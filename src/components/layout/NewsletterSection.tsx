// src/components/NewsletterSection.tsx
"use client";

import { useState } from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!agreed) {
      setStatus('error');
      setMessage('Veuillez accepter les conditions pour continuer');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || '🎉 Inscription réussie ! Vérifiez votre email.');
        setEmail('');
        setAgreed(false);
        
        // Réinitialiser après 5 secondes
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur de connexion. Veuillez réessayer.');
    }
  };

  return (
    <div className="w-full bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Titre principal */}
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          VOUS EN VOULEZ PLUS ?
        </h2>

        {/* Sous-titre */}
        <p className="text-white font-semibold text-sm mb-4 tracking-wide">
          OBTENEZ 10% DE RÉDUCTION SUR VOTRE PREMIER ACHAT
        </p>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-8 max-w-2xl mx-auto leading-relaxed">
          Rendons cela officiel. Rejoignez-nous pour un accès exclusif aux lancements de produits incontournables, 
          aux actualités tendance, aux pop-ups et plus encore. Oh, et vous obtiendrez 10% de réduction sur votre 
          premier achat. Convaincu ?
        </p>

        {/* Checkbox */}
        <div className="flex items-start justify-center gap-3 mb-6 max-w-2xl mx-auto">
          <input
            type="checkbox"
            id="marketing-consent"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 cursor-pointer accent-pink-500"
          />
          <label htmlFor="marketing-consent" className="text-white text-xs text-left">
            En cochant cette case et en cliquant sur "accepter et soumettre", j'accepte de recevoir des emails marketing 
            de IL MAKIAGE à mon adresse email et aux Conditions Générales et à la Politique de Confidentialité
          </label>
        </div>

        {/* Formulaire Email */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4">
          <div className="flex flex-col sm:flex-row gap-0">
            <input
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="flex-1 px-6 py-4 bg-black border border-white text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
              required
            />
            <button
              type="submit"
              disabled={!agreed || status === 'loading'}
              className="px-8 py-4 bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'ENVOI...' : 'ACCEPTER ET SOUMETTRE'}
            </button>
          </div>

          {/* Message de statut */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              status === 'success' 
                ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}
        </form>

        {/* Icônes réseaux sociaux */}
        <div className="flex justify-center gap-6 mt-8">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500 transition-colors"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500 transition-colors"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500 transition-colors"
          >
            <Youtube className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}