// src/app/(main)/profile/orders/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'

interface OrderItem {
  name: string
  brand?: string
  shade?: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  id: string
  order_number?: string
  status: string
  items: OrderItem[]
  total_amount: number
  currency?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: any
  stripe_payment_id?: string
  stripe_session_id?: string
  whatsapp_sent?: boolean
  created_at: string
  updated_at?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:   { label: 'En attente',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  paid:      { label: 'Payée',       color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  shipped:   { label: 'Expédiée',    color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Truck },
  delivered: { label: 'Livrée',      color: 'text-purple-700', bg: 'bg-purple-100', icon: Package },
  cancelled: { label: 'Annulée',     color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle },
}

export default function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      if (!user) { setLoading(false); return }

      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setOrders(data)
      setLoading(false)
    }

    fetchOrders()
  }, [user])

  // ── Non connecté ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Connecte-toi pour voir tes commandes
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Tes commandes sont liées à ton compte.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Chargement de tes commandes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Mes commandes</h1>
            {orders.length > 0 && (
              <p className="text-xs text-gray-400">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Aucune commande ─────────────────────────────────────────────── */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Package className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Aucune commande pour le moment
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              Tes commandes apparaîtront ici après ton premier achat.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors"
              >
                Découvrir la boutique
              </Link>
              <Link
                href="/"
                className="inline-block px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voir les looks
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusKey = order.status || 'pending'
              const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending
              const StatusIcon = status.icon
              const isExpanded = expandedOrder === order.id
              const items: OrderItem[] = Array.isArray(order.items) ? order.items : []

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* ── Header commande (cliquable) ── */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-pink-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {items.length} article{items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {Number(order.total_amount).toFixed(2)}€
                        </p>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </div>
                  </button>

                  {/* ── Détails (expandable) ── */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-5">

                      {/* Produits */}
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        🛒 Produits commandés
                      </h3>
                      <div className="space-y-3 mb-5">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                💄
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                              {item.brand && (
                                <p className="text-xs text-gray-400">{item.brand}</p>
                              )}
                              {item.shade && (
                                <p className="text-xs text-pink-500">Teinte: {item.shade}</p>
                              )}
                              <p className="text-xs text-gray-400">Qté: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                              {Number(item.price).toFixed(2)}€
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Récapitulatif prix */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">Total payé</span>
                          <span className="font-bold text-xl text-gray-900">
                            {Number(order.total_amount).toFixed(2)}€
                          </span>
                        </div>
                        {order.currency && (
                          <p className="text-xs text-gray-400 mt-1">
                            Devise: {order.currency.toUpperCase()}
                          </p>
                        )}
                      </div>

                      {/* Infos client */}
                      {(order.customer_name || order.customer_email || order.customer_phone) && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">👤 Client</h3>
                          {order.customer_name && (
                            <p className="text-sm text-gray-600">{order.customer_name}</p>
                          )}
                          {order.customer_email && (
                            <p className="text-sm text-gray-600">{order.customer_email}</p>
                          )}
                          {order.customer_phone && (
                            <p className="text-sm text-gray-600">{order.customer_phone}</p>
                          )}
                        </div>
                      )}

                      {/* Adresse livraison */}
                      {order.shipping_address && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Adresse de livraison
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.shipping_address.line1}
                          </p>
                          {order.shipping_address.line2 && (
                            <p className="text-sm text-gray-600">{order.shipping_address.line2}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {order.shipping_address.city} {order.shipping_address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shipping_address.country}
                          </p>
                        </div>
                      )}

                      {/* Infos paiement */}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                        <span>
                          {order.stripe_payment_id
                            ? `💳 Stripe: ${order.stripe_payment_id.slice(0, 20)}...`
                            : '💳 Paiement Stripe'}
                        </span>
                        {order.whatsapp_sent && (
                          <span className="text-green-500 font-medium">✅ Facture envoyée</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
