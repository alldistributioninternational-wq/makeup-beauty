'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { compressImage, compressVideo, formatFileSize } from '@/lib/compress';
import { 
  ArrowLeft, Upload, X, Plus, Trash2, 
  Image as ImageIcon, Video, Tag, Package,
  Loader2, CheckCircle
} from 'lucide-react';

const PRODUCT_CATEGORIES = [
  { id: 'peau',        label: '✨ Peau',        color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'yeux',        label: '👁️ Yeux',        color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'cils',        label: '🪄 Cils',         color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'levres',      label: '💋 Lèvres',       color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'sourcils',    label: '🎨 Sourcils',     color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'highlighter', label: '⭐ Highlighter',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'blush',       label: '🌸 Blush',        color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'autre',       label: '📦 Autre',        color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const LOOK_CATEGORIES = ['naturel', 'glamour', 'soirée', 'tous-les-jours', 'bold', 'smoky'];
const DIFFICULTIES    = ['facile', 'intermédiaire', 'avancé'];

interface ProductEntry {
  tempId: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  note: string;
  // Image produit optionnelle
  imageFile?: File;
  imagePreview?: string;
  imageCompressing?: boolean;
  imageCompressed?: File;
  imageOriginalSize?: string;
  imageCompressedSize?: string;
}

interface MediaInfo {
  file: File;
  preview: string;
  originalSize: string;
  compressedSize?: string;
  compressing: boolean;
  compressed?: File;
}

export default function NewLookPage() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const productImageRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Médias ──────────────────────────────────────────────────────────
  const [image,         setImage]         = useState<MediaInfo | null>(null);
  const [video,         setVideo]         = useState<MediaInfo | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // ── Infos look ──────────────────────────────────────────────────────
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [category,    setCategory]    = useState('');
  const [difficulty,  setDifficulty]  = useState('facile');
  const [isFeatured,  setIsFeatured]  = useState(false);

  // ── Produits ────────────────────────────────────────────────────────
  const [products,       setProducts]       = useState<ProductEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState('peau');

  // ── État global ─────────────────────────────────────────────────────
  const [saving,         setSaving]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [success,        setSuccess]        = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  // ── Gestion image look ───────────────────────────────────────────────
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setImage({ file, preview, originalSize: formatFileSize(file.size), compressing: true });
    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1600, quality: 0.82, outputFormat: 'image/webp' });
      setImage(prev => prev ? { ...prev, compressing: false, compressed, compressedSize: formatFileSize(compressed.size) } : null);
    } catch {
      setImage(prev => prev ? { ...prev, compressing: false } : null);
    }
  };

  // ── Gestion vidéo ────────────────────────────────────────────────────
  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setVideoProgress(0);
    setVideo({ file, preview, originalSize: formatFileSize(file.size), compressing: true });
    try {
      const compressed = await compressVideo(file, { maxSizeMB: 20, videoBitrate: 1_500_000, onProgress: setVideoProgress });
      setVideo(prev => prev ? { ...prev, compressing: false, compressed, compressedSize: formatFileSize(compressed.size) } : null);
    } catch {
      setVideo(prev => prev ? { ...prev, compressing: false } : null);
    }
  };

  // ── Gestion image produit (optionnelle) ──────────────────────────────
  const handleProductImageChange = async (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setProducts(prev => prev.map(p => p.tempId === tempId ? {
      ...p, imageFile: file, imagePreview: preview,
      imageOriginalSize: formatFileSize(file.size), imageCompressing: true,
    } : p));
    try {
      const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85, outputFormat: 'image/webp' });
      setProducts(prev => prev.map(p => p.tempId === tempId ? {
        ...p, imageCompressing: false, imageCompressed: compressed,
        imageCompressedSize: formatFileSize(compressed.size),
      } : p));
    } catch {
      setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, imageCompressing: false } : p));
    }
  };

  // ── Gestion produits ─────────────────────────────────────────────────
  const addProduct = () => {
    setProducts(prev => [...prev, {
      tempId: crypto.randomUUID(),
      name: '', brand: '', price: '',
      category: activeCategory, note: '',
    }]);
  };

  const updateProduct = (tempId: string, field: keyof ProductEntry, value: string) =>
    setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, [field]: value } : p));

  const removeProduct = (tempId: string) =>
    setProducts(prev => prev.filter(p => p.tempId !== tempId));

  const productsByCategory = PRODUCT_CATEGORIES
    .map(cat => ({ ...cat, items: products.filter(p => p.category === cat.id) }))
    .filter(cat => cat.items.length > 0);

  // ── Upload Cloudinary ────────────────────────────────────────────────
  const uploadToCloudinary = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.public_id as string;
  };

  // ── Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title    = 'Le titre est requis';
    if (!image)        e.image    = "L'image est requise";
    if (!category)     e.category = 'La catégorie est requise';
    if (image?.compressing || video?.compressing) e.compress = 'Attendez la fin de la compression';
    if (products.some(p => p.imageCompressing))  e.productImage = 'Attendez la compression des images produits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Sauvegarde ───────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      let cloudinaryImageId: string | null = null;
      let cloudinaryVideoId: string | null = null;

      if (image) {
        setUploadProgress("Upload de l'image compressée...");
        cloudinaryImageId = await uploadToCloudinary(image.compressed ?? image.file, 'image');
      }
      if (video) {
        setUploadProgress('Upload de la vidéo compressée...');
        cloudinaryVideoId = await uploadToCloudinary(video.compressed ?? video.file, 'video');
      }

      setUploadProgress('Création du look...');
      const { data: look, error: lookError } = await supabase
        .from('looks')
        .insert({
          title:               title.trim(),
          description:         description.trim() || null,
          category:            category || null,
          difficulty,
          creator_name:        'Admin',
          creator_username:    '@admin',
          cloudinary_image_id: cloudinaryImageId,
          cloudinary_video_id: cloudinaryVideoId,
          is_featured:         isFeatured,
          likes: 0, views: 0,
        })
        .select()
        .single();

      if (lookError) throw lookError;

      if (products.length > 0 && look) {
        setUploadProgress('Association des produits...');
        for (const product of products) {
          if (!product.name.trim()) continue;

          // Upload image produit si fournie
          let productCloudinaryId: string | null = null;
          if (product.imageFile) {
            setUploadProgress(`Upload image: ${product.name}...`);
            productCloudinaryId = await uploadToCloudinary(product.imageCompressed ?? product.imageFile, 'image');
          }

          let productId: string;
          const { data: existing } = await supabase
            .from('products').select('id').ilike('name', product.name.trim()).limit(1).maybeSingle();

          if (existing) {
            productId = existing.id;
            // Mettre à jour l'image si fournie
            if (productCloudinaryId) {
              await supabase.from('products').update({ cloudinary_id: productCloudinaryId }).eq('id', productId);
            }
          } else {
            const { data: newProduct, error: pErr } = await supabase
              .from('products')
              .insert({
                name:          product.name.trim(),
                brand:         product.brand.trim() || 'Marque inconnue',
                price:         parseFloat(product.price) || 0,
                category:      product.category,
                description:   '',
                cloudinary_id: productCloudinaryId,
              })
              .select().single();
            if (pErr) throw pErr;
            productId = newProduct.id;
          }

          await supabase.from('look_products').insert({
            look_id:    look.id,
            product_id: productId,
            category:   product.category,
            note:       product.note.trim() || null,
          });
        }
      }

      setSuccess(true);
      setTimeout(() => router.push('/admin/looks'), 2000);

    } catch (err: any) {
      console.error('Erreur:', err);
      setUploadProgress(`❌ ${err?.message || 'Erreur inconnue'}`);
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Look créé avec succès !</h2>
          <p className="text-gray-500">Redirection vers la liste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/looks" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Nouveau look</h1>
              <p className="text-xs text-gray-500">Remplissez les informations du look</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || image?.compressing || video?.compressing || products.some(p => p.imageCompressing)}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50"
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress || 'Sauvegarde...'}</>
              : <><CheckCircle className="h-4 w-4" />Publier le look</>
            }
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── MÉDIAS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-pink-500" />
              Médias du look
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Les fichiers sont automatiquement compressés avant l'envoi</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* IMAGE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photo du look <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => !image && imageInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors
                  ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-pink-400 bg-gray-50 hover:bg-pink-50'}
                  ${!image ? 'cursor-pointer' : ''}`}
                style={{ aspectRatio: '3/4' }}
              >
                {image ? (
                  <>
                    <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                    {image.compressing && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                        <p className="text-white text-sm font-semibold">Compression...</p>
                      </div>
                    )}
                    {!image.compressing && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-3 py-1.5 text-xs text-white flex justify-between">
                        <span>Avant : {image.originalSize}</span>
                        <span className="text-green-400 font-semibold">Après : {image.compressedSize}</span>
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Upload className="h-8 w-8" />
                    <p className="text-sm font-medium">Cliquer pour uploader</p>
                    <p className="text-xs">JPG, PNG, WEBP → compressé en WebP</p>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* VIDÉO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vidéo du look <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
              </label>
              <div
                onClick={() => !video && videoInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors
                  border-gray-200 hover:border-purple-400 bg-gray-50 hover:bg-purple-50
                  ${!video ? 'cursor-pointer' : ''}`}
                style={{ aspectRatio: '3/4' }}
              >
                {video ? (
                  <>
                    <video src={video.preview} className="w-full h-full object-cover" muted loop autoPlay />
                    {video.compressing && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 px-4">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                        <p className="text-white text-sm font-semibold">Compression vidéo...</p>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full transition-all duration-300" style={{ width: `${videoProgress}%` }} />
                        </div>
                        <p className="text-white/70 text-xs">{videoProgress}%</p>
                      </div>
                    )}
                    {!video.compressing && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-3 py-1.5 text-xs text-white flex justify-between">
                        <span>Avant : {video.originalSize}</span>
                        <span className="text-green-400 font-semibold">Après : {video.compressedSize}</span>
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setVideo(null); setVideoProgress(0); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Video className="h-8 w-8" />
                    <p className="text-sm font-medium">Cliquer pour uploader</p>
                    <p className="text-xs">MP4, MOV → compressé en WebM</p>
                  </div>
                )}
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            </div>
          </div>

          {(image?.compressing || video?.compressing) && (
            <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Compression en cours... Attendez la fin avant de publier.</p>
            </div>
          )}
        </div>

        {/* ── INFOS LOOK ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-500" />
              Informations du look
            </h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre du look <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Natural Glow Everyday"
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-pink-400'}`} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez ce look en quelques mots..." rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none text-sm resize-none transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie <span className="text-red-500">*</span></label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white transition-all ${errors.category ? 'border-red-400' : 'border-gray-200 focus:border-pink-400'}`}>
                  <option value="">Choisir...</option>
                  {LOOK_CATEGORIES.map(cat => <option key={cat} value={cat} className="capitalize">{cat}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulté</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none text-sm bg-white transition-all">
                  {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <input type="checkbox" id="featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-pink-500" />
              <label htmlFor="featured" className="text-sm font-medium text-yellow-800 cursor-pointer">⭐ Mettre ce look en vedette sur la page d'accueil</label>
            </div>
          </div>
        </div>

        {/* ── PRODUITS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Produits utilisés
              {products.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{products.length}</span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {/* Sélecteur catégorie */}
            <div className="flex gap-2 flex-wrap mb-5">
              {PRODUCT_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeCategory === cat.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Produits groupés */}
            {productsByCategory.length > 0 && (
              <div className="space-y-5 mb-5">
                {productsByCategory.map(cat => (
                  <div key={cat.id}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${cat.color}`}>{cat.label}</span>
                    <div className="space-y-4">
                      {cat.items.map(product => (
                        <div key={product.tempId} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">

                          {/* Ligne champs texte */}
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                              <label className="block text-xs text-gray-500 mb-1">Nom du produit *</label>
                              <input type="text" value={product.name} onChange={(e) => updateProduct(product.tempId, 'name', e.target.value)}
                                placeholder="Velvet Matte Lipstick"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-500 mb-1">Marque</label>
                              <input type="text" value={product.brand} onChange={(e) => updateProduct(product.tempId, 'brand', e.target.value)}
                                placeholder="MAC"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Prix (€)</label>
                              <input type="number" value={product.price} onChange={(e) => updateProduct(product.tempId, 'price', e.target.value)}
                                placeholder="29.90" min="0" step="0.01"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Note</label>
                              <input type="text" value={product.note} onChange={(e) => updateProduct(product.tempId, 'note', e.target.value)}
                                placeholder="Star du look !"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-1 flex items-end justify-center pb-1">
                              <button onClick={() => removeProduct(product.tempId)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Image produit optionnelle */}
                          <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                            <div className="flex-shrink-0">
                              <label className="block text-xs text-gray-500 mb-1">
                                Image <span className="text-gray-400">(optionnel)</span>
                              </label>
                              <div
                                onClick={() => productImageRefs.current[product.tempId]?.click()}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-pink-400 bg-white hover:bg-pink-50 cursor-pointer overflow-hidden flex items-center justify-center transition-colors relative"
                              >
                                {product.imagePreview ? (
                                  <>
                                    <img src={product.imagePreview} alt="" className="w-full h-full object-cover" />
                                    {product.imageCompressing && (
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <Upload className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { productImageRefs.current[product.tempId] = el; }}
                                onChange={(e) => handleProductImageChange(product.tempId, e)}
                              />
                            </div>

                            {product.imageFile && !product.imageCompressing ? (
                              <div className="flex items-center gap-2">
                                <div className="text-xs bg-gray-100 rounded-lg px-3 py-2 text-gray-500">
                                  <span>{product.imageOriginalSize}</span>
                                  <span className="mx-1 text-gray-400">→</span>
                                  <span className="text-green-600 font-semibold">{product.imageCompressedSize}</span>
                                </div>
                                <button
                                  onClick={() => setProducts(prev => prev.map(p => p.tempId === product.tempId
                                    ? { ...p, imageFile: undefined, imagePreview: undefined, imageCompressed: undefined, imageOriginalSize: undefined, imageCompressedSize: undefined }
                                    : p
                                  ))}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : product.imageCompressing ? (
                              <p className="text-xs text-amber-600 font-medium">Compression en cours...</p>
                            ) : (
                              <p className="text-xs text-gray-400">Cliquez sur le carré pour ajouter une image au produit</p>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={addProduct}
              className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-pink-400 hover:bg-pink-50 rounded-xl text-sm font-semibold text-gray-500 hover:text-pink-600 transition-all flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un produit "{PRODUCT_CATEGORIES.find(c => c.id === activeCategory)?.label}"
            </button>

            {products.length === 0 && (
              <p className="text-center text-xs text-gray-400 mt-3">Sélectionnez une catégorie et ajoutez les produits utilisés dans ce look</p>
            )}
          </div>
        </div>

        {/* ── BOUTONS FINAUX ── */}
        <div className="flex gap-3 pb-8">
          <Link href="/admin/looks"
            className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-center hover:bg-gray-50 transition-colors">
            Annuler
          </Link>
          <button onClick={handleSave}
            disabled={saving || image?.compressing || video?.compressing || products.some(p => p.imageCompressing)}
            className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 className="h-5 w-5 animate-spin" />{uploadProgress || 'Sauvegarde...'}</>
              : <><CheckCircle className="h-5 w-5" />Publier le look</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}