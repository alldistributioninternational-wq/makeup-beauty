// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// ✅ Sérialisation sécurisée — jamais de JSON tronqué
const safeJson = (data: any, maxLen: number): string => {
  const full = JSON.stringify(data)
  if (full.length <= maxLen) return full
  if (Array.isArray(data)) {
    for (let i = data.length - 1; i >= 0; i--) {
      const trimmed = JSON.stringify(data.slice(0, i))
      if (trimmed.length <= maxLen) return trimmed
    }
  }
  return '[]'
}

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' })

    const { items, userId, sessionId } = await req.json()
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 })
    }

    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: [
            item.brand ? `Marque: ${item.brand}` : null,
            item.shade ? `Teinte: ${item.shade}` : null,
          ].filter(Boolean).join(' | ') || undefined,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity || 1,
    }))

    // ✅ look_ids dans une clé séparée pour ne pas dépasser 500 chars
    const lookIds = [...new Set(
      items.map((item: any) => item.look_id || '').filter(Boolean)
    )]

    // ✅ cart_items sans image pour réduire la taille
    const cartItemsClean = items.map((item: any) => ({
      name: (item.name || '').slice(0, 30),
      brand: (item.brand || '').slice(0, 20),
      shade: (item.shade || '').slice(0, 20),
      quantity: item.quantity || 1,
      price: item.price,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'CA', 'CM', 'SN', 'CI', 'MA', 'TN'],
      },
      phone_number_collection: {
        enabled: true,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 0, currency: 'eur' },
            display_name: 'Livraison gratuite',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
      ],
      metadata: {
        user_id: userId || '',
        session_id: sessionId || '',
        // ✅ safeJson — JSON toujours valide, jamais tronqué au milieu
        look_ids: safeJson(lookIds, 490),
        cart_items: safeJson(cartItemsClean, 490),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('❌ Erreur création session Stripe:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}