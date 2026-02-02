// src/components/feed/LookCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Look } from '@/types/look.types';
import { Heart, ShoppingBag } from 'lucide-react';

interface LookCardProps {
  look: Look;
}

export default function LookCard({ look }: LookCardProps) {
  return (
    <Link href={`/feed/${look.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
        {/* Image principale du look */}
        <Image
          src={look.image}
          alt={look.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          {/* Creator info */}
          <div className="mb-3 flex items-center gap-2">
            {/* Avatar remplacé par des initiales */}
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-sm font-medium">
                {look.creator.name.charAt(0)}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">{look.creator.name}</span>
              <div className="text-xs text-white/80">{look.creator.username}</div>
            </div>
          </div>

          {/* Look title */}
          <h3 className="mb-2 text-lg font-semibold line-clamp-2">
            {look.title}
          </h3>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-2">
            {look.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span className="text-sm">{look.likes.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm">{look.products.length} produits</span>
              </div>
            </div>

            {/* Difficulty badge */}
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium capitalize backdrop-blur-sm">
              {look.difficulty}
            </span>
          </div>
        </div>

        {/* Hover state indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/90 px-6 py-3 font-semibold text-gray-900 backdrop-blur-sm">
            Voir les produits
          </div>
        </div>
      </div>
    </Link>
  );
}