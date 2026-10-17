/* =========================================================
   Lophi: gemeinsames Script für alle Seiten
   1. Mobile Navigation
   2. Teilen Links im Footer
   3. Cookie Hinweis mit Einwilligung (Statistik / Marketing)
   4. Google Analytics und Meta Pixel, nur nach Einwilligung
   ========================================================= */

/* ---------- IDs hier eintragen, sobald vorhanden ---------- */
const GA_ID = 'G-XXXXXXXXXX';        // Google Analytics 4 Mess-ID
const META_PIXEL_ID = 'XXXXXXXXXXXXXXX'; // Meta Pixel ID
/* Solange hier noch X stehen, wird nichts geladen. */

(function () {
  /* ---------- 1. Mobile Navigation ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ---------- 2. Teilen Links ---------- */
  const shareUrl = 'https://www.lophi.ch/';
  const shareText = 'Schau dir Lophi an: der Bausteintimer, der Kindern Zeit sichtbar macht.';
  const wa = document.getElementById('shareWhatsApp');
  if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + shareUrl);
  const em = document.getElementById('shareEmail');
  if (em) em.href = 'mailto:?subject=' + encodeURIComponent('Das musst du sehen: Lophi') + '&body=' + encodeURIComponent(shareText + ' ' + shareUrl);

  /* ---------- 3. Cookie Hinweis ---------- */
  const KEY = 'lophi-consent';
  const VERSION = 1;

  function readConsent() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY));
      return c && c.v === VERSION ? c : null;
    } catch (e) { return null; }
  }
  function saveConsent(statistik, marketing) {
    const c = { v: VERSION, statistik: !!statistik, marketing: !!marketing, datum: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }
  function deleteTrackingCookies() {
    document.cookie.split(';').forEach(part => {
      const name = part.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_fbp|_fbc)/.test(name)) {
        const host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(d => {
          document.cookie = name + '=; Max-Age=0; path=/' + d;
        });
      }
    });
  }

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie Einstellungen');
  banner.hidden = true;
  banner.innerHTML = `
    <p class="cookie-title">Cookies? Gerne mit deinem Okay.</p>
    <p class="cookie-text">Wir möchten verstehen, wie Besucher Lophi finden, und unsere Werbung verbessern. Dafür nutzen wir Google Analytics und den Meta Pixel, aber nur, wenn du zustimmst. Mehr dazu in der <a href="privacy.html#cookies">Datenschutzerklärung</a>.</p>
    <div class="cookie-options" hidden>
      <label class="cookie-option"><input type="checkbox" checked disabled> <span><strong>Notwendig</strong> Damit die Website funktioniert. Immer aktiv.</span></label>
      <label class="cookie-option"><input type="checkbox" id="ckStatistik"> <span><strong>Statistik</strong> Google Analytics: Besucherzahlen und wie die Seite genutzt wird.</span></label>
      <label class="cookie-option"><input type="checkbox" id="ckMarketing"> <span><strong>Marketing</strong> Meta Pixel: Werbung auf Instagram und Facebook messen.</span></label>
    </div>
    <div class="cookie-buttons">
      <button type="button" class="btn btn--primary btn--small" data-cookie="all">Alle akzeptieren</button>
      <button type="button" class="btn btn--outline btn--small" data-cookie="necessary">Nur notwendige</button>
      <button type="button" class="cookie-link" data-cookie="settings">Einstellungen</button>
      <button type="button" class="btn btn--outline btn--small" data-cookie="save" hidden>Auswahl speichern</button>
    </div>`;
  document.body.appendChild(banner);

  const options = banner.querySelector('.cookie-options');
  const ckStat = banner.querySelector('#ckStatistik');
  const ckMark = banner.querySelector('#ckMarketing');
  const btnSettings = banner.querySelector('[data-cookie="settings"]');
  const btnSave = banner.querySelector('[data-cookie="save"]');

  function openBanner(showSettings) {
    const c = readConsent();
    ckStat.checked = c ? c.statistik : false;
    ckMark.checked = c ? c.marketing : false;
    options.hidden = !showSettings;
    btnSave.hidden = !showSettings;
    btnSettings.hidden = showSettings;
    banner.hidden = false;
  }
  function decide(statistik, marketing) {
    const before = readConsent();
    const c = saveConsent(statistik, marketing);
    banner.hidden = true;
    // Einwilligung zurückgezogen: Cookies löschen und neu laden, damit nichts weiterläuft
    if (before && ((before.statistik && !c.statistik) || (before.marketing && !c.marketing))) {
      deleteTrackingCookies();
      location.reload();
      return;
    }
    loadTracking(c);
  }

  banner.addEventListener('click', e => {
    const action = e.target.getAttribute('data-cookie');
    if (action === 'all') decide(true, true);
    if (action === 'necessary') decide(false, false);
    if (action === 'settings') openBanner(true);
    if (action === 'save') decide(ckStat.checked, ckMark.checked);
  });

  // Link "Cookie Einstellungen" im Footer
  document.querySelectorAll('[data-open-cookies]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    openBanner(true);
  }));

  /* ---------- 4. Tracking nur nach Einwilligung ---------- */
  let gaLoaded = false, pixelLoaded = false;
  function loadTracking(c) {
    if (!c) return;
    if (c.statistik && !gaLoaded && !GA_ID.includes('X')) {
      gaLoaded = true;
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', GA_ID);
    }
    if (c.marketing && !pixelLoaded && !META_PIXEL_ID.includes('X')) {
      pixelLoaded = true;
      /* Offizieller Meta Pixel Code */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID);
      fbq('track', 'PageView');
    }
  }

  const consent = readConsent();
  if (consent) loadTracking(consent);
  else openBanner(false);
})();
