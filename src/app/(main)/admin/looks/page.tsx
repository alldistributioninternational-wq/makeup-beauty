'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { 
  ArrowLeft, PlusCircle, Pencil, Trash2, Eye, 
  Search, Filter, MoreVertical, CheckCircle, Clock
} from 'lucide-react';

interface Look {
  id: string;
  title: string;
  description?: string;
  category?: string;
  cloudinary_image_id: string | null;
  cloudinary_video_id: string | null;
  difficulty?: string;
  likes?: number;
  views?: number;
  creator_name?: string;
  is_featured?: boolean;
  created_at?: string;
  look_products?: any[];
}

export default function AdminLooksPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchLooks();
  }, []);

  const fetchLooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('looks')
      .select('*, look_products(id)')
      .order('created_at', { ascending: false });

    if (!error && data) setLooks(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      // Supprimer d'abord les associations look_products
      await supabase.from('look_products').delete().eq('look_id', id);
      // Puis supprimer le look
      const { error } = await supabase.from('looks').delete().eq('id', id);
      if (!error) {
        setLooks(looks.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filteredLooks = looks.filter(look =>
    look.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (look.creator_name && look.creator_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (look.category && look.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gérer les Looks</h1>
              <p className="text-sm text-gray-500">{looks.length} look{looks.length > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <Link
            href="/admin/looks/new"
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-semibold text-sm shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Nouveau look
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barre de recherche */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un look..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 text-sm bg-white"
            />
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{looks.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total looks</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-pink-500">{looks.filter(l => l.is_featured).length}</p>
            <p className="text-xs text-gray-500 mt-1">En vedette</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-2xl font-bold text-purple-500">
              {looks.reduce((acc, l) => acc + (l.look_products?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Associations produits</p>
          </div>
        </div>

        {/* Liste des looks */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
          </div>
        ) : filteredLooks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun look trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Aucun résultat pour votre recherche' : 'Commencez par créer votre premier look'}
            </p>
            <Link href="/admin/looks/new" className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-semibold">
              <PlusCircle className="h-4 w-4" />
              Créer un look
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header tableau */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Look</div>
              <div className="col-span-2 text-center">Catégorie</div>
              <div className="col-span-2 text-center">Produits</div>
              <div className="col-span-2 text-center">Likes</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {filteredLooks.map((look) => (
                <div key={look.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors group">
                  {/* Look info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={getCloudinaryUrl(look.cloudinary_image_id)}
                        alt={look.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{look.title}</p>
                      <p className="text-xs text-gray-400 truncate">{look.creator_name || 'Inconnu'}</p>
                      {look.is_featured && (
                        <span className="inline-flex items-center gap-1 text-xs text-pink-600 font-medium mt-0.5">
                          <CheckCircle className="h-3 w-3" />
                          Vedette
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div className="col-span-2 text-center">
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full capitalize">
                      {look.category || '—'}
                    </span>
                  </div>

                  {/* Nb produits */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {look.look_products?.length || 0}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">produit{(look.look_products?.length || 0) > 1 ? 's' : ''}</span>
                  </div>

                  {/* Likes */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {look.likes?.toLocaleString() || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === look.id ? null : look.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === look.id && (
                        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-40 z-30">
                          <Link
                            href={`/feed/${look.id}`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Eye className="h-4 w-4 text-gray-400" />
                            Voir le look
                          </Link>
                          <Link
                            href={`/admin/looks/${look.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setOpenMenuId(null)}
                          >
                            <Pencil className="h-4 w-4 text-blue-400" />
                            Modifier
                          </Link>
                          <button
                            onClick={() => {
                              setConfirmDeleteId(look.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmation suppression */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer ce look ?</h3>
              <p className="text-sm text-gray-500">
                Cette action est irréversible. Le look et toutes ses associations produits seront supprimés.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer les menus */}
      {openMenuId && (
        <div className="fixed inset-0 z-20" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}