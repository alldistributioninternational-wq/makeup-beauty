'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { ArrowLeft, PlusCircle, Pencil, Trash2, Search, MoreVertical } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  cloudinary_id: string | null;
  shades?: any;
  created_at?: string;
}

// ✅ LISTE UNIFIÉE
const CATEGORY_COLORS: Record<string, string> = {
  peau:        'bg-amber-100 text-amber-700',
  yeux:        'bg-blue-100 text-blue-700',
  cils:        'bg-purple-100 text-purple-700',
  levres:      'bg-red-100 text-red-700',
  sourcils:    'bg-orange-100 text-orange-700',
  highlighter: 'bg-yellow-100 text-yellow-600',
  blush:       'bg-pink-100 text-pink-700',
  contour:     'bg-stone-100 text-stone-700',
  autre:       'bg-gray-100 text-gray-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  peau:        '✨ Peau',
  yeux:        '👁️ Yeux',
  cils:        '🪄 Cils',
  levres:      '💋 Lèvres',
  sourcils:    '🎨 Sourcils',
  highlighter: '⭐ Highlighter',
  blush:       '🌸 Blush',
  contour:     '🔲 Contour',
  autre:       '📦 Autre',
};

export default function AdminProductsPage() {
  const [products,        setProducts]        = useState<Product[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [filterCategory,  setFilterCategory]  = useState('');
  const [deletingId,      setDeletingId]      = useState<string | null>(null);
  const [openMenuId,      setOpenMenuId]      = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await supabase.from('look_products').delete().eq('product_id', id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingId(null); setConfirmDeleteId(null); }
  };

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const filtered = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !filterCategory || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const getShadesCount = (p: Product) => {
    if (!p.shades) return 0;
    try { const parsed = typeof p.shades === 'string' ? JSON.parse(p.shades) : p.shades; return Array.isArray(parsed) ? parsed.length : 0; } catch { return 0; }
  };

  const getShadesColors = (p: Product): string[] => {
    if (!p.shades) return [];
    try { const parsed = typeof p.shades === 'string' ? JSON.parse(p.shades) : p.shades; return Array.isArray(parsed) ? parsed.slice(0, 5).map((s: any) => s.hex) : []; } catch { return []; }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900"><ArrowLeft className="h-5 w-5" /></Link>
            <div><h1 className="text-xl font-bold text-gray-900">Gérer les Produits</h1><p className="text-sm text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''}</p></div>
          </div>
          <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-semibold text-sm shadow-sm">
            <PlusCircle className="h-4 w-4" />Nouveau produit
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-2xl font-bold text-gray-900">{products.length}</p><p className="text-xs text-gray-500 mt-1">Total produits</p></div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"><p className="text-2xl font-bold text-purple-500">{categories.length}</p><p className="text-xs text-gray-500 mt-1">Catégories</p></div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-pink-500">{products.length > 0 ? (products.reduce((a, p) => a + Number(p.price), 0) / products.length).toFixed(0) : 0}€</p>
            <p className="text-xs text-gray-500 mt-1">Prix moyen</p>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 text-sm bg-white" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none text-sm bg-white text-gray-700">
            <option value="">Toutes les catégories</option>
            {categories.map(cat => <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">💄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit</h3>
            <p className="text-gray-500 mb-6">{searchQuery || filterCategory ? 'Aucun résultat' : 'Ajoutez votre premier produit'}</p>
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-semibold"><PlusCircle className="h-4 w-4" />Ajouter</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Produit</div>
              <div className="col-span-2 text-center">Catégorie</div>
              <div className="col-span-2 text-center">Prix</div>
              <div className="col-span-3 text-center">Teintes</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.map(product => {
                const shadesCount  = getShadesCount(product);
                const shadesColors = getShadesColors(product);
                return (
                  <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        {product.cloudinary_id
                          ? <img src={getCloudinaryUrl(product.cloudinary_id)} alt={product.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <div className="w-full h-full flex items-center justify-center text-lg">💄</div>
                        }
                      </div>
                      <div className="min-w-0"><p className="font-semibold text-gray-900 truncate text-sm">{product.name}</p><p className="text-xs text-gray-400">{product.brand}</p></div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[product.category] || 'bg-gray-100 text-gray-700'}`}>
                        {CATEGORY_LABELS[product.category] || product.category || '—'}
                      </span>
                    </div>
                    <div className="col-span-2 text-center"><span className="text-sm font-bold text-gray-900">{Number(product.price).toFixed(2)}€</span></div>
                    <div className="col-span-3 flex items-center justify-center gap-2">
                      {shadesCount > 0 ? (<>
                        <div className="flex items-center">
                          {shadesColors.map((hex, i) => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: hex, marginLeft: i > 0 ? '-6px' : '0', zIndex: shadesColors.length - i, position: 'relative' }} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{shadesCount} teinte{shadesCount > 1 ? 's' : ''}</span>
                      </>) : <span className="text-xs text-gray-400">—</span>}
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><MoreVertical className="h-4 w-4" /></button>
                        {openMenuId === product.id && (
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-36 z-30">
                            <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpenMenuId(null)}><Pencil className="h-4 w-4 text-blue-400" />Modifier</Link>
                            <button onClick={() => { setConfirmDeleteId(product.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" />Supprimer</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal suppression */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-7 w-7 text-red-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce produit ?</h3>
              <p className="text-sm text-gray-500">Action irréversible. Le produit sera retiré de tous les looks.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm">Annuler</button>
              <button onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 text-sm disabled:opacity-50">
                {deletingId === confirmDeleteId ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {openMenuId && <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
}