const { test, expect } = require('@playwright/test');
const { loginAsTraveller } = require('./helpers/auth');

test('Traveller Login Flow (localStorage based, no OTP)', async ({ page }) => {

  console.log("------ DEBUG START ------");

  // 1️⃣ Print the env variable BEFORE injecting
  console.log("TRAVELLER_AUTH from .env:");
  console.log(process.env.TRAVELLER_AUTH);

  // Inject auth BEFORE loading any page
  await loginAsTraveller({ page });

  // 2️⃣ Print what we injected into the browser
  await page.addInitScript(() => {
    console.log("Auth after injection (in browser context):", localStorage.getItem("auth"));
  });

  // Open home page
  await page.goto('https://karabookdev.cloud', { waitUntil: 'networkidle' });

  // 3️⃣ Print auth value AFTER page loads
  const storedAuth = await page.evaluate(() => localStorage.getItem("auth"));
  console.log("Auth inside page after load:", storedAuth);

  console.log("------ DEBUG END ------");

  // Close popup if visible
  const popup = page.locator('[data-state="open"]');
  if (await popup.isVisible().catch(() => false)) {
    await page.mouse.click(20, 20);
    await page.waitForTimeout(400);
  }

  // Navigate to dashboard
  await page.goto('https://karabookdev.cloud/dashboard');

  // Verify login success
  await expect(page.getByText('My Bookings')).toBeVisible();
});
