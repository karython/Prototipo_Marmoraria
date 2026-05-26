/* ============================================================
   NOBILE MARMORARIA — SCRIPT.JS
   Funcionalidades: Carousel, Lightbox, Scroll Animations,
   Portfolio Filters, Catalog Search, Reviews Slider,
   Header Scroll, Back-to-Top, Form Handling, Mobile Menu
   ============================================================ */

'use strict';

/* ── Utilities ───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DOM Ready ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initHeroCarousel();
  initScrollAnimations();
  initPortfolioFilters();
  initLightbox();
  initCatalog();
  initReviewsSlider();
  initQuoteForm();
  initBackToTop();
  initSmoothScroll();
  initCurrentYear();
  initPhoneMask();
});

/* ============================================================
   HEADER — scroll behavior & transparency
============================================================ */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  let lastScroll = 0;

  const update = () => {
    const y = window.scrollY;
    if (y > 60) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.remove('scrolled');
      header.classList.add('transparent');
    }
    lastScroll = y;
  };

  header.classList.add('transparent');
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ============================================================
   MOBILE MENU
============================================================ */
function initMobileMenu() {
  const hamburger = $('#hamburger');
  const nav       = $('#main-nav');
  if (!hamburger || !nav) return;

  const toggle = (force) => {
    const open = typeof force === 'boolean' ? force : !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggle());

  // Close on nav link click
  $$('.nav-link', nav).forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)) {
      toggle(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
}

/* ============================================================
   HERO CAROUSEL
============================================================ */
function initHeroCarousel() {
  const slides     = $$('.slide');
  const indicators = $$('.indicator');
  const prevBtn    = $('#heroPrev');
  const nextBtn    = $('#heroNext');
  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  const DELAY  = 5500;
  const TOTAL  = slides.length;

  const goTo = (idx) => {
    // Bounds
    idx = ((idx % TOTAL) + TOTAL) % TOTAL;
    slides[current].classList.remove('active');
    indicators[current]?.classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    indicators[current]?.classList.add('active');
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const start = () => { timer = setInterval(next, DELAY); };
  const stop  = () => { clearInterval(timer); };
  const restart = () => { stop(); start(); };

  // Auto-play
  start();

  // Arrow controls
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });

  // Indicators
  indicators.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); restart(); });
  });

  // Pause on hover
  const heroEl = $('#inicio');
  if (heroEl) {
    heroEl.addEventListener('mouseenter', stop);
    heroEl.addEventListener('mouseleave', start);
  }

  // Touch/swipe support
  let touchStartX = 0;
  heroEl?.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); restart(); }
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (document.activeElement?.closest('#inicio') || window.scrollY < window.innerHeight / 2) {
      if (e.key === 'ArrowLeft')  { prev(); restart(); }
      if (e.key === 'ArrowRight') { next(); restart(); }
    }
  });
}

/* ============================================================
   SCROLL ANIMATIONS (IntersectionObserver)
============================================================ */
function initScrollAnimations() {
  const targets = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   PORTFOLIO FILTERS
============================================================ */
function initPortfolioFilters() {
  const filterBtns = $$('.filter-btn');
  const items      = $$('.portfolio-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const cat = item.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn .4s ease both';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ============================================================
   LIGHTBOX
============================================================ */
function initLightbox() {
  const lightbox    = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxCap = $('#lightboxCaption');
  const closeBtn    = $('#lightboxClose');
  if (!lightbox) return;

  const open = (src, title) => {
    lightboxImg.src = src;
    lightboxImg.alt = title || '';
    if (lightboxCap) lightboxCap.textContent = title || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 350);
  };

  // Trigger from portfolio zoom buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.portfolio-zoom');
    if (btn) {
      e.stopPropagation();
      open(btn.dataset.src, btn.dataset.title);
    }
    // Also open on item click
    const item = e.target.closest('.portfolio-item');
    if (item && !btn) {
      const zoomBtn = item.querySelector('.portfolio-zoom');
      if (zoomBtn) open(zoomBtn.dataset.src, zoomBtn.dataset.title);
    }
  });

  closeBtn?.addEventListener('click', close);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) close();
  });
}

