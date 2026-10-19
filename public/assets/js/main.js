/* ErgoNova — 站点交互（逆向 libernovo.com 主题行为重建） */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Header：滚动变色 / 隐藏 ---------- */
  const header = $('.site-header');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    if (!header) return;
    header.classList.toggle('is-solid', y > 40);
    header.classList.toggle('is-hidden', y > 480 && y > lastY && !document.body.classList.contains('nav-open'));
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  const burger = $('.burger');
  const nav = $('.main-nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      burger.textContent = open ? '✕' : '☰';
    });
    $$('.main-nav .nav-item > .nav-link').forEach((link) => {
      if (link.nextElementSibling && link.nextElementSibling.classList.contains('mega')) {
        link.addEventListener('click', (e) => {
          if (window.matchMedia('(max-width: 1023px)').matches) {
            e.preventDefault();
            const item = link.parentElement;
            const was = item.classList.contains('expanded');
            $$('.main-nav .nav-item').forEach((i) => i.classList.remove('expanded'));
            if (!was) item.classList.add('expanded');
          }
        });
      }
    });
  }

  /* ---------- Hero 双系列切换 ---------- */
  const heroSlides = $$('.hero-slide');
  const heroTabs = $$('.hero-tab');
  function setSlide(i) {
    heroSlides.forEach((s, k) => s.classList.toggle('active', k === i));
    heroTabs.forEach((t, k) => t.classList.toggle('active', k === i));
    heroSlides.forEach((s, k) => {
      const v = $('video', s);
      if (v) { k === i ? v.play().catch(() => {}) : v.pause(); }
    });
  }
  heroTabs.forEach((t, i) => t.addEventListener('click', () => setSlide(i)));
  if (heroSlides.length) {
    setSlide(0);
    let hi = 0;
    const heroTimer = setInterval(() => {
      const active = $('.hero-slide.active video');
      if (active && !active.paused && active.duration && active.currentTime < active.duration - 0.5) return;
      hi = (hi + 1) % heroSlides.length; setSlide(hi);
    }, 9000);
  }

  /* ---------- 产品系列 tab ---------- */
  $$('.series-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.series-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const series = tab.dataset.series;
      $$('.product-card[data-series]').forEach((c) => {
        c.style.display = !series || series === 'all' || c.dataset.series === series ? '' : 'none';
      });
    });
  });

  /* ---------- 创作者 / 评论 / 视频轮播 ---------- */
  function bindCarousel(rootSel) {
    const root = $(rootSel);
    if (!root) return;
    const track = $('.creator-track, .review-track, .video-track', root) || $('.creator-track, .review-track, .video-track');
    const prev = $('.car-btn.prev', root);
    const next = $('.car-btn.next', root);
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 20 : 320);
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }
  bindCarousel('.creators-section');
  bindCarousel('.reviews-section');
  bindCarousel('.videos-section');
  bindCarousel('.milestones-section');

  /* ---------- 痛点手风琴 ---------- */
  const painItems = $$('.pain-item');
  painItems.forEach((item, i) => {
    item.querySelector('button').addEventListener('click', () => {
      painItems.forEach((p) => p.classList.remove('active'));
      item.classList.add('active');
      const img = $('.pain-media img');
      const src = item.dataset.img;
      if (img && src && img.getAttribute('src') !== src) {
        img.style.opacity = 0;
        setTimeout(() => { img.src = src; img.onload = () => (img.style.opacity = 1); }, 180);
      }
    });
    if (i === 0) item.classList.add('active');
  });

  /* ---------- 视频点击播放 ---------- */
  $$('.video-card').forEach((card) => {
    const v = $('video', card);
    const btn = $('.vplay', card);
    if (!v || !btn) return;
    btn.addEventListener('click', () => {
      v.play().catch(() => {});
      v.controls = true;
      btn.style.display = 'none';
    });
    v.addEventListener('pause', () => { btn.style.display = ''; });
    v.addEventListener('play', () => { btn.style.display = 'none'; });
  });

  /* ---------- 滚动进入动画 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Newsletter 弹窗 ---------- */
  const modal = $('.modal-mask');
  function openModal(force) {
    if (!modal) return;
    if (sessionStorage.getItem('nl-dismissed') && !force) return;
    setTimeout(() => modal.classList.add('open'), force ? 0 : 6000);
  }
  openModal(false);
  if (modal) {
    $('.modal-close', modal).addEventListener('click', () => {
      modal.classList.remove('open'); sessionStorage.setItem('nl-dismissed', '1');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { modal.classList.remove('open'); sessionStorage.setItem('nl-dismissed', '1'); }
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  window.showToast = function (msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  };

  /* ---------- Newsletter 提交 ---------- */
  $$('.newsletter-form').forEach((f) => {
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input[type="email"]', f);
      if (!input.value || !input.value.includes('@')) { showToast('Please enter a valid email address.'); return; }
      showToast('🎉 Subscribed! Your 5% off code is on its way.');
      input.value = '';
      if (modal) modal.classList.remove('open');
      sessionStorage.setItem('nl-dismissed', '1');
    });
  });

  /* ---------- 购物车计数（演示） ---------- */
  let cartN = 0;
  const cartCount = $('.cart-count');
  window.addToCart = function (qty) {
    cartN += qty || 1;
    if (cartCount) { cartCount.textContent = cartN; cartCount.style.display = 'grid'; }
    showToast('Added to cart ✓');
  };

  /* ---------- PDP：图库 / 变体 / 数量 ---------- */
  const thumbs = $$('.gallery-thumbs button');
  const mainShot = $('.pdp-gallery .main-shot img');
  thumbs.forEach((b) => {
    b.addEventListener('click', () => {
      thumbs.forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      if (mainShot) {
        mainShot.style.opacity = 0;
        setTimeout(() => { mainShot.src = b.dataset.full; mainShot.onload = () => (mainShot.style.opacity = 1); }, 150);
      }
    });
  });
  $$('.opt-row').forEach((row) => {
    $$('.opt-pill', row).forEach((p) => {
      p.addEventListener('click', () => {
        $$('.opt-pill', row).forEach((x) => x.classList.remove('active'));
        p.classList.add('active');
        const lab = $('.opt-label b', row.parentElement);
        if (lab && p.dataset.label) lab.textContent = p.dataset.label;
      });
    });
  });
  $$('.swatch-row').forEach((row) => {
    $$('.swatch', row).forEach((s) => {
      s.addEventListener('click', () => {
        $$('.swatch', row).forEach((x) => x.classList.remove('active'));
        s.classList.add('active');
      });
    });
  });
  $$('.depth-card').forEach((c) => {
    c.addEventListener('click', () => {
      $$('.depth-card').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
    });
  });
  const qtyInput = $('.qty input');
  if (qtyInput) {
    $('.qty .minus').addEventListener('click', () => (qtyInput.value = Math.max(1, +qtyInput.value - 1)));
    $('.qty .plus').addEventListener('click', () => (qtyInput.value = +qtyInput.value + 1));
  }
  const buyBtn = $('.pdp-buy .btn-primary');
  if (buyBtn) buyBtn.addEventListener('click', () => window.addToCart(+((qtyInput && qtyInput.value) || 1)));

  /* ---------- 锚点导航高亮 ---------- */
  const anchorNav = $('.anchor-nav');
  if (anchorNav) {
    const links = $$('a', anchorNav);
    const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const io2 = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    secs.forEach((s) => io2.observe(s));
  }

  /* ---------- 列表页筛选 ---------- */
  $$('.filter-bar .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('.filter-bar .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      $$('.listing-grid .product-card').forEach((c) => {
        c.style.display = !f || f === 'all' || c.dataset.series === f ? '' : 'none';
      });
    });
  });
})();
