const path = require("path");
require(path.join(__dirname, "../node_modules/dotenv")).config({
  path: path.join(__dirname, "../.env"),
});
const mongoose = require(path.join(__dirname, "../node_modules/mongoose"));
const bcrypt = require(path.join(__dirname, "../node_modules/bcryptjs"));
const connectDB = require(path.join(__dirname, "../config/db"));
const User = require(path.join(__dirname, "../model/User"));

async function seedAdmin() {
  await connectDB();
  console.log("Connecting to MongoDB Atlas to configure admin account...");

  const adminEmail = process.env.ADMIN_EMAIL || "nantio.official@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "NantionProject32@";
  const adminName = process.env.ADMIN_NAME || "Nantio Admin";

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const existingUser = await User.findOne({ email: adminEmail });

  if (existingUser) {
    existingUser.name = adminName;
    existingUser.password = hashedPassword;
    existingUser.role = "admin";
    existingUser.isBlocked = false;
    existingUser.blockedUntil = null;
    await existingUser.save();
    console.log(`✓ Updated existing account [${adminEmail}] to Root ADMIN in MongoDB Atlas!`);
  } else {
    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      phone: "+977 9800000000",
      role: "admin",
      isBlocked: false,
    });
    console.log(`✓ Created new Root ADMIN account [${adminEmail}] (ID: ${newAdmin._id}) in MongoDB Atlas!`);
  }

  // Verify by fetching
  const verified = await User.findOne({ email: adminEmail });
  console.log(`Verification:`, {
    id: verified._id,
    name: verified.name,
    email: verified.email,
    role: verified.role,
    isBlocked: verified.isBlocked,
  });

  await mongoose.disconnect();
  console.log("Admin account seed complete!");
}

seedAdmin().catch((err) => {
  console.error("Error seeding admin account:", err);
  process.exit(1);
});