/* ============================================================
   CATALOG — Search & Filter
============================================================ */
function initCatalog() {
  const searchInput  = $('#catalogSearch');
  const filterSelect = $('#catalogFilter');
  const cards        = $$('.catalog-card');
  const emptyMsg     = $('#catalogEmpty');
  if (!searchInput && !filterSelect) return;

  const filterCatalog = () => {
    const query    = searchInput?.value.toLowerCase().trim() || '';
    const category = filterSelect?.value || 'all';
    let visible    = 0;

    cards.forEach(card => {
      const name    = (card.dataset.name || '').toLowerCase();
      const cat     = card.dataset.category || '';
      const matchQ  = !query || name.includes(query);
      const matchC  = category === 'all' || cat === category;

      if (matchQ && matchC) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    if (emptyMsg) emptyMsg.style.display = visible === 0 ? 'block' : 'none';
  };

  searchInput?.addEventListener('input', filterCatalog);
  filterSelect?.addEventListener('change', filterCatalog);
}

/* ============================================================
   REVIEWS SLIDER — auto-scroll
============================================================ */
function initReviewsSlider() {
  const track    = $('#reviewsTrack');
  const prevBtn  = $('#reviewPrev');
  const nextBtn  = $('#reviewNext');
  const dotsWrap = $('#reviewsDots');
  if (!track) return;

  const cards   = $$('.review-card', track);
  const TOTAL   = cards.length;
  let current   = 0;
  let autoTimer = null;
  const DELAY   = 4200;

  // Detect cards per view
  const cardsPerView = () => {
    if (window.innerWidth < 600) return 1;
    if (window.innerWidth < 860) return 2;
    return 3;
  };

  // Build dots
  const buildDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const pages = Math.ceil(TOTAL / cardsPerView());
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'rev-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Avaliação ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restartAuto(); });
      dotsWrap.appendChild(dot);
    }
  };

  const updateDots = () => {
    const dots = $$('.rev-dot', dotsWrap);
    const page = Math.floor(current / cardsPerView());
    dots.forEach((d, i) => d.classList.toggle('active', i === page));
  };

  const goTo = (page) => {
    const cpv = cardsPerView();
    const pages = Math.ceil(TOTAL / cpv);
    page = ((page % pages) + pages) % pages;
    current = page * cpv;

    // Calculate offset
    const cardW = cards[0]?.offsetWidth || 0;
    const gap   = 24; // 1.5rem
    const offset = current * (cardW + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  };

  const nextPage = () => {
    const cpv   = cardsPerView();
    const pages = Math.ceil(TOTAL / cpv);
    const page  = Math.floor(current / cpv);
    goTo((page + 1) % pages);
  };

  const prevPage = () => {
    const cpv   = cardsPerView();
    const pages = Math.ceil(TOTAL / cpv);
    const page  = Math.floor(current / cpv);
    goTo((page - 1 + pages) % pages);
  };

  const startAuto   = () => { autoTimer = setInterval(nextPage, DELAY); };
  const stopAuto    = () => clearInterval(autoTimer);
  const restartAuto = () => { stopAuto(); startAuto(); };

  prevBtn?.addEventListener('click', () => { prevPage(); restartAuto(); });
  nextBtn?.addEventListener('click', () => { nextPage(); restartAuto(); });

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) { dx < 0 ? nextPage() : prevPage(); restartAuto(); }
  });

  // Pause on hover
  track.parentElement?.addEventListener('mouseenter', stopAuto);
  track.parentElement?.addEventListener('mouseleave', startAuto);

  // Rebuild on resize
  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => { buildDots(); goTo(0); }, 200);
  });

  // Init
  buildDots();
  startAuto();
}

/* ============================================================
   QUOTE FORM — basic handling & validation
============================================================ */
function initQuoteForm() {
  const form    = $('#quoteForm');
  const success = $('#formSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = $('#nome')?.value.trim();
    const tel  = $('#telefone')?.value.trim();

    if (!nome || !tel) {
      // Simple highlight for empty fields
      if (!nome && $('#nome')) { highlightError($('#nome')); }
      if (!tel  && $('#telefone')) { highlightError($('#telefone')); }
      return;
    }

    // Simulate async send
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Enviando…';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      form.style.display = 'none';
      if (success) { success.style.display = 'block'; success.classList.add('visible'); }
    }, 900);
  });

  function highlightError(el) {
    el.style.borderColor = '#e05858';
    el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
    el.focus();
  }
}

/* ============================================================
   BACK TO TOP
============================================================ */
function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SMOOTH SCROLL for anchor links
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   CURRENT YEAR in Footer
============================================================ */
function initCurrentYear() {
  const el = $('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   PHONE MASK — (XX) X XXXX-XXXX
============================================================ */
function initPhoneMask() {
  const tel = $('#telefone');
  if (!tel) return;

  tel.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    let masked = '';
    if (v.length > 0) masked += '(' + v.slice(0, 2);
    if (v.length > 2) masked += ') ' + v.slice(2, 3);
    if (v.length > 3) masked += ' ' + v.slice(3, 7);
    if (v.length > 7) masked += '-' + v.slice(7, 11);
    e.target.value = masked;
  });
}

/* ============================================================
   EXTRA: Fade-in keyframe for portfolio filter animation
============================================================ */
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
  .portfolio-item { animation: fadeIn .4s ease both; }
`;
document.head.appendChild(styleTag);
