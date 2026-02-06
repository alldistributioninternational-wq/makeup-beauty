// src/app/(main)/checkout/page.tsx
// @ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart.store';
import { getProductById } from '@/data/mockProducts';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Récupérer la carnation sauvegardée
  const [savedSkinTone, setSavedSkinTone] = useState<string | null>(null);

  // Palette de carnations (même que checkout-look)
  const skinTones = [
    { id: '1', name: 'Très clair rosé', hex: '#FFE4D6' },
    { id: '2', name: 'Clair rosé', hex: '#FFDCC5' },
    { id: '3', name: 'Clair neutre', hex: '#FFD4B3' },
    { id: '4', name: 'Clair chaud', hex: '#FFCBA4' },
    { id: '5', name: 'Moyen clair rosé', hex: '#F5C6A5' },
    { id: '6', name: 'Moyen clair neutre', hex: '#EAB896' },
    { id: '7', name: 'Moyen clair chaud', hex: '#E0AC7E' },
    { id: '8', name: 'Moyen neutre', hex: '#D4A276' },
    { id: '9', name: 'Moyen chaud', hex: '#C99869' },
    { id: '10', name: 'Moyen doré', hex: '#BE8E5C' },
    { id: '11', name: 'Moyen foncé neutre', hex: '#B1824F' },
    { id: '12', name: 'Moyen foncé chaud', hex: '#A47444' },
    { id: '13', name: 'Foncé neutre', hex: '#8B6341' },
    { id: '14', name: 'Foncé chaud', hex: '#7A5638' },
    { id: '15', name: 'Très foncé neutre', hex: '#6B4A31' },
    { id: '16', name: 'Très foncé chaud', hex: '#5D3F2A' },
    { id: '17', name: 'Profond neutre', hex: '#4E3423' },
    { id: '18', name: 'Profond chaud', hex: '#43291E' },
    { id: '19', name: 'Très profond', hex: '#3A1F19' },
    { id: '20', name: 'Ultra profond', hex: '#2C1614' },
  ];

  // Charger la carnation au montage du composant
  useEffect(() => {
    const tone = localStorage.getItem('userSkinTone');
    setSavedSkinTone(tone);
  }, []);

  const total = getTotalPrice();
  const shipping = total > 50 ? 0 : 5.99;
  const finalTotal = total + shipping;

  // Vérifier si un produit est de type teint/peau
  const isSkinProduct = (product: any) => {
    if (!product) return false;
    return ['foundation', 'concealer', 'powder'].includes(product.category);
  };

  // Redirect si panier vide
  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulation du paiement (à remplacer par Stripe)
    setTimeout(() => {
      alert('✅ Commande validée ! (Intégration Stripe à venir)');
      clearCart();
      router.push('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au panier
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Finaliser la commande
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact info */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Informations de contact
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping info */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Adresse de livraison
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Adresse
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Code postal
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Ville
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Payment (simplified for MVP) */}
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Paiement
                </h2>
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                  <p className="mb-1 font-semibold text-gray-900">
                    Intégration Stripe à venir
                  </p>
                  <p className="text-sm text-gray-600">
                    Pour le MVP, le paiement est simulé
                  </p>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Votre commande
                </h2>

                {/* Products */}
                <div className="mb-4 max-h-60 space-y-3 overflow-y-auto border-b border-gray-200 pb-4">
                  {items.map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    const shade = product.shades?.find(s => s.id === item.shadeId);
                    const isSkin = isSkinProduct(product);
                    const skinTone = savedSkinTone ? skinTones.find(t => t.id === savedSkinTone) : null;

                    return (
                      <div
                        key={`${item.productId}-${item.shadeId}`}
                        className="flex gap-3"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          
                          {/* Afficher SOIT la carnation (pour produits peau) SOIT le shade (pour autres produits) */}
                          {isSkin && skinTone ? (
                            <div className="mt-1 flex items-center gap-1.5">
                              <div 
                                className="h-3.5 w-3.5 rounded-full border border-gray-300" 
                                style={{ backgroundColor: skinTone.hex }}
                              />
                              <span className="text-xs text-gray-600 font-medium">
                                {skinTone.name}
                              </span>
                            </div>
                          ) : (
                            shade && (
                              <p className="text-xs text-gray-500">{shade.name}</p>
                            )
                          )}
                          
                          <p className="text-sm text-gray-600 mt-1">
                            Qté: {item.quantity} • {(product.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-b border-gray-200 pb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span className="font-semibold">{total.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Livraison</span>
                    <span className="font-semibold">
                      {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}
                    </span>
                  </div>
                </div>

                <div className="my-4 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{finalTotal.toFixed(2)}€</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-4 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Lock className="h-5 w-5" />
                  {isProcessing ? 'Traitement...' : 'Payer maintenant'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Paiement sécurisé • Données cryptées
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}