// =====================================================
// Carga el contenido editable (JSON) y lo inserta en el HTML.
// =====================================================

function waLink(numero, mensaje) {
  const num = (numero || '').replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
}

async function cargarContenido() {
  try {
    const [sitio, sedesData, programasData, galeriaData, novedadesData] = await Promise.all([
      fetch('/content/sitio.json').then(r => r.json()),
      fetch('/content/sedes.json').then(r => r.json()),
      fetch('/content/programas.json').then(r => r.json()),
      fetch('/content/galeria.json').then(r => r.json()),
      fetch('/content/novedades.json').then(r => r.json())
    ]);

    document.querySelectorAll('[data-campo="hero_titulo"]').forEach(el => el.textContent = sitio.hero_titulo);
    document.querySelectorAll('[data-campo="hero_subtitulo"]').forEach(el => el.textContent = sitio.hero_subtitulo);

    // ---- Favicon ----
    const faviconLink = document.getElementById('favicon-link');
    if (faviconLink && sitio.favicon) faviconLink.href = sitio.favicon;

    // ---- Hero (slideshow de hasta 3 fotos, sin imagen por defecto) ----
    const heroBg = document.getElementById('hero-bg');
    const heroImagenes = (sitio.hero_imagenes || []).filter(Boolean).slice(0, 3);
    if (heroBg && heroImagenes.length) {
      heroBg.innerHTML = heroImagenes.map((img, i) =>
        `<img src="${img.imagen || img}" alt="" class="${i === 0 ? 'activa' : ''}">`
      ).join('');
      if (heroImagenes.length > 1) {
        let indiceHero = 0;
        setInterval(() => {
          const imgs = heroBg.querySelectorAll('img');
          imgs[indiceHero].classList.remove('activa');
          indiceHero = (indiceHero + 1) % imgs.length;
          imgs[indiceHero].classList.add('activa');
        }, 5000);
      }
    }

    // ---- Nuestra diferencia ----
    document.querySelectorAll('[data-campo="diferencia_frase"]').forEach(el => el.textContent = sitio.diferencia_frase);
    document.querySelectorAll('[data-campo="diferencia_valores"]').forEach(el => el.textContent = sitio.diferencia_valores);
    const diferenciaImg = document.getElementById('diferencia-imagen');
    if (diferenciaImg && sitio.diferencia_imagen) diferenciaImg.src = sitio.diferencia_imagen;

    // ---- WhatsApp general (hero, flotante, formulario) ----
    const numeroGeneral = sitio.whatsapp_general;
    const heroWaBtn = document.getElementById('hero-wa-btn');
    if (heroWaBtn) heroWaBtn.href = waLink(numeroGeneral, 'Hola, necesito información sobre Danny Man Academy');
    const flotanteBtn = document.getElementById('wa-flotante-boton');
    if (flotanteBtn) flotanteBtn.href = waLink(numeroGeneral, 'Hola, necesito información sobre Danny Man Academy');
    window._whatsappGeneral = numeroGeneral;
    document.querySelectorAll('[data-campo="instagram_url"]').forEach(el => el.href = sitio.instagram_url);
    document.querySelectorAll('[data-campo="facebook_url"]').forEach(el => el.href = sitio.facebook_url);

    // ---- Carrusel de experiencia (horizontal) ----
    const fotos = galeriaData.fotos || [];
    const track = document.getElementById('carrusel-track');
    const dotsCont = document.getElementById('carrusel-dots');
    if (track && fotos.length) {
      track.innerHTML = fotos.map(f => `<div><img src="${f.imagen}" alt="${f.descripcion || ''}" loading="lazy"></div>`).join('');
      dotsCont.innerHTML = fotos.map((_, i) => `<span class="carrusel-dot${i === 0 ? ' activo' : ''}"></span>`).join('');
      let indice = 0;
      const mover = (i) => {
        indice = (i + fotos.length) % fotos.length;
        track.style.transform = `translateX(-${indice * 100}%)`;
        dotsCont.querySelectorAll('.carrusel-dot').forEach((d, j) => d.classList.toggle('activo', j === indice));
      };
      document.getElementById('carrusel-prev').addEventListener('click', () => mover(indice - 1));
      document.getElementById('carrusel-next').addEventListener('click', () => mover(indice + 1));
    }

    // ---- Novedades (fila horizontal, con scroll y flechas) ----
    const flyers = novedadesData.flyers || [];
    const ncTrack = document.getElementById('nc-track');
    const ncViewport = document.getElementById('nc-viewport');
    const ncPrev = document.getElementById('nc-prev');
    const ncNext = document.getElementById('nc-next');
    if (ncTrack && flyers.length) {
      ncTrack.innerHTML = flyers.map(f => `
        <div class="nc-item">
          <a href="${f.imagen}" target="_blank" rel="noopener">
            <img src="${f.imagen}" alt="" loading="lazy">
          </a>
        </div>
      `).join('');
      const desplazar = (dir) => {
        const item = ncTrack.querySelector('.nc-item');
        if (!item) return;
        const ancho = item.getBoundingClientRect().width + 22; // + gap
        ncViewport.scrollBy({ left: dir * ancho, behavior: 'smooth' });
      };
      ncPrev.addEventListener('click', () => desplazar(-1));
      ncNext.addEventListener('click', () => desplazar(1));
      if (flyers.length <= 3) { ncPrev.style.display = 'none'; ncNext.style.display = 'none'; }
    }

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

    // Pie de página: lista de sedes
    const footerSedes = document.getElementById('footer-sedes');
    if (footerSedes) {
      footerSedes.innerHTML = sedes.map(s => `<span>${s.nombre}</span>`).join('<span>|</span>');
    }

    // ---- Programas (acordeón) ----
    const programas = programasData.programas;
    const programasContenedor = document.getElementById('programas-contenedor');
    if (programasContenedor) {
      programasContenedor.innerHTML = programas.map((p, i) => `
        <div class="prog-card" data-index="${i}">
          <button class="prog-toggle" aria-expanded="false">
            <img src="${p.foto}" alt="${p.nombre}" loading="lazy">
            <div class="prog-hover-msg"><span>Presiona para ver más información</span></div>
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

// Formulario de clase demo -> arma el mensaje y abre WhatsApp del número general
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

    const mensaje = `Hola, quiero agendar una clase demostrativa gratuita.
Representante: ${representante}
Alumno: ${alumno}
Edad: ${edad}
Teléfono: ${telefono}
Sede: ${sedeNombre}
Programa de interés: ${programa}
Horario preferido: ${horario}`;

    trackLead(sedeNombre, programa);
    window.open(waLink(window._whatsappGeneral, mensaje), '_blank');
  });
});
