// scripts/sync-cloudinary-ids.js
// Version améliorée avec affichage de toutes les images pour matching manuel

const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function syncCloudinaryIds() {
  console.log('🔍 Récupération des images depuis Cloudinary...\n');

  try {
    // Lister tous les fichiers
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image'
    });

    console.log(`✅ ${result.resources.length} images trouvées\n`);

    // Afficher toutes les images pour inspection
    console.log('📸 LISTE DES IMAGES CLOUDINARY:');
    console.log('================================\n');
    result.resources.forEach((img, index) => {
      console.log(`${index + 1}. ${img.public_id}`);
    });
    console.log('\n================================\n');

    // Récupérer les produits
    const { data: products } = await supabase
      .from('products')
      .select('id, name, cloudinary_id')
      .order('name');

    console.log('🛍️  PRODUITS SUPABASE:');
    console.log('================================\n');
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Actuel: ${p.cloudinary_id || 'null'}\n`);
    });
    console.log('================================\n');

    // Mapping manuel basé sur les noms de fichiers typiques
    const mapping = {
      'Skin Tint Foundation': ['foundation', 'tint'],
      'Luminous Concealer': ['concealer'],
      'Velvet Matte Lipstick': ['lipstick'],
      'Soft Focus Blush': ['blush'],
      'Volume Mascara': ['mascara'],
      'Brow Sculptor': ['brow'],
      'Glow Highlighter': ['highlighter'],
      'Setting Powder': ['powder']
    };

    console.log('🔄 TENTATIVE DE MATCHING AUTOMATIQUE:\n');

    for (const product of products) {
      const keywords = mapping[product.name] || [];
      
      // Chercher une image qui contient un des mots-clés
      const matchedImage = result.resources.find(img => {
        const publicId = img.public_id.toLowerCase();
        return keywords.some(keyword => publicId.includes(keyword));
      });

      if (matchedImage) {
        console.log(`✅ ${product.name}`);
        console.log(`   Trouvé: ${matchedImage.public_id}`);
        
        // Mettre à jour
        await supabase
          .from('products')
          .update({ cloudinary_id: matchedImage.public_id })
          .eq('id', product.id);
        
        console.log(`   ✓ Mis à jour\n`);
      } else {
        console.log(`⚠️  ${product.name}: Aucune correspondance trouvée`);
        console.log(`   Mots-clés recherchés: ${keywords.join(', ')}\n`);
      }
    }

    console.log('\n🎉 Terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

syncCloudinaryIds();