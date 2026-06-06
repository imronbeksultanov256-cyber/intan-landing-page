document.addEventListener('DOMContentLoaded', () => {

  // ── BURGER NAV MENU ──
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

  // ── HEADER SCROLL HEADER EFFECT ──
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // ── SCROLLSPY (ACTIVE NAV STATE) ──
  const sections = document.querySelectorAll('section[id]');
  const scrollSpy = () => {
    const currentScroll = window.scrollY + 120;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);

      if (targetNavLink) {
        if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
          targetNavLink.classList.add('active');
        } else {
          targetNavLink.classList.remove('active');
        }
      }
    });
  };
  window.addEventListener('scroll', scrollSpy);

  // ── LIGHT / DARK THEME SYSTEM ──
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // ── SCROLL REVEAL ANIMATION ──
  const revealElements = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.88;
    revealElements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;
      if (elTop < triggerBottom) {
        el.classList.add('visible');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // ── ANIMATED COUNTERS STATISTICS ──
  const counters = document.querySelectorAll('.counter');
  const speed = 200;

  const startCounting = (counter) => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const inc = Math.ceil(target / speed);

    if (count < target) {
      counter.innerText = count + inc > target ? target : count + inc;
      setTimeout(() => startCounting(counter), 15);
    } else {
      counter.innerText = target;
    }
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounting(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => counterObserver.observe(counter));

  // ── FAQ ACCORDION MULTIPLE ──
  const faqTriggers = document.querySelectorAll('.faq__trigger');
  faqTriggers.forEach(trigger => {
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

  // ── SCROLL TO TOP & APPOINTMENT BUTTONS ──
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const floatingAppointBtn = document.getElementById('floatingAppointBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
      if (floatingAppointBtn) floatingAppointBtn.style.transform = 'translateY(0)';
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── PHONE INPUT MASK & VALIDATION ──
  const phoneInput = document.getElementById('formPhone');
  if (phoneInput) {
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value) {
        phoneInput.value = '+996 ';
      }
    });

    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value.trim() === '+996') {
        phoneInput.value = '';
      }
    });

    phoneInput.addEventListener('input', (e) => {
      // Разрешаем вводить только цифры, знак плюс и пробелы/скобки
      let matrix = '+996 (___) __-__-__';
      let i = 0;
      let def = matrix.replace(/\D/g, '');
      let val = phoneInput.value.replace(/\D/g, '');
      
      if (def.length >= val.length) val = def;
      
      phoneInput.value = matrix.replace(/./g, function(a) {
        return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? '' : a;
      });
    });
  }

  // ── APPOINTMENT FORM SUBMIT TOAST ──
  const form = document.getElementById('appointmentForm');
  const toast = document.getElementById('formToast');

  if (form && toast) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('formName');
      const serviceSelect = document.getElementById('formService');
      const dateInput = document.getElementById('formDate');
      let isValid = true;

      // Базовая валидация
      [nameInput, phoneInput, serviceSelect, dateInput].forEach(input => {
        if (!input.value || input.value.trim() === '' || (input === phoneInput && phoneInput.value.length < 19)) {
          input.classList.add('invalid');
          isValid = false;
        } else {
          input.classList.remove('invalid');
        }
      });

      if (!isValid) return;

      // Имитация отправки данных на сервер
      toast.classList.add('visible');
      form.reset();

      setTimeout(() => {
        toast.classList.remove('visible');
      }, 4500);
    });
  }

  // Ограничение выбора прошедших дат в форме записи
  const dateInput = document.getElementById('formDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});
