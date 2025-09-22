// java.js - versión corregida y limpia
// -------------------------------------
// Reglas:
// - cada reserva ocupa 90 minutos
// - solo reservas entre hoy (excluido pasado) y hoy + 30 días
// - se previene solapamiento en la misma mesa
// - tabla en vivo con hora fin y cuenta regresiva (one-interval)

const availabletables = [
  { number: 1, reservationsByMonth: {} },
  { number: 2, reservationsByMonth: {} },
  { number: 3, reservationsByMonth: {} },
  { number: 4, reservationsByMonth: {} },
  { number: 5, reservationsByMonth: {} },
  { number: 6, reservationsByMonth: {} },
  { number: 7, reservationsByMonth: {} },
  { number: 8, reservationsByMonth: {} },
  { number: 9, reservationsByMonth: {} },
  { number: 10, reservationsByMonth: {} },
];

const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// ---------------------- DOMContentLoaded ----------------------
document.addEventListener('DOMContentLoaded', () => {
  // actualizar calendario si cambia mes/año cada 60s
  setInterval(() => {
    const now = new Date();
    const newMonth = now.getMonth();
    const newYear = now.getFullYear();
    if (newMonth !== currentMonth || newYear !== currentYear) {
      currentMonth = newMonth;
      currentYear = newYear;
      generateCalendar(currentMonth, currentYear);
    }
  }, 60000);

  // listeners botones (si existen)
  const resevarBtn = document.getElementById('resevar-button');
  const reporteBtn = document.getElementById('reporte-button');
  if (resevarBtn) resevarBtn.addEventListener('click', reservedTable);
  if (reporteBtn) reporteBtn.addEventListener('click', generateReport);

  // prev / next del calendario (cuando el DOM ya está listo)
  const prevBtn = document.getElementById('prev-month');
  const nextBtn = document.getElementById('next-month');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentMonth === 0) { currentMonth = 11; currentYear--; } else currentMonth--;
    generateCalendar(currentMonth, currentYear);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentMonth === 11) { currentMonth = 0; currentYear++; } else currentMonth++;
    generateCalendar(currentMonth, currentYear);
  });

  // inicial
  generateCalendar(currentMonth, currentYear);
  renderTables();
  renderActiveReservations();
});

// ---------------------- RENDER MESAS ----------------------
function renderTables() {
  const availabletablesDiv = document.getElementById('mesas-disponibles');
  const ocupiedtablesDiv = document.getElementById('mesas-ocupadas');

  if (!availabletablesDiv || !ocupiedtablesDiv) {
    console.warn('Contenedores de mesas no encontrados en el DOM.');
    return;
  }

  availabletablesDiv.innerHTML = '';
  ocupiedtablesDiv.innerHTML = '';

  const yearNow = new Date().getFullYear();

  availabletables.forEach(table => {
    const tableDiv = document.createElement('div');
    tableDiv.className = 'table';

    // imagen (creada de forma segura)
    const img = document.createElement('img');
    img.className = 'mesa-img';
    img.alt = `Mesa ${table.number}`;
    img.src = 'imagenes/mesas.jpg';
    img.onerror = function () {
      this.onerror = null;
      this.src = 'https://via.placeholder.com/300x200.png?text=Mesa';
    };

    const nameDiv = document.createElement('div');
    nameDiv.className = 'table-name';
    nameDiv.textContent = `Mesa ${table.number}`;

    tableDiv.appendChild(img);
    tableDiv.appendChild(nameDiv);

    const months = table.reservationsByMonth[yearNow] || {};

    if (Object.keys(months).length > 0) {
      // listar reservas por mes dentro del card de la mesa
      Object.keys(months).forEach(monthKey => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-reservation';
        const monthName = monthNames[Number(monthKey)] || monthKey;
        monthDiv.innerHTML = `<strong>${monthName}</strong>`;

        months[monthKey].forEach(res => {
          const reserveInfo = document.createElement('div');
          reserveInfo.className = 'reservation-info';
          reserveInfo.innerHTML = `${escapeHtml(res.customerName)} - ${escapeHtml(res.date)} a las ${escapeHtml(res.time)}`;
          monthDiv.appendChild(reserveInfo);
        });

        tableDiv.appendChild(monthDiv);
      });

      ocupiedtablesDiv.appendChild(tableDiv);
    } else {
      const reserveButton = document.createElement('button');
      reserveButton.className = 'button';
      reserveButton.textContent = 'Reservar';
      reserveButton.onclick = () => reservedTableByNumber(table.number);
      tableDiv.appendChild(reserveButton);
      availabletablesDiv.appendChild(tableDiv);
    }
  });
}

