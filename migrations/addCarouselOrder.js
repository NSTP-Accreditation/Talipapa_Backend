const mongoose = require('mongoose');
const PageContent = require('../model/PageContent');
require('dotenv').config();

/**
 * Migration script to add order field to existing carousel slides
 * Run once: node migrations/addCarouselOrder.js
 */
async function migrateCarouselOrders() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
    
    console.log('\nStarting carousel order migration...');
    
    // Find all page content documents with carousel
    const pages = await PageContent.find({ 
      'carousel.0': { $exists: true } 
    });
    
    console.log(`Found ${pages.length} page(s) with carousel slides`);
    
    if (pages.length === 0) {
      console.log('No pages with carousel found. Migration not needed.');
      await mongoose.connection.close();
      process.exit(0);
    }
    
    let updatedCount = 0;
    let totalSlides = 0;
    let updatedSlides = 0;
    
    for (const page of pages) {
      let needsSave = false;
      
      console.log(`\nChecking page: ${page.barangayName} (${page._id})`);
      console.log(`  Carousel slides: ${page.carousel.length}`);
      
      page.carousel.forEach((slide, index) => {
        totalSlides++;
        
        if (slide.order === undefined || slide.order === null) {
          slide.order = index;
          needsSave = true;
          updatedSlides++;
          console.log(`  → Slide "${slide.title}" updated with order: ${index}`);
        } else {
          console.log(`  ✓ Slide "${slide.title}" already has order: ${slide.order}`);
        }
      });
      
      if (needsSave) {
        // Sort slides by order for consistency
        page.carousel.sort((a, b) => (a.order || 0) - (b.order || 0));
        await page.save();
        updatedCount++;
        console.log(`  ✓ Page updated and saved`);
      } else {
        console.log(`  ✓ Page already up to date`);
      }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log('✅ Migration complete!');
    console.log(`${'='.repeat(50)}`);
    console.log(`Total pages processed: ${pages.length}`);
    console.log(`Pages updated: ${updatedCount}`);
    console.log(`Total slides: ${totalSlides}`);
    console.log(`Slides updated: ${updatedSlides}`);
    console.log(`${'='.repeat(50)}\n`);
    
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  console.log('🚀 Carousel Order Migration Script');
  console.log('=' .repeat(50));
  migrateCarouselOrders();
}

module.exports = migrateCarouselOrders;
