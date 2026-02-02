"use client";

import { mockLooks } from '@/data/mockLooks';
import { getProductById } from '@/data/mockProducts';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cart.store';
import { Heart, ShoppingCart, Share2, User } from 'lucide-react';

export default function HomePage() {
  const addItem = useCartStore((state) => state.addItem);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartItemCount = getTotalItems();

  const handleAddToCart = (productId: string, shadeId?: string) => {
    const product = getProductById(productId);
    if (!product) return;

    // Si le produit a des shades, prendre la première par défaut
    const defaultShadeId = shadeId || product.shades?.[0]?.id || 'default';
    const selectedShade = product.shades?.find(s => s.id === defaultShadeId);

    addItem({
      productId: product.id,
      shadeId: defaultShadeId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      shade: selectedShade?.name || 'Unique',
      quantity: 1,
    });
  };

  const handleBuyPack = (lookId: string) => {
    const look = mockLooks.find(l => l.id === lookId);
    if (!look) return;

    look.products.forEach(item => {
      handleAddToCart(item.productId, item.shadeId);
    });

    alert(`Pack ajouté au panier ! ${look.products.length} produits`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">B</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">BeautyFeed</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2">
              <ShoppingCart size={22} className="text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
            <Button variant="ghost" size="sm">
              <User size={18} className="mr-2" />
              Connexion
            </Button>
          </div>
        </div>
      </header>

      {/* Feed TikTok-like */}
      <main className="max-w-2xl mx-auto">
        {mockLooks.map((look) => {
          const lookProducts = look.products
            .map(item => getProductById(item.productId))
            .filter((p): p is NonNullable<typeof p> => p !== undefined);

          const packPrice = lookProducts.reduce((sum, p) => sum + p.price, 0);
          const savings = packPrice * 0.15;

          return (
            <div key={look.id} className="border-b border-gray-200 last:border-b-0">
              {/* Look Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {look.creator.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{look.creator.name}</h3>
                  <p className="text-sm text-gray-500">{look.creator.username}</p>
                </div>
              </div>

              {/* Look Image */}
              <div className="relative aspect-[4/5] bg-gradient-to-br from-pink-100 to-purple-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💄</div>
                    <p className="text-gray-600">Image: {look.title}</p>
                    <p className="text-sm text-gray-500">(Placeholder)</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex justify-between">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2">
                    <Heart size={22} className="text-gray-700" />
                    <span className="text-sm">{look.likes}</span>
                  </button>
                  <button className="flex items-center gap-2">
                    <Share2 size={22} className="text-gray-700" />
                    <span className="text-sm">Partager</span>
                  </button>
                </div>
                <button className="text-gray-700">
                  <ShoppingCart size={22} />
                </button>
              </div>

              {/* Description */}
              <div className="px-4 pb-3">
                <h2 className="font-bold text-lg text-gray-900">{look.title}</h2>
                <p className="text-gray-600 mt-1">{look.description}</p>
              </div>

              {/* Products in this look */}
              <div className="px-4 pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Produits utilisés :</h4>
                <div className="space-y-3">
                  {lookProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">{product.price.toFixed(2)}€</span>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product.id)}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pack CTA */}
              <div className="px-4 pb-6">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">Pack Complet</p>
                      <p className="text-gray-600">{lookProducts.length} produits</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl">{packPrice.toFixed(2)}€</p>
                      <p className="text-sm text-green-600">Économisez {savings.toFixed(2)}€</p>
                    </div>
                  </div>
                  <Button 
                    fullWidth 
                    onClick={() => handleBuyPack(look.id)}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <ShoppingCart size={20} className="mr-2" />
                    Acheter le pack complet
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="max-w-2xl mx-auto flex justify-around">
          {[
            { icon: '🏠', label: 'Accueil' },
            { icon: '🔍', label: 'Découvrir' },
            { icon: '➕', label: 'Créer' },
            { icon: '🛍️', label: 'Boutique' },
            { icon: '👤', label: 'Profil' }
          ].map((item) => (
            <button key={item.label} className="flex flex-col items-center py-1">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}