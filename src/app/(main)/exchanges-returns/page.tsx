'use client'

import Link from 'next/link'
import { ArrowLeft, RefreshCw, Package, Clock, CheckCircle } from 'lucide-react'

export default function ExchangesReturnsPage() {
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Échanges & Retours</h1>
          <p className="text-xl text-white/90">30 jours pour changer d'avis, sans questions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Points clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Clock, title: '30 jours', desc: 'Pour retourner vos produits après réception' },
            { icon: Package, title: 'Gratuit', desc: 'Retours offerts pour toute commande en France' },
            { icon: CheckCircle, title: 'Remboursement', desc: 'Sous 5 à 7 jours ouvrés après réception du colis' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-4">
                <Icon className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Conditions de retour</h2>
          <div className="space-y-4 text-gray-600">
            <p>Pour être éligible à un retour, votre article doit être dans le même état que vous l'avez reçu :</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">•</span> Non utilisé et non ouvert</li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">•</span> Dans son emballage d'origine</li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">•</span> Accompagné du ticket de caisse ou de la preuve d'achat</li>
              <li className="flex items-start gap-2"><span className="text-pink-500 font-bold mt-1">•</span> Retourné dans les 30 jours suivant la livraison</li>
            </ul>
            <p className="mt-4 text-sm bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              ⚠️ Les produits de maquillage ouverts ou utilisés ne peuvent pas être retournés pour des raisons d'hygiène, sauf en cas de défaut de fabrication.
            </p>
          </div>
        </div>

        {/* Comment faire */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Comment effectuer un retour ?</h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Initiez votre retour', desc: 'Connectez-vous à votre compte, allez dans "Mes commandes" et sélectionnez l\'article à retourner.' },
              { step: '2', title: 'Imprimez l\'étiquette', desc: 'Vous recevrez par email une étiquette de retour prépayée à imprimer et coller sur votre colis.' },
              { step: '3', title: 'Déposez votre colis', desc: 'Déposez votre colis dans le point relais ou bureau de poste le plus proche.' },
              { step: '4', title: 'Remboursement', desc: 'Dès réception et vérification du colis, votre remboursement sera effectué sous 5 à 7 jours ouvrés.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Échanges */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Échanges</h2>
          <p className="text-gray-600">
            La façon la plus rapide d'échanger un produit est de retourner l'article, puis de passer une nouvelle commande séparément. Cela vous garantit d'obtenir votre nouveau produit le plus vite possible.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Besoin d'aide ?</h3>
          <p className="text-white/90 mb-6">Notre équipe est là pour vous accompagner</p>
          <Link href="/contact" className="inline-block px-8 py-3 bg-white text-pink-600 font-bold rounded-full hover:bg-pink-50 transition-colors">
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  )
}