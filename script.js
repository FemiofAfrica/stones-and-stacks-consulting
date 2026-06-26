(function() {
  'use strict';

  /* ─── REDUCED MOTION ─── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    document.body.classList.add('reduce-motion');
  }
  prefersReduced.addEventListener('change', (e) => {
    document.body.classList.toggle('reduce-motion', e.matches);
  });

  /* ─── SCROLL REVEAL (IntersectionObserver) ─── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ─── STATS BAR ENTRANCE ─── */
  const statsBar = document.querySelector('.hero-stats');
  if (statsBar) {
    // Trigger after page load to allow hero entrance to settle
    window.addEventListener('load', () => {
      setTimeout(() => statsBar.classList.add('visible'), 400);
    });
  }

  /* ─── HEADER SCROLL STATE ─── */
  const header = document.querySelector('.site-header');
  let lastScroll = 0;

  const updateHeader = () => {
    const scrollY = window.scrollY;
    if (scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  };

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // initial check

  /* ─── ACTIVE NAV LINK ─── */
  const navLinks = document.querySelectorAll('.nav a');
  const sections = [];
  navLinks.forEach((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) sections.push({ el: target, link: link });
  });

  const updateActiveNav = () => {
    const scrollY = window.scrollY + 120; // offset for header
    let current = sections[0];

    for (const s of sections) {
      if (s.el.offsetTop <= scrollY) {
        current = s;
      }
    }

    sections.forEach((s) => s.link.classList.toggle('active', s === current));
  };

  if (sections.length) {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();
  }

  /* ─── SMOOTH SCROLL FOR NAV LINKS ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── CONTACT FORM ─── */
  const form = document.querySelector('.contact-form');
  const formStatus = document.querySelector('.form-status');

  if (form && formStatus) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form));
      formStatus.hidden = false;
      formStatus.className = 'form-status form-status--sending';
      formStatus.textContent = 'Sending\u2026';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });

        if (res.ok) {
          formStatus.className = 'form-status form-status--success';
          formStatus.textContent = 'Thanks\u2014we\u2019ll be in touch within 48 hours.';
          form.reset();
        } else {
          throw new Error(`Server responded ${res.status}`);
        }
      } catch (err) {
        formStatus.className = 'form-status form-status--error';
        formStatus.textContent = 'Something went wrong. Please email us directly at hello@stonesandstacks.com.';
      }
    });
  }

  /* ─── OUTCOME CARD EXPAND/COLLAPSE ─── */
  document.querySelectorAll('.outcome-more').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.outcome-card');
      if (!card) return;
      const isExpanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', isExpanded);
      btn.querySelector('.outcome-more-text').hidden = isExpanded;
      btn.querySelector('.outcome-less-text').hidden = !isExpanded;
    });
  });

})();
