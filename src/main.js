(function () {
  const menuButton = document.querySelector("[data-menu-button]");
  const nav = document.querySelector("[data-site-nav]");
  const header = document.querySelector(".site-header");

  if (menuButton && nav) {
    const openLabel = menuButton.getAttribute("aria-label") || "Open main menu";
    const closeLabel = document.documentElement.lang === "th"
      ? "ปิดเมนูหลัก"
      : document.documentElement.lang === "zh"
        ? "关闭主菜单"
        : "Close main menu";

    const setMenuState = (isOpen) => {
      nav.classList.toggle("is-open", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      if (header) header.classList.toggle("menu-open", isOpen);
      document.body.classList.toggle("lock-scroll", isOpen);
      menuButton.setAttribute("aria-label", isOpen ? closeLabel : openLabel);
    };

    menuButton.addEventListener("click", () => {
      setMenuState(!nav.classList.contains("is-open"));
    });

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link && !link.classList.contains("has-dropdown")) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuState(false);
    });

    document.addEventListener("click", (event) => {
      if (!header || !nav.classList.contains("is-open")) return;
      if (!header.contains(event.target)) setMenuState(false);
    });

    window.matchMedia("(min-width: 1161px)").addEventListener("change", (e) => {
      if (e.matches && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        document.body.classList.remove("lock-scroll");
        if(header) header.classList.remove("menu-open");
      }
    });
  }

  document.querySelectorAll("[data-faq-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("[data-faq-item]");
      const panel = item.querySelector("[data-faq-panel]");
      const expanded = button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!expanded));
      
      item.classList.toggle("is-open", !expanded);
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
          const bgs = heroBgs;
          bgs.forEach((bg, i) => {
            if (i === currentSlide) {
              bg.classList.add('active');
              if (bg.tagName === 'VIDEO') {
                stopTimer(); // Let the video dictate the duration
                bg.currentTime = 0;
                bg.play().catch(() => {});
                
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
          
          const indicator = heroIndicator;
          if(indicator) indicator.textContent = `0${currentSlide + 1} / 0${slides.length}`;
        };

        const nextSlide = () => { currentSlide = (currentSlide + 1) % slides.length; updateSlide(); };
        const prevSlide = () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateSlide(); };

        const startTimer = () => { stopTimer(); slideInterval = setInterval(nextSlide, 6000); };
        const stopTimer = () => { clearInterval(slideInterval); };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          isPaused = true;
        }

        updateSlide(); // Initialize first slide state
        heroSlider.classList.add("is-animating"); // initial zoom

        document.querySelector(".slider-arrow.next")?.addEventListener("click", () => { nextSlide(); });
        document.querySelector(".slider-arrow.prev")?.addEventListener("click", () => { prevSlide(); });
        const pauseBtn = document.querySelector(".slider-pause");
        if(pauseBtn) {
          pauseBtn.addEventListener("click", () => {
            isPaused = !isPaused;
            pauseBtn.innerHTML = isPaused ? `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>` : `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            pauseBtn.setAttribute(
              "aria-label",
              isPaused
                ? (document.documentElement.lang === "th" ? "เล่นสไลด์ต่อ" : document.documentElement.lang === "zh" ? "继续轮播" : "Resume slideshow")
                : (document.documentElement.lang === "th" ? "หยุดสไลด์ชั่วคราว" : document.documentElement.lang === "zh" ? "暂停轮播" : "Pause slideshow")
            );
            isPaused ? stopTimer() : startTimer();
          });
        }

        document.addEventListener("visibilitychange", () => {
          if (document.hidden) stopTimer();
          else if (!isPaused) startTimer();
        });

        let touchStartX = 0;
let touchStartY = 0;
        heroSlider.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        heroSlider.addEventListener('touchend', (e) => {
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) nextSlide();
            else prevSlide();
          }
        }, { passive: true });
      }
    } catch (e) {
      console.error("Slideshow error:", e);
    }
  }

  // Sticky Header Scroll
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
  const animateCounter = (el, target, duration) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.textContent = target;
      return;
    }
    const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.round(easeOutExpo(progress) * target);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        
        // Counter Animations
        entry.target.querySelectorAll(".counter").forEach(counter => {
          if (!counter.dataset.animated) {
            counter.dataset.animated = "true";
            const target = parseInt(counter.getAttribute("data-target"), 10);
            if (!isNaN(target)) {
              animateCounter(counter, target, 1800);
            }
          }
        });

        // Animate legend values too
        entry.target.querySelectorAll(".legend-value").forEach((el, i) => {
          if (!el.dataset.animated) {
            el.dataset.animated = "true";
            const text = el.textContent;
            const num = parseInt(text, 10);
            if (!isNaN(num)) {
              const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              if (prefersReduced) {
                el.textContent = num + "%";
                return;
              }
              el.textContent = "0%";
              setTimeout(() => {
                const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
                let startTime = null;
                const step = (timestamp) => {
                  if (!startTime) startTime = timestamp;
                  const progress = Math.min((timestamp - startTime) / 1400, 1);
                  el.textContent = Math.round(easeOutExpo(progress) * num) + "%";
                  if (progress < 1) requestAnimationFrame(step);
                  else el.textContent = num + "%";
                };
                requestAnimationFrame(step);
              }, i * 200);
            }
          }
        });
        
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

  // Initialize Feather Icons

  // Mobile & Touch Dropdown Toggle
  const dropdownToggles = document.querySelectorAll('.has-dropdown');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 1160) {
        e.preventDefault();
        toggle.parentElement.classList.toggle('is-expanded');
      } else if (window.matchMedia('(any-pointer: coarse)').matches) {
        // iPad / Touch landscape
        if (!toggle.parentElement.classList.contains('is-expanded')) {
          e.preventDefault(); // prevent navigation on first tap
          // close others
          navDropdowns.forEach(d => d.classList.remove('is-expanded'));
          toggle.parentElement.classList.add('is-expanded');
        }
      }
    });
  });

  // Language Switcher Toggle for Mobile/Touch
  const langSwitch = document.querySelector('.language-switch');
  const langWrapper = document.querySelector('.lang-wrapper');
  if (langSwitch && langWrapper) {
    langSwitch.addEventListener('click', (e) => {
      e.preventDefault();
      if (langWrapper.classList.contains('is-active')) {
        langWrapper.classList.remove('is-active');
        langSwitch.blur();
      } else {
        langWrapper.classList.add('is-active');
      }
    });
  }

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (langWrapper && !langWrapper.contains(e.target)) {
      langWrapper.classList.remove('is-active');
    }
    if (window.innerWidth > 1160 && window.matchMedia('(any-pointer: coarse)').matches) {
      if (!e.target.closest('.nav-item-dropdown')) {
        navDropdowns.forEach(d => d.classList.remove('is-expanded'));
      }
    }
  });

  if (window.feather) {

    feather.replace();
  }
})();
