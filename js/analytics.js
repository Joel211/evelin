// =====================================================
// MEDICIÓN DE CONVERSIONES
// Meta Pixel y Google Analytics 4 (GA4 / Google Tag)
// Los IDs se pegan en index.html (ver comentarios "PEGA_AQUI").
// Este archivo solo dispara los EVENTOS de conversión.
// =====================================================

function trackWhatsApp(origen) {
  try { if (typeof fbq !== 'undefined') fbq('track', 'Contact'); } catch (e) {}
  try { if (typeof gtag !== 'undefined') gtag('event', 'click_whatsapp', { origen: origen }); } catch (e) {}
}

function trackFormStart() {
  try { if (typeof fbq !== 'undefined') fbq('trackCustom', 'FormStart'); } catch (e) {}
  try { if (typeof gtag !== 'undefined') gtag('event', 'form_start'); } catch (e) {}
}

function trackLead(sede, programa) {
  try { if (typeof fbq !== 'undefined') fbq('track', 'Lead'); } catch (e) {}
  try { if (typeof gtag !== 'undefined') gtag('event', 'generate_lead', { sede: sede, programa: programa }); } catch (e) {}
}

document.addEventListener('DOMContentLoaded', function () {
  // Cualquier botón/enlace de WhatsApp en toda la página dispara el evento
  document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-whatsapp]');
    if (link) trackWhatsApp(link.getAttribute('data-origen') || 'general');
  });

  // Primer interacción con el formulario de clase demo = "form_start" (una sola vez)
  const form = document.getElementById('demoForm');
  if (form) {
    let yaDisparado = false;
    form.addEventListener('focusin', function () {
      if (!yaDisparado) { trackFormStart(); yaDisparado = true; }
    });
  }
});
