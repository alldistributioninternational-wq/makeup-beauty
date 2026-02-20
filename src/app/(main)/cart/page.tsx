'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  cloudinary_id: string | null;
  category: string;
  shades?: any;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [savedSkinTone, setSavedSkinTone] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // ✅ Stocker le look_id pour le retour arrière
  const [returnLookId, setReturnLookId] = useState<string | null>(null);

  const skinTones = [
    { id: '1',  name: 'Très clair rosé',      hex: '#FFE4D6' },
    { id: '2',  name: 'Clair rosé',            hex: '#FFDCC5' },
    { id: '3',  name: 'Clair neutre',          hex: '#FFD4B3' },
    { id: '4',  name: 'Clair chaud',           hex: '#FFCBA4' },
    { id: '5',  name: 'Moyen clair rosé',      hex: '#F5C6A5' },
    { id: '6',  name: 'Moyen clair neutre',    hex: '#EAB896' },
    { id: '7',  name: 'Moyen clair chaud',     hex: '#E0AC7E' },
    { id: '8',  name: 'Moyen neutre',          hex: '#D4A276' },
    { id: '9',  name: 'Moyen chaud',           hex: '#C99869' },
    { id: '10', name: 'Moyen doré',            hex: '#BE8E5C' },
    { id: '11', name: 'Moyen foncé neutre',    hex: '#B1824F' },
    { id: '12', name: 'Moyen foncé chaud',     hex: '#A47444' },
    { id: '13', name: 'Foncé neutre',          hex: '#8B6341' },
    { id: '14', name: 'Foncé chaud',           hex: '#7A5638' },
    { id: '15', name: 'Très foncé neutre',     hex: '#6B4A31' },
    { id: '16', name: 'Très foncé chaud',      hex: '#5D3F2A' },
    { id: '17', name: 'Profond neutre',        hex: '#4E3423' },
    { id: '18', name: 'Profond chaud',         hex: '#43291E' },
    { id: '19', name: 'Très profond',          hex: '#3A1F19' },
    { id: '20', name: 'Ultra profond',         hex: '#2C1614' },
  ];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
    const tone = localStorage.getItem('userSkinTone');
    setSavedSkinTone(tone);

    // ✅ Récupérer le look_id depuis les items du panier pour le retour
    const stored = useCartStore.getState().items;
    const lookId = stored.find((i: any) => i.look_id)?.look_id || null;
    setReturnLookId(lookId);
  }, []);

  // ✅ Catégories peau élargies
  const isSkinProduct = (category: string) => {
    return ['foundation', 'concealer', 'powder', 'teint', 'correcteur', 'poudre',
            'peau', 'highlighter', 'blush', 'contour'].includes(category.toLowerCase());
  };

  const getProduct = (productId: string) => products.find(p => p.id === productId);

  const total = getTotalPrice();
  const finalTotal = total;

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const sessionId = localStorage.getItem('sessionId') || '';

      const cartItemsForStripe = items.map(item => {
        const product = getProduct(item.productId);
        let shadeName = item.shade || '';

        if (!shadeName && product?.shades && item.shadeId) {
          const shades = typeof product.shades === 'string'
            ? JSON.parse(product.shades)
            : product.shades;
          const shade = shades.find((s: any) => s.id === item.shadeId);
          shadeName = shade?.name || '';
        }

        return {
          name: product?.name || (item as any).name || '',
          brand: product?.brand || (item as any).brand || '',
          shade: shadeName,
          quantity: item.quantity,
          price: product ? Number(product.price) : Number((item as any).price),
          image: product?.cloudinary_id ? getCloudinaryUrl(product.cloudinary_id) : '',
          look_id: (item as any).look_id || '',
        };
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItemsForStripe,
          userId: user?.id || null,
          sessionId,
        }),
      });

      const data = await res.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error('Erreur checkout:', err);
      setCheckoutError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ✅ Bouton retour dynamique
  const handleBack = () => {
    if (returnLookId) {
      router.push(`/checkout-look/${returnLookId}`);
    } else {
      router.push('/');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:text-gray-600">
              <ArrowLeft className="h-4 w-4" />
              Continuer mes achats
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="mb-6 text-6xl">🛒</div>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Votre panier est vide</h1>
          <p className="mb-8 text-gray-600">Découvrez nos looks et produits pour commencer vos achats</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800">
              Voir les looks
            </Link>
            <Link href="/shop" className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition-colors hover:bg-gray-50">
              Voir les produits
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* ✅ Retour vers checkout-look si vient d'un look, sinon accueil */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-medium hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              {returnLookId ? 'Modifier mes produits' : 'Continuer mes achats'}
            </button>
            <button onClick={clearCart} className="text-sm font-medium text-red-600 hover:text-red-700">
              Vider le panier
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Votre panier</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => {
                const product = getProduct(item.productId);
                if (!product) return null;

                let shades: any[] = [];
                if (product.shades) {
                  shades = typeof product.shades === 'string'
                    ? JSON.parse(product.shades)
                    : product.shades;
                }

                const shade = shades.find((s: any) => s.id === item.shadeId);
                const isSkin = isSkinProduct(product.category);
                const skinTone = savedSkinTone ? skinTones.find(t => t.id === savedSkinTone) : null;

                return (
                  <div key={`${item.productId}-${item.shadeId}`} className="flex gap-4 rounded-xl border border-gray-200 p-4">
                    <Link href={`/shop/products/${product.id}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={getCloudinaryUrl(product.cloudinary_id)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/shop/products/${product.id}`}
                            className="font-semibold text-gray-900 hover:underline">
                            {product.name}
                          </Link>
                          <p className="text-sm text-gray-500">{product.brand}</p>

                          {/* ✅ Priorité : shade choisie > carnation si peau > shade string */}
                          {shade ? (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: shade.hex }} />
                              <span className="text-sm text-gray-600">{shade.name}</span>
                            </div>
                          ) : isSkin && skinTone ? (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: skinTone.hex }} />
                              <span className="text-sm text-gray-600">{skinTone.name}</span>
                            </div>
                          ) : item.shade ? (
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-4 w-4 rounded-full border border-gray-300 bg-gray-200" />
                              <span className="text-sm text-gray-600">{item.shade}</span>
                            </div>
                          ) : null}
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.shadeId)}
                          className="text-gray-400 transition-colors hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.shadeId)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.shadeId)}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 transition-colors hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-bold text-gray-900">
                          {(Number(product.price) * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 p-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Récapitulatif</h2>

              <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total ({items.reduce((acc, i) => acc + i.quantity, 0)} articles)</span>
                  <span className="font-semibold">{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span className="font-semibold text-green-600">🎉 Gratuite</span>
                </div>
              </div>

              <div className="my-4 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{finalTotal.toFixed(2)}€</span>
              </div>

              {checkoutError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">{checkoutError}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 font-semibold text-white transition-colors ${
                  checkoutLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {checkoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Passer la commande
                  </>
                )}
              </button>

              {!user && (
                <p className="mt-3 text-center text-xs text-gray-400">
                  <Link href="/login" className="text-pink-500 font-medium hover:underline">
                    Connecte-toi
                  </Link>{' '}
                  pour suivre tes commandes
                </p>
              )}

              <div className="mt-4 space-y-1.5 text-center text-xs text-gray-500">
                <p>🔒 Paiement sécurisé par Stripe</p>
                <p>✓ Retours gratuits sous 30 jours</p>
                <p>✓ Livraison toujours gratuite</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}