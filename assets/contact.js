/* Pacific inline contact, shared by every page.
   SWITCH SENDING ON HERE: set FORM_ENDPOINT to a URL that accepts POST with a JSON body.
   It serves both forms: the body carries form:"preorder" (homepage Pre-order Pod 32 dialog)
   or form:"whitepaper" (Request the whitepaper dialog). Empty = each form shows an honest
   "not switched on yet" note with a switch to Book a call. */
window.PACIFIC_CONTACT = window.PACIFIC_CONTACT || {
  FORM_ENDPOINT: '',
  CAL_LINK: 'harper-smith/30-minute-call'
};
(function(){
  'use strict';
  var CFG = window.PACIFIC_CONTACT;
  /* Cal.com embed loader (same snippet as the old site; safe to run twice, nothing loads until a calendar is mounted) */
  (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  var nsCount = 0;
  function mountCal(wrap, el, prefill){
    var ns = 'pwp' + (++nsCount);
    wrap.classList.remove('ready', 'failed'); el.innerHTML = '';
    var config = Object.assign({ layout:'month_view', theme:'dark' }, prefill || {});
    Cal('init', ns, { origin:'https://app.cal.com' });
    Cal.ns[ns]('inline', { elementOrSelector: el, calLink: CFG.CAL_LINK, layout:'month_view', config: config });
    Cal.ns[ns]('ui', { theme:'dark', cssVarsPerTheme:{ dark:{ 'cal-brand':'#ffffff' } }, hideEventTypeDetails:false, layout:'month_view' });
    Cal.ns[ns]('on', { action:'linkReady', callback: function(){ wrap.classList.add('ready'); } });
    Cal.ns[ns]('on', { action:'linkFailed', callback: function(){ wrap.classList.add('failed'); } });
    setTimeout(function(){ if (!wrap.classList.contains('ready') && !el.querySelector('iframe')) wrap.classList.add('failed'); }, 20000);
  }

  var CAL_URL = 'https://cal.com/' + CFG.CAL_LINK;
  var WP_HTML =
    '<dialog class="po" id="wp-dialog" aria-labelledby="wp-title">' +
    '<div class="po-in">' +
      '<div class="po-head"><h2 class="po-title" id="wp-title">Request the whitepaper</h2><button class="po-close" type="button" aria-label="Close">Close</button></div>' +
      '<div class="po-tabs" role="tablist" aria-label="How to get the whitepaper">' +
        '<button class="po-tab" type="button" role="tab" id="wp-tab-req" aria-controls="wp-panel-req" aria-selected="true">Request</button>' +
        '<button class="po-tab" type="button" role="tab" id="wp-tab-cal" aria-controls="wp-panel-cal" aria-selected="false" tabindex="-1">Book a call</button>' +
      '</div>' +
      '<div class="po-panel" id="wp-panel-req" role="tabpanel" aria-labelledby="wp-tab-req">' +
        '<form class="po-form" novalidate>' +
          '<div class="po-grid">' +
            '<div class="po-field"><label for="wp-name">Name <span class="req">(required)</span></label><input id="wp-name" name="name" type="text" autocomplete="name" required aria-describedby="wp-name-err"><div class="po-err" id="wp-name-err" aria-live="polite"></div></div>' +
            '<div class="po-field"><label for="wp-company">Company</label><input id="wp-company" name="company" type="text" autocomplete="organization"></div>' +
            '<div class="po-field"><label for="wp-email">Email <span class="req">(required)</span></label><input id="wp-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="wp-email-err"><div class="po-err" id="wp-email-err" aria-live="polite"></div></div>' +
            '<div class="po-field"><label for="wp-role">Role</label><input id="wp-role" name="role" type="text" autocomplete="organization-title"></div>' +
            '<div class="po-field wide"><label for="wp-message">What are you evaluating?</label><textarea id="wp-message" name="message" rows="3"></textarea></div>' +
          '</div>' +
          '<div class="po-actions"><button class="po-send" type="submit">Request whitepaper</button><div class="po-err" id="wp-send-err" aria-live="polite"></div></div>' +
          '<div class="po-note" id="wp-note" role="status" hidden>Requests are not switched on yet. Please book a call instead.<br><button class="po-switch" type="button">Book a call</button></div>' +
        '</form>' +
        '<p class="po-done" id="wp-done" role="status" tabindex="-1" hidden>Thanks. We will send the whitepaper to your email.</p>' +
      '</div>' +
      '<div class="po-panel" id="wp-panel-cal" role="tabpanel" aria-labelledby="wp-tab-cal" hidden>' +
        '<div class="cal-wrap" id="wp-cal-wrap"><div class="cal-loading">Loading the calendar</div><div class="cal-fallback">The calendar did not load. <a href="' + CAL_URL + '" target="_blank" rel="noopener">Open it here</a>.</div><div class="cal-inline" id="wp-cal"></div></div>' +
      '</div>' +
    '</div>' +
    '</dialog>';

  function initWhitepaper(){
    var openers = Array.prototype.slice.call(document.querySelectorAll('a[data-wp-open]'));
    if (!openers.length) return;
    var probe = document.createElement('dialog');
    if (typeof probe.showModal !== 'function') return; /* old browsers keep the link to the booking section */
    document.body.insertAdjacentHTML('beforeend', WP_HTML);
    var dlg = document.getElementById('wp-dialog');
    var tabs = Array.prototype.slice.call(dlg.querySelectorAll('.po-tab'));
    var panels = { 'wp-tab-req': document.getElementById('wp-panel-req'), 'wp-tab-cal': document.getElementById('wp-panel-cal') };
    var form = dlg.querySelector('.po-form'), note = document.getElementById('wp-note'), done = document.getElementById('wp-done'), sendErr = document.getElementById('wp-send-err'), sendBtn = dlg.querySelector('.po-send');
    var cWrap = document.getElementById('wp-cal-wrap'), cEl = document.getElementById('wp-cal');
    var lastPrefill = null, lastOpener = null, byKeyboard = false;
    function val(n){ return (form.elements[n].value || '').trim(); }
    function prefill(){
      var p = {}; if (val('name')) p.name = val('name'); if (val('email')) p.email = val('email');
      var notes = ['Whitepaper request', val('company') && ('Company: ' + val('company')), val('role') && ('Role: ' + val('role')), val('message') && ('Evaluating: ' + val('message'))].filter(Boolean);
      if (notes.length > 1) p.notes = notes.join('\n');
      return p;
    }
    function select(id, focus){
      tabs.forEach(function(t){ var on = t.id === id; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[t.id].hidden = !on; });
      if (focus) document.getElementById(id).focus();
      if (id === 'wp-tab-cal') { var p = prefill(), key = JSON.stringify(p); if (key !== lastPrefill) { lastPrefill = key; mountCal(cWrap, cEl, p); } }
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ select(t.id); });
      t.addEventListener('keydown', function(e){ if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].id, true); } });
    });
    function open(e){
      if (e) e.preventDefault();
      lastOpener = e ? e.currentTarget : null;
      byKeyboard = !!(e && e.detail === 0);
      /* if the phone menu is open, close it first so the sheet is the only layer */
      if (document.documentElement.classList.contains('menu-open')) { var mc = document.querySelector('.mnav .mnav-close'); if (mc) mc.click(); }
      select('wp-tab-req'); note.hidden = true; sendErr.textContent = '';
      document.documentElement.classList.add('po-open');
      dlg.showModal();
      if (!done.hidden) done.focus(); else if (matchMedia('(hover:hover)').matches) document.getElementById('wp-name').focus(); else dlg.querySelector('.po-close').focus();
    }
    function close(){ dlg.close(); }
    openers.forEach(function(o){ o.setAttribute('aria-haspopup', 'dialog'); o.setAttribute('aria-controls', 'wp-dialog'); o.addEventListener('click', open); });
    dlg.querySelector('.po-close').addEventListener('click', close);
    dlg.addEventListener('click', function(e){ if (e.target === dlg) { var r = dlg.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } });
    /* keyboard users get focus back on the link; pointer users do not, so no focus style lingers on it */
    dlg.addEventListener('close', function(){ document.documentElement.classList.remove('po-open'); if (!lastOpener) return; if (byKeyboard) lastOpener.focus({ preventScroll:true }); else { var o = lastOpener; requestAnimationFrame(function(){ if (document.activeElement === o) o.blur(); }); } });
    dlg.querySelector('.po-switch').addEventListener('click', function(){ select('wp-tab-cal', true); });
    function setErr(name, msg){ var i = form.elements[name], e = document.getElementById('wp-' + name + '-err'); e.textContent = msg; if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); return !msg; }
    function validate(only){
      var ok = true;
      if (!only || only === 'name') ok = setErr('name', val('name') ? '' : 'Please add your name.') && ok;
      if (!only || only === 'email') ok = setErr('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email')) ? '' : 'Please add a valid email address.') && ok;
      return ok;
    }
    ['name', 'email'].forEach(function(n){ form.elements[n].addEventListener('input', function(){ if (form.elements[n].getAttribute('aria-invalid')) validate(n); }); });
    form.addEventListener('submit', function(e){
      e.preventDefault(); sendErr.textContent = ''; note.hidden = true;
      if (!validate()) { form.querySelector('[aria-invalid="true"]').focus(); return; }
      if (!CFG.FORM_ENDPOINT) { note.hidden = false; note.querySelector('.po-switch').focus(); return; }
      sendBtn.disabled = true; sendBtn.textContent = 'Sending';
      fetch(CFG.FORM_ENDPOINT, { method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ form:'whitepaper', name: val('name'), company: val('company'), email: val('email'), role: val('role'), message: val('message'), source:'Request whitepaper', page: location.href }) })
        .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); form.hidden = true; done.hidden = false; done.focus(); })
        .catch(function(){ sendErr.textContent = 'That did not send. Please try again, or book a call instead.'; })
        .then(function(){ sendBtn.disabled = false; sendBtn.textContent = 'Request whitepaper'; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initWhitepaper); else initWhitepaper();
})();
