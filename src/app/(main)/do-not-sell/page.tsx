'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function DoNotSellPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ email: '', name: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Ne pas vendre mes informations</h1>
          <p className="text-white/90">Exercez votre droit à la protection de vos données personnelles</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Info */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Vos droits sur vos données</h2>
              <p className="text-gray-600">Conformément au RGPD et aux lois applicables sur la protection des données, vous avez le droit de demander que vos informations personnelles ne soient pas vendues ou partagées à des tiers à des fins commerciales.</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-600">
            <h3 className="font-bold text-gray-900">Quelles données sont concernées ?</h3>
            <ul className="space-y-2 ml-4">
              {[
                'Vos informations d\'identification (nom, email, téléphone)',
                'Votre historique d\'achat et de navigation',
                'Vos préférences et centres d\'intérêt',
                'Vos données de localisation',
                'Toute autre information personnelle collectée',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Demande enregistrée</h3>
              <p className="text-gray-600">Nous avons bien reçu votre demande. Nous traiterons celle-ci dans un délai de 15 jours ouvrés et vous enverrons une confirmation par email.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Soumettre ma demande</h2>
              <p className="text-gray-600 mb-6">Remplissez ce formulaire pour exercer votre droit. Nous traiterons votre demande dans les 15 jours ouvrés.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                    placeholder="L'email associé à votre compte"
                  />
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                  En soumettant ce formulaire, vous demandez que vos informations personnelles ne soient plus vendues ou partagées à des fins commerciales. Cette demande n'affectera pas votre capacité à utiliser nos services.
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Envoi en cours...' : 'Soumettre ma demande'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Pour toute question, consultez notre{' '}
          <Link href="/privacy" className="text-pink-500 hover:underline">politique de confidentialité</Link>
          {' '}ou{' '}
          <Link href="/contact" className="text-pink-500 hover:underline">contactez-nous</Link>.
        </p>
      </div>
    </div>
  )
}