// src/data/mockLooks.ts

import { Look } from '@/types/look.types';

export const mockLooks: Look[] = [
  {
    id: 'look_001',
    title: 'Natural Glow Everyday',
    description: 'Mon look quotidien pour un teint frais et lumineux en 10 minutes ! Parfait pour le bureau ou un brunch.',
    image: '/images/looks/Look1.jpg',
    creator: {
      name: 'Sarah Martinez',
      username: '@sarahmakeup'
    },
    likes: 2847,
    tags: ['natural', 'everyday', 'glowy'],
    difficulty: 'easy',
    createdAt: '2024-01-15',
    products: [
      { productId: 'prod_001', category: 'Teint', shadeId: 'shade_001_02' },
      { productId: 'prod_002', category: 'Correcteur', shadeId: 'shade_002_02' },
      { productId: 'prod_004', category: 'Blush', shadeId: 'shade_004_01', note: 'Sur les pommettes' },
      { productId: 'prod_007', category: 'Highlighter', shadeId: 'shade_007_01' },
      { productId: 'prod_005', category: 'Mascara' },
    ],
  },
  {
    id: 'look_002',
    title: 'Soft Glam Evening',
    description: 'Un look glamour mais pas trop pour vos soirées. Élégant et facile à porter !',
    image: '/images/looks/Look2.jpg',
    creator: {
      name: 'Emma Johnson',
      username: '@emmaglam'
    },
    likes: 5621,
    tags: ['glam', 'evening', 'date-night'],
    difficulty: 'medium',
    createdAt: '2024-01-14',
    products: [
      { productId: 'prod_001', category: 'Teint', shadeId: 'shade_001_03' },
      { productId: 'prod_002', category: 'Correcteur', shadeId: 'shade_002_03' },
      { productId: 'prod_008', category: 'Poudre', note: 'Pour fixer le teint' },
      { productId: 'prod_004', category: 'Blush', shadeId: 'shade_004_02' },
      { productId: 'prod_007', category: 'Highlighter', shadeId: 'shade_007_02' },
      { productId: 'prod_005', category: 'Mascara' },
      { productId: 'prod_003', category: 'Rouge à lèvres', shadeId: 'shade_003_01' },
    ],
  },
  {
    id: 'look_003',
    title: 'Bold Red Lip',
    description: 'THE red lip classique qui fait toujours son effet. Simple mais puissant !',
    image: '/images/looks/Look3.jpg',
    creator: {
      name: 'Léa Dubois',
      username: '@lea_makeup'
    },
    likes: 4230,
    tags: ['bold', 'red-lip', 'classic'],
    difficulty: 'easy',
    createdAt: '2024-01-13',
    products: [
      { productId: 'prod_001', category: 'Teint', shadeId: 'shade_001_02' },
      { productId: 'prod_002', category: 'Correcteur', shadeId: 'shade_002_02' },
      { productId: 'prod_005', category: 'Mascara' },
      { productId: 'prod_003', category: 'Rouge à lèvres', shadeId: 'shade_003_04', note: 'La star du look !' },
    ],
  },
  {
    id: 'look_004',
    title: 'Sun-Kissed Bronze',
    description: 'Look bronzé parfait pour l\'été ! Des joues sunkissed et un glow naturel.',
    image: '/images/looks/Look4.jpg',
    creator: {
      name: 'Jasmine Lee',
      username: '@jasmine_beauty'
    },
    likes: 3890,
    tags: ['bronze', 'summer', 'sunkissed'],
    difficulty: 'medium',
    createdAt: '2024-01-12',
    products: [
      { productId: 'prod_001', category: 'Teint', shadeId: 'shade_001_04' },
      { productId: 'prod_004', category: 'Blush', shadeId: 'shade_004_01' },
      { productId: 'prod_007', category: 'Highlighter', shadeId: 'shade_007_03', note: 'Généreusement !' },
      { productId: 'prod_005', category: 'Mascara' },
      { productId: 'prod_003', category: 'Rouge à lèvres', shadeId: 'shade_003_02' },
    ],
  },
  {
    id: 'look_005',
    title: 'Fresh Face No-Makeup',
    description: 'Le fameux "no-makeup makeup". Frais, reposé, naturel !',
    image: '/images/looks/Look5.jpg',
    creator: {
      name: 'Sophie Bernard',
      username: '@sophienaturel'
    },
    likes: 6102,
    tags: ['natural', 'no-makeup', 'minimal'],
    difficulty: 'easy',
    createdAt: '2024-01-11',
    products: [
      { productId: 'prod_001', category: 'Teint', shadeId: 'shade_001_02', note: 'Légèrement' },
      { productId: 'prod_002', category: 'Correcteur', shadeId: 'shade_002_02' },
      { productId: 'prod_004', category: 'Blush', shadeId: 'shade_004_01' },
      { productId: 'prod_006', category: 'Sourcils', shadeId: 'shade_006_02' },
      { productId: 'prod_005', category: 'Mascara' },
    ],
  },
  {
    id: 'look_006',
    title: 'Berry Lips Fall Vibes',
    description: 'Les vibes d\'automne avec une bouche berry parfaite. Cozy et chic !',
    image: '/images/looks/Look6.jpg',
    creator: {
      name: 'Maya Patel',
      username: '@maya_fallmakeup'
    },
    likes: 3456,
    tags: ['fall', 'berry', 'cozy'],
    difficulty: 'easy',
    createdAt: '2024-01-10',
    products: [
      { productId: 'prod_001', category: 'Teint', shadeId: 'shade_001_05' },
      { productId: 'prod_002', category: 'Correcteur', shadeId: 'shade_002_04' },
      { productId: 'prod_004', category: 'Blush', shadeId: 'shade_004_03' },
      { productId: 'prod_005', category: 'Mascara' },
      { productId: 'prod_003', category: 'Rouge à lèvres', shadeId: 'shade_003_03' },
    ],
  },
];

// Helper pour récupérer un look par ID
export const getLookById = (id: string): Look | undefined => {
  return mockLooks.find(look => look.id === id);
};