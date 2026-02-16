'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BarChart3, Image, Package, PlusCircle, Settings, Upload } from 'lucide-react';

interface Stats {
  totalLooks: number;
  totalProducts: number;
  totalViews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalLooks: 0,
    totalProducts: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Compter les looks
      const { count: looksCount } = await supabase
        .from('looks')
        .select('*', { count: 'exact', head: true });

      // Compter les produits
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalLooks: looksCount || 0,
        totalProducts: productsCount || 0,
        totalViews: 0,
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Gérer les Looks',
      description: 'Créer, modifier et supprimer des looks',
      icon: Image,
      href: '/admin/looks',
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Gérer les Produits',
      description: 'Gérer votre catalogue de produits',
      icon: Package,
      href: '/admin/products',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Upload Médias',
      description: 'Uploader des images et vidéos sur Cloudinary',
      icon: Upload,
      href: '/admin/upload',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Paramètres',
      description: 'Configuration du site',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-500 to-slate-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            💎 Dashboard Admin
          </h1>
          <p className="text-gray-600">
            Bienvenue sur votre tableau de bord BeautyBloom
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-100 p-3 rounded-xl">
                <Image className="h-6 w-6 text-pink-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {loading ? '...' : stats.totalLooks}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Looks publiés
            </h3>
            <p className="text-xs text-gray-500">
              Total de looks sur la plateforme
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                {loading ? '...' : stats.totalProducts}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Produits
            </h3>
            <p className="text-xs text-gray-500">
              Catalogue de produits disponibles
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                2.5K
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Vues totales
            </h3>
            <p className="text-xs text-gray-500">
              Vues sur tous les looks
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ⚡ Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/admin/looks/new"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:shadow-lg transition"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="font-semibold">Créer un nouveau look</span>
            </Link>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="font-semibold">Ajouter un produit</span>
            </Link>
          </div>
        </div>

        {/* Menu principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start gap-4">
                <div className={`bg-gradient-to-br ${item.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Astuce :</strong> Commencez par uploader vos médias sur Cloudinary, 
            puis créez vos produits et looks !
          </p>
        </div>
      </div>
    </div>
  );
}