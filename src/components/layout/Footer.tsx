// src/components/layout/Footer.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Footer() {
  const [selectedLanguage, setSelectedLanguage] = useState('Français');

  const languages = ['Français', 'English', 'Español', 'Deutsch', 'Italiano'];

  return (
    <footer className="w-full bg-white py-12 px-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Sélecteur de langue */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-black" />
            <span className="text-black font-medium">Langue:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
            >
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Liens du footer */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
          <Link href="/faq" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            FAQ
          </Link>
          <Link href="/exchanges-returns" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            Échanges & Retours
          </Link>
          <Link href="/profile" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            Mon compte
          </Link>
          <Link href="/about-us" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            À propos
          </Link>
          <Link href="/contact" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            Nous contacter
          </Link>
          <Link href="/terms" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            Conditions Générales
          </Link>
          <Link href="/privacy" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            Confidentialité
          </Link>
          <Link href="/do-not-sell" className="text-black hover:text-pink-500 transition-colors font-medium text-sm">
            Ne pas vendre mes informations
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-600 text-xs">
            © 2026 Oddify Global Ltd. d/b/a IL MAKIAGE PRO MAKEUP NY. TOUS DROITS RÉSERVÉS
          </p>
        </div>
      </div>
    </footer>
  );
}