/**
 * INTAN CLINIC — sync.js
 * Подключите этот файл в index.html ПЕРЕД закрывающим </body>:
 * <script src="sync.js"></script>
 *
 * Что делает:
 *  1. Загружает врачей из БД → вставляет в секцию #doctors
 *  2. Загружает прайс из БД  → вставляет в секцию #services
 *  3. Форма записи (#appointmentForm) → отправляет на бэкенд /api/book
 */

const BACKEND = 'https://intan-backend.onrender.com/api';

// ── Утилита: безопасный fetch с таймаутом ─────────────────
async function apiFetch(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000); // 10 сек таймаут
  try {
    const res = await fetch(`${BACKEND}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[Intan sync] ${path}:`, e.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ══════════════════════════════════════════════════════════
// 1. ВРАЧИ
// ══════════════════════════════════════════════════════════
async function loadDoctors() {
  const doctors = await apiFetch('/doctors');
  if (!doctors || !doctors.length) return; // нет данных — оставляем статичный HTML

  // Ищем контейнер с карточками врачей
  // На вашем сайте секция #doctors содержит карточки с классом doctor-card или похожим
  const section = document.querySelector('#doctors .doctors__grid, #doctors .grid, #doctors');
  if (!section) return;

  // Очищаем статичные карточки и вставляем из БД
  const cardContainer = section.querySelector('.doctors__grid') || section;

  // Сохраняем заголовок секции если есть
  const heading = section.querySelector('h2, h3, .section-title');

  cardContainer.innerHTML = doctors.map(d => {
    const name     = `${d.last_name || ''} ${d.first_name || ''} ${d.middle_name || ''}`.trim();
    const photo    = d.photo_url
      ? `<img src="${d.photo_url}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#0ea5e9,#0284c7);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:700">${getInitials(name)}</div>`;

    const certs    = Array.isArray(d.certificates) ? d.certificates : [];
    const tagsHtml = certs.slice(0, 3).map(c =>
      `<span style="background:rgba(14,165,233,0.12);color:#0284c7;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:500">${c}</span>`
    ).join('');

    return `
      <div class="doctor-card" style="
        background:#fff;border-radius:16px;padding:24px;text-align:center;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);transition:transform 0.2s;
      " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="width:90px;height:90px;margin:0 auto 14px;border-radius:50%;overflow:hidden;border:3px solid #e0f2fe">
          ${photo}
        </div>
        <div style="font-size:11px;color:#0ea5e9;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">
          Опыт: ${d.experience_years || 0} лет
        </div>
        <h3 style="font-size:16px;font-weight:700;margin:0 0 4px;color:#0f172a">${name}</h3>
        <p style="font-size:13px;color:#64748b;margin:0 0 12px">${d.specialization || ''}</p>
        ${d.bio ? `<p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0 0 12px">${d.bio.slice(0,100)}${d.bio.length>100?'...':''}</p>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px">${tagsHtml}</div>
        <a href="#appointment" style="
          display:inline-block;background:#0ea5e9;color:#fff;
          padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;
          text-decoration:none;transition:background 0.2s;
        " onmouseover="this.style.background='#0284c7'" onmouseout="this.style.background='#0ea5e9'">
          Записаться
        </a>
      </div>
    `;
  }).join('');
}

// ══════════════════════════════════════════════════════════
// 2. ПРАЙС-ЛИСТ
// ══════════════════════════════════════════════════════════
async function loadPrices() {
  const data = await apiFetch('/services?activeOnly=true');
  if (!data || !data.grouped || !data.grouped.length) return;

  // Ищем контейнер услуг
  const section = document.querySelector('#services');
  if (!section) return;

  // Находим место куда вставить — после заголовка
  const existingPriceBlock = section.querySelector('.price-list, .services__price, #priceList');
  const insertTarget = existingPriceBlock || section;

  const priceHtml = `
    <div id="intanPriceList" style="margin-top:32px">
      ${data.grouped.map(cat => `
        <div style="margin-bottom:28px">
          <h4 style="
            font-size:15px;font-weight:700;color:#0f172a;
            padding:10px 16px;background:#f0f9ff;border-left:4px solid #0ea5e9;
            border-radius:0 8px 8px 0;margin:0 0 8px
          ">${cat.name}</h4>
          <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
            ${cat.services.map((s, i) => `
              <div style="
                display:flex;align-items:center;justify-content:space-between;
                padding:12px 16px;
                ${i < cat.services.length-1 ? 'border-bottom:1px solid #f1f5f9;' : ''}
                background:${i % 2 === 0 ? '#fff' : '#fafbfc'};
              ">
                <div>
                  <div style="font-size:14px;font-weight:500;color:#1e293b">${s.name}</div>
                  ${s.duration_min ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px">⏱ ${s.duration_min} мин</div>` : ''}
                </div>
                <div style="
                  font-size:15px;font-weight:700;color:#0ea5e9;
                  white-space:nowrap;margin-left:16px
                ">
                  ${formatMoney(s.price)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
      <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:8px">
        * Цены актуальны на ${new Date().toLocaleDateString('ru-RU')}. Окончательная стоимость после консультации.
      </p>
    </div>
  `;

  // Если уже вставляли — обновляем
  const existing = document.getElementById('intanPriceList');
  if (existing) {
    existing.outerHTML = priceHtml;
  } else {
    insertTarget.insertAdjacentHTML('beforeend', priceHtml);
  }
}

// ══════════════════════════════════════════════════════════
// 3. ФОРМА ЗАПИСИ
// ══════════════════════════════════════════════════════════
async function initBookingForm() {
  // Заполняем select услуг из БД
  const serviceSelect = document.getElementById('formService');
  if (serviceSelect) {
    const data = await apiFetch('/services?activeOnly=true');
    if (data && data.flat && data.flat.length) {
      // Оставляем первый пустой option
      const firstOption = serviceSelect.querySelector('option[value=""], option:first-child');
      serviceSelect.innerHTML = '';
      if (firstOption) serviceSelect.appendChild(firstOption);

      // Группируем по категориям
      if (data.grouped) {
        data.grouped.forEach(cat => {
          const optgroup = document.createElement('optgroup');
          optgroup.label = cat.name;
          cat.services.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `${s.name} — ${formatMoney(s.price)}`;
            optgroup.appendChild(opt);
          });
          serviceSelect.appendChild(optgroup);
        });
      }
    }
  }

  // Подключаем обработчик формы
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  // Убираем старый обработчик (если был) — клонируем элемент
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput    = newForm.querySelector('#formName, [name="name"], input[placeholder*="имя"], input[placeholder*="Имя"]');
    const phoneInput   = newForm.querySelector('#formPhone, [name="phone"], input[type="tel"]');
    const serviceInput = newForm.querySelector('#formService, [name="service"], select');
    const dateInput    = newForm.querySelector('#formDate, [name="date"], input[type="date"]');
    const commentInput = newForm.querySelector('#formComment, [name="comment"], textarea');

    const name    = nameInput?.value?.trim()  || '';
    const phone   = phoneInput?.value?.trim() || '';
    const date    = dateInput?.value           || '';

    // Валидация
    if (!name) { showFormError(newForm, 'Введите ваше имя'); return; }
    if (!phone || phone.length < 10) { showFormError(newForm, 'Введите корректный телефон'); return; }
    if (!date) { showFormError(newForm, 'Выберите дату'); return; }

    // Блокируем кнопку
    const submitBtn = newForm.querySelector('button[type="submit"], input[type="submit"]');
    const origText  = submitBtn?.textContent || '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Отправка...'; }

    try {
      const res = await fetch(`${BACKEND}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name:    name,
          phone:           phone,
          service_id:      serviceInput?.value || null,
          appointment_dt:  date ? `${date}T09:00:00` : null,
          comment:         commentInput?.value || '',
          source:          'online',
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showFormSuccess(newForm);
        newForm.reset();
      } else {
        showFormError(newForm, result.error || 'Ошибка отправки. Позвоните нам.');
      }
    } catch (err) {
      console.error('[Intan booking]', err);
      showFormError(newForm, 'Нет связи с сервером. Позвоните: +996 500 000 000');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origText; }
    }
  });
}

// ── Показать ошибку формы ──────────────────────────────────
function showFormError(form, msg) {
  let errEl = form.querySelector('.form-error, #formError, .auth-error');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.className = 'form-error';
    errEl.style.cssText = 'color:#ef4444;font-size:13px;margin:8px 0;text-align:center';
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.before(errEl);
    else form.appendChild(errEl);
  }
  errEl.textContent = msg;
  errEl.style.display = 'block';
  setTimeout(() => { errEl.style.display = 'none'; }, 5000);
}

// ── Показать успех формы ───────────────────────────────────
function showFormSuccess(form) {
  // Ищем существующий toast/success элемент на сайте
  const toast = document.getElementById('formToast');
  if (toast) {
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 5000);
    return;
  }

  // Создаём собственный
  const successEl = document.createElement('div');
  successEl.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:#10b981;color:#fff;padding:16px 24px;
    border-radius:12px;font-size:14px;font-weight:500;
    box-shadow:0 8px 24px rgba(16,185,129,0.3);
    animation:slideIn 0.3s ease;
  `;
  successEl.innerHTML = '🎉 Заявка принята! Мы свяжемся с вами в течение 5 минут.';
  document.body.appendChild(successEl);
  setTimeout(() => successEl.remove(), 5000);
}

// ── Вспомогательные функции ───────────────────────────────
function getInitials(name) {
  return name.trim().split(' ').filter(Boolean).slice(0, 2)
    .map(w => w[0]).join('').toUpperCase();
}

function formatMoney(n) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' сом';
}

// ══════════════════════════════════════════════════════════
// СТАРТ — запускаем всё после загрузки DOM
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Небольшая задержка — даём сайту отрендериться
  setTimeout(() => {
    loadDoctors();
    loadPrices();
    initBookingForm();
  }, 300);
});
