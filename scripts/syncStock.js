const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function sync() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    name: String,
    currentStock: Number,
    initialStock: Number,
    inStock: Boolean
  }, { strict: false }), 'ProductDetails');

  const products = await Product.find({});
  console.log(`Found ${products.length} products in DB.`);

  for (const p of products) {
    let updateNeeded = false;
    const update = {};
    if (p.currentStock === undefined || p.currentStock === null) {
      update.currentStock = 50;
      updateNeeded = true;
    }
    if (p.initialStock === undefined || p.initialStock === null) {
      update.initialStock = 50;
      updateNeeded = true;
    }
    if (updateNeeded) {
      await Product.updateOne({ _id: p._id }, { $set: update });
      console.log(`Updated stock for: ${p.name}`);
    }
  }

  console.log('Stock sync complete.');
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
