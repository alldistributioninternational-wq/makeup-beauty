// scripts/list-looks-cloudinary.js
// Lister les looks (images + vidéos) et générer le SQL

const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env.local' });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function listLooks() {
  console.log('🎨 LOOKS - IMAGES:\n');
  
  // Lister les images
  const images = await cloudinary.api.resources({
    type: 'upload',
    max_results: 500,
    resource_type: 'image'
  });

  const lookImages = images.resources.filter(img => 
    img.public_id.toLowerCase().includes('look')
  );

  lookImages.forEach(img => {
    console.log(`Fichier: ${img.public_id}`);
    console.log(`URL: ${img.secure_url}\n`);
  });

  console.log('\n🎬 LOOKS - VIDÉOS:\n');
  
  // Lister les vidéos
  const videos = await cloudinary.api.resources({
    type: 'upload',
    max_results: 500,
    resource_type: 'video'
  });

  videos.resources.forEach(vid => {
    console.log(`Fichier: ${vid.public_id}`);
    console.log(`URL: ${vid.secure_url}\n`);
  });

  console.log('\n📋 SQL POUR MISE À JOUR:\n');
  console.log('-- Mettez à jour manuellement selon vos titres de looks');
  console.log('-- Exemple:');
  console.log("UPDATE looks SET cloudinary_image_id = 'Look1_xxx', cloudinary_video_id = 'look1_xxx' WHERE title = 'Natural Glow Everyday';");
}

listLooks();