const availabletables = [ // arreglo con las mesas disponibles (cada objeto representa una mesa)
    { number: 1, reserved: false }, // mesa 1, no reservada
    { number: 2, reserved: false }, // mesa 2, no reservada
    { number: 3, reserved: false }, // mesa 3, no reservada
    { number: 4, reserved: false }, // mesa 4, no reservada
    { number: 5, reserved: false }, // mesa 5, no reservada
    { number: 6, reserved: false }, // mesa 6, no reservada
    { number: 7, reserved: false }, // mesa 7, no reservada
    { number: 8, reserved: false }, // mesa 8, no reservada
    { number: 9, reserved: false }, // mesa 9, no reservada
    { number: 10, reserved: false }, // mesa 10, no reservada
    { number: 11, reserved: false }, // mesa 11, no reservada
    { number: 12, reserved: false }, // mesa 12, no reservada
    { number: 13, reserved: false }, // mesa 13, no reservada
    { number: 14, reserved: false }, // mesa 14, no reservada
    { number: 15, reserved: false }, // mesa 15, no reservada
    { number: 16, reserved: false }, // mesa 16, no reservada
    { number: 17, reserved: false }, // mesa 17, no reservada
    { number: 18, reserved: false }, // mesa 18, no reservada
    { number: 19, reserved: false }, // mesa 19, no reservada
    { number: 20, reserved: false }, // mesa 20, no reservada
]; // fin del arreglo de mesas
const ocupiedtables = []; // arreglo vacío para llevar registro (opcional) de mesas ocupadas

document.addEventListener('DOMContentLoaded', () => { // espera a que el DOM esté cargado antes de ejecutar
    renderTables(); // llama a la función que dibuja/actualiza las mesas en la página
    const resevarBtn = document.getElementById('resevar-button'); // obtiene el botón de reservar por su id
    const reporteBtn = document.getElementById('reporte-button'); // obtiene el botón de reporte por su id

    if (resevarBtn) resevarBtn.addEventListener('click', reservedTable); // si existe el botón, añade evento click que llama reservedTable
    if (reporteBtn) reporteBtn.addEventListener('click', generateReport); // si existe el botón, añade evento click que llama generateReport
}); // fin del listener DOMContentLoaded

function renderTables(){ // función que construye la vista de mesas en el HTML
    const availabletablesDiv = document.getElementById('mesas-disponibles'); // contenedor para mesas disponibles
    const ocupiedtablesDiv = document.getElementById('mesas-ocupadas'); // contenedor para mesas ocupadas

    if (!availabletablesDiv || !ocupiedtablesDiv) { // si faltan los contenedores en el HTML
      console.warn('No se encontraron los contenedores de mesas en el HTML'); // aviso en consola
      return; // sale de la función para evitar errores
    }

    availabletablesDiv.innerHTML = ''; // limpia el HTML previo de mesas disponibles
    ocupiedtablesDiv.innerHTML = ''; // limpia el HTML previo de mesas ocupadas

    availabletables.forEach(table => { // recorre cada objeto mesa del arreglo
        const tableDiv = document.createElement('div'); // crea un div para contener la tarjeta de la mesa
        tableDiv.className = 'table'; // asigna la clase 'table' para estilos
        tableDiv.innerHTML = ` 
          <img class="mesa-img" src="imagenes/mesas.jpg" alt="mesa ${table.number}">
          <div class="table-name">mesa ${table.number}</div> 
        `;// rellena el div con la imagen y el nombre de la mesa

        // si la mesa NO está reservada mostramos botón para reservar
        if (!table.reserved) {
            const reserveButton = document.createElement('button'); // crea un botón
            reserveButton.className = 'button'; // le asigna clase 'button' para estilos
            reserveButton.textContent = 'reservar'; // texto que aparece en el botón
            reserveButton.onclick = () => reservedTableByNumber(table.number); // al hacer click llama reservedTableByNumber con el número de mesa
            tableDiv.appendChild(reserveButton); // añade el botón al div de la mesa

            // la agregamos a la sección de mesas disponibles
            availabletablesDiv.appendChild(tableDiv); // añade el div de la mesa al contenedor de disponibles
        } else {
            // si está reservada, añadimos badge con nombre (si existe)
            const ocupadoBadge = document.createElement('div'); // crea un div para el badge "ocupada"
            ocupadoBadge.className = 'badge-ocupada'; // asigna clase para estilos del badge
            const name = table.reserverName ? ` - ${table.reserverName}` : ''; // si hay nombre del reservante, lo usa; si no, cadena vacía
            ocupadoBadge.textContent = `reservada${name}`; // texto del badge: "ocupada - Nombre" o solo "ocupada"
            tableDiv.appendChild(ocupadoBadge); // añade el badge al div de la mesa

            ocupiedtablesDiv.appendChild(tableDiv); // añade el div de la mesa al contenedor de ocupadas
        }
    }); // fin forEach
} // fin función renderTables

