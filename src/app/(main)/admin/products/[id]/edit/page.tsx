'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { compressImage, formatFileSize } from '@/lib/compress';
import { ArrowLeft, Upload, X, Plus, Trash2, Package, Tag, Loader2, CheckCircle, Palette } from 'lucide-react';

// ✅ LISTE UNIFIÉE
const PRODUCT_CATEGORIES = [
  { id: 'peau',        label: '✨ Peau' },
  { id: 'yeux',        label: '👁️ Yeux' },
  { id: 'cils',        label: '🪄 Cils' },
  { id: 'levres',      label: '💋 Lèvres' },
  { id: 'sourcils',    label: '🎨 Sourcils' },
  { id: 'highlighter', label: '⭐ Highlighter' },
  { id: 'blush',       label: '🌸 Blush' },
  { id: 'contour',     label: '🔲 Contour' },
  { id: 'autre',       label: '📦 Autre' },
];

interface Shade { tempId: string; name: string; hex: string; }
interface MediaInfo { file: File; preview: string; originalSize: string; compressedSize?: string; compressing: boolean; compressed?: File; }

export default function EditProductPage() {
  const router    = useRouter();
  const params    = useParams();
  const productId = params.id as string;
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [loadingData,     setLoadingData]     = useState(true);
  const [image,           setImage]           = useState<MediaInfo | null>(null);
  const [existingImageId, setExistingImageId] = useState<string | null>(null);
  const [name,        setName]        = useState('');
  const [brand,       setBrand]       = useState('');
  const [price,       setPrice]       = useState('');
  const [category,    setCategory]    = useState('');
  const [description, setDescription] = useState('');
  const [shades,    setShades]    = useState<Shade[]>([]);
  const [hasShades, setHasShades] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [success,        setSuccess]        = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  useEffect(() => { if (productId) fetchProduct(); }, [productId]);

  const fetchProduct = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error || !data) throw error;
      setName(data.name || '');
      setBrand(data.brand || '');
      setPrice(String(data.price || ''));
      // ✅ Normaliser la catégorie vers la liste unifiée
      setCategory(normalizeCategory(data.category));
      setDescription(data.description || '');
      setExistingImageId(data.cloudinary_id || null);
      if (data.shades) {
        try {
          const parsed = typeof data.shades === 'string' ? JSON.parse(data.shades) : data.shades;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setShades(parsed.map((s: any) => ({ tempId: crypto.randomUUID(), name: s.name || '', hex: s.hex || '#F5C6A5' })));
            setHasShades(true);
          }
        } catch { setHasShades(false); }
      }
    } catch (err) { console.error('Erreur:', err); }
    finally { setLoadingData(false); }
  };

  // ✅ Normalise les anciennes catégories vers les nouvelles
  const normalizeCategory = (cat: string | null | undefined): string => {
    if (!cat) return 'autre';
    const known = PRODUCT_CATEGORIES.map(c => c.id);
    if (known.includes(cat)) return cat;
    const map: Record<string, string> = {
      'teint': 'peau', 'correcteur': 'peau', 'fond-de-teint': 'peau',
      'mascara': 'cils', 'lèvres': 'levres',
      'fard à paupières': 'yeux', 'eye-liner': 'yeux', 'eyeliner': 'yeux',
    };
    return map[cat.toLowerCase()] || 'autre';
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const preview = URL.createObjectURL(file);
    setImage({ file, preview, originalSize: formatFileSize(file.size), compressing: true });
    try {
      const compressed = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85, outputFormat: 'image/webp' });
      setImage(prev => prev ? { ...prev, compressing: false, compressed, compressedSize: formatFileSize(compressed.size) } : null);
    } catch { setImage(prev => prev ? { ...prev, compressing: false } : null); }
  };

  const addShade = () => setShades(prev => [...prev, { tempId: crypto.randomUUID(), name: '', hex: '#F5C6A5' }]);
  const updateShade = (id: string, field: 'name' | 'hex', val: string) => setShades(prev => prev.map(s => s.tempId === id ? { ...s, [field]: val } : s));
  const removeShade = (id: string) => setShades(prev => prev.filter(s => s.tempId !== id));

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', 'ml_default');
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
    const data = await res.json(); if (data.error) throw new Error(data.error.message);
    return data.public_id;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name     = 'Le nom est requis';
    if (!brand.trim()) e.brand    = 'La marque est requise';
    if (!price)        e.price    = 'Le prix est requis';
    if (!category)     e.category = 'La catégorie est requise';
    if (image?.compressing) e.compress = 'Attendez la compression';
    if (hasShades && shades.some(s => !s.name.trim())) e.shades = 'Remplissez tous les noms';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return; setSaving(true);
    try {
      let cloudinaryId = existingImageId;
      if (image) { setUploadProgress("Upload image..."); cloudinaryId = await uploadToCloudinary(image.compressed ?? image.file); }
      setUploadProgress('Mise à jour...');
      const shadesData = hasShades && shades.length > 0 ? shades.filter(s => s.name.trim()).map(s => ({ id: s.tempId, name: s.name.trim(), hex: s.hex })) : null;
      const { error } = await supabase.from('products').update({ name: name.trim(), brand: brand.trim(), price: parseFloat(price), category, description: description.trim() || null, cloudinary_id: cloudinaryId, shades: shadesData ? JSON.stringify(shadesData) : null }).eq('id', productId);
      if (error) throw error;
      setSuccess(true); setTimeout(() => router.push('/admin/products'), 2000);
    } catch (err: any) { setUploadProgress(`❌ ${err?.message}`); setSaving(false); }
  };

  if (loadingData) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto mb-4" /><p className="text-gray-500 text-sm">Chargement...</p></div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-10 w-10 text-green-500" /></div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit modifié !</h2><p className="text-gray-500">Redirection...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft className="h-5 w-5" /></Link>
            <div><h1 className="text-lg font-bold text-gray-900">Modifier le produit</h1><p className="text-xs text-gray-500 truncate max-w-xs">{name}</p></div>
          </div>
          <button onClick={handleSave} disabled={saving || image?.compressing}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 font-semibold text-sm disabled:opacity-50">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />{uploadProgress || 'Sauvegarde...'}</> : <><CheckCircle className="h-4 w-4" />Enregistrer</>}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* IMAGE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900 flex items-center gap-2"><Package className="h-5 w-5 text-purple-500" />Photo du produit</h2><p className="text-xs text-gray-400 mt-0.5">Laissez vide pour garder la photo actuelle</p></div>
          <div className="p-6 flex justify-center">
            <div className="w-64">
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                {existingImageId && !image && (<>
                  <img src={getCloudinaryUrl(existingImageId)} alt={name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">✓ Actuelle</div>
                  <button onClick={() => imageInputRef.current?.click()} className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs py-2 rounded-lg hover:bg-black text-center font-semibold">Changer la photo</button>
                </>)}
                {!existingImageId && !image && (
                  <div onClick={() => imageInputRef.current?.click()} className={`w-full h-full border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-400 ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-purple-400 bg-gray-50'}`}>
                    <Upload className="h-8 w-8" /><p className="text-sm">Cliquer pour uploader</p>
                  </div>
                )}
                {image && (<>
                  <img src={image.preview} alt="" className="w-full h-full object-cover" />
                  {image.compressing && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="h-8 w-8 text-white animate-spin" /></div>}
                  {!image.compressing && <div className="absolute bottom-2 left-2 right-2 bg-black/70 rounded-lg px-2 py-1 text-xs text-white flex justify-between"><span>{image.originalSize}</span><span className="text-green-400">→ {image.compressedSize}</span></div>}
                  <button onClick={() => setImage(null)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center"><X className="h-4 w-4" /></button>
                </>)}
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
          </div>
        </div>

        {/* INFOS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900 flex items-center gap-2"><Tag className="h-5 w-5 text-pink-500" />Informations</h2></div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-purple-400'}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marque <span className="text-red-500">*</span></label>
                <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 ${errors.brand ? 'border-red-400' : 'border-gray-200 focus:border-purple-400'}`} />
                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prix (€) <span className="text-red-500">*</span></label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 ${errors.price ? 'border-red-400' : 'border-gray-200 focus:border-purple-400'}`} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Catégorie <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${category === cat.id ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="text-gray-400 text-xs font-normal">(optionnel)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-sm resize-none" />
            </div>
          </div>
        </div>

        {/* TEINTES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Palette className="h-5 w-5 text-pink-500" />Teintes {shades.length > 0 && <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-bold rounded-full">{shades.length}</span>}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">A des teintes</span>
              <button onClick={() => { setHasShades(!hasShades); if (hasShades) setShades([]); }} className={`relative w-10 h-5 rounded-full transition-colors ${hasShades ? 'bg-pink-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hasShades ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          {hasShades ? (
            <div className="p-6">
              {shades.length > 0 && <div className="space-y-3 mb-4">
                {shades.map((shade, i) => (
                  <div key={shade.tempId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <input type="color" value={shade.hex} onChange={e => updateShade(shade.tempId, 'hex', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 p-0.5" />
                    <input type="text" value={shade.hex} onChange={e => updateShade(shade.tempId, 'hex', e.target.value)} className="w-24 px-2 py-2 rounded-lg border border-gray-200 text-xs font-mono" />
                    <input type="text" value={shade.name} onChange={e => updateShade(shade.tempId, 'name', e.target.value)} placeholder="Nude Rose..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: shade.hex }} />
                    <button onClick={() => removeShade(shade.tempId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>}
              {errors.shades && <p className="text-red-500 text-xs mb-3">{errors.shades}</p>}
              <button onClick={addShade} className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-pink-400 hover:bg-pink-50 rounded-xl text-sm font-semibold text-gray-500 hover:text-pink-600 flex items-center justify-center gap-2"><Plus className="h-4 w-4" />Ajouter une teinte</button>
            </div>
          ) : <div className="px-6 py-4"><p className="text-sm text-gray-400 text-center">Pas de teintes</p></div>}
        </div>

        <div className="flex gap-3 pb-8">
          <Link href="/admin/products" className="flex-1 py-4 rounded-xl border border-gray-200 text-gray-700 font-semibold text-center hover:bg-gray-50">Annuler</Link>
          <button onClick={handleSave} disabled={saving || image?.compressing}
            className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="h-5 w-5 animate-spin" />{uploadProgress}</> : <><CheckCircle className="h-5 w-5" />Enregistrer les modifications</>}
          </button>
        </div>
      </div>
    </div>
  );
}