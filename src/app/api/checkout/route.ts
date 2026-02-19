// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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
      // ✅ Livraison toujours gratuite
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
        // ✅ look_id inclus pour afficher le tutoriel après achat
        cart_items: JSON.stringify(
          items.map((item: any) => ({
            name: item.name,
            brand: item.brand || '',
            shade: item.shade || '',
            quantity: item.quantity || 1,
            price: item.price,
            image: item.image || '',
            look_id: item.look_id || '',
          }))
        ).slice(0, 490),
      },
    })
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('❌ Erreur création session Stripe:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}