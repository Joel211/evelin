// =====================================================
// Carga el contenido editable (JSON) y lo inserta en el HTML.
// =====================================================

function waLink(numero, mensaje) {
  const num = (numero || '').replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
}

async function cargarContenido() {
  try {
    const [sitio, sedesData, programasData] = await Promise.all([
      fetch('/content/sitio.json').then(r => r.json()),
      fetch('/content/sedes.json').then(r => r.json()),
      fetch('/content/programas.json').then(r => r.json())
    ]);

    // ---- Hero ----
    document.querySelectorAll('[data-campo="hero_titulo"]').forEach(el => el.textContent = sitio.hero_titulo);
    document.querySelectorAll('[data-campo="hero_subtitulo"]').forEach(el => el.textContent = sitio.hero_subtitulo);

    // ---- Nuestra diferencia ----
    document.querySelectorAll('[data-campo="diferencia_frase"]').forEach(el => el.textContent = sitio.diferencia_frase);
    document.querySelectorAll('[data-campo="diferencia_valores"]').forEach(el => el.textContent = sitio.diferencia_valores);

    // ---- Redes sociales ----
    document.querySelectorAll('[data-campo="instagram_url"]').forEach(el => el.href = sitio.instagram_url);
    document.querySelectorAll('[data-campo="facebook_url"]').forEach(el => el.href = sitio.facebook_url);

    // ---- Sedes ----
    const sedes = sedesData.sedes;
    const sedesContenedor = document.getElementById('sedes-contenedor');
    if (sedesContenedor) {
      sedesContenedor.innerHTML = sedes.map(sede => `
        <div class="sede-card">
          <img src="${sede.foto}" alt="${sede.nombre}" loading="lazy">
          <div class="sede-body">
            <span class="eyebrow">Sede</span>
            <h3>${sede.nombre}</h3>
            <p>${sede.direccion}</p>
            <div class="sede-btns">
              <a href="${sede.maps_url}" target="_blank" rel="noopener" class="btn btn-outline-dark">Cómo llegar</a>
              <a href="${waLink(sede.whatsapp_numero, 'Hola, quiero información sobre la sede ' + sede.nombre)}" data-whatsapp data-origen="sede-${sede.nombre}" class="btn btn-wa">WhatsApp</a>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Llena el <select> de sedes en el formulario
    const selectSede = document.getElementById('sede');
    if (selectSede) {
      selectSede.innerHTML = sedes.map(s => `<option value="${s.nombre}">${s.nombre}</option>`).join('');
    }

    // Botones flotantes / nav que abren el WhatsApp de una sede específica
    window._sedesWhatsapp = sedes.map(s => ({ nombre: s.nombre, numero: s.whatsapp_numero }));
    const flotanteLista = document.getElementById('wa-flotante-lista');
    if (flotanteLista) {
      flotanteLista.innerHTML = sedes.map(s => `
        <a href="${waLink(s.whatsapp_numero, 'Hola, quiero información sobre Danny Man Academy')}" data-whatsapp data-origen="flotante-${s.nombre}" class="wa-flotante-opcion">${s.nombre}</a>
      `).join('');
    }

    // ---- Programas (acordeón) ----
    const programas = programasData.programas;
    const programasContenedor = document.getElementById('programas-contenedor');
    if (programasContenedor) {
      programasContenedor.innerHTML = programas.map((p, i) => `
        <div class="prog-card" data-index="${i}">
          <button class="prog-toggle" aria-expanded="false">
            <img src="${p.foto}" alt="${p.nombre}" loading="lazy">
            <div class="prog-overlay">
              <span class="prog-tag">${p.etiqueta}</span>
              <h3>${p.nombre}</h3>
              <p>${p.descripcion_corta}</p>
            </div>
          </button>
          <div class="prog-detalle">
            <p>${p.descripcion_larga}</p>
            <a href="#demo" class="btn btn-rojo">Pedir información</a>
          </div>
        </div>
      `).join('');

      programasContenedor.querySelectorAll('.prog-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.prog-card');
          const abierta = card.classList.contains('abierta');
          programasContenedor.querySelectorAll('.prog-card').forEach(c => {
            c.classList.remove('abierta');
            c.querySelector('.prog-toggle').setAttribute('aria-expanded', 'false');
          });
          if (!abierta) {
            card.classList.add('abierta');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });
    }

  } catch (error) {
    console.error('Error cargando el contenido:', error);
  }
}

document.addEventListener('DOMContentLoaded', cargarContenido);

// Botón flotante de WhatsApp: abre/cierra el mini menú de sedes
document.addEventListener('DOMContentLoaded', () => {
  const boton = document.getElementById('wa-flotante-boton');
  const menu = document.getElementById('wa-flotante-menu');
  if (boton && menu) {
    boton.addEventListener('click', () => menu.classList.toggle('abierto'));
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !boton.contains(e.target)) menu.classList.remove('abierto');
    });
  }
});

// Formulario de clase demo -> arma el mensaje y abre WhatsApp de la sede elegida
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('demoForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const representante = document.getElementById('representante').value;
    const alumno = document.getElementById('alumno').value;
    const edad = document.getElementById('edad').value;
    const telefono = document.getElementById('telefono').value;
    const sedeNombre = document.getElementById('sede').value;
    const programa = document.getElementById('programa').value;
    const horario = document.getElementById('horario').value;

    const sede = (window._sedesWhatsapp || []).find(s => s.nombre === sedeNombre);
    const numero = sede ? sede.numero : '';

    const mensaje = `Hola, quiero agendar una clase demostrativa gratuita.
Representante: ${representante}
Alumno: ${alumno}
Edad: ${edad}
Teléfono: ${telefono}
Sede: ${sedeNombre}
Programa de interés: ${programa}
Horario preferido: ${horario}`;

    trackLead(sedeNombre, programa);
    window.open(waLink(numero, mensaje), '_blank');
  });
});
