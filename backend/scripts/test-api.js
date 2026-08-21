const path = require("path");
require(path.join(__dirname, "../node_modules/dotenv")).config({ path: path.join(__dirname, "../.env") });
const mongoose = require(path.join(__dirname, "../node_modules/mongoose"));
const connectDB = require(path.join(__dirname, "../config/db"));
const Product = require(path.join(__dirname, "../model/Product"));
const productService = require(path.join(__dirname, "../services/product.service"));

async function runTests() {
  await connectDB();
  console.log("Testing backend product services...");

  const landingProducts = await productService.getLandingProducts();
  console.log(`✓ getLandingProducts returned: ${landingProducts.length} items`);
  console.log(`  First item: [${landingProducts[0].code}] ${landingProducts[0].name}`);

  const allProducts = await productService.getAllProducts();
  console.log(`✓ getAllProducts returned: ${allProducts.length} items`);

  // Test placement toggle
  const firstKit = allProducts[0];
  const updated = await productService.updatePlacement(firstKit._id, {
    showOnLanding: true,
  });
  console.log(`✓ updatePlacement succeeded for: [${updated.code}], showOnLanding: ${updated.showOnLanding}`);

  await mongoose.disconnect();
  console.log("All tests passed cleanly!");
}

runTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
