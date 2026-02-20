'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { User, Mail, Phone, LogOut, Loader2, CheckCircle, Package, ChevronDown, ChevronUp, Truck, Clock, XCircle, Edit2, Lock, Save, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function Toast({ message, type = 'error', onClose }: { message: string; type?: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 font-bold">×</button>
    </div>
  );
}

interface OrderItem {
  name: string
  brand?: string
  shade?: string
  quantity: number
  price: number
  image?: string
}

interface Order {
  id: string
  order_number?: string
  status: string
  items: OrderItem[]
  look_ids?: string[]  // ✅
  total_amount: number
  customer_name?: string
  shipping_address?: any
  whatsapp_sent?: boolean
  created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending:   { label: 'En attente',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock },
  paid:      { label: 'Payée',       color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  shipped:   { label: 'Expédiée',    color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Truck },
  delivered: { label: 'Livrée',      color: 'text-purple-700', bg: 'bg-purple-100', icon: Package },
  cancelled: { label: 'Annulée',     color: 'text-red-700',    bg: 'bg-red-100',    icon: XCircle },
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, error, register, login, logout, clearError, initAuth } = useAuthStore();

  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phone: '' });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [downloadingTutorial, setDownloadingTutorial] = useState<string | null>(null) // ✅

  const [editingInfo, setEditingInfo] = useState(false)
  const [infoForm, setInfoForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [infoLoading, setInfoLoading] = useState(false)

  const [editingEmail, setEditingEmail] = useState(false)
  const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' })
  const [emailLoading, setEmailLoading] = useState(false)

  const [editingPassword, setEditingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => { initAuth(); }, [initAuth]);
  useEffect(() => { if (error) setShowErrorToast(true); }, [error]);

  useEffect(() => {
    if (user) {
      const parts = (user.full_name || '').split(' ')
      setInfoForm({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setOrdersLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
    setOrdersLoading(false)
  }, [user])

  useEffect(() => {
    fetchOrders()
    const justPurchased = sessionStorage.getItem('just_purchased')
    if (justPurchased) {
      sessionStorage.removeItem('just_purchased')
      const interval = setInterval(fetchOrders, 3000)
      setTimeout(() => clearInterval(interval), 15000)
      return () => clearInterval(interval)
    }
  }, [fetchOrders])

  // ✅ Télécharger le tutoriel via l'API — URL Cloudinary jamais exposée
  const handleDownloadTutorial = async (orderId: string) => {
    setDownloadingTutorial(orderId)
    try {
      const response = await fetch('/api/tutorial/' + orderId)
      if (!response.ok) throw new Error('Tutoriel non disponible')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mon-tutoriel-makeup.mp4'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      showToast('Erreur lors du téléchargement', 'error')
    } finally {
      setDownloadingTutorial(null)
    }
  }

  const showToast = (message: string, type = 'success') => setToast({ message, type })

  const handleSaveInfo = async () => {
    setInfoLoading(true)
    try {
      const fullName = `${infoForm.firstName} ${infoForm.lastName}`.trim()
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone: infoForm.phone, updated_at: new Date().toISOString() })
        .eq('id', user!.id)
      if (dbError) throw dbError
      await supabase.auth.updateUser({ data: { full_name: fullName, phone: infoForm.phone } })
      showToast('Informations mises à jour ✅')
      setEditingInfo(false)
      await initAuth()
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la mise à jour', 'error')
    } finally {
      setInfoLoading(false)
    }
  }

  const handleChangeEmail = async () => {
    if (!emailForm.newEmail) return showToast('Entrez un nouvel email', 'error')
    setEmailLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ email: emailForm.newEmail })
      if (error) throw error
      showToast('Un email de confirmation a été envoyé à ta nouvelle adresse ✅')
      setEditingEmail(false)
      setEmailForm({ newEmail: '', password: '' })
    } catch (err: any) {
      showToast(err.message || "Erreur lors du changement d'email", 'error')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) return showToast('Remplis tous les champs', 'error')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return showToast('Les mots de passe ne correspondent pas', 'error')
    if (passwordForm.newPassword.length < 6) return showToast('Le mot de passe doit faire au moins 6 caractères', 'error')
    setPasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
      if (error) throw error
      showToast('Mot de passe mis à jour ✅')
      setEditingPassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      showToast(err.message || 'Erreur lors du changement de mot de passe', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!formData.email || !formData.password) return;
    if (!showLoginForm && !formData.fullName) return;
    try {
      if (showLoginForm) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.fullName, formData.phone);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
      setFormData({ email: '', password: '', fullName: '', phone: '' });
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleLogout = async () => {
    try { await logout(); router.push('/'); } catch (err) { console.error(err); }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        {showErrorToast && error && (
          <Toast message={error} type="error" onClose={() => { setShowErrorToast(false); clearError(); }} />
        )}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showLoginForm ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p className="text-gray-600">
              {showLoginForm ? 'Connectez-vous pour accéder à votre profil' : 'Créez votre compte pour sauvegarder vos looks préférés'}
            </p>
          </div>
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <div>
                <p className="text-green-800 font-semibold">Votre profil a été bien créé !</p>
                <p className="text-green-600 text-sm">Bienvenue sur Ilma Skin 🎉</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!showLoginForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Votre nom complet" required={!showLoginForm}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre@email.com" required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors" />
              </div>
            </div>
            {!showLoginForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone <span className="text-gray-400 text-xs">(optionnel)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="tel" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe <span className="text-red-500">*</span></label>
              <input type="password" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••" required minLength={6}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none transition-colors" />
              {!showLoginForm && <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-pink-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? 'Chargement...' : (showLoginForm ? 'Se connecter' : 'Créer mon compte')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {showLoginForm ? "Pas encore de compte ?" : "Déjà un compte ?"}
              <button onClick={() => { setShowLoginForm(!showLoginForm); clearError(); setShowErrorToast(false); setFormData({ email: '', password: '', fullName: '', phone: '' }); }}
                className="ml-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                {showLoginForm ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button onClick={() => router.back()}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Continuer sans compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user.full_name || 'Mon profil'}</h1>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            </div>
            <button onClick={handleLogout} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-semibold text-sm">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
              Déconnexion
            </button>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="text-blue-500" size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
            </div>
            {!editingInfo && (
              <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1.5 text-sm text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                <Edit2 size={15} /> Modifier
              </button>
            )}
          </div>
          {!editingInfo ? (
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Prénom</p>
                <p className="font-semibold text-gray-900">{infoForm.firstName || 'Non renseigné'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Nom</p>
                <p className="font-semibold text-gray-900">{infoForm.lastName || 'Non renseigné'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Téléphone</p>
                <p className="font-semibold text-gray-900">{infoForm.phone || 'Non renseigné'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénom</label>
                  <input type="text" value={infoForm.firstName} onChange={e => setInfoForm({ ...infoForm, firstName: e.target.value })} placeholder="Ton prénom" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>
                  <input type="text" value={infoForm.lastName} onChange={e => setInfoForm({ ...infoForm, lastName: e.target.value })} placeholder="Ton nom" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Téléphone</label>
                <input type="tel" value={infoForm.phone} onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })} placeholder="+33 6 12 34 56 78" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-sm" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveInfo} disabled={infoLoading} className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {infoLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Sauvegarder
                </button>
                <button onClick={() => setEditingInfo(false)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
                  <X size={16} /> Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Changer email */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="text-purple-500" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Adresse email</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>
            {!editingEmail && (
              <button onClick={() => setEditingEmail(true)} className="flex items-center gap-1.5 text-sm text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                <Edit2 size={15} /> Modifier
              </button>
            )}
          </div>
          {editingEmail && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nouvel email</label>
                <input type="email" value={emailForm.newEmail} onChange={e => setEmailForm({ ...emailForm, newEmail: e.target.value })} placeholder="nouveau@email.com" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-sm" />
              </div>
              <p className="text-xs text-gray-400">Un email de confirmation sera envoyé à ta nouvelle adresse.</p>
              <div className="flex gap-2">
                <button onClick={handleChangeEmail} disabled={emailLoading} className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {emailLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Confirmer
                </button>
                <button onClick={() => { setEditingEmail(false); setEmailForm({ newEmail: '', password: '' }) }} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
                  <X size={16} /> Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="text-orange-500" size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mot de passe</h2>
            </div>
            {!editingPassword && (
              <button onClick={() => setEditingPassword(true)} className="flex items-center gap-1.5 text-sm text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                <Edit2 size={15} /> Modifier
              </button>
            )}
          </div>
          {!editingPassword ? (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-sm text-gray-500">••••••••••••</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nouveau mot de passe</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="Minimum 6 caractères" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirmer le mot de passe</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Répète le mot de passe" className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-pink-500 focus:outline-none text-sm" />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleChangePassword} disabled={passwordLoading} className="flex items-center gap-1.5 px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors disabled:opacity-50">
                  {passwordLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Mettre à jour
                </button>
                <button onClick={() => { setEditingPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors">
                  <X size={16} /> Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Commandes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Package className="text-pink-500" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mes commandes</h2>
                <p className="text-xs text-gray-400">
                  {ordersLoading ? 'Chargement...' : `${orders.length} commande${orders.length > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button onClick={fetchOrders} disabled={ordersLoading} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-40">
              <Loader2 className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {ordersLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-pink-500" size={28} />
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm mb-3">Aucune commande pour le moment</p>
              <button onClick={() => router.push('/shop')} className="text-pink-500 font-semibold hover:text-pink-600 transition-colors text-sm">
                Découvrir la boutique →
              </button>
            </div>
          )}

          {!ordersLoading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                const StatusIcon = status.icon
                const isExpanded = expandedOrder === order.id
                const items: OrderItem[] = Array.isArray(order.items) ? order.items : []
                const hasTutorial = order.look_ids && order.look_ids.length > 0 // ✅

                return (
                  <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-pink-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {order.order_number || '#' + order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} • {items.length} article{items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">{Number(order.total_amount).toFixed(2)}€</p>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />{status.label}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-3">

                        {/* ✅ Bouton tutoriel */}
                        {hasTutorial && (
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-pink-700">🎬 Voici votre tutoriel</p>
                              <p className="text-xs text-pink-500">Cliquer pour télécharger</p>
                            </div>
                            <button
                              onClick={() => handleDownloadTutorial(order.id)}
                              disabled={downloadingTutorial === order.id}
                              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white text-xs font-semibold rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 flex-shrink-0 ml-3"
                            >
                              {downloadingTutorial === order.id ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Téléchargement...</>
                              ) : (
                                <><Download className="w-3.5 h-3.5" /> Télécharger</>
                              )}
                            </button>
                          </div>
                        )}

                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">💄</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                              {item.brand && <p className="text-xs text-gray-400">{item.brand}</p>}
                              {item.shade && <p className="text-xs text-pink-500">Teinte: {item.shade}</p>}
                              <p className="text-xs text-gray-400">Qté: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-gray-900 text-sm">{Number(item.price).toFixed(2)}€</p>
                          </div>
                        ))}

                        <div className="flex justify-between items-center bg-white rounded-lg px-4 py-3">
                          <span className="text-sm font-semibold text-gray-700">Total payé</span>
                          <span className="font-bold text-gray-900">{Number(order.total_amount).toFixed(2)}€</span>
                        </div>
                        {order.shipping_address && (
                          <div className="bg-white rounded-lg px-4 py-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Livraison
                            </p>
                            <p className="text-sm text-gray-600">{order.shipping_address.line1}</p>
                            <p className="text-sm text-gray-600">{order.shipping_address.city} {order.shipping_address.postal_code} — {order.shipping_address.country}</p>
                          </div>
                        )}
                        {order.whatsapp_sent && (
                          <p className="text-xs text-green-500 font-medium text-right">✅ Facture envoyée</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}