// =====================================================
// Carga el contenido editable (JSON) y lo inserta en el HTML.
// Esto es lo que conecta el panel /admin con lo que ve el visitante.
// =====================================================

async function cargarContenido() {
  try {
    const [sitio, sedesData, programasData] = await Promise.all([
      fetch('/content/sitio.json').then(r => r.json()),
      fetch('/content/sedes.json').then(r => r.json()),
      fetch('/content/programas.json').then(r => r.json())
    ]);

    // ---- Hero ----
    document.querySelectorAll('[data-campo="hero_titulo"]')
      .forEach(el => el.textContent = sitio.hero_titulo);
    document.querySelectorAll('[data-campo="hero_subtitulo"]')
      .forEach(el => el.textContent = sitio.hero_subtitulo);

    // ---- WhatsApp (todos los enlaces con este atributo) ----
    document.querySelectorAll('[data-whatsapp]').forEach(el => {
      const mensaje = el.getAttribute('data-mensaje') || sitio.whatsapp_mensaje_general;
      el.href = `https://wa.me/${sitio.whatsapp_numero}?text=${encodeURIComponent(mensaje)}`;
    });

    // ---- Sedes ----
    const sedesContenedor = document.getElementById('sedes-contenedor');
    if (sedesContenedor) {
      sedesContenedor.innerHTML = sedesData.sedes.map(sede => `
        <div class="sede-card">
          <img src="${sede.foto}" alt="${sede.nombre}">
          <div class="sede-body">
            <h3>${sede.nombre}</h3>
            <p>📍 ${sede.direccion}</p>
            <p>🕓 ${sede.horario}</p>
            <a class="btn btn-wa" data-whatsapp data-mensaje="Hola, quiero información de la sede ${sede.nombre}" href="#">
              Escribir a esta sede
            </a>
          </div>
        </div>
      `).join('');
      // volver a aplicar los enlaces de WhatsApp recién creados
      sedesContenedor.querySelectorAll('[data-whatsapp]').forEach(el => {
        const mensaje = el.getAttribute('data-mensaje');
        el.href = `https://wa.me/${sitio.whatsapp_numero}?text=${encodeURIComponent(mensaje)}`;
      });
    }

    // ---- Programas ----
    const programasContenedor = document.getElementById('programas-contenedor');
    if (programasContenedor) {
      programasContenedor.innerHTML = programasData.programas.map(p => `
        <div class="prog-card">
          <img src="${p.foto}" alt="${p.nombre}">
          <span class="prog-tag">${p.etiqueta}</span>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
        </div>
      `).join('');
    }

  } catch (error) {
    console.error('Error cargando el contenido:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarContenido);
