/**
 * INTAN CLINIC — sync.js
 * Telegram Bot уведомления + бэкенд + localStorage
 */

const CONFIG = {
  BACKEND:      'https://intan-backend.onrender.com/api',
  TG_BOT_TOKEN: '8934629611:AAHLbTr5dCE4AvCjqGscXwJrmwChoKZ_TFw',
  TG_CHAT_ID:   '8191971983',
  TG_ENABLED:   true,
};

// ── Утилита fetch ──────────────────────────────
async function apiFetch(path) {
  try {
    const res = await fetch(`${CONFIG.BACKEND}${path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[Intan sync] ${path}:`, e.message);
    return null;
  }
}

// ── Telegram уведомление ───────────────────────
async function sendTelegramNotification(data) {
  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    timeZone: 'Asia/Bishkek',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Простой текст без Markdown — надёжнее
  const text =
    `🦷 НОВАЯ ЗАПИСЬ — Клиника Интан\n\n` +
    `👤 Пациент: ${data.name}\n` +
    `📞 Телефон: ${data.phone}\n` +
    `🩺 Услуга: ${data.service || 'Не указано'}\n` +
    `📅 Дата приёма: ${data.date ? formatDate(data.date) : 'Не указано'}\n` +
    `💬 Комментарий: ${data.comment || '—'}\n` +
    `🕐 Время заявки: ${dateStr} (Бишкек)\n` +
    `🌐 Источник: Сайт intan.kg`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${CONFIG.TG_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CONFIG.TG_CHAT_ID,
          text: text,
        }),
      }
    );

    const result = await res.json();
    if (result.ok) {
      console.log('[Telegram] ✅ Уведомление отправлено');
      return true;
    } else {
      console.error('[Telegram] ❌ Ошибка API:', result.description);
      return false;
    }
  } catch (err) {
    console.error('[Telegram] ❌ Сетевая ошибка:', err);
    return false;
  }
}

function formatDate(dateStr) {
  try {
    const [y, m, d] = dateStr.split('-');
    const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
  } catch { return dateStr; }
}

// ── localStorage ───────────────────────────────
function saveBookingLocally(data) {
  try {
    const bookings = JSON.parse(localStorage.getItem('intan_bookings') || '[]');
    bookings.unshift({ id: Date.now(), ...data, createdAt: new Date().toISOString(), status: 'new' });
    if (bookings.length > 200) bookings.splice(200);
    localStorage.setItem('intan_bookings', JSON.stringify(bookings));
  } catch (e) {
    console.warn('[LocalStorage] Ошибка:', e);
  }
}

// ── Форма записи ───────────────────────────────
function initBookingForm() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const name    = document.getElementById('formName')?.value?.trim()    || '';
    const phone   = document.getElementById('formPhone')?.value?.trim()   || '';
    const service = document.getElementById('formService')?.value         || '';
    const date    = document.getElementById('formDate')?.value            || '';
    const comment = document.getElementById('formComment')?.value?.trim() || '';

    // Валидация
    if (!name)  { markInvalid('formName');  showSyncError('Введите ваше имя');    return; }
    if (!phone || phone.length < 6) { markInvalid('formPhone'); showSyncError('Введите корректный телефон'); return; }

    // Блокируем кнопку
    const btn = form.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Отправка...'; }

    const bookingData = { name, phone, service, date, comment };

    try {
      saveBookingLocally(bookingData);
      await sendTelegramNotification(bookingData);

      // Бэкенд — необязательно, не блокируем если упал
      fetch(`${CONFIG.BACKEND}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name:   name,
          phone:          phone,
          service_id:     null,
          comment:        [service ? `Услуга: ${service}` : '', comment].filter(Boolean).join(' | '),
          appointment_dt: date ? `${date}T09:00:00` : null,
          source:         'online',
        }),
      }).catch(() => {});

      showSuccessToast();
      clearError();
      form.reset();

    } catch (err) {
      console.error('[Intan booking]', err);
      showSyncError('Ошибка отправки. Позвоните нам: +996 500 000 000');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = origText; }
    }
  }, true); // capture — перехватываем раньше script.js
}

function markInvalid(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('invalid');
  el.addEventListener('input', () => el.classList.remove('invalid'), { once: true });
}

function showSuccessToast() {
  const toast = document.getElementById('formToast');
  if (toast) { toast.classList.add('visible'); setTimeout(() => toast.classList.remove('visible'), 5000); }
}

function showSyncError(msg) {
  let el = document.getElementById('syncFormError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'syncFormError';
    el.style.cssText = 'color:#ef4444;font-size:13px;margin:8px 0 4px;text-align:center;font-weight:600;padding:10px;background:rgba(239,68,68,.08);border-radius:10px';
    const btn = form ? form.querySelector('button[type="submit"]') : document.querySelector('#appointmentForm button[type="submit"]');
    if (btn) btn.before(el);
  }
  el.textContent = msg;
  setTimeout(() => { if (el) el.textContent = ''; }, 6000);
}

function clearError() {
  const el = document.getElementById('syncFormError');
  if (el) el.textContent = '';
}

// ── Врачи из БД ────────────────────────────────
async function loadDoctors() {
  const doctors = await apiFetch('/doctors');
  if (!doctors?.length) return;
  const grid = document.getElementById('doctorsGrid') || document.querySelector('.doctors__grid');
  if (!grid) return;

  const colors = ['#0369a1,#0ea5e9','#0891b2,#06b6d4','#0284c7,#38bdf8','#0d9488,#14b8a6'];
  grid.innerHTML = doctors.map((d, i) => {
    const name = `${d.last_name || ''} ${d.first_name || ''}`.trim();
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const ci = i % colors.length;
    const [c1, c2] = colors[ci].split(',');
    return `
      <div class="doctor-card reveal">
        <div class="doctor-card__photo">
          <div class="doctor-card__avatar">
            ${d.photo_url
              ? `<img src="${d.photo_url}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
              : `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="dg${i}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
                  </linearGradient></defs>
                  <circle cx="60" cy="60" r="60" fill="url(#dg${i})"/>
                  <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-size="40" font-weight="700" fill="white">${initials}</text>
                </svg>`}
          </div>
          <div class="doctor-card__exp">Опыт: ${d.experience_years || 0} лет</div>
        </div>
        <div class="doctor-card__info">
          <h3>${name}</h3>
          <span class="doctor-card__spec">${d.specialization || ''}</span>
          <p>${d.bio ? d.bio.slice(0,110) + (d.bio.length > 110 ? '...' : '') : ''}</p>
          <div class="doctor-card__tags">${(d.certificates||[]).slice(0,2).map(c=>`<span>${c}</span>`).join('')}</div>
          <a href="#appointment" class="btn btn--primary btn--sm btn--full">Записаться</a>
        </div>
      </div>`;
  }).join('');
}

// ── Старт ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBookingForm();
  setTimeout(loadDoctors, 600);
});