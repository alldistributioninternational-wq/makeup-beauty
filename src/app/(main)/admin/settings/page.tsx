'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Save, Globe, Mail, Instagram,
  Truck, FileText, Palette, CheckCircle,
  Loader2, ChevronDown, ChevronUp
} from 'lucide-react';

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  homepage_title: string;
  homepage_subtitle: string;
  delivery_free_threshold: string;
  delivery_standard_days: string;
  delivery_express_days: string;
  delivery_express_price: string;
  cgv_text: string;
  mentions_legales: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'Ilma Skin',
  site_tagline: 'Révèle ta beauté naturelle',
  site_description: 'Découvrez les meilleurs looks et produits beauté',
  primary_color: '#ec4899',
  secondary_color: '#a855f7',
  contact_email: '',
  contact_phone: '',
  contact_whatsapp: '',
  instagram_url: '',
  tiktok_url: '',
  facebook_url: '',
  homepage_title: 'Découvre ton prochain look',
  homepage_subtitle: 'Des looks inspirants avec les produits qui vont avec',
  delivery_free_threshold: '50',
  delivery_standard_days: '3-5',
  delivery_express_days: '24h',
  delivery_express_price: '9.90',
  cgv_text: '',
  mentions_legales: '',
};

type SectionKey = 'general' | 'apparence' | 'contact' | 'reseaux' | 'homepage' | 'livraison' | 'legal';

