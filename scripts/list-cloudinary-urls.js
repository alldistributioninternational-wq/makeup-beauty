// scripts/list-cloudinary-urls.js
// Afficher les URLs complètes de tous les fichiers produits

const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listUrls() {
  console.log('📸 URLS COMPLÈTES DES IMAGES PRODUITS:\n');
  
  const result = await cloudinary.api.resources({
    type: 'upload',
    max_results: 500,
    resource_type: 'image'
  });

  // Filtrer seulement les images de produits
  const productImages = result.resources.filter(img => 
    img.public_id.includes('foundation') ||
    img.public_id.includes('concealer') ||
    img.public_id.includes('lipstick') ||
    img.public_id.includes('blush') ||
    img.public_id.includes('mascara') ||
    img.public_id.includes('brow') ||
    img.public_id.includes('highlighter') ||
    img.public_id.includes('powder')
  );

  productImages.forEach(img => {
    console.log(`\nFichier: ${img.public_id}`);
    console.log(`URL: ${img.secure_url}`);
    console.log(`Public ID: ${img.public_id}`);
  });

  console.log('\n\n📋 SQL POUR MISE À JOUR:\n');
  
  productImages.forEach(img => {
    const name = img.public_id.includes('foundation') ? 'Skin Tint Foundation' :
                 img.public_id.includes('concealer') ? 'Luminous Concealer' :
                 img.public_id.includes('lipstick') ? 'Velvet Matte Lipstick' :
                 img.public_id.includes('blush') ? 'Soft Focus Blush' :
                 img.public_id.includes('mascara') ? 'Volume Mascara' :
                 img.public_id.includes('brow') ? 'Brow Sculptor' :
                 img.public_id.includes('highlighter') ? 'Glow Highlighter' :
                 img.public_id.includes('powder') ? 'Setting Powder' : null;
    
    if (name) {
      console.log(`UPDATE products SET cloudinary_id = '${img.public_id}' WHERE name = '${name}';`);
    }
  });
}

listUrls();