// reservar por número (usado por botones individuales y por el botón general)
function reservedTableByNumber(number){
    const idx = availabletables.findIndex(t => t.number === number); // busca índice de la mesa con ese número
    if (idx === -1) return alert('Mesa no encontrada'); // si no existe, muestra alerta y sale

    if (availabletables[idx].reserved) { // si la mesa ya está reservada
      return alert('Esa mesa ya está reservada.'); // alerta y sale
    }

    // tomar nombre del input (si hay)
    const nameInput = document.getElementById('customizacion'); // obtiene input donde el usuario pone su nombre
    const reserverName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Anónimo'; // toma el valor o 'Anónimo' si está vacío

    availabletables[idx].reserved = true; // marca la mesa como reservada en el arreglo
    availabletables[idx].reserverName = reserverName; // guarda el nombre del reservante en la propiedad reserverName

    // opcional: llevarla al array de ocupadas (no estrictamente necesario pero lo dejamos)
    ocupiedtables.push(availabletables[idx]); // añade la mesa reservada al arreglo ocupiedtables

    renderTables(); // vuelve a renderizar las mesas para actualizar la vista
} // fin reservedTableByNumber

// función llamada por el botón general "resevar-button"
function reservedTable(){
    const numInput = document.getElementById('numero-mesa'); // obtiene el input donde se escribe el número de mesa
    const n = numInput ? Number(numInput.value) : NaN; // convierte el valor a número, o NaN si no existe input
    if (!n || isNaN(n)) { // valida que sea un número válido y distinto de 0
        return alert('Ingresa un número de mesa válido en el campo "ingrese el numero de mesa".'); // alerta si inválido
    }
    reservedTableByNumber(n); // llama a la función que reserva por número con el número validado
} // fin reservedTable

// reporte simple: lo ponemos en el <pre id="reporte-de-salida">
function generateReport(){
    const reportePre = document.getElementById('reporte-de-salida'); // obtiene el <pre> donde se mostrará el reporte
    if (!reportePre) { // si no existe ese elemento en el HTML
      // fallback: alert
      const total = availabletables.length; // número total de mesas definidas
      const ocupadas = availabletables.filter(t => t.reserved).length; // cuenta las mesas reservadas
      const libres = total - ocupadas; // calcula mesas libres
      return alert(`Total: ${total}\nOcupadas: ${ocupadas}\nLibres: ${libres}`); // muestra reporte por alert como respaldo
    }

    const ocupadasList = availabletables.filter(t => t.reserved); // obtiene lista de mesas reservadas
    if (ocupadasList.length === 0) { // si no hay reservas
        reportePre.textContent = 'No hay reservas registradas.'; // escribe mensaje en el <pre>
        return; // sale de la función
    }

    let text = 'Reporte de reservas:\n\n'; // encabezado del reporte
    ocupadasList.forEach(t => { // recorre cada mesa ocupada
        text += `Mesa ${t.number} - ${t.reserverName ? t.reserverName : 'Sin nombre'}\n`; // añade línea con número y nombre (o 'Sin nombre')
    });
    reportePre.textContent = text; // escribe todo el texto generado en el <pre>
} // fin generateReport
function reservedTableByNumber(tableNumber) {
    const customerName = document.getElementById("customizacion").value.trim();

    if (!customerName) {
        alert("Ingrese un nombre válido");
        return;
    }

    const table = availabletables.find(t => t.number === tableNumber);

    if (table && !table.reserved) {
        table.reserved = true;
        ocupiedtables.push({ number: table.number, customer: customerName });
        renderTables();
        document.getElementById("customizacion").value = "";
    } else {
        alert("La mesa ya está reservada o no existe");
    }
}

function releaseTable(tableNumber) {
    // Buscar índice en el array de mesas ocupadas
    const index = ocupiedtables.findIndex(t => t.number === tableNumber);

    if (index !== -1) {
        // Remover la mesa del arreglo de ocupadas
        const [table] = ocupiedtables.splice(index, 1);

        // Buscar la mesa correspondiente en availabletables para marcarla como no reservada
        const availableTable = availabletables.find(t => t.number === tableNumber);
        if (availableTable) {
            availableTable.reserved = false;
            delete availableTable.reserverName; // opcional: eliminar el nombre del reservante
        }

        // Actualizar la vista
        renderTables();

    } else {
        alert("La mesa no está ocupada o no existe");
    }
}
