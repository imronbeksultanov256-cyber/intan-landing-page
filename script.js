document.addEventListener('DOMContentLoaded', () => {

  // ── CURSOR GLOW ──
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  // ── DENTAL PARTICLES ──
  const canvas = document.getElementById('particlesCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const toothEmoji = ['🦷', '✨', '⭐', '💎'];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 12 + 6;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = -Math.random() * 0.6 - 0.2;
        this.opacity = Math.random() * 0.12 + 0.04;
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
        this.emoji = toothEmoji[Math.floor(Math.random() * toothEmoji.length)];
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotSpeed;
        this.life--;
        if (this.life <= 0) this.reset();
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity * (this.life / this.maxLife);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
      }
    }

    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }

    let animFrame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  // ── BURGER NAV ──
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav__link');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
    });
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  // ── HEADER SCROLL ──
  const header = document.getElementById('header');
  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ── SCROLLSPY ──
  const sections = document.querySelectorAll('section[id]');
  const scrollSpy = () => {
    const currentScroll = window.scrollY + 120;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const link = document.querySelector(`.nav__link[href="#${sectionId}"]`);
      if (link) {
        link.classList.toggle('active', currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight);
      }
    });
  };
  window.addEventListener('scroll', scrollSpy, { passive: true });

  // ── THEME TOGGLE ──
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ── SCROLL REVEAL ──
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = Array.from(entry.target.parentElement?.children || []).filter(el => el.classList.contains('reveal'));
        const index = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // ── COUNTERS ──
  const counters = document.querySelectorAll('.counter');
  const startCounting = (counter) => {
    const target = +counter.getAttribute('data-target');
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.innerText = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else counter.innerText = target;
    };
    requestAnimationFrame(update);
  };
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounting(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(counter => counterObserver.observe(counter));

  // ── FAQ ──
  document.querySelectorAll('.faq__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.parentElement;
      const content = parent.querySelector('.faq__content');
      const isActive = parent.classList.contains('active');

      document.querySelectorAll('.faq__item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq__content').style.maxHeight = null;
      });

      if (!isActive) {
        parent.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // ── PRICE TABS ──
  const priceTabs = document.querySelectorAll('.prices__tab');
  const pricePanels = document.querySelectorAll('.prices__panel');
  priceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      priceTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      pricePanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${target}`) {
          panel.classList.add('active');
          // Animate rows
          const rows = panel.querySelectorAll('.price-row:not(.price-row--head)');
          rows.forEach((row, i) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(-12px)';
            setTimeout(() => {
              row.style.transition = 'all .3s ease';
              row.style.opacity = '1';
              row.style.transform = 'translateX(0)';
            }, i * 40);
          });
        }
      });
    });
  });

  // ── SCROLL TOP & FLOAT APPOINT BTN ──
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const floatingAppointBtn = document.getElementById('floatingAppointBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn?.classList.add('visible');
    } else {
      scrollTopBtn?.classList.remove('visible');
    }
  }, { passive: true });
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── PHONE MASK ──
  const phoneInput = document.getElementById('formPhone');
  if (phoneInput) {
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value) phoneInput.value = '+996 ';
    });
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.trim() === '+996') phoneInput.value = '';
    });
    phoneInput.addEventListener('input', () => {
      let matrix = '+996 (___) __-__-__';
      let i = 0;
      let def = matrix.replace(/\D/g, '');
      let val = phoneInput.value.replace(/\D/g, '');
      if (def.length >= val.length) val = def;
      phoneInput.value = matrix.replace(/./g, (a) => /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a);
    });
  }

  // ── DATE MIN ──
  const dateInput = document.getElementById('formDate');
  if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  // ── TOOTH HOVER on service cards ──
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.service-card__icon');
      if (icon) {
        icon.style.transform = 'scale(1.25) rotate(10deg)';
        icon.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)';
      }
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.service-card__icon');
      if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
    });
  });

  // ── MAGNETIC BUTTON EFFECT ──
  document.querySelectorAll('.btn--primary').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translateY(-2px) translate(${x * 0.08}px, ${y * 0.08}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ── RIPPLE EFFECT ──
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute;width:${size}px;height:${size}px;
        border-radius:50%;background:rgba(255,255,255,0.3);
        top:${e.clientY - rect.top - size/2}px;
        left:${e.clientX - rect.left - size/2}px;
        transform:scale(0);animation:rippleAnim .6s ease-out forwards;
        pointer-events:none;
      `;
      if (!document.querySelector('#rippleStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleStyle';
        style.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0}}';
        document.head.appendChild(style);
      }
      btn.style.position = 'relative';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // ── FORM VALIDATION DISPLAY ──
  const form = document.getElementById('appointmentForm');
  if (form) {
    const inputs = form.querySelectorAll('.form__input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          input.classList.add('invalid');
        } else {
          input.classList.remove('invalid');
        }
      });
      input.addEventListener('input', () => {
        input.classList.remove('invalid');
      });
    });
  }

});
