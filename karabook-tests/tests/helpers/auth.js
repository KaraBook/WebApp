module.exports.loginAsTraveller = async function ({ page }) {
  await page.addInitScript((authValue) => {
    localStorage.setItem("auth", authValue);
  }, process.env.TRAVELLER_AUTH);
};
