/* ==========================================================================
   WANDERERS — Shared motion & interaction layer
   Pure vanilla JS, no build step. Respects prefers-reduced-motion.
   Exposes: window.WM = { toast, confirmDialog, ripple, animateCount }
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-reveal-delay') || 0;
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, Number(delay));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* Auto stagger: any container with [data-reveal-stagger] assigns
     incrementing delays to its direct [data-reveal] children */
  function initStagger() {
    document.querySelectorAll('[data-reveal-stagger]').forEach(function (container) {
      var step = Number(container.getAttribute('data-reveal-stagger')) || 80;
      var children = container.querySelectorAll(':scope > [data-reveal]');
      children.forEach(function (child, i) {
        child.setAttribute('data-reveal-delay', i * step);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Nav scroll state
     ------------------------------------------------------------------- */
  function initNavScroll() {
    var nav = document.querySelector('[data-nav]');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons
     ------------------------------------------------------------------- */
  function initMagnetic() {
    if (reduceMotion || isTouch) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = Number(el.getAttribute('data-magnetic')) || 14;
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var mx = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
        var my = ((e.clientY - rect.top) / rect.height - 0.5) * strength;
        el.style.setProperty('--mx', mx.toFixed(2));
        el.style.setProperty('--my', my.toFixed(2));
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--mx', 0);
        el.style.setProperty('--my', 0);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Ripple on .btn
     ------------------------------------------------------------------- */
  function ripple(e, el) {
    if (reduceMotion) return;
    var rect = el.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.4;
    var span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - rect.left - size / 2) + 'px';
    span.style.top = (e.clientY - rect.top - size / 2) + 'px';
    el.appendChild(span);
    setTimeout(function () { span.remove(); }, 700);
  }

  function initRipple() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('.btn');
      if (!el) return;
      var prevPos = getComputedStyle(el).position;
      if (prevPos === 'static') el.style.position = 'relative';
      ripple(e, el);
    });
  }

  /* ---------------------------------------------------------------------
     3D tilt on [data-tilt]
     ------------------------------------------------------------------- */
  function initTilt() {
    if (reduceMotion || isTouch) return;
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rx = (0.5 - py) * 6;
        var ry = (px - 0.5) * 8;
        el.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Cursor glow (desktop only)
     ------------------------------------------------------------------- */
  function initCursorGlow() {
    if (reduceMotion || isTouch) return;
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.opacity = '0';
    document.body.appendChild(glow);
    var x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
    function raf() {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(raf);
    }
    raf();
  }

  /* ---------------------------------------------------------------------
     Toasts — replaces alert()
     ------------------------------------------------------------------- */
  function ensureStack() {
    var stack = document.getElementById('toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  var ICONS = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/></svg>'
  };
  var COLORS = { success: '#34d399', error: '#fb7185', info: '#8b8aff' };

  function toast(message, opts) {
    opts = opts || {};
    var type = opts.type || 'info';
    var duration = opts.duration || 4200;
    var stack = ensureStack();

    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.setAttribute('role', 'status');
    el.innerHTML =
      '<span style="color:' + COLORS[type] + '; flex-shrink:0; margin-top:1px;">' + (ICONS[type] || ICONS.info) + '</span>' +
      '<span style="font-size:0.875rem; color:var(--text-primary); line-height:1.4; flex:1;">' + message + '</span>' +
      '<button aria-label="Dismiss" style="color:var(--text-tertiary); flex-shrink:0; line-height:1;">&times;</button>' +
      '<span class="toast-bar" style="animation-duration:' + duration + 'ms;"></span>';

    stack.appendChild(el);

    function dismiss() {
      el.classList.add('leaving');
      setTimeout(function () { el.remove(); }, 260);
    }
    el.querySelector('button').addEventListener('click', dismiss);
    var timer = setTimeout(dismiss, duration);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 1200); });
    return el;
  }

  /* ---------------------------------------------------------------------
     Confirm dialog — replaces window.confirm()
     ------------------------------------------------------------------- */
  function confirmDialog(opts) {
    opts = typeof opts === 'string' ? { message: opts } : (opts || {});
    return new Promise(function (resolve) {
      var backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML =
        '<div class="modal-panel glass-strong" style="width:100%; max-width:400px; border-radius:var(--radius-lg); padding:1.75rem; box-shadow:var(--shadow-lg);">' +
          '<div style="width:2.75rem;height:2.75rem;border-radius:var(--radius-full);display:flex;align-items:center;justify-content:center;background:' + (opts.danger ? 'rgba(251,113,133,0.12)' : 'rgba(109,107,255,0.12)') + ';color:' + (opts.danger ? 'var(--danger)' : 'var(--accent-soft)') + ';margin-bottom:1rem;">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>' +
          '</div>' +
          '<h3 class="font-display" style="font-size:1.15rem; font-weight:600; margin-bottom:0.4rem;">' + (opts.title || 'Are you sure?') + '</h3>' +
          '<p style="color:var(--text-secondary); font-size:0.9rem; line-height:1.5; margin-bottom:1.5rem;">' + (opts.message || '') + '</p>' +
          '<div style="display:flex; gap:0.6rem; justify-content:flex-end;">' +
            '<button data-act="cancel" class="btn btn-ghost" style="padding:0.6rem 1.1rem; font-size:0.875rem;">Cancel</button>' +
            '<button data-act="ok" class="btn ' + (opts.danger ? '' : 'btn-primary') + '" style="padding:0.6rem 1.2rem; font-size:0.875rem;' + (opts.danger ? 'background:var(--danger);color:#fff;box-shadow:0 0 0 1px rgba(251,113,133,0.4),0 8px 32px rgba(251,113,133,0.28);' : '') + '">' + (opts.confirmText || 'Confirm') + '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(backdrop);
      requestAnimationFrame(function () { backdrop.classList.add('is-open'); });

      function close(result) {
        backdrop.classList.remove('is-open');
        setTimeout(function () { backdrop.remove(); }, 260);
        document.removeEventListener('keydown', onKey);
        resolve(result);
      }
      function onKey(e) {
        if (e.key === 'Escape') close(false);
        if (e.key === 'Enter') close(true);
      }
      document.addEventListener('keydown', onKey);
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(false); });
      backdrop.querySelector('[data-act="cancel"]').addEventListener('click', function () { close(false); });
      backdrop.querySelector('[data-act="ok"]').addEventListener('click', function () { close(true); });
    });
  }

  /* ---------------------------------------------------------------------
     Count-up animation for stat numbers
     ------------------------------------------------------------------- */
  function animateCount(el, target, opts) {
    opts = opts || {};
    var prefix = opts.prefix || '';
    var duration = reduceMotion ? 0 : (opts.duration || 900);
    var start = 0;
    var startTime = null;
    target = Number(target) || 0;

    if (!duration) {
      el.textContent = prefix + target.toLocaleString();
      return;
    }

    function frame(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(start + (target - start) * eased);
      el.textContent = prefix + value.toLocaleString();
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------
     Init
     ------------------------------------------------------------------- */
  function boot() {
    initStagger();
    initReveal();
    initNavScroll();
    initMagnetic();
    initRipple();
    initTilt();
    initCursorGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.WM = {
    toast: toast,
    confirmDialog: confirmDialog,
    animateCount: animateCount,
    refreshMotion: boot
  };
})();
