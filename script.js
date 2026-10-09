// Figma Master Landing Page - Interactions & Lead Capture Engine
document.addEventListener('DOMContentLoaded', () => {

  // Leads Storage Management
  const STORAGE_KEY = 'figma_marketing_leads';

  function getLeads() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLead(email, source = 'hero_form') {
    const leads = getLeads();
    const newLead = {
      id: 'lead_' + Date.now(),
      email: email.trim().toLowerCase(),
      timestamp: new Date().toISOString(),
      displayDate: new Date().toLocaleString(),
      source: source
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    updateLeadsCount();
    renderLeadsDrawer();
    return newLead;
  }

  // Email Validation Helper
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Modals & Elements
  const successModal = document.getElementById('successModal');
  const closeModalBtns = document.querySelectorAll('.close-modal-trigger');
  const userEmailDisplay = document.getElementById('userEmailDisplay');

  function openSuccessModal(email) {
    if (userEmailDisplay) userEmailDisplay.textContent = email;
    if (successModal) {
      successModal.classList.add('active');
      triggerConfetti();
    }
  }

  function closeSuccessModal() {
    if (successModal) successModal.classList.remove('active');
  }

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeSuccessModal);
  });

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeSuccessModal();
    });
  }

  // Handle Form Submissions
  const heroForm = document.getElementById('heroLeadForm');
  const bottomForm = document.getElementById('bottomLeadForm');

  function handleFormSubmit(e, formEl, source) {
    e.preventDefault();
    const input = formEl.querySelector('input[type="email"]');
    const submitBtn = formEl.querySelector('button[type="submit"]');
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      input.focus();
      input.style.boxShadow = '0 0 0 2px #F24E1E';
      setTimeout(() => { input.style.boxShadow = ''; }, 2500);
      return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Unlocking & Sending Email...</span>`;

    // Always record locally for real-time demo CRM
    saveLead(email, source);

    // Call Vercel Serverless Function to store in Supabase and send via Resend
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: source })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Subscription API response:', data);
    })
    .catch(err => {
      // Graceful fallback for local offline file:// viewing
      console.warn('API /api/subscribe not reachable (likely local demo mode):', err);
    })
    .finally(() => {
      openSuccessModal(email);
      input.value = '';
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
  }

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => handleFormSubmit(e, heroForm, 'hero_section'));
  }
  if (bottomForm) {
    bottomForm.addEventListener('submit', (e) => handleFormSubmit(e, bottomForm, 'bottom_cta'));
  }

  // Interactive Live Teaser Widget on Landing Page
  const teaserColorPicker = document.getElementById('teaserColorPicker');
  const teaserCardBadge = document.getElementById('teaserCardBadge');
  const teaserCardButton = document.getElementById('teaserCardButton');
  const teaserLayoutBtns = document.querySelectorAll('.teaser-layout-btn');
  const teaserComponentRow = document.getElementById('teaserComponentRow');

  if (teaserColorPicker && teaserCardBadge && teaserCardButton) {
    teaserColorPicker.addEventListener('input', (e) => {
      const color = e.target.value;
      teaserCardBadge.style.color = color;
      teaserCardBadge.style.borderColor = color;
      teaserCardButton.style.backgroundColor = color;
    });
  }

  if (teaserLayoutBtns && teaserComponentRow) {
    teaserLayoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        teaserLayoutBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        if (mode === 'hug') {
          teaserComponentRow.style.width = 'fit-content';
          teaserComponentRow.style.justifyContent = 'flex-start';
        } else if (mode === 'fill') {
          teaserComponentRow.style.width = '100%';
          teaserComponentRow.style.justifyContent = 'space-between';
        } else if (mode === 'center') {
          teaserComponentRow.style.width = '100%';
          teaserComponentRow.style.justifyContent = 'center';
        }
      });
    });
  }

  // Canvas Mouse Follow Interactive Parallax
  const canvasBody = document.querySelector('.canvas-body');
  const cursorDani = document.querySelector('.cursor-dani');
  const cursorSarah = document.querySelector('.cursor-sarah');

  if (canvasBody && cursorDani && cursorSarah) {
    canvasBody.addEventListener('mousemove', (e) => {
      const rect = canvasBody.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Subtle reactive nudges to multiplayer cursors
      cursorDani.style.transform = `translate(${(x - rect.width / 2) * 0.08}px, ${(y - rect.height / 2) * 0.08}px)`;
      cursorSarah.style.transform = `translate(${-(x - rect.width / 2) * 0.05}px, ${-(y - rect.height / 2) * 0.05}px)`;
    });
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // Admin Leads Drawer (Special feature for marketing class demonstration)
  const leadsDrawer = document.getElementById('leadsDrawer');
  const leadsDrawerOpenBtn = document.getElementById('leadsDrawerOpenBtn');
  const leadsDrawerCloseBtn = document.getElementById('leadsDrawerCloseBtn');
  const leadsListContainer = document.getElementById('leadsListContainer');
  const leadsCountBadge = document.getElementById('leadsCountBadge');
  const clearLeadsBtn = document.getElementById('clearLeadsBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  function updateLeadsCount() {
    const leads = getLeads();
    if (leadsCountBadge) {
      leadsCountBadge.textContent = leads.length;
    }
  }

  function renderLeadsDrawer() {
    if (!leadsListContainer) return;
    const leads = getLeads();
    leadsListContainer.innerHTML = '';

    if (leads.length === 0) {
      leadsListContainer.innerHTML = `
        <div style="text-align:center; padding: 2.5rem 1rem; color: var(--text-dim); font-size: 0.9rem;">
          No emails captured yet.<br>Submit the hero form above to test lead capture!
        </div>
      `;
      return;
    }

    leads.forEach(lead => {
      const div = document.createElement('div');
      div.className = 'lead-item';
      div.innerHTML = `
        <div class="lead-email">${lead.email}</div>
        <div class="lead-time">Captured: ${lead.displayDate} &bull; via ${lead.source}</div>
      `;
      leadsListContainer.appendChild(div);
    });
  }

  if (leadsDrawerOpenBtn) {
    leadsDrawerOpenBtn.addEventListener('click', () => {
      leadsDrawer.classList.add('open');
      renderLeadsDrawer();
    });
  }

  if (leadsDrawerCloseBtn) {
    leadsDrawerCloseBtn.addEventListener('click', () => {
      leadsDrawer.classList.remove('open');
    });
  }

  if (clearLeadsBtn) {
    clearLeadsBtn.addEventListener('click', () => {
      if (confirm('Clear all demo leads?')) {
        localStorage.removeItem(STORAGE_KEY);
        updateLeadsCount();
        renderLeadsDrawer();
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const leads = getLeads();
      if (leads.length === 0) {
        alert('No leads to export yet!');
        return;
      }
      let csv = 'ID,Email,Captured At,Source\n';
      leads.forEach(l => {
        csv += `"${l.id}","${l.email}","${l.displayDate}","${l.source}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figma-leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Pre-populate with 2 demo leads so the drawer looks active on first load if empty
  if (!localStorage.getItem(STORAGE_KEY)) {
    const defaultLeads = [
      { id: 'lead_seed_1', email: 'elena.design@airbnb.com', timestamp: new Date(Date.now() - 3600000).toISOString(), displayDate: '1 hour ago', source: 'hero_form' },
      { id: 'lead_seed_2', email: 'marcus.ux@stripe.com', timestamp: new Date(Date.now() - 7200000).toISOString(), displayDate: '2 hours ago', source: 'bento_cta' }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLeads));
  }

  updateLeadsCount();
  renderLeadsDrawer();

  // Simple Confetti particle effect
  function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1005';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#A259FF', '#1ABCFE', '#0ACF83', '#FF7262', '#F24E1E', '#FFFFFF'];
    const particles = [];

    for (let i = 0; i < 75; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // gravity
        p.rotation += p.rotSpeed;
        p.alpha -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 120) {
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }
    render();
  }
});

  // ==========================================================================
  // SCROLL PROGRESS BAR, INTERSECTION REVEALS, 3D TILT & STAT COUNTERS
  // ==========================================================================

  // 1. Scroll Progress Bar Tracker
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0 && scrollProgressBar) {
      const scrolled = (winScroll / height) * 100;
      scrollProgressBar.style.width = scrolled + '%';
    }
  }, { passive: true });

  // 2. Animated Number Counters
  function animateCounter(counter) {
    if (counter.dataset.animated === 'true') return;
    counter.dataset.animated = 'true';
    const target = parseInt(counter.dataset.target, 10);
    const suffix = counter.dataset.suffix || '';
    const prefix = counter.dataset.prefix || '';
    const duration = 1800;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * target);
      counter.textContent = prefix + currentVal.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = prefix + target.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(updateCounter);
  }

  // 3. Scroll-Driven Intersection Reveal Observer
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        // Trigger any nested counters
        const counters = entry.target.querySelectorAll('.stat-counter');
        counters.forEach(counter => animateCounter(counter));
        if (entry.target.classList.contains('stat-counter')) {
          animateCounter(entry.target);
        }
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Interactive 3D Card Tilt with Dynamic Lighting Glare
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
