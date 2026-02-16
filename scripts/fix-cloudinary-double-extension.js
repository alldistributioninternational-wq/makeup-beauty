// scripts/fix-cloudinary-double-extension.js
// Renommer automatiquement tous les fichiers pour enlever le .png.png

const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDoubleExtensions() {
  console.log('🔧 Correction des doubles extensions dans Cloudinary...\n');

  try {
    // Lister toutes les images
    const result = await cloudinary.api.resources({
      type: 'upload',
      max_results: 500,
      resource_type: 'image'
    });

    // Filtrer les images de produits avec double extension
    const productImages = result.resources.filter(img => 
      img.public_id.endsWith('.png.png') && (
        img.public_id.includes('foundation') ||
        img.public_id.includes('concealer') ||
        img.public_id.includes('lipstick') ||
        img.public_id.includes('blush') ||
        img.public_id.includes('mascara') ||
        img.public_id.includes('brow') ||
        img.public_id.includes('highlighter') ||
        img.public_id.includes('powder')
      )
    );

    console.log(`📋 ${productImages.length} fichiers à corriger\n`);

    for (const img of productImages) {
      const oldPublicId = img.public_id;
      const newPublicId = oldPublicId.replace('.png.png', '.png');

      console.log(`🔄 ${oldPublicId}`);
      console.log(`   → ${newPublicId}`);

      try {
        // Renommer dans Cloudinary
        await cloudinary.uploader.rename(oldPublicId, newPublicId, {
          overwrite: false,
          invalidate: true
        });

        console.log(`   ✅ Renommé dans Cloudinary`);

        // Mettre à jour dans Supabase
        const productName = 
          newPublicId.includes('foundation') ? 'Skin Tint Foundation' :
          newPublicId.includes('concealer') ? 'Luminous Concealer' :
          newPublicId.includes('lipstick') ? 'Velvet Matte Lipstick' :
          newPublicId.includes('blush') ? 'Soft Focus Blush' :
          newPublicId.includes('mascara') ? 'Volume Mascara' :
          newPublicId.includes('brow') ? 'Brow Sculptor' :
          newPublicId.includes('highlighter') ? 'Glow Highlighter' :
          newPublicId.includes('powder') ? 'Setting Powder' : null;

        if (productName) {
          await supabase
            .from('products')
            .update({ cloudinary_id: newPublicId })
            .eq('name', productName);

          console.log(`   ✅ Mis à jour dans Supabase\n`);
        }

      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}\n`);
      }
    }

    console.log('\n🎉 Terminé ! Tous les fichiers ont été corrigés.');
    console.log('\n📋 Nouveaux cloudinary_id:');
    
    const { data: products } = await supabase
      .from('products')
      .select('name, cloudinary_id')
      .order('name');

    products.forEach(p => {
      console.log(`  • ${p.name}: ${p.cloudinary_id}`);
    });

    console.log('\n✅ Testez maintenant: http://localhost:3000/shop');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixDoubleExtensions();