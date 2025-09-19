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
    // más mesas...
];

document.addEventListener('DOMContentLoaded', () => {
    renderTables(); // Llamar para renderizar las mesas disponibles
    const resevarBtn = document.getElementById('resevar-button');
    const reporteBtn = document.getElementById('reporte-button');

    if (resevarBtn) resevarBtn.addEventListener('click', reservedTable);
    if (reporteBtn) reporteBtn.addEventListener('click', generateReport);

    generateCalendar(currentMonth, currentYear); // Inicializa el calendario
});

// Función para renderizar las mesas disponibles y ocupadas
// Función para renderizar las mesas disponibles y ocupadas
// Función para renderizar las mesas disponibles y ocupadas
// Función para renderizar las mesas disponibles y ocupadas
function renderTables() {
    const availabletablesDiv = document.getElementById('mesas-disponibles');
    const ocupiedtablesDiv = document.getElementById('mesas-ocupadas');

    if (!availabletablesDiv || !ocupiedtablesDiv) {
        console.warn('No se encontraron los contenedores de mesas en el HTML');
        return;
    }

    availabletablesDiv.innerHTML = '';
    ocupiedtablesDiv.innerHTML = '';

    availabletables.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table';
        tableDiv.innerHTML = ` 
            <img class="mesa-img" src="imagenes/mesas.jpg" alt="mesa ${table.number}">
            <div class="table-name">Mesa ${table.number}</div>
        `;

        // Mostramos las reservas agrupadas por mes
        const currentYear = new Date().getFullYear();
        const months = table.reservationsByMonth[currentYear] || {};

        // Si hay reservas para la mesa
        if (Object.keys(months).length > 0) {
            Object.keys(months).forEach(month => {
                const monthDiv = document.createElement('div');
                monthDiv.className = 'month-reservation';
                const monthName = monthNames[month];
                monthDiv.innerHTML = `<strong>${monthName}</strong>`;

                // Crear un contenedor para las reservas por fecha y hora
                months[month].forEach(reservation => {
                    const reserveInfo = document.createElement('div');
                    reserveInfo.className = 'reservation-info';
                    reserveInfo.innerHTML = `${reservation.customerName} - ${reservation.date} a las ${reservation.time}`;
                    monthDiv.appendChild(reserveInfo);
                });

                // Añadimos todas las reservas del mes
                tableDiv.appendChild(monthDiv);
            });

            // Mesa ocupada
            ocupiedtablesDiv.appendChild(tableDiv);
        } else {
            // Si no hay reservas para esa mesa, mostrar el botón de "Reservar"
            const reserveButton = document.createElement('button');
            reserveButton.className = 'button';
            reserveButton.textContent = 'Reservar';
            reserveButton.onclick = () => reservedTableByNumber(table.number);
            tableDiv.appendChild(reserveButton);
            availabletablesDiv.appendChild(tableDiv);
        }
    });
}

// Función para realizar la reserva
// Función para realizar la reserva
// Función para realizar la reserva
function reservedTableByNumber(tableNumber) {
    const customerName = document.getElementById("customizacion").value.trim();
    const reservationDate = document.getElementById("fecha-seleccionada").value;
    const reservationTime = document.getElementById("hora-seleccionada").value;

    if (!customerName) {
        alert("Ingrese un nombre válido");
        return;
    }

    if (!reservationDate || !reservationTime) {
        alert("Seleccione una fecha y hora válidas");
        return;
    }

    const table = availabletables.find(t => t.number === tableNumber);

    if (table) {
        // Convertimos la fecha en un objeto Date para extraer el mes y año
        const reservationDateObj = new Date(reservationDate);
        const month = reservationDateObj.getMonth();
        const year = reservationDateObj.getFullYear();

        // Si no existe el mes en las reservas de la mesa, lo creamos
        if (!table.reservationsByMonth[year]) {
            table.reservationsByMonth[year] = {};
        }
        if (!table.reservationsByMonth[year][month]) {
            table.reservationsByMonth[year][month] = [];
        }

        // Verificar si ya existe una reserva para la misma fecha y hora
        const existingReservation = table.reservationsByMonth[year][month].find(
            reservation => reservation.date === reservationDate && reservation.time === reservationTime
        );

        if (existingReservation) {
            // Si ya existe una reserva a esa hora, duplicar la mesa
            const reservationDiv = document.createElement('div');
            reservationDiv.className = 'reservation-entry';
            reservationDiv.innerHTML = ` 
                <img class="mesa-img" src="imagenes/mesas.jpg" alt="mesa ${table.number}">
                <div class="table-name">Mesa ${table.number}</div>
                <div class="reservation-info">
                    ${customerName} - ${reservationDate} a las ${reservationTime}
                </div>
            `;

            // Añadir la nueva "instancia" de la mesa con la reserva a la sección de mesas ocupadas
            document.getElementById('mesas-ocupadas').appendChild(reservationDiv);
            alert("La mesa ya está reservada a esa hora. Se ha creado una nueva instancia de la reserva.");
        } else {
            // Si no hay una reserva a esa hora, añadir la nueva reserva normalmente
            table.reservationsByMonth[year][month].push({
                customerName: customerName,
                date: reservationDate,
                time: reservationTime,
            });

            // Renderizamos las mesas nuevamente para reflejar la nueva reserva
            renderTables();
            document.getElementById("customizacion").value = "";
        }
    } else {
        alert("La mesa no existe.");
    }
}