// ---------- HELPERS ----------
function parseDateTimeFromReservation(reservation) {
  // reservation.date debe ser "YYYY-MM-DD" (normalizada)
  const [y, m, d] = (reservation.date || "").split("-").map(Number);
  const [hh, mm] = (reservation.time || "").split(":").map(Number);
  if ([y,m,d,hh,mm].some(v => Number.isNaN(v))) return null;
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

function formatDurationWithDays(ms) {
  if (ms <= 0) return "00:00:00";

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400); // segundos en un día
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${hh}:${mm}:${ss}`; // ejemplo: "2d 05:12:33"
  } else {
    return `${hh}:${mm}:${ss}`; // menos de un día: "05:12:33"
  }
}

// ---------- RENDER TABLA ----------
function renderActiveReservations() {
  const tbody = document.querySelector("#tabla-reservas tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  availabletables.forEach(table => {
    for (const yearKey in table.reservationsByMonth) {
      const monthsObj = table.reservationsByMonth[yearKey] || {};
      for (const monthKey in monthsObj) {
        const reservations = monthsObj[monthKey] || [];
        reservations.forEach(reservation => {
          // parse inicio y fin con método seguro
          const start = parseDateTimeFromReservation(reservation);
          if (!start) return; // fecha/hora inválida, saltar
          const end = reservation.endTime ? new Date(reservation.endTime) : new Date(start.getTime() + 90 * 60000);
          reservation.id = reservation.id || Date.now();
          const id = reservation.id;

          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${escapeHtml(reservation.customerName)}</td>
            <td>${table.number}</td>
            <td>${reservation.date}</td>
            <td>${formatTimeHHMM(start)}</td>
            <td>${formatTimeHHMM(end)}</td>
            <td class="countdown" data-start="${start.getTime()}" data-end="${end.getTime()}"></td>
            <td>${id}</td>
          `;
          tbody.appendChild(row);
        });
      }
    }
  });

  startCountdowns();
}

// ---------- CUENTA REGRESIVA ----------
function startCountdowns() {
  // limpiar interval anterior
  if (window._reservationCountdownInterval) clearInterval(window._reservationCountdownInterval);

  function updateAll() {
    const now = Date.now();
    const cells = document.querySelectorAll(".countdown");
    cells.forEach(cell => {
      const startMs = Number(cell.dataset.start);
      const endMs = Number(cell.dataset.end);

      if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
        cell.textContent = "—";
        return;
      }

      if (now < startMs) {
        // aún no empezó
        const diff = startMs - now;
        cell.textContent = `Comienza en ${formatDurationWithDays(diff)}`;
        cell.classList.remove("active");
        cell.classList.remove("expired");
        return;
      }

      if (now >= startMs && now < endMs) {
        // en curso
        const diff = endMs - now;
        cell.textContent = `Restan ${formatDurationWithDays(diff)}`;
        cell.classList.add("active");
        cell.classList.remove("expired");
        return;
      }

      // finalizada
      cell.textContent = "Finalizada";
      cell.classList.add("expired");
      cell.classList.remove("active");
    });
  }

  updateAll();
  window._reservationCountdownInterval = setInterval(updateAll, 1000);
}

