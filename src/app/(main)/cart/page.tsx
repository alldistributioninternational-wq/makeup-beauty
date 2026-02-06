// src/app/(main)/cart/page.tsx
// @ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart.store';
import { getProductById } from '@/data/mockProducts';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

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

  // Vérifier si un produit est de type teint/peau
  const isSkinProduct = (product: any) => {
    if (!product) return false;
    return ['foundation', 'concealer', 'powder'].includes(product.category);
  };

  const total = getTotalPrice();
  const shipping = total > 50 ? 0 : 5.99;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuer mes achats
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mb-6 text-6xl">🛒</div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Votre panier est vide
          </h1>
          <p className="mb-8 text-gray-600">
            Découvrez nos looks et produits pour commencer vos achats
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Voir les looks
            </Link>
            <Link
              href="/shop"
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition-colors hover:bg-gray-50"
            >
              Voir les produits
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuer mes achats
            </Link>
            <button
              onClick={clearCart}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Vider le panier
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Votre panier
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;

                const shade = product.shades?.find(s => s.id === item.shadeId);
                const isSkin = isSkinProduct(product);
                const skinTone = savedSkinTone ? skinTones.find(t => t.id === savedSkinTone) : null;

                return (
                  <div
                    key={`${item.productId}-${item.shadeId}`}
                    className="flex gap-4 rounded-xl border border-gray-200 p-4"
                  >
                    {/* Product image */}
                    <Link
                      href={`/shop/products/${product.id}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Product info */}
                    <div className="flex flex-1 flex-col">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/shop/products/${product.id}`}
                            className="font-semibold text-gray-900 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {product.brand}
                          </p>
                          
                          {/* Afficher SOIT la carnation (pour produits peau) SOIT le shade (pour autres produits) */}
                          {isSkin && skinTone ? (
                            <div className="mt-1 flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: skinTone.hex }}
                              />
                              <span className="text-sm text-gray-600">
                                {skinTone.name}
                              </span>
                            </div>
                          ) : (
                            shade && (
                              <div className="mt-1 flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: shade.hex }}
                                />
                                <span className="text-sm text-gray-600">
                                  {shade.name}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.shadeId)}
                          className="text-gray-400 transition-colors hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Quantity & price */}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.shadeId
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.shadeId
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="font-bold text-gray-900">
                          {(product.price * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Récapitulatif
              </h2>

              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold">{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}
                  </span>
                </div>
                {total < 50 && (
                  <p className="text-xs text-gray-500">
                    Plus que {(50 - total).toFixed(2)}€ pour la livraison gratuite !
                  </p>
                )}
              </div>

              <div className="my-4 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)}€</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full rounded-lg bg-gray-900 py-4 text-center font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Passer la commande
              </Link>

              <div className="mt-6 space-y-2 text-center text-xs text-gray-500">
                <p>✓ Paiement sécurisé</p>
                <p>✓ Retours gratuits sous 30 jours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}