// Función para reservar mesa por el botón general
function reservedTable() {
    const numInput = document.getElementById('numero-mesa');
    const n = numInput ? Number(numInput.value) : NaN;
    if (!n || isNaN(n)) {
        return alert('Ingresa un número de mesa válido.');
    }
    reservedTableByNumber(n);
}

// Generar reporte
function generateReport() {
    const reportePre = document.getElementById('reporte-de-salida');
    if (!reportePre) {
        alert('No se encontró el contenedor de reporte.');
        return;
    }

    const ocupadasList = availabletables.filter(t => t.reserved);
    if (ocupadasList.length === 0) {
        reportePre.textContent = 'No hay reservas registradas.';
        return;
    }

    let text = 'Reporte de reservas:\n\n';
    ocupadasList.forEach(t => {
        text += `Mesa ${t.number} - ${t.reserverName || 'Sin nombre'}\n`;
        text += `Fecha de reserva: ${t.reservationDate}\nHora de reserva: ${t.reservationTime}\n\n`;
    });
    reportePre.textContent = text;
}

// Calendario
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Generar calendario
function generateCalendar(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    document.getElementById('calendario-titulo').textContent = `${monthNames[month]} ${year}`;

    const calendarBody = document.getElementById('calendar-body');
    calendarBody.innerHTML = '';

    let row = document.createElement('tr');
    for (let i = 0; i < startDay; i++) {
        row.appendChild(document.createElement('td'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        cell.textContent = day;
        cell.classList.add('numero-dia');
        cell.addEventListener('click', () => selectDate(day, month, year));
        row.appendChild(cell);

        if ((startDay + day) % 7 === 0) {
            calendarBody.appendChild(row);
            row = document.createElement('tr');
        }
    }

    if (row.children.length > 0) {
        calendarBody.appendChild(row);
    }
}

// Selección de fecha en el calendario
function selectDate(day, month, year) {
    selectedDate = new Date(year, month, day);
    const dateInput = document.getElementById('fecha-seleccionada');
    const formattedDate = `${year}-${month + 1}-${day}`;
    dateInput.value = formattedDate;
}

// Cambiar de mes
document.getElementById('prev-month').addEventListener('click', () => {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    generateCalendar(currentMonth, currentYear);
});

document.getElementById('next-month').addEventListener('click', () => {
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    generateCalendar(currentMonth, currentYear);
});

generateCalendar(currentMonth, currentYear);
function generateReport() {
    const reportePre = document.getElementById('reporte-de-salida');
    if (!reportePre) {
        alert('No se encontró el contenedor de reporte.');
        return;
    }

    const currentYear = new Date().getFullYear();
    let text = 'Reporte de reservas por mes:\n\n';

    // Iterar sobre todas las mesas
    availabletables.forEach(table => {
        const months = table.reservationsByMonth[currentYear] || {};
        text += `Mesa ${table.number}:\n`;

        // Iterar sobre los meses
        Object.keys(months).forEach(month => {
            text += `  ${monthNames[month]}:\n`;

            months[month].forEach(reservation => {
                text += `    ${reservation.date} a las ${reservation.time} - ${reservation.customerName}\n`;
            });
        });

        text += '\n';
    });

    reportePre.textContent = text;
}
function renderTables() {
    const availabletablesDiv = document.getElementById('mesas-disponibles');
    const ocupiedtablesDiv = document.getElementById('mesas-ocupadas');

    if (!availabletablesDiv || !ocupiedtablesDiv) {
        console.warn('No se encontraron los contenedores de mesas en el HTML');
        return;
    }

    availabletablesDiv.innerHTML = '';
    ocupiedtablesDiv.innerHTML = '';

    availabletables.forEach(table => {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table';
        tableDiv.innerHTML = ` 
            <img class="mesa-img" src="imagenes/mesas.jpg" alt="mesa ${table.number}">
            <div class="table-name">Mesa ${table.number}</div>
        `;

        // Mostramos las reservas agrupadas por mes
        const currentYear = new Date().getFullYear();
        const months = table.reservationsByMonth[currentYear] || {};

        if (Object.keys(months).length > 0) {
            // Si hay reservas, mostrar la mesa en las ocupadas
            Object.keys(months).forEach(month => {
                const monthDiv = document.createElement('div');
                monthDiv.className = 'month-reservation';
                const monthName = monthNames[month];
                monthDiv.innerHTML = `<strong>${monthName}</strong>`;

                months[month].forEach(reservation => {
                    const reserveInfo = document.createElement('div');
                    reserveInfo.className = 'reservation-info';
                    reserveInfo.innerHTML = `${reservation.customerName} - ${reservation.date} a las ${reservation.time}`;
                    monthDiv.appendChild(reserveInfo);
                });

                tableDiv.appendChild(monthDiv);
            });

            ocupiedtablesDiv.appendChild(tableDiv);
        } else {
            // Si no hay reservas para esa mesa, mostrar el botón de "Reservar"
            const reserveButton = document.createElement('button');
            reserveButton.className = 'button';
            reserveButton.textContent = 'Reservar';
            reserveButton.onclick = () => reservedTableByNumber(table.number);
            tableDiv.appendChild(reserveButton);
            availabletablesDiv.appendChild(tableDiv);
        }
    });
}