export default function AdminSettingsPage() {
  const [settings, setSettings]   = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [saved,    setSaved]      = useState(false);
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    general:   true,
    apparence: true,
    contact:   true,
    reseaux:   true,
    homepage:  true,
    livraison: true,
    legal:     true,
  });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (data) {
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    }
    setLoading(false);
  };

  const update = (key: keyof SiteSettings, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const toggleSection = (key: SectionKey) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from('site_settings')
          .update(settings)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('site_settings')
          .insert(settings);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500" />
      </div>
    );
  }

  const Section = ({
    id, icon: Icon, title, subtitle, color, children
  }: {
    id: SectionKey;
    icon: React.ElementType;
    title: string;
    subtitle: string;
    color: string;
    children: React.ReactNode;
  }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        {openSections[id]
          ? <ChevronUp className="h-4 w-4 text-gray-400" />
          : <ChevronDown className="h-4 w-4 text-gray-400" />
        }
      </button>

      {openSections[id] && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-50 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  const Field = ({
    label, value, onChange, placeholder, type = 'text', required = false, hint
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none text-sm transition-all"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const TextArea = ({
    label, value, onChange, placeholder, rows = 4, hint
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    rows?: number;
    hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none text-sm resize-none transition-all"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Paramètres du site</h1>
              <p className="text-xs text-gray-500">Configuration générale de {settings.site_name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all disabled:opacity-50
              ${saved
                ? 'bg-green-500 text-white'
                : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
          >
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />Sauvegarde...</>
              : saved
              ? <><CheckCircle className="h-4 w-4" />Sauvegardé !</>
              : <><Save className="h-4 w-4" />Sauvegarder</>
            }
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">

        {/* ── GÉNÉRAL — Slogan et Description supprimés ── */}
        <Section id="general" icon={Globe} title="Informations générales" subtitle="Nom du site" color="bg-blue-100 text-blue-600">
          <Field label="Nom du site" value={settings.site_name} onChange={(v) => update('site_name', v)} placeholder="Ilma Skin" required />
        </Section>

        <Section id="apparence" icon={Palette} title="Apparence & Couleurs" subtitle="Couleurs principales de votre marque" color="bg-pink-100 text-pink-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Couleur principale</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.primary_color} onChange={(e) => update('primary_color', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 p-0.5 bg-white" />
                <input type="text" value={settings.primary_color} onChange={(e) => update('primary_color', e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Couleur secondaire</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.secondary_color} onChange={(e) => update('secondary_color', e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 p-0.5 bg-white" />
                <input type="text" value={settings.secondary_color} onChange={(e) => update('secondary_color', e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none text-sm font-mono" />
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl text-white text-center font-bold text-sm" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.secondary_color})` }}>
            Aperçu du dégradé — {settings.site_name}
          </div>
        </Section>

        <Section id="contact" icon={Mail} title="Informations de contact" subtitle="Email, téléphone et WhatsApp" color="bg-green-100 text-green-600">
          <Field label="Email de contact" value={settings.contact_email} onChange={(v) => update('contact_email', v)} placeholder="contact@ilmaskin.com" type="email" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Téléphone" value={settings.contact_phone} onChange={(v) => update('contact_phone', v)} placeholder="+33 6 12 34 56 78" type="tel" />
            <Field label="WhatsApp" value={settings.contact_whatsapp} onChange={(v) => update('contact_whatsapp', v)} placeholder="+33 6 12 34 56 78" hint="Numéro avec indicatif pays" />
          </div>
        </Section>

        <Section id="reseaux" icon={Instagram} title="Réseaux sociaux" subtitle="Liens vers vos profils" color="bg-purple-100 text-purple-600">
          <Field label="Instagram" value={settings.instagram_url} onChange={(v) => update('instagram_url', v)} placeholder="https://instagram.com/ilmaskin" />
          <Field label="TikTok" value={settings.tiktok_url} onChange={(v) => update('tiktok_url', v)} placeholder="https://tiktok.com/@ilmaskin" />
          <Field label="Facebook" value={settings.facebook_url} onChange={(v) => update('facebook_url', v)} placeholder="https://facebook.com/ilmaskin" />
        </Section>

        <Section id="homepage" icon={Globe} title="Texte de la page d'accueil" subtitle="Titre et sous-titre affichés sur le hero" color="bg-orange-100 text-orange-600">
          <Field label="Titre principal" value={settings.homepage_title} onChange={(v) => update('homepage_title', v)} placeholder="Découvre ton prochain look" />
          <Field label="Sous-titre" value={settings.homepage_subtitle} onChange={(v) => update('homepage_subtitle', v)} placeholder="Des looks inspirants avec les produits qui vont avec" />
        </Section>

        <Section id="livraison" icon={Truck} title="Politique de livraison" subtitle="Délais et seuils de livraison gratuite" color="bg-cyan-100 text-cyan-600">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Livraison gratuite à partir de (€)" value={settings.delivery_free_threshold} onChange={(v) => update('delivery_free_threshold', v)} placeholder="50" type="number" hint="Ex: 50 pour livraison gratuite dès 50€" />
            <Field label="Prix livraison express (€)" value={settings.delivery_express_price} onChange={(v) => update('delivery_express_price', v)} placeholder="9.90" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Délai livraison standard" value={settings.delivery_standard_days} onChange={(v) => update('delivery_standard_days', v)} placeholder="3-5 jours ouvrés" hint="Ex: 3-5 jours ouvrés" />
            <Field label="Délai livraison express" value={settings.delivery_express_days} onChange={(v) => update('delivery_express_days', v)} placeholder="24h" hint="Ex: 24h ou 48h" />
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Aperçu</p>
            <div className="flex items-center gap-2 text-sm text-gray-700"><span className="w-2 h-2 rounded-full bg-green-400" />Livraison <strong>GRATUITE</strong> dès {settings.delivery_free_threshold}€</div>
            <div className="flex items-center gap-2 text-sm text-gray-700"><span className="w-2 h-2 rounded-full bg-blue-400" />Standard : {settings.delivery_standard_days} jours</div>
            <div className="flex items-center gap-2 text-sm text-gray-700"><span className="w-2 h-2 rounded-full bg-purple-400" />Express : {settings.delivery_express_days} — {settings.delivery_express_price}€</div>
          </div>
        </Section>

        <Section id="legal" icon={FileText} title="Informations légales" subtitle="CGV et mentions légales" color="bg-gray-100 text-gray-600">
          <TextArea label="Conditions Générales de Vente (CGV)" value={settings.cgv_text} onChange={(v) => update('cgv_text', v)} placeholder="Article 1 — Objet&#10;Les présentes CGV régissent les ventes effectuées sur le site..." rows={8} hint="Texte complet de vos CGV" />
          <TextArea label="Mentions légales" value={settings.mentions_legales} onChange={(v) => update('mentions_legales', v)} placeholder="Éditeur du site : ...&#10;Hébergeur : Vercel Inc..." rows={6} hint="Nom de l'éditeur, SIRET, hébergeur, etc." />
        </Section>

        <div className="pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg disabled:opacity-50
              ${saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-pink-200'
              }`}
          >
            {saving
              ? <><Loader2 className="h-5 w-5 animate-spin" />Sauvegarde en cours...</>
              : saved
              ? <><CheckCircle className="h-5 w-5" />Paramètres sauvegardés !</>
              : <><Save className="h-5 w-5" />Sauvegarder les paramètres</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}