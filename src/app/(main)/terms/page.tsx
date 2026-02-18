'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Conditions Générales</h1>
          <p className="text-white/90">Dernière mise à jour : janvier 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">
          {[
            {
              title: '1. Objet',
              content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Oddify Global Ltd. d/b/a IL MAKIAGE PRO MAKEUP NY, société enregistrée en France, et tout client souhaitant effectuer un achat sur notre site.`
            },
            {
              title: '2. Produits',
              content: `Nos produits sont présentés avec la plus grande exactitude possible. Toutefois, des variations mineures de couleur peuvent exister selon les paramètres d'affichage de votre écran. Les produits sont conformes à la législation française et européenne en vigueur.`
            },
            {
              title: '3. Prix',
              content: `Les prix sont indiqués en euros TTC. Nous nous réservons le droit de modifier nos prix à tout moment, étant entendu que le prix applicable à votre commande sera celui en vigueur au moment de la validation de celle-ci.`
            },
            {
              title: '4. Commandes',
              content: `Toute commande passée sur notre site implique l'acceptation des présentes CGV. La commande est définitivement validée après confirmation du paiement. Nous nous réservons le droit d'annuler ou de refuser toute commande en cas de suspicion de fraude.`
            },
            {
              title: '5. Paiement',
              content: `Le paiement est exigible immédiatement à la commande. Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, Apple Pay et Google Pay. Toutes les transactions sont sécurisées par cryptage SSL.`
            },
            {
              title: '6. Livraison',
              content: `Les délais de livraison sont donnés à titre indicatif. Nous ne pouvons être tenus responsables des retards dus aux transporteurs ou à des événements de force majeure. Le risque de perte ou de détérioration des produits est transféré au client à la livraison.`
            },
            {
              title: '7. Droit de rétractation',
              content: `Conformément à la loi, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motif. Ce délai est porté à 30 jours dans le cadre de notre politique commerciale.`
            },
            {
              title: '8. Garanties',
              content: `Nos produits bénéficient de la garantie légale de conformité et de la garantie légale contre les vices cachés, conformément aux articles L. 217-4 et suivants du Code de la consommation.`
            },
            {
              title: '9. Propriété intellectuelle',
              content: `Tous les contenus présents sur notre site (textes, images, logos, vidéos) sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation préalable est strictement interdite.`
            },
            {
              title: '10. Droit applicable',
              content: `Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents. Nous vous encourageons à nous contacter en premier lieu pour trouver une solution amiable.`
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