// ---------------------- RESERVAR MESA (principal) ----------------------
function reservedTableByNumber(tableNumber) {
  const customerInput = document.getElementById("customizacion");
  const reservationDateRaw = (document.getElementById("fecha-seleccionada") || {}).value;
  const reservationTime = (document.getElementById("hora-seleccionada") || {}).value;

  const customerName = customerInput ? customerInput.value.trim() : "";

  if (!customerName) { alert("Ingrese un nombre válido"); return; }
  if (!reservationDateRaw || !reservationTime) { alert("Seleccione una fecha y hora válidas"); return; }

  // Normalizar YYYY-MM-DD (pad zeros)
  const [y, m, d] = reservationDateRaw.split("-").map(Number);
  if (!y || !m || !d) { alert("Formato de fecha inválido"); return; }
  const normalizedDate = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  // Parse seguro
  const [pYear, pMonth, pDay] = [y, m, d];
  const [hour, minute] = reservationTime.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) { alert("Hora inválida"); return; }

  const reservationDateTime = new Date(pYear, pMonth - 1, pDay, hour, minute);

  const now = new Date();
  if (reservationDateTime <= now) { alert("No se pueden hacer reservas para fechas o tiempos pasados."); return; }

  // límite 30 días (normalizamos al final del día)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  maxDate.setHours(23,59,59,999);
  if (reservationDateTime > maxDate) { alert("Solo puedes reservar con un máximo de 30 días de anticipación."); return; }

  const table = availabletables.find(t => t.number === tableNumber);
  if (!table) { alert("Por favor seleccione una mesa existente."); return; }

  const rYear = reservationDateTime.getFullYear();
  const rMonth = reservationDateTime.getMonth();
  if (!table.reservationsByMonth[rYear]) table.reservationsByMonth[rYear] = {};
  if (!table.reservationsByMonth[rYear][rMonth]) table.reservationsByMonth[rYear][rMonth] = [];

  const newStart = reservationDateTime.getTime();
  const newEnd = newStart + 90 * 60000;

  const overlap = table.reservationsByMonth[rYear][rMonth].some(existing => {
    const [resY, resM, resD] = existing.date.split('-').map(Number);
    const [resH, resMin] = existing.time.split(':').map(Number);
    const existingStart = new Date(resY, resM - 1, resD, resH, resMin).getTime();
    const existingEnd = existing.endTime ? new Date(existing.endTime).getTime() : existingStart + 90 * 60000;
    return (newStart < existingEnd && newEnd > existingStart);
  });

  if (overlap) { alert("Error: La mesa ya está reservada en ese horario (se solapa con otra reserva de 90 minutos)."); return; }

  // crear reserva completa (una sola vez)
  const newReservation = {
    customerName,
    date: normalizedDate,
    time: reservationTime,
    endTime: new Date(newEnd).toISOString(),
    id: Date.now()
  };

  table.reservationsByMonth[rYear][rMonth].push(newReservation);

  // actualizar UI
  renderTables();
  renderActiveReservations();

  if (customerInput) customerInput.value = "";
}

// helper para ligar al botón general
function reservedTable() {
  const numInput = document.getElementById('numero-mesa');
  const n = numInput ? Number(numInput.value) : NaN;
  if (!n || isNaN(n)) { alert('Ingresa un número de mesa válido.'); return; }
  reservedTableByNumber(n);
}

// ---------------------- REPORTE (botón) ----------------------
function generateReport() {
  const reportePre = document.getElementById('reporte-de-salida');
  if (!reportePre) { alert('No se encontró el contenedor de reporte.'); return; }

  const currentYear = new Date().getFullYear();
  let text = 'Reporte de reservas por mesa:\n\n';

  availabletables.forEach(table => {
    text += `Mesa ${table.number}:\n`;
    const months = table.reservationsByMonth[currentYear] || {};
    Object.keys(months).forEach(monthKey => {
      text += `  ${monthNames[monthKey]}:\n`;
      months[monthKey].forEach(res => {
        text += `    ${res.date} ${res.time} - ${res.customerName} (id:${res.id})\n`;
      });
    });
    text += '\n';
  });

  reportePre.textContent = text;
}

