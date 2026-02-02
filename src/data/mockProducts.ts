// src/data/mockProducts.ts

import { Product } from '@/types/product.types';

export const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Skin Tint Foundation',
    brand: 'Ilma Beauty',
    category: 'foundation',
    price: 42,
    image: '/images/products/foundation-01.png',
    description: 'Foundation légère effet seconde peau. Couvrance modulable, fini naturel lumineux.',
    shades: [
      { id: 'shade_001_01', name: 'Porcelain', hex: '#F5E6D3' },
      { id: 'shade_001_02', name: 'Vanilla', hex: '#F0D5B8' },
      { id: 'shade_001_03', name: 'Beige', hex: '#E8C4A0' },
      { id: 'shade_001_04', name: 'Tan', hex: '#D4A574' },
      { id: 'shade_001_05', name: 'Caramel', hex: '#B8845C' },
      { id: 'shade_001_06', name: 'Cocoa', hex: '#8B5A3C' },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_002',
    name: 'Luminous Concealer',
    brand: 'Ilma Beauty',
    category: 'concealer',
    price: 28,
    image: '/images/products/concealer-01.png',
    description: 'Anti-cernes hydratant longue tenue. Cache imperfections et illumine le regard.',
    shades: [
      { id: 'shade_002_01', name: 'Fair', hex: '#F7E7D1' },
      { id: 'shade_002_02', name: 'Light', hex: '#F0D9BC' },
      { id: 'shade_002_03', name: 'Medium', hex: '#E5C9A5' },
      { id: 'shade_002_04', name: 'Deep', hex: '#C9A47A' },
    ],
    inStock: true,
  },
  {
    id: 'prod_003',
    name: 'Velvet Matte Lipstick',
    brand: 'Ilma Beauty',
    category: 'lipstick',
    price: 24,
    image: '/images/products/lipstick-01.png',
    description: 'Rouge à lèvres mat confortable. Pigmentation intense, tenue 8h.',
    shades: [
      { id: 'shade_003_01', name: 'Nude Rose', hex: '#D4A5A5' },
      { id: 'shade_003_02', name: 'Terracotta', hex: '#C87A5C' },
      { id: 'shade_003_03', name: 'Berry', hex: '#8B3A62' },
      { id: 'shade_003_04', name: 'Red', hex: '#C41E3A' },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_004',
    name: 'Soft Focus Blush',
    brand: 'Ilma Beauty',
    category: 'blush',
    price: 32,
    image: '/images/products/blush-01.png',
    description: 'Blush crème-poudre effet flouté. S\'estompe facilement pour un résultat naturel.',
    shades: [
      { id: 'shade_004_01', name: 'Peach', hex: '#FFCBA4' },
      { id: 'shade_004_02', name: 'Rose', hex: '#E6A5B4' },
      { id: 'shade_004_03', name: 'Mauve', hex: '#C9A3B8' },
    ],
    inStock: true,
  },
  {
    id: 'prod_005',
    name: 'Volume Mascara',
    brand: 'Ilma Beauty',
    category: 'mascara',
    price: 26,
    image: '/images/products/mascara-01.png',
    description: 'Mascara volume intense sans paquets. Brosse courbe pour un effet faux-cils.',
    inStock: true,
  },
  {
    id: 'prod_006',
    name: 'Brow Sculptor',
    brand: 'Ilma Beauty',
    category: 'eyeshadow',
    price: 22,
    image: '/images/products/brow-01.png',
    description: 'Crayon sourcils ultra-précis avec brosse. Tenue waterproof 12h.',
    shades: [
      { id: 'shade_006_01', name: 'Blonde', hex: '#B89968' },
      { id: 'shade_006_02', name: 'Brown', hex: '#6F4E37' },
      { id: 'shade_006_03', name: 'Dark Brown', hex: '#3B2820' },
    ],
    inStock: true,
  },
  {
    id: 'prod_007',
    name: 'Glow Highlighter',
    brand: 'Ilma Beauty',
    category: 'highlighter',
    price: 34,
    image: '/images/products/highlighter-01.png',
    description: 'Enlumineur poudre ultra-fine. Éclat naturel sans paillettes.',
    shades: [
      { id: 'shade_007_01', name: 'Champagne', hex: '#F4E4C1' },
      { id: 'shade_007_02', name: 'Rose Gold', hex: '#ECC5C0' },
      { id: 'shade_007_03', name: 'Bronze', hex: '#CD7F32' },
    ],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod_008',
    name: 'Setting Powder',
    brand: 'Ilma Beauty',
    category: 'powder',
    price: 36,
    image: '/images/products/powder-01.png',
    description: 'Poudre fixante translucide. Matifie sans marquer, effet flou instantané.',
    inStock: true,
  },
];

// Helper pour récupérer un produit par ID
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

// Helper pour récupérer plusieurs produits par IDs
export const getProductsByIds = (ids: string[]): Product[] => {
  return ids
    .map(id => getProductById(id))
    .filter((product): product is Product => product !== undefined);
};