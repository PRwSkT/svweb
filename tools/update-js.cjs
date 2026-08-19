const fs = require('fs');
let js = fs.readFileSync('src/main.js', 'utf8');

const newJS = `
  // Cookie Banner
  const cookieBanner = document.getElementById("cookie-banner");
  if (cookieBanner) {
    if (!localStorage.getItem("cookieConsent")) {
      setTimeout(() => cookieBanner.classList.add("show"), 1000);
    }
    const acceptBtn = document.getElementById("accept-cookies");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        localStorage.setItem("cookieConsent", "true");
        cookieBanner.classList.remove("show");
      });
    }
  }
`;

js = js.replace('// Initialize Feather Icons', newJS + '\n  // Initialize Feather Icons');
fs.writeFileSync('src/main.js', js);
