const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const generateToken = require("../Utils/generateToken");

test("1. Auth & JWT Generation", () => {
  const mockId = new mongoose.Types.ObjectId().toString();
  const token = generateToken(mockId, "admin");
  assert.ok(token, "Token should be generated");
  assert.strictEqual(typeof token, "string");
  assert.ok(token.length > 20, "JWT token should have valid length");
});

test("2. Multi-Currency Calculation Logic", () => {
  const usdPrice = 120;
  const nprRate = 135;
  const eurRate = 0.92;

  const nprPrice = Math.round(usdPrice * nprRate);
  const eurPrice = (usdPrice * eurRate).toFixed(2);

  assert.strictEqual(nprPrice, 16200, "120 USD should equal 16,200 NPR");
  assert.strictEqual(eurPrice, "110.40", "120 USD should equal 110.40 EUR");
});

test("3. Gamified Collector Loyalty Points & Tier Algorithm", () => {
  // 1 Point per $1 USD spent + 50 profile completion bonus
  const orderAmounts = [120, 140, 150];
  const totalSpent = orderAmounts.reduce((a, b) => a + b, 0); // 410
  const userPoints = Math.floor(totalSpent) + 50; // 460

  // Tier calculation formula
  const currentTier = userPoints >= 1000 ? 4 : userPoints >= 500 ? 3 : userPoints >= 200 ? 2 : 1;
  const tierFloor = currentTier === 1 ? 0 : currentTier === 2 ? 200 : currentTier === 3 ? 500 : 1000;
  const tierGoal = currentTier === 1 ? 200 : currentTier === 2 ? 500 : currentTier === 3 ? 1000 : 1000;

  const progressPercent = Math.min(100, Math.round(((userPoints - tierFloor) / (tierGoal - tierFloor)) * 100));
  const pointsRemaining = Math.max(0, tierGoal - userPoints);

  assert.strictEqual(currentTier, 2, "460 points should be Tier 02 (CLUB MEMBER)");
  assert.strictEqual(progressPercent, 87, "Progress percent to Tier 03 should be 87%");
  assert.strictEqual(pointsRemaining, 40, "Should need 40 points to reach Tier 03");
});

test("4. Heat-Press Customization & Extra Fee Pricing Formula", () => {
  const basePrice = 125;
  const playerName = "HENRY";
  const playerNumber = "14";
  const selectedPatches = ["ucl", "epl"]; // 2 patches at $15 each

  const printCost = (playerName.trim() || playerNumber.trim()) ? 15 : 0;
  const patchCost = selectedPatches.length * 15;
  const totalExtra = printCost + patchCost;
  const grandTotal = basePrice + totalExtra;

  assert.strictEqual(printCost, 15, "Name/number print should be $15");
  assert.strictEqual(patchCost, 30, "Two sleeve patches should be $30");
  assert.strictEqual(totalExtra, 45, "Total customizer extra should be $45");
  assert.strictEqual(grandTotal, 170, "Customized kit should equal $170");
});

test("5. Certificate of Authenticity (CoA) Mint Generator", () => {
  const club = "Real Madrid";
  const mintId = `VAULT-MINT-#${1000 + 42}-${club.substring(0, 3).toUpperCase()}`;
  assert.strictEqual(mintId, "VAULT-MINT-#1042-REA");
  assert.match(mintId, /^VAULT-MINT-#\d{4}-[A-Z]{3}$/);
});
