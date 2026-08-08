(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-site-nav]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll("[data-faq-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("[data-faq-item]");
      const panel = item.querySelector("[data-faq-panel]");
      const expanded = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
      item.classList.toggle("is-open", !expanded);
    });
  });

  document.querySelectorAll("[data-language-select]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const next = event.target.value;
      if (next) window.location.href = next;
    });
  });

  const heroSlider = document.querySelector("[data-slides]");
  if (heroSlider) {
    try {
      const slides = JSON.parse(heroSlider.getAttribute("data-slides"));
      if (slides.length > 1) {
        let currentSlide = 0;
        setInterval(() => {
          currentSlide = (currentSlide + 1) % slides.length;
          heroSlider.style.setProperty('--hero-image', `url('${slides[currentSlide]}')`);
        }, 5000);
      }
    } catch (e) {
      console.error("Slideshow error:", e);
    }
  }
})();
