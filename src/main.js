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
      el.textContent = target.toLocaleString('en-US');
      return;
    }
    const easeOutExpo = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.round(easeOutExpo(progress) * target);
      el.textContent = value.toLocaleString('en-US');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-US');
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
  const navDropdowns = document.querySelectorAll('.nav-item-dropdown');
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

// Review Carousel Auto-Play Logic
function initReviewCarousel() {
  const reviewSections = document.querySelectorAll('.review-carousel-section');
  
  reviewSections.forEach(section => {
    const slides = section.querySelectorAll('.review-slide');
    const dots = section.querySelectorAll('.review-dot');
    let currentIndex = 0;
    let timer;

    if (slides.length <= 1) return;

    const track = section.querySelector('.review-carousel-track');
    
    function updateHeight() {
      if (slides[currentIndex]) {
        track.style.height = slides[currentIndex].offsetHeight + 'px';
      }
    }

    function goToSlide(index) {
      slides[currentIndex].classList.remove('active');
      dots[currentIndex].classList.remove('active');
      
      currentIndex = index;
      
      slides[currentIndex].classList.add('active');
      dots[currentIndex].classList.add('active');
      
      track.style.transform = `translateX(-${index * 100}%)`;
      updateHeight();
    }
    
    // Initialize height on load and resize
    window.addEventListener('resize', updateHeight);
    setTimeout(updateHeight, 100); // ensure fonts are loaded


    function nextSlide() {
      const nextIndex = (currentIndex + 1) % slides.length;
      goToSlide(nextIndex);
    }

    function startTimer() {
      timer = setInterval(nextSlide, 7000); // 7 seconds per slide
    }

    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetTimer();
      });
    });

    startTimer();
  });
}