// ---------------------- CALENDARIO ----------------------
function generateCalendar(month, year) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const title = document.getElementById('calendario-titulo');
  if (title) title.textContent = `${monthNames[month]} ${year}`;

  const calendarBody = document.getElementById('calendar-body');
  if (!calendarBody) return;
  calendarBody.innerHTML = '';

  const today = new Date();
  today.setHours(0,0,0,0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  maxDate.setHours(23,59,59,999);

  let row = document.createElement('tr');

  for (let i = 0; i < startDay; i++) row.appendChild(document.createElement('td'));

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('td');
    cell.textContent = day;
    const cellDate = new Date(year, month, day);
    cellDate.setHours(0,0,0,0);

    // solo deshabilitar visualmente los días anteriores a hoy
    if (cellDate < today) {
      cell.classList.add('disabled-day');
    } else if (cellDate > maxDate) {
      cell.classList.add('out-of-range'); // opcional: marca >30d
      cell.classList.add('numero-dia');
      cell.addEventListener('click', () => selectDate(day, month, year));
    } else {
      cell.classList.add('numero-dia');
      cell.addEventListener('click', () => selectDate(day, month, year));
    }

    row.appendChild(cell);
    if ((startDay + day) % 7 === 0) {
      calendarBody.appendChild(row);
      row = document.createElement('tr');
    }
  }

  if (row.children.length > 0) calendarBody.appendChild(row);
}

function selectDate(day, month, year) {
  const selectedDate = new Date(year, month, day);
  const dateInput = document.getElementById('fecha-seleccionada');
  if (!dateInput) return;

  // normalizar con ceros: YYYY-MM-DD
  const normalized = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,"0")}-${String(selectedDate.getDate()).padStart(2,"0")}`;
  dateInput.value = normalized;

  // animación sutil al seleccionar
  if (dateInput.animate) {
    dateInput.animate(
      [{ transform: 'translateY(-6px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 200, easing: 'ease-out' }
    );
  }

  // opcional: limpiar el time cuando cambie fecha (para forzar elección)
  const timeInput = document.getElementById('hora-seleccionada');
  if (timeInput) timeInput.value = '';
}

// ---------------------- UTILITIES ----------------------
function formatTimeHHMM(date) {
  if (!(date instanceof Date)) date = new Date(date);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
/* ===== Reloj y display fecha seleccionada ===== */

// inicia el reloj en el elemento #clock
function startClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;

  function updateClock() {
    const now = new Date();
    // formato HH:MM:SS, sin AM/PM (24h)
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }

  updateClock();
  // guarda el interval globalmente para poder limpiarlo si hace falta
  if (window._siteClockInterval) clearInterval(window._siteClockInterval);
  window._siteClockInterval = setInterval(updateClock, 1000);
}

// convierte "YYYY-MM-DD" a un texto legible en español
function formatDateHuman(dateString) {
  if (!dateString) return null;
  // crear fecha en local sin ambiguedad
  const parts = dateString.split('-').map(Number);
  if (parts.length !== 3) return dateString;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  // ejemplo: "Lun 21 Sep 2025" y detalle "21 de Septiembre de 2025"
  const short = date.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const long = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  return { short, long };
}

// actualiza la caja #selected-date-display
function updateSelectedDateDisplay(normalizedDate) {
  const container = document.getElementById('selected-date-display');
  if (!container) return;
  if (!normalizedDate) {
    container.innerHTML = 'No hay fecha seleccionada';
    return;
  }
  const f = formatDateHuman(normalizedDate);
  if (!f) {
    container.textContent = normalizedDate;
    return;
  }
  container.innerHTML = `<div class="fecha-dia">${f.short}</div><div class="fecha-detalle">${f.long}</div>`;
}

// Iniciar reloj y, si hay ya una fecha en el input, mostrarla al cargar
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  
  // si input de fecha ya tiene valor cuando carga la página, actualizar display
  const dateInput = document.getElementById('fecha-seleccionada');
  if (dateInput && dateInput.value) updateSelectedDateDisplay(dateInput.value);
});
// Iniciar reloj y, si hay ya una fecha en el input, mostrarla al cargar
document.addEventListener('DOMContentLoaded', () => {
  startClock();

  // después de renderTables() y renderActiveReservations()
  generateCalendar(currentMonth, currentYear);
  renderTables();
  renderActiveReservations();

  // obtener referencia al input de fecha
  const dateInput = document.getElementById('fecha-seleccionada');

  // evitar que el usuario escriba manualmente
  if (dateInput) {
    dateInput.addEventListener('keydown', e => e.preventDefault());

    // si ya tenía un valor al cargar la página, actualizar display
    if (dateInput.value) {
      updateSelectedDateDisplay(dateInput.value);
    }
  }
});
