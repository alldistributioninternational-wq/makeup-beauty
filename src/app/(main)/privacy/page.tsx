'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Politique de Confidentialité</h1>
          <p className="text-white/90">Dernière mise à jour : janvier 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">
          {[
            {
              title: '1. Collecte des données',
              content: `Nous collectons les données que vous nous fournissez directement (nom, email, adresse, téléphone) lors de la création de votre compte, de vos commandes ou de vos communications avec notre service client. Nous collectons également des données de navigation de manière anonyme pour améliorer notre site.`
            },
            {
              title: '2. Utilisation des données',
              content: `Vos données personnelles sont utilisées pour : traiter vos commandes et vous livrer vos produits, gérer votre compte client, vous envoyer des confirmations et informations relatives à vos commandes, améliorer nos services et personnaliser votre expérience, vous envoyer des communications marketing (avec votre consentement).`
            },
            {
              title: '3. Partage des données',
              content: `Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données uniquement avec nos prestataires de service (transporteurs pour la livraison, prestataires de paiement, hébergeurs) dans le strict cadre de l'exécution de leurs services.`
            },
            {
              title: '4. Cookies',
              content: `Notre site utilise des cookies pour améliorer votre expérience de navigation, mémoriser vos préférences et analyser notre trafic. Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne plus fonctionner correctement.`
            },
            {
              title: '5. Vos droits (RGPD)',
              content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants : droit d'accès à vos données, droit de rectification, droit à l'effacement ("droit à l'oubli"), droit à la portabilité, droit d'opposition au traitement. Pour exercer ces droits, contactez-nous à privacy@ilmakiage.fr.`
            },
            {
              title: '6. Sécurité',
              content: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Toutes les transmissions de données sont cryptées via le protocole SSL/TLS.`
            },
            {
              title: '7. Conservation des données',
              content: `Vos données personnelles sont conservées pendant la durée nécessaire à la finalité pour laquelle elles ont été collectées, et au maximum 3 ans après votre dernière interaction avec notre site, sauf obligation légale contraire.`
            },
            {
              title: '8. Contact',
              content: `Pour toute question relative à notre politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter à : privacy@ilmakiage.fr ou par courrier à : IL MAKIAGE — DPO, 12 Rue de la Paix, 75001 Paris, France.`
            },
          ].map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-xl font-black text-gray-900 mb-3">{title}</h2>
              <p>{content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}