// =========================================================================
// Real-time Dynamic Hydration for News & Albums (Between Weekly Deploys)
// =========================================================================
function initLiveWebsiteSync() {
  const newsBoard = document.querySelector(".news-board");
  const albumGrid = document.querySelector(".album-grid");

  if (!newsBoard && !albumGrid) return;

  const SUPABASE_URL = "https://ufsqavndpjphowuacxfi.supabase.co";
  const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmc3Fhdm5kcGpwaG93dWFjeGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTM4NzgsImV4cCI6MjA5NjY4OTg3OH0.fpaVZY8i7YQLRewcv3cuEZR_P9wNz1rWs5Q1UOk3Hz0";
  const headers = { "apikey": SUPABASE_ANON, "Authorization": "Bearer " + SUPABASE_ANON };

  const htmlLang = document.documentElement.lang || "th";
  const isTh = htmlLang === "th";
  const isZh = htmlLang === "zh";
  const readMoreText = isTh ? "อ่านเพิ่มเติม" : isZh ? "了解更多" : "Read more";
  const newsPath = isTh ? "/news/" : `/${htmlLang}/news/`;

  function safeText(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // 1. Live Hydrate News
  if (newsBoard) {
    fetch(`${SUPABASE_URL}/rest/v1/news?select=*&is_published=eq.true&order=published_at.desc&limit=5`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(async (newsItems) => {
        if (!Array.isArray(newsItems) || newsItems.length === 0) return;

        const featured = newsItems[0];
        const listItems = newsItems.slice(1, 4);

        const title = (isZh ? (featured.title_zh || featured.title_en) : isTh ? featured.title_th : (featured.title_en || featured.title_th)) || "";
        const content = (isZh ? (featured.content_zh || featured.content_en) : isTh ? featured.content_th : (featured.content_en || featured.content_th)) || "";
        const dateStr = new Date(featured.published_at || featured.created_at).toLocaleDateString(isTh ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' });
        const coverImg = featured.cover_image_url || '/assets/images/real-4.jpg';

        let collageHtml = '';
        if (featured.album_id) {
          try {
            const aRes = await fetch(`${SUPABASE_URL}/rest/v1/album_photos?album_id=eq.${featured.album_id}&order=sort_order.asc&limit=3`, { headers });
            if (aRes.ok) {
              const photos = await aRes.json();
              if (Array.isArray(photos) && photos.length > 0) {
                collageHtml = `<div class="news-collage" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 15px;">
                  ${photos.map(p => `<img src="${safeText(p.image_url)}" alt="Album photo" loading="lazy" width="400" height="300" style="width:100%; height:auto; aspect-ratio:4/3; object-fit:cover; border-radius:8px;">`).join('')}
                </div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: var(--sv-gold);"><i class="fas fa-images"></i> ${isTh ? "ดูรูปภาพทั้งหมดในอัลบั้ม →" : "View all photos in album →"}</div>`;
              }
            }
          } catch(e) {}
        }

        let listHtml = listItems.map(item => {
          const itemTitle = (isZh ? (item.title_zh || item.title_en) : isTh ? item.title_th : (item.title_en || item.title_th)) || "";
          const dStr = new Date(item.published_at || item.created_at).toLocaleDateString(isTh ? 'th-TH' : 'en-US', { month: 'short', day: 'numeric' });
          return `<a href="${newsPath}" class="news-row">
            <div class="news-date">${dStr}</div>
            <div class="news-title">${safeText(itemTitle)}</div>
          </a>`;
        }).join("");

        listHtml += `<a href="${newsPath}" class="news-row" style="margin-top: auto; border: none;">
          <div class="news-title" style="color: var(--sv-crimson);">${readMoreText} &rarr;</div>
        </a>`;

        newsBoard.innerHTML = `
          <a href="${newsPath}" class="news-featured" style="position: relative; display: block; height: 380px;">
            <img src="${safeText(coverImg)}" alt="${safeText(title)}" width="800" height="500" loading="lazy" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; margin: 0;">
            <div class="news-featured-content" style="position: absolute; bottom: 0; left: 0; width: 100%; z-index: 2; padding: 60px 30px 30px; background: linear-gradient(to top, rgba(9, 27, 48, 0.95) 0%, rgba(9, 27, 48, 0.6) 60%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--sv-gold); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">${dateStr}</span>
              <h3 style="margin: 0 0 10px 0; color: #ffffff; font-size: 1.5rem;">${safeText(title)}</h3>
              <p style="font-size: 0.95rem; color: rgba(255,255,255,0.8); margin-bottom: 0;">${safeText(content.substring(0, 100))}...</p>
              ${collageHtml}
            </div>
          </a>
          <div class="news-list">${listHtml}</div>
        `;
      })
      .catch(err => {
        // Fallback gracefully to pre-rendered static build content
      });
  }

  // 2. Live Hydrate Albums (Gallery)
  if (albumGrid) {
    fetch(`${SUPABASE_URL}/rest/v1/albums?select=*,album_photos(*)&order=event_date.desc&limit=20`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(albums => {
        if (!Array.isArray(albums) || albums.length === 0) return;

        albumGrid.innerHTML = albums.map(album => {
          const title = (isZh ? (album.title_zh || album.title_en) : isTh ? album.title_th : (album.title_en || album.title_th)) || "";
          const dStr = new Date(album.event_date).toLocaleDateString(isTh ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          const cover = album.cover_image_url || album.album_photos?.[0]?.image_url || '/assets/images/placeholder.jpg';
          const count = album.album_photos ? album.album_photos.length : 0;
          const countLabel = isTh ? 'รูปภาพ' : 'Photos';
          return `<div class="album-card">
            <div class="album-cover"><img src="${safeText(cover)}" alt="${safeText(title)}" loading="lazy" width="600" height="400" /></div>
            <div class="album-info">
              <h3>${safeText(title)}</h3>
              <p class="meta"><span>${dStr}</span> • ${count} ${countLabel}</p>
            </div>
          </div>`;
        }).join("");
      })
      .catch(err => {
        // Fallback gracefully to pre-rendered static build content
      });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initReviewCarousel();
    initLiveWebsiteSync();
  });
} else {
  initReviewCarousel();
  initLiveWebsiteSync();
}
