(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-site-nav]");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      const header = document.querySelector(".site-header");
      if (header) header.classList.toggle("menu-open", isOpen);
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
        let slideInterval;
        let isPaused = false;
        
        const updateSlide = () => {
          const bgs = heroSlider.querySelectorAll('.hero-bg');
          bgs.forEach((bg, i) => {
            if (i === currentSlide) {
              bg.classList.add('active');
              if (bg.tagName === 'VIDEO') {
                stopTimer(); // Let the video dictate the duration
                bg.currentTime = 0;
                bg.play().catch(e => console.log('Autoplay prevented', e));
                
                // Only attach the event once
                if (!bg.hasAttribute('data-ended-listener')) {
                  bg.setAttribute('data-ended-listener', 'true');
                  bg.addEventListener('ended', () => {
                    if (!isPaused) {
                      nextSlide();
                    }
                  });
                }
              } else {
                // If it's an image, make sure the timer is running
                if (!isPaused) {
                  stopTimer();
                  startTimer();
                }
              }
            } else {
              bg.classList.remove('active');
              if (bg.tagName === 'VIDEO') {
                bg.pause();
              }
            }
          });
          
          const indicator = document.querySelector(".slider-indicator");
          if(indicator) indicator.textContent = `0${currentSlide + 1} / 0${slides.length}`;
        };

        const nextSlide = () => { currentSlide = (currentSlide + 1) % slides.length; updateSlide(); };
        const prevSlide = () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSlide(); };

        const startTimer = () => { slideInterval = setInterval(nextSlide, 6000); };
        const stopTimer = () => { clearInterval(slideInterval); };

        updateSlide(); // Initialize first slide state
        heroSlider.classList.add("is-animating"); // initial zoom

        document.querySelector(".slider-arrow.next")?.addEventListener("click", () => { nextSlide(); stopTimer(); if(!isPaused) startTimer(); });
        document.querySelector(".slider-arrow.prev")?.addEventListener("click", () => { prevSlide(); stopTimer(); if(!isPaused) startTimer(); });
        const pauseBtn = document.querySelector(".slider-pause");
        if(pauseBtn) {
          pauseBtn.addEventListener("click", () => {
            isPaused = !isPaused;
            pauseBtn.innerHTML = isPaused ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>` : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            isPaused ? stopTimer() : startTimer();
          });
        }
      }
    } catch (e) {
      console.error("Slideshow error:", e);
    }
  }

  // Sticky Header Scroll
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });
  }

  // Reveal Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });

  document.querySelectorAll("[data-animate]").forEach(el => {
    el.classList.add(el.getAttribute("data-animate"));
    observer.observe(el);
  });

  if (window.netlifyIdentity) {
    window.netlifyIdentity.on("init", user => {
      if (!user) {
        window.netlifyIdentity.on("login", () => {
          document.location.href = "/admin/";
        });
      }
    });
  }
})();
