// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('❌ Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      })

      const metadata = session.metadata || {}

      const items = metadata.cart_items
        ? JSON.parse(metadata.cart_items)
        : lineItems.data.map(item => ({
            name: (item.price?.product as Stripe.Product)?.name || item.description || '',
            brand: '',
            shade: '',
            quantity: item.quantity || 1,
            price: (item.amount_total || 0) / 100,
            image: '',
          }))

      const totalAmount = (session.amount_total || 0) / 100

      const orderNumber = `CMD-${Date.now().toString().slice(-6)}`

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: metadata.user_id || null,
          session_id: metadata.session_id || null,
          stripe_payment_id: session.payment_intent as string,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_session_id: session.id,
          status: 'paid',
          items: items,
          total_amount: totalAmount,
          currency: session.currency || 'eur',
          customer_name: session.customer_details?.name || null,
          customer_email: session.customer_details?.email || null,
          customer_phone: session.customer_details?.phone || null,
          shipping_address: session.collected_information?.shipping_details?.address || null,
          whatsapp_sent: false,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erreur Supabase insert order:', error)
        return NextResponse.json({ error: 'DB error' }, { status: 500 })
      }

      console.log('✅ Commande sauvegardée:', order.id)

      await sendWhatsAppInvoice(twilioClient, supabase, order, items, totalAmount, session, orderNumber)

    } catch (err) {
      console.error('❌ Erreur traitement commande:', err)
      return NextResponse.json({ error: 'Processing error' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

async function sendWhatsAppInvoice(
  twilioClient: twilio.Twilio,
  supabase: any,
  order: any,
  items: any[],
  total: number,
  session: Stripe.Checkout.Session,
  orderNumber: string
) {
  try {
    const itemsList = items.map((item: any) =>
      `• ${item.name}${item.shade ? ` (${item.shade})` : ''} x${item.quantity} — ${Number(item.price).toFixed(2)}€`
    ).join('\n')

    const shippingAddress = session.collected_information?.shipping_details?.address
    const shippingBlock = shippingAddress
      ? `\n📦 *Livraison*\n${shippingAddress.line1 || ''}${shippingAddress.line2 ? '\n' + shippingAddress.line2 : ''}\n${shippingAddress.city || ''} ${shippingAddress.postal_code || ''}\n${shippingAddress.country || ''}`
      : ''

    const date = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const message = `
🛍️ *NOUVELLE COMMANDE REÇUE*
━━━━━━━━━━━━━━━━━━━━━
📋 *${orderNumber}*
📅 ${date}

👤 *Client*
Nom: ${session.customer_details?.name || 'Non renseigné'}
Email: ${session.customer_details?.email || 'Non renseigné'}
Tél: ${session.customer_details?.phone || 'Non renseigné'}

🛒 *Produits commandés*
${itemsList}
━━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL: ${total.toFixed(2)}€*
💳 Paiement Stripe ✅ Confirmé
${shippingBlock}
━━━━━━━━━━━━━━━━━━━━━
    `.trim()

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to: process.env.WHATSAPP_RECIPIENT_NUMBER!,
      body: message,
    })

    await supabase
      .from('orders')
      .update({ whatsapp_sent: true, updated_at: new Date().toISOString() })
      .eq('id', order.id)

    console.log('✅ WhatsApp facture envoyée pour', orderNumber)
  } catch (err) {
    console.error('❌ Erreur envoi WhatsApp:', err)
  }
}