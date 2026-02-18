'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const faqs = [
  {
    category: 'Commandes',
    questions: [
      { q: 'Comment passer une commande ?', a: 'Parcourez notre catalogue, ajoutez les produits à votre panier, puis suivez les étapes de paiement. Vous recevrez une confirmation par email.' },
      { q: 'Puis-je modifier ma commande après validation ?', a: 'Les modifications sont possibles dans les 2 heures suivant la commande. Contactez notre service client rapidement via le formulaire de contact.' },
      { q: 'Comment suivre ma commande ?', a: 'Un email avec un lien de suivi vous sera envoyé dès l\'expédition. Vous pouvez aussi suivre votre commande depuis votre espace "Mon compte".' },
    ]
  },
  {
    category: 'Livraison',
    questions: [
      { q: 'Quels sont les délais de livraison ?', a: 'Livraison standard : 3-5 jours ouvrés. Livraison express : 24-48h. Les délais peuvent varier selon votre localisation.' },
      { q: 'La livraison est-elle gratuite ?', a: 'La livraison est offerte pour toute commande supérieure à 50€. En dessous, les frais de port sont de 4,99€.' },
      { q: 'Livrez-vous à l\'international ?', a: 'Oui, nous livrons dans toute l\'Europe et dans plus de 30 pays. Les délais et frais varient selon la destination.' },
    ]
  },
  {
    category: 'Paiement',
    questions: [
      { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Nous acceptons les cartes Visa, Mastercard, American Express, PayPal, Apple Pay et Google Pay.' },
      { q: 'Mes données bancaires sont-elles sécurisées ?', a: 'Oui, toutes les transactions sont cryptées via le protocole SSL. Nous ne stockons jamais vos données bancaires.' },
      { q: 'Puis-je payer en plusieurs fois ?', a: 'Oui, nous proposons le paiement en 3 ou 4 fois sans frais pour les commandes supérieures à 100€ avec Klarna.' },
    ]
  },
  {
    category: 'Produits',
    questions: [
      { q: 'Vos produits sont-ils testés sur les animaux ?', a: 'Non, tous nos produits sont 100% cruelty-free. Nous nous engageons pour une beauté éthique et responsable.' },
      { q: 'Comment connaître ma teinte ?', a: 'Utilisez notre outil de diagnostic en ligne ou consultez nos guides de teintes disponibles sur chaque fiche produit.' },
      { q: 'Les produits ont-ils une date de péremption ?', a: 'Chaque produit affiche sa date de péremption. En général, les produits durent 12 à 24 mois après ouverture.' },
    ]
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggle = (key: string) => {
    setOpenItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Questions Fréquentes</h1>
          <p className="text-xl text-white/90">Trouvez rapidement les réponses à vos questions</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {faqs.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-4 pb-2 border-b-2 border-pink-500">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.questions.map((item, i) => {
                const key = `${section.category}-${i}`
                const isOpen = openItems.includes(key)
                return (
                  <div key={key} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{item.q}</span>
                      {isOpen ? <ChevronUp className="w-5 h-5 text-pink-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-white/90 mb-6">Notre équipe est disponible pour vous aider</p>
          <Link href="/contact" className="inline-block px-8 py-3 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-colors">
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  )
}