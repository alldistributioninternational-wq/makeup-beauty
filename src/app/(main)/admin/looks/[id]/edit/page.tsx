'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { compressImage, compressVideo, formatFileSize } from '@/lib/compress';
import { getCloudinaryUrl } from '@/lib/cloudinary';
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
  { id: 'contour',     label: '🔲 Contour',      color: 'bg-stone-100 text-stone-700 border-stone-200' },
  { id: 'autre',       label: '📦 Autre',        color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const KNOWN_CATEGORY_IDS = PRODUCT_CATEGORIES.map(c => c.id);
const LOOK_CATEGORIES = ['naturel', 'glamour', 'soirée', 'tous-les-jours', 'bold', 'smoky'];
const DIFFICULTIES    = ['facile', 'intermédiaire', 'difficile'];

interface ProductEntry {
  tempId: string;
  productId?: string;
  lookProductId?: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  note: string;
  imageFile?: File;
  imagePreview?: string;
  imageCompressing?: boolean;
  imageCompressed?: File;
  imageOriginalSize?: string;
  imageCompressedSize?: string;
  existingCloudinaryId?: string | null;
}

interface MediaInfo {
  file: File;
  preview: string;
  originalSize: string;
  compressedSize?: string;
  compressing: boolean;
  compressed?: File;
}

function normalizeCategory(cat: string | null | undefined): string {
  if (!cat) return 'autre';
  const lower = cat.toLowerCase().trim();
  if (KNOWN_CATEGORY_IDS.includes(lower)) return lower;
  const map: Record<string, string> = {
    'lèvres': 'levres', 'levres': 'levres',
    'eyes': 'yeux', 'eye': 'yeux',
    'lips': 'levres', 'skin': 'peau',
    'brows': 'sourcils', 'lashes': 'cils',
    'teint': 'peau', 'correcteur': 'peau',
    'mascara': 'cils', 'fond-de-teint': 'peau',
    'rouge à lèvres': 'levres', 'gloss': 'levres',
    'fard à paupières': 'yeux', 'eye-liner': 'yeux',
  };
  return map[lower] || 'autre';
}

export default function EditLookPage() {
  const router  = useRouter();
  const params  = useParams();
  const lookId  = params.id as string;

  const imageInputRef    = useRef<HTMLInputElement>(null);
  const videoInputRef    = useRef<HTMLInputElement>(null);
  const productImageRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [loadingData,     setLoadingData]     = useState(true);
  const [image,           setImage]           = useState<MediaInfo | null>(null);
  const [video,           setVideo]           = useState<MediaInfo | null>(null);
  const [videoProgress,   setVideoProgress]   = useState(0);
  const [existingImageId, setExistingImageId] = useState<string | null>(null);
  const [existingVideoId, setExistingVideoId] = useState<string | null>(null);
  const [title,           setTitle]           = useState('');
  const [description,     setDescription]     = useState('');
  const [category,        setCategory]        = useState('');
  const [difficulty,      setDifficulty]      = useState('facile');
  const [isFeatured,      setIsFeatured]      = useState(false);
  const [showInTrending,  setShowInTrending]  = useState(false);  // ✅ NOUVEAU
  const [showInTopLips,   setShowInTopLips]   = useState(false);  // ✅ NOUVEAU
 const [showInTopEyes,   setShowInTopEyes]   = useState(false);  // ✅ NOUVEAU
  const [products,        setProducts]        = useState<ProductEntry[]>([]);
  const [activeCategory,  setActiveCategory]  = useState('peau');
  const [saving,          setSaving]          = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState('');
  const [success,         setSuccess]         = useState(false);
  const [errors,          setErrors]          = useState<Record<string, string>>({});

  useEffect(() => { if (lookId) fetchLookData(); }, [lookId]);

  const fetchLookData = async () => {
    setLoadingData(true);
    try {
      const { data: look, error } = await supabase
        .from('looks').select('*').eq('id', lookId).single();
      if (error || !look) throw error;

      setTitle(look.title || '');
      setDescription(look.description || '');
      setCategory(look.category || '');
      setDifficulty(look.difficulty || 'facile');
      setIsFeatured(look.is_featured || false);
      setShowInTrending(look.show_in_trending || false);  // ✅ NOUVEAU
      setShowInTopLips(look.show_in_top_lips || false);   // ✅ NOUVEAU
      setShowInTopEyes(look.show_in_top_eyes || false);   // ✅ NOUVEAU
      setExistingImageId(look.cloudinary_image_id || null);
      setExistingVideoId(look.cloudinary_video_id || null);

      const { data: lookProducts } = await supabase
        .from('look_products').select('*, products(*)').eq('look_id', lookId);

      if (lookProducts && lookProducts.length > 0) {
        setProducts(lookProducts.map((lp: any) => ({
          tempId:               crypto.randomUUID(),
          productId:            lp.product_id,
          lookProductId:        lp.id,
          name:                 lp.products?.name  || '',
          brand:                lp.products?.brand || '',
          price:                String(lp.products?.price || ''),
          category:             normalizeCategory(lp.category || lp.products?.category),
          note:                 lp.note || '',
          existingCloudinaryId: lp.products?.cloudinary_id || null,
        })));
      }
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const preview = URL.createObjectURL(file);
    setImage({ file, preview, originalSize: formatFileSize(file.size), compressing: true });
    try {
      const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1600, quality: 0.82, outputFormat: 'image/webp' });
      setImage(prev => prev ? { ...prev, compressing: false, compressed, compressedSize: formatFileSize(compressed.size) } : null);
    } catch { setImage(prev => prev ? { ...prev, compressing: false } : null); }
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const preview = URL.createObjectURL(file);
    setVideoProgress(0);
    setVideo({ file, preview, originalSize: formatFileSize(file.size), compressing: true });
    try {
      const compressed = await compressVideo(file, { maxSizeMB: 20, videoBitrate: 1_500_000, onProgress: setVideoProgress });
      setVideo(prev => prev ? { ...prev, compressing: false, compressed, compressedSize: formatFileSize(compressed.size) } : null);
    } catch { setVideo(prev => prev ? { ...prev, compressing: false } : null); }
  };

  const handleProductImageChange = async (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
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
    } catch { setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, imageCompressing: false } : p)); }
  };

  const addProduct = () => setProducts(prev => [...prev, {
    tempId: crypto.randomUUID(), name: '', brand: '', price: '',
    category: activeCategory, note: '',
  }]);

  const updateProduct = (tempId: string, field: keyof ProductEntry, value: string) =>
    setProducts(prev => prev.map(p => p.tempId === tempId ? { ...p, [field]: value } : p));

  const removeProduct = (tempId: string) =>
    setProducts(prev => prev.filter(p => p.tempId !== tempId));

  const productsByCategory = PRODUCT_CATEGORIES
    .map(cat => ({ ...cat, items: products.filter(p => p.category === cat.id) }))
    .filter(cat => cat.items.length > 0);

  const uploadToCloudinary = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.public_id as string;
  };

  const getCloudinaryVideoUrl = (publicId: string) => {
    const base = getCloudinaryUrl(publicId);
    return base.replace('/image/upload/', '/video/upload/');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim())              e.title       = 'Le titre est requis';
    if (!category)                  e.category    = 'La catégorie est requise';
    if (!existingImageId && !image) e.image       = "L'image est requise";
    if (image?.compressing || video?.compressing) e.compress = 'Attendez la fin de la compression';
    if (products.some(p => p.imageCompressing))  e.productImage = 'Attendez la compression des images produits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let cloudinaryImageId = existingImageId;
      let cloudinaryVideoId = existingVideoId;

      if (image) { setUploadProgress("Upload de l'image..."); cloudinaryImageId = await uploadToCloudinary(image.compressed ?? image.file, 'image'); }
      if (video) { setUploadProgress('Upload de la vidéo...'); cloudinaryVideoId = await uploadToCloudinary(video.compressed ?? video.file, 'video'); }

      setUploadProgress('Mise à jour du look...');
      const { error: lookError } = await supabase.from('looks').update({
        title: title.trim(), description: description.trim() || null,
        category: category || null, difficulty,
        cloudinary_image_id: cloudinaryImageId, cloudinary_video_id: cloudinaryVideoId,
        is_featured: isFeatured,show_in_trending: showInTrending,    // ✅ NOUVEAU
  show_in_top_lips: showInTopLips,     // ✅ NOUVEAU
  show_in_top_eyes: showInTopEyes,     // ✅ NOUVEAU
      }).eq('id', lookId);
      if (lookError) throw lookError;

      await supabase.from('look_products').delete().eq('look_id', lookId);

      if (products.length > 0) {
        setUploadProgress('Mise à jour des produits...');
        for (const product of products) {
          if (!product.name.trim()) continue;
          let productCloudinaryId = product.existingCloudinaryId || null;
          if (product.imageFile) {
            setUploadProgress(`Upload image: ${product.name}...`);
            productCloudinaryId = await uploadToCloudinary(product.imageCompressed ?? product.imageFile, 'image');
          }
          let productId: string;
          if (product.productId) {
            await supabase.from('products').update({
              name: product.name.trim(), brand: product.brand.trim() || 'Marque inconnue',
              price: parseFloat(product.price) || 0, category: product.category,
              ...(productCloudinaryId && { cloudinary_id: productCloudinaryId }),
            }).eq('id', product.productId);
            productId = product.productId;
          } else {
            const { data: existing } = await supabase.from('products').select('id').ilike('name', product.name.trim()).limit(1).maybeSingle();
            if (existing) {
              productId = existing.id;
              if (productCloudinaryId) await supabase.from('products').update({ cloudinary_id: productCloudinaryId }).eq('id', productId);
            } else {
              const { data: newP, error: pErr } = await supabase.from('products')
                .insert({ name: product.name.trim(), brand: product.brand.trim() || 'Marque inconnue', price: parseFloat(product.price) || 0, category: product.category, description: '', cloudinary_id: productCloudinaryId })
                .select().single();
              if (pErr) throw pErr;
              productId = newP.id;
            }
          }
          await supabase.from('look_products').insert({ look_id: lookId, product_id: productId, category: product.category, note: product.note.trim() || null });
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

  if (loadingData) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Chargement du look...</p>
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Look modifié avec succès !</h2>
        <p className="text-gray-500">Redirection vers la liste...</p>
      </div>
    </div>
  );

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
              <h1 className="text-lg font-bold text-gray-900">Modifier le look</h1>
              <p className="text-xs text-gray-500 truncate max-w-xs">{title}</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || image?.compressing || video?.compressing}
            className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50">
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress || 'Sauvegarde...'}</>
              : <><CheckCircle className="h-4 w-4" />Enregistrer les modifications</>}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── MÉDIAS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-pink-500" />Médias du look
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Laissez vide pour garder les médias actuels</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IMAGE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo du look</label>
              {existingImageId && !image && (
                <div className="relative rounded-xl overflow-hidden border-2 border-green-200" style={{ aspectRatio: '3/4' }}>
                  <img src={getCloudinaryUrl(existingImageId)} alt="Actuelle" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">✓ Actuelle</div>
                  <button onClick={() => imageInputRef.current?.click()}
                    className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs py-2 rounded-lg hover:bg-black transition-colors text-center font-semibold">
                    Changer l'image
                  </button>
                </div>
              )}
              {!existingImageId && !image && (
                <div onClick={() => imageInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-pink-400 bg-gray-50 hover:bg-pink-50'}`}
                  style={{ aspectRatio: '3/4' }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Upload className="h-8 w-8" /><p className="text-sm font-medium">Cliquer pour uploader</p>
                  </div>
                </div>
              )}
              {image && (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200" style={{ aspectRatio: '3/4' }}>
                  <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                  {image.compressing && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2"><Loader2 className="h-8 w-8 text-white animate-spin" /><p className="text-white text-sm font-semibold">Compression...</p></div>}
                  {!image.compressing && <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-3 py-1.5 text-xs text-white flex justify-between"><span>{image.originalSize}</span><span className="text-green-400 font-semibold">→ {image.compressedSize}</span></div>}
                  <button onClick={() => setImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"><X className="h-4 w-4" /></button>
                </div>
              )}
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* VIDÉO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vidéo du look <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
              </label>
              {existingVideoId && !video && (
                <div className="relative rounded-xl overflow-hidden border-2 border-green-200" style={{ aspectRatio: '3/4' }}>
                  <video key={existingVideoId} src={getCloudinaryVideoUrl(existingVideoId)} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">✓ Actuelle</div>
                  <button onClick={() => videoInputRef.current?.click()}
                    className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs py-2 rounded-lg hover:bg-black transition-colors text-center font-semibold">
                    Changer la vidéo
                  </button>
                </div>
              )}
              {!existingVideoId && !video && (
                <div onClick={() => videoInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-200 hover:border-purple-400 bg-gray-50 hover:bg-purple-50 rounded-xl cursor-pointer transition-colors"
                  style={{ aspectRatio: '3/4' }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Video className="h-8 w-8" /><p className="text-sm font-medium">Ajouter une vidéo</p>
                  </div>
                </div>
              )}
              {video && (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200" style={{ aspectRatio: '3/4' }}>
                  <video src={video.preview} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  {video.compressing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 px-4">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                      <p className="text-white text-sm font-semibold">Compression vidéo...</p>
                      <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-purple-400 h-2 rounded-full transition-all" style={{ width: `${videoProgress}%` }} /></div>
                      <p className="text-white/70 text-xs">{videoProgress}%</p>
                    </div>
                  )}
                  {!video.compressing && <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-3 py-1.5 text-xs text-white flex justify-between"><span>{video.originalSize}</span><span className="text-green-400 font-semibold">→ {video.compressedSize}</span></div>}
                  <button onClick={() => { setVideo(null); setVideoProgress(0); }} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"><X className="h-4 w-4" /></button>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
            </div>
          </div>

          {(image?.compressing || video?.compressing) && (
            <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">Compression en cours... Attendez avant d'enregistrer.</p>
            </div>
          )}
        </div>

        {/* ── INFOS LOOK ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="h-5 w-5 text-purple-500" />Informations du look</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-pink-400'}`} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none text-sm resize-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie <span className="text-red-500">*</span></label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white transition-all ${errors.category ? 'border-red-400' : 'border-gray-200 focus:border-pink-400'}`}>
                  <option value="">Choisir...</option>
                  {LOOK_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Difficulté</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none text-sm bg-white transition-all">
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <input type="checkbox" id="featured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-pink-500" />
              <label htmlFor="featured" className="text-sm font-medium text-yellow-800 cursor-pointer">⭐ Mettre en vedette sur la page d'accueil</label>
            </div>
          </div>
        </div>
    

{/* ✅ NOUVELLES OPTIONS D'AFFICHAGE */}
<div className="space-y-3">
  <p className="text-sm font-semibold text-gray-700">Afficher dans les sections :</p>
  
  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl border border-pink-200">
    <input type="checkbox" id="trending" checked={showInTrending} onChange={e => setShowInTrending(e.target.checked)} className="w-4 h-4 accent-pink-500" />
    <label htmlFor="trending" className="text-sm font-medium text-pink-800 cursor-pointer">🔥 Looks Tendances</label>
  </div>

  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
    <input type="checkbox" id="topLips" checked={showInTopLips} onChange={e => setShowInTopLips(e.target.checked)} className="w-4 h-4 accent-red-500" />
    <label htmlFor="topLips" className="text-sm font-medium text-red-800 cursor-pointer">💋 Top Looks Lèvres</label>
  </div>

  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
    <input type="checkbox" id="topEyes" checked={showInTopEyes} onChange={e => setShowInTopEyes(e.target.checked)} className="w-4 h-4 accent-blue-500" />
    <label htmlFor="topEyes" className="text-sm font-medium text-blue-800 cursor-pointer">👁️ Top Looks Yeux</label>
  </div>
</div>
        {/* ── PRODUITS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />Produits utilisés
              {products.length > 0 && <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{products.length}</span>}
            </h2>
          </div>
          <div className="p-6">

            {/* Filtre / ajout par catégorie */}
            <div className="flex gap-2 flex-wrap mb-5">
              {PRODUCT_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                  {cat.label}
                  {products.filter(p => p.category === cat.id).length > 0 && (
                    <span className="ml-1.5 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {products.filter(p => p.category === cat.id).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Produits groupés par catégorie */}
            {productsByCategory.length > 0 && (
              <div className="space-y-5 mb-5">
                {productsByCategory.map(cat => (
                  <div key={cat.id}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${cat.color}`}>{cat.label}</span>
                    <div className="space-y-4">
                      {cat.items.map(product => (
                        <div key={product.tempId} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">

                          {/* Ligne 1 : champs texte */}
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                              <label className="block text-xs text-gray-500 mb-1">Nom du produit *</label>
                              <input type="text" value={product.name} onChange={e => updateProduct(product.tempId, 'name', e.target.value)}
                                placeholder="Velvet Matte Lipstick"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-gray-500 mb-1">Marque</label>
                              <input type="text" value={product.brand} onChange={e => updateProduct(product.tempId, 'brand', e.target.value)}
                                placeholder="MAC"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Prix (€)</label>
                              <input type="number" value={product.price} onChange={e => updateProduct(product.tempId, 'price', e.target.value)}
                                placeholder="29.90" min="0" step="0.01"
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-pink-400 focus:outline-none text-sm bg-white" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Note</label>
                              <input type="text" value={product.note} onChange={e => updateProduct(product.tempId, 'note', e.target.value)}
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

                          {/* ✅ Ligne 2 : sélecteur de catégorie */}
                          <div className="pt-2 border-t border-gray-100">
                            <label className="block text-xs text-gray-500 mb-2">Catégorie du produit</label>
                            <div className="flex gap-1.5 flex-wrap">
                              {PRODUCT_CATEGORIES.map(c => (
                                <button key={c.id} type="button"
                                  onClick={() => updateProduct(product.tempId, 'category', c.id)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                                    product.category === c.id
                                      ? `${c.color} ring-2 ring-offset-1 ring-pink-400`
                                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                  }`}>
                                  {c.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Ligne 3 : image produit optionnelle */}
                          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                            <div className="flex-shrink-0">
                              <label className="block text-xs text-gray-500 mb-1">Image <span className="text-gray-400">(optionnel)</span></label>
                              <div onClick={() => productImageRefs.current[product.tempId]?.click()}
                                className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 hover:border-pink-400 bg-white hover:bg-pink-50 cursor-pointer overflow-hidden flex items-center justify-center transition-colors relative">
                                {product.imagePreview ? (
                                  <>
                                    <img src={product.imagePreview} alt="" className="w-full h-full object-cover" />
                                    {product.imageCompressing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="h-4 w-4 text-white animate-spin" /></div>}
                                  </>
                                ) : product.existingCloudinaryId ? (
                                  <img src={getCloudinaryUrl(product.existingCloudinaryId)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Upload className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <input type="file" accept="image/*" className="hidden"
                                ref={el => { productImageRefs.current[product.tempId] = el; }}
                                onChange={e => handleProductImageChange(product.tempId, e)} />
                            </div>
                            {product.imageFile && !product.imageCompressing ? (
                              <div className="flex items-center gap-2">
                                <div className="text-xs bg-gray-100 rounded-lg px-3 py-2 text-gray-500">
                                  <span>{product.imageOriginalSize}</span><span className="mx-1 text-gray-400">→</span>
                                  <span className="text-green-600 font-semibold">{product.imageCompressedSize}</span>
                                </div>
                                <button onClick={() => setProducts(prev => prev.map(p => p.tempId === product.tempId
                                  ? { ...p, imageFile: undefined, imagePreview: undefined, imageCompressed: undefined } : p))}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : !product.imageFile && !product.existingCloudinaryId ? (
                              <p className="text-xs text-gray-400">Cliquez sur le carré pour ajouter une image</p>
                            ) : null}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback produits avec catégorie non reconnue */}
            {productsByCategory.length === 0 && products.length > 0 && (
              <div className="space-y-4 mb-5">
                {products.map(product => (
                  <div key={product.tempId} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4"><input type="text" value={product.name} onChange={e => updateProduct(product.tempId, 'name', e.target.value)} placeholder="Nom" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" /></div>
                      <div className="col-span-3"><input type="text" value={product.brand} onChange={e => updateProduct(product.tempId, 'brand', e.target.value)} placeholder="Marque" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" /></div>
                      <div className="col-span-2"><input type="number" value={product.price} onChange={e => updateProduct(product.tempId, 'price', e.target.value)} placeholder="Prix" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" /></div>
                      <div className="col-span-2"><input type="text" value={product.note} onChange={e => updateProduct(product.tempId, 'note', e.target.value)} placeholder="Note" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" /></div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button onClick={() => removeProduct(product.tempId)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {/* Sélecteur catégorie aussi dans le fallback */}
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs text-gray-500 mb-2">Catégorie du produit</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {PRODUCT_CATEGORIES.map(c => (
                          <button key={c.id} type="button"
                            onClick={() => updateProduct(product.tempId, 'category', c.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                              product.category === c.id
                                ? `${c.color} ring-2 ring-offset-1 ring-pink-400`
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}>
                            {c.label}
                          </button>
                        ))}
                      </div>
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

            {products.length === 0 && <p className="text-center text-xs text-gray-400 mt-3">Aucun produit associé à ce look</p>}
          </div>
        </div>

        {/* ── BOUTONS ── */}
        <div className="flex gap-3 pb-8">
          <Link href="/admin/looks" className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-center hover:bg-gray-50 transition-colors">Annuler</Link>
          <button onClick={handleSave} disabled={saving || image?.compressing || video?.compressing}
            className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving
              ? <><Loader2 className="h-5 w-5 animate-spin" />{uploadProgress || 'Sauvegarde...'}</>
              : <><CheckCircle className="h-5 w-5" />Enregistrer les modifications</>}
          </button>
        </div>
      </div>
    </div>
  );
}