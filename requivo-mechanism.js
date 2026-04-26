/* ============================================================
   Requivo Mechanism — vanilla JS controller
   Drop after the markup. No dependencies.
   Initialises every .rq-mechanism on the page.
============================================================ */
(function () {
  'use strict';

  const STAGE_W = 1660;
  const STAGE_H = 860;

  const EVIDENCE = [
    { id: 'S-01', name: 'procedure_v3.pdf', kind: 'pdf',  y: 152 },
    { id: 'S-02', name: 'ticket_4172.json', kind: 'json', y: 212 },
    { id: 'S-03', name: 'team_wiki/ops',    kind: 'wiki', y: 272 },
    { id: 'S-04', name: 'incident_q3',      kind: 'log',  y: 332 },
    { id: 'S-05', name: 'expert_email_24',  kind: 'mail', y: 392 },
    { id: 'S-06', name: 'slack_thread',     kind: 'chat', y: 452 },
    { id: 'S-07', name: 'audit_2024.pdf',   kind: 'pdf',  y: 512 }
  ];

  const ENGINE_ROWS = [
    { n: '01', key: 'conflict', label: 'conflict', note: 'sources differ' },
    { n: '02', key: 'gap',      label: 'gap',      note: 'step undocumented' },
    { n: '03', key: 'routed',   label: 'routed',   note: 'targeted question issued' },
    { n: '04', key: 'verified', label: 'verified', note: 'clarification confirmed' }
  ];

  const QUESTIONS = [
    { text: 'clarify missing step', y: 218 },
    { text: 'confirm threshold',    y: 264 },
    { text: 'check exception rule', y: 310 },
    { text: 'who approves this?',   y: 356 }
  ];

  const EXPERTS = [
    { role: 'Maintenance lead',   y: 218 },
    { role: 'Process engineer',   y: 264 },
    { role: 'QA specialist',      y: 310 },
    { role: 'Operations manager', y: 356 }
  ];

  const RETURNS = [
    { text: 'captured expert judgment', y: 432 },
    { text: 'validated clarification',  y: 472 },
    { text: 'decision rationale',       y: 512 },
    { text: 'exception logic',          y: 552 }
  ];

  const KNOWLEDGE = [
    { icon: 'doc',  text: 'governed procedure step' },
    { icon: 'shld', text: 'verification status' },
    { icon: 'tree', text: 'cited source evidence' },
    { icon: 'code', text: 'colleague confirmation' }
  ];

  const APPS = ['Knowledge Writer', 'Knowledge Manager', 'Knowledge Verifier', 'MCP Interface'];

  const STEPS = [
    { title: 'Fragmented evidence',   desc: 'Operational truth is scattered across documents, tickets, threads, and tribal memory.' },
    { title: 'Consolidate & analyse', desc: 'Requivo ingests the corpus and reasons across it as a single body of evidence.' },
    { title: 'Detect unresolved',     desc: 'Conflicts, gaps, ambiguities, and undocumented steps are surfaced — not patched over.' },
    { title: 'Route to experts',      desc: 'Selected questions are routed to the most relevant expert. Only what cannot be inferred.' },
    { title: 'Capture & govern',      desc: 'Replies become validated, retained, governed knowledge — not single-use answers.' },
    { title: 'Power applications',    desc: 'Writer, Manager, Verifier, and MCP all read from the same governed layer.' }
  ];

  const STEP_DURATIONS = [1800, 2000, 2200, 2600, 2700, 3200];

  // Layout
  const L = {
    evidenceX: 252, engineX: 380, engineY: 256, engineW: 280, engineH: 268,
    engineCenterY: 256 + 134, engineRightX: 660,
    questionX: 720, questionRightX: 870, expertDotX: 905,
    klX: 1170, klY: 196, klW: 248, klH: 304, klRightX: 1418,
    appX: 1470
  };

  const SVGNS = 'http://www.w3.org/2000/svg';

  function curve(x1, y1, x2, y2, bend) {
    bend = bend == null ? 0.5 : bend;
    const cx1 = x1 + (x2 - x1) * bend;
    const cx2 = x2 - (x2 - x1) * bend;
    return 'M ' + x1 + ' ' + y1 + ' C ' + cx1 + ' ' + y1 + ', ' + cx2 + ' ' + y2 + ', ' + x2 + ' ' + y2;
  }

  function iconSvg(kind) {
    const paths = {
      pdf:  '<path d="M4 2h6l2.5 2.5V14H4z"/><path d="M10 2v2.5h2.5"/><path d="M6 9h4M6 11.5h3"/>',
      json: '<path d="M6 3c-1.5 0-2 .8-2 2v1.5c0 .8-.5 1.5-1.5 1.5 1 0 1.5.7 1.5 1.5V11c0 1.2.5 2 2 2"/><path d="M10 3c1.5 0 2 .8 2 2v1.5c0 .8.5 1.5 1.5 1.5-1 0-1.5.7-1.5 1.5V11c0 1.2-.5 2-2 2"/>',
      wiki: '<path d="M3 3h10v10H3z"/><path d="M3 6h10M6 3v10"/>',
      log:  '<path d="M3 4h10M3 8h10M3 12h7"/>',
      mail: '<path d="M2.5 4h11v8h-11z"/><path d="M2.5 4l5.5 4 5.5-4"/>',
      chat: '<path d="M3 4h10v6H8l-3 2v-2H3z"/>',
      doc:  '<path d="M4 2h6l2.5 2.5V14H4z"/><path d="M10 2v2.5h2.5"/><path d="M6 8h4M6 10.5h4M6 6h2"/>',
      shld: '<path d="M8 2l5 1.5v4.5c0 3-2 5-5 6-3-1-5-3-5-6V3.5z"/><path d="M5.5 8l1.8 1.8L10.5 6.5"/>',
      tree: '<circle cx="8" cy="3.5" r="1.2"/><circle cx="4" cy="11.5" r="1.2"/><circle cx="12" cy="11.5" r="1.2"/><path d="M8 4.7v3M8 7.7l-4 3M8 7.7l4 3"/>',
      code: '<path d="M5 5L2.5 8 5 11M11 5l2.5 3-2.5 3M9 4l-2 8"/>'
    };
    return '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">' + (paths[kind] || '') + '</svg>';
  }

  function init(root) {
    if (!root || root.dataset.rqInit) return;
    root.dataset.rqInit = '1';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let step = 0;
    let playing = !reduced;
    let hoverExpert = null;
    let timer = null;

    /* ---- Build dynamic markup ---- */
    const evidenceWrap  = root.querySelector('[data-evidence]');
    const engineRows    = root.querySelector('[data-engine-rows]');
    const questionsWrap = root.querySelector('[data-questions]');
    const expertsWrap   = root.querySelector('[data-experts]');
    const returnsWrap   = root.querySelector('[data-returns]');
    const klRows        = root.querySelector('[data-kl-rows]');
    const appsWrap      = root.querySelector('[data-apps]');
    const dotsWrap      = root.querySelector('.rq-mechanism-dots');
    const railWrap      = root.querySelector('[data-rail]');
    const connSvg       = root.querySelector('[data-connectors]');
    const stage         = root.querySelector('[data-stage]');
    const stageWrap     = root.querySelector('.rq-mechanism-stage-wrap');
    const playBtn       = root.querySelector('.rq-mechanism-play');
    const playLabel     = root.querySelector('.rq-mechanism-play-label');

    // Evidence rows
    EVIDENCE.forEach(function (e, i) {
      const row = document.createElement('div');
      row.className = 'rq-mechanism-evidence-row';
      row.style.top = (e.y - 12) + 'px';
      row.style.animationDelay = (i * 80) + 'ms';
      row.innerHTML =
        '<span class="rq-mechanism-evidence-dot"></span>' +
        '<span class="rq-mechanism-evidence-id">' + e.id + '</span>' +
        '<span class="rq-mechanism-evidence-rule"></span>' +
        '<span class="rq-mechanism-evidence-name">' + iconSvg(e.kind) +
        '<span class="rq-mechanism-evidence-name-text">' + e.name + '</span></span>';
      evidenceWrap.appendChild(row);
    });

    // Engine rows
    ENGINE_ROWS.forEach(function (r, i) {
      const row = document.createElement('div');
      row.className = 'rq-mechanism-engine-row rq-mechanism-engine-row--' + r.key;
      row.dataset.key = r.key;
      row.style.transitionDelay = (i * 70) + 'ms';
      row.innerHTML =
        '<span class="rq-mechanism-engine-statusdot"></span>' +
        '<span class="rq-mechanism-engine-num">' + r.n + '</span>' +
        '<span class="rq-mechanism-engine-label">' + r.label + '</span>' +
        '<span class="rq-mechanism-engine-detail">' + r.note + '</span>';
      engineRows.appendChild(row);
    });

    // Questions
    QUESTIONS.forEach(function (q, i) {
      const el = document.createElement('div');
      el.className = 'rq-mechanism-question';
      el.style.left = L.questionX + 'px';
      el.style.top  = (q.y - 13) + 'px';
      el.style.transitionDelay = (i * 110) + 'ms';
      el.textContent = q.text;
      el.dataset.idx = i;
      questionsWrap.appendChild(el);
    });

    // Experts
    EXPERTS.forEach(function (e, i) {
      const el = document.createElement('div');
      el.className = 'rq-mechanism-expert';
      el.style.left = L.expertDotX + 'px';
      el.style.top  = (e.y - 10) + 'px';
      el.style.transitionDelay = (300 + i * 100) + 'ms';
      el.dataset.idx = i;
      el.innerHTML =
        '<span class="rq-mechanism-expert-dot"></span>' +
        '<span class="rq-mechanism-expert-role">' + e.role + '</span>';
      el.addEventListener('mouseenter', function () { hoverExpert = i; render(); });
      el.addEventListener('mouseleave', function () { hoverExpert = null; render(); });
      expertsWrap.appendChild(el);
    });

    // Returns
    RETURNS.forEach(function (r, i) {
      const el = document.createElement('div');
      el.className = 'rq-mechanism-return';
      el.style.left = L.questionX + 'px';
      el.style.top  = (r.y - 13) + 'px';
      el.style.transitionDelay = (i * 110) + 'ms';
      el.innerHTML =
        '<span class="rq-mechanism-return-check">' +
          '<svg viewBox="0 0 8 8" fill="none" aria-hidden="true">' +
            '<path d="M1.5 4L3.3 5.8L6.5 2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>' +
        '</span>' +
        '<span>' + r.text + '</span>';
      returnsWrap.appendChild(el);
    });

    // Knowledge layer rows
    KNOWLEDGE.forEach(function (k, i) {
      const row = document.createElement('div');
      row.className = 'rq-mechanism-kl-row';
      row.style.transitionDelay = (300 + i * 110) + 'ms';
      row.innerHTML =
        '<span class="rq-mechanism-kl-icon">' + iconSvg(k.icon) + '</span>' +
        '<span class="rq-mechanism-kl-text">' + k.text + '</span>';
      klRows.appendChild(row);
    });

    // Applications
    APPS.forEach(function (name, i) {
      const el = document.createElement('div');
      el.className = 'rq-mechanism-app';
      el.style.top = (200 + i * 84) + 'px';
      el.style.transitionDelay = (i * 110) + 'ms';
      el.innerHTML =
        '<span class="rq-mechanism-app-dot"></span>' +
        '<span class="rq-mechanism-app-name">' + name + '</span>';
      appsWrap.appendChild(el);
    });

    // Step dots
    STEPS.forEach(function (s, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rq-mechanism-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', s.title);
      b.addEventListener('click', function () { setStep(i); setPlaying(false); });
      dotsWrap.appendChild(b);
    });

    // Rail
    const railItems = ['Evidence', 'Expert capture', 'Governed knowledge layer', 'Applications'];
    railItems.forEach(function (it, i) {
      const span = document.createElement('span');
      span.className = 'rq-mechanism-rail-item';
      span.textContent = it;
      railWrap.appendChild(span);
      if (i < railItems.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'rq-mechanism-rail-arrow';
        arrow.textContent = '→';
        railWrap.appendChild(arrow);
      }
    });

    /* ---- Connectors ---- */
    const evidencePaths   = EVIDENCE.map(function (e) { return curve(L.evidenceX, e.y, L.engineX, L.engineCenterY, 0.55); });
    const engineToQ       = QUESTIONS.map(function (q) { return curve(L.engineRightX, L.engineCenterY, L.questionX - 4, q.y, 0.5); });
    const qToExpert       = QUESTIONS.map(function (q, i) { return curve(L.questionRightX, q.y, L.expertDotX, EXPERTS[i].y, 0.5); });
    const expertToReturn  = EXPERTS.map(function (e, i) {
      const r = RETURNS[i];
      return 'M ' + L.expertDotX + ' ' + e.y +
             ' C ' + (L.expertDotX - 30) + ' ' + (e.y + 50) + ', ' +
                     (L.questionRightX + 30) + ' ' + (r.y - 50) + ', ' +
                     L.questionRightX + ' ' + r.y;
    });
    const returnToKL      = RETURNS.map(function (r) { return curve(L.questionRightX + 110, r.y, L.klX - 4, L.klY + L.klH / 2, 0.5); });
    const klMidY          = L.klY + L.klH / 2;
    const appYs           = [204, 288, 372, 456];
    const klToApp         = appYs.map(function (y) { return curve(L.klRightX + 4, klMidY, L.appX - 4, y, 0.5); });

    function makePath(d, opts) {
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke', opts.stroke);
      p.setAttribute('stroke-width', opts.width || 1);
      p.setAttribute('fill', 'none');
      p.style.opacity = 0;
      const len = p.getTotalLength ? 0 : 1; // measured later
      p.dataset.opacity = opts.opacity != null ? opts.opacity : 1;
      p.dataset.delay = opts.delay || 0;
      return p;
    }

    function group(paths, opts) {
      return paths.map(function (d, i) {
        const p = makePath(d, {
          stroke: opts.stroke,
          width: opts.width,
          opacity: opts.opacity,
          delay: (opts.baseDelay || 0) + i * (opts.stagger || 0)
        });
        connSvg.appendChild(p);
        return p;
      });
    }

    const layers = {
      evidence:  group(evidencePaths,  { stroke: 'url(#rqMechAccent)',     width: 1, opacity: 0.85, stagger: 80 }),
      engineToQ: group(engineToQ,      { stroke: 'url(#rqMechAccent)',     width: 1, opacity: 0.7,  stagger: 90 }),
      qToExpert: group(qToExpert,      { stroke: 'oklch(74% 0.06 282 / 0.7)', width: 1, opacity: 0.6, baseDelay: 200, stagger: 90 }),
      expertToReturn: group(expertToReturn, { stroke: 'url(#rqMechAccentBack)', width: 1, opacity: 0.55, stagger: 100 }),
      returnToKL: group(returnToKL,    { stroke: 'oklch(72% 0.08 282 / 0.7)', width: 1, opacity: 0.7, baseDelay: 200, stagger: 80 }),
      klToApp:   group(klToApp,        { stroke: 'url(#rqMechAccent)',     width: 1, opacity: 0.8,  stagger: 90 })
    };

    // Initialise dasharray once paths have layout
    function primeLength(p) {
      try {
        const len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        p.dataset.len = len;
      } catch (_) { /* noop */ }
    }
    Object.keys(layers).forEach(function (k) { layers[k].forEach(primeLength); });

    function setLayer(paths, on) {
      paths.forEach(function (p) {
        const len = p.dataset.len || 1;
        const opacity = parseFloat(p.dataset.opacity || '1');
        const delay = parseFloat(p.dataset.delay || '0');
        p.style.transitionDelay = delay + 'ms';
        p.style.strokeDashoffset = on ? '0' : len;
        p.style.opacity = on ? opacity : 0;
      });
    }

    /* ---- Scaling ---- */
    function fit() {
      const w = stageWrap.clientWidth;
      const s = Math.min(1, Math.max(0.32, (w - 24) / STAGE_W));
      stage.style.transform = 'scale(' + s + ')';
      stageWrap.style.height = (STAGE_H * s) + 'px';
    }
    window.addEventListener('resize', fit);
    fit();

    /* ---- Render state ---- */
    function setStep(n) {
      step = (n + STEPS.length) % STEPS.length;
      render();
    }

    function setPlaying(p) {
      playing = p;
      playBtn.dataset.state = p ? 'playing' : 'paused';
      playBtn.setAttribute('aria-label', p ? 'Pause autoplay' : 'Play autoplay');
      if (playLabel) playLabel.textContent = p ? 'Pause' : 'Play';
      schedule();
    }

    function schedule() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (!playing || reduced) return;
      timer = setTimeout(function () {
        step = (step + 1) % STEPS.length;
        render();
        schedule();
      }, STEP_DURATIONS[step] || 3400);
    }

    playBtn.addEventListener('click', function () { setPlaying(!playing); });

    function render() {
      const active = {
        evidence:  step >= 1,
        engine:    step >= 1,
        detect:    step >= 2,
        route:     step >= 3,
        capture:   step >= 4,
        knowledge: step >= 4,
        apps:      step >= 5
      };

      // Evidence
      [].forEach.call(evidenceWrap.children, function (row, i) {
        row.classList.toggle('is-active', active.evidence);
        row.classList.toggle('is-lit', active.evidence);
      });

      // Wordmark
      root.querySelector('[data-mark]').classList.toggle('is-active', step >= 1);

      // Engine
      const engine = root.querySelector('[data-engine]');
      engine.classList.toggle('is-active', active.engine);
      engine.classList.toggle('is-detect', active.detect);
      [].forEach.call(engineRows.children, function (row, i) {
        const lit = active.detect && step >= (i < 2 ? 2 : i === 2 ? 3 : 4);
        row.classList.toggle('is-lit', lit);
      });

      // Capture loop labels
      root.querySelector('[data-zone-out]').classList.toggle('is-active', active.route);
      root.querySelector('[data-zone-in]').classList.toggle('is-active', active.capture);

      // Questions / experts
      const sel = hoverExpert == null ? 0 : hoverExpert;
      [].forEach.call(questionsWrap.children, function (q, i) {
        q.classList.toggle('is-lit', active.route);
        q.classList.toggle('is-selected', active.route && i === sel);
      });
      [].forEach.call(expertsWrap.children, function (e, i) {
        e.classList.toggle('is-lit', active.route);
        e.classList.toggle('is-selected', active.route && i === sel);
      });

      // Returns
      [].forEach.call(returnsWrap.children, function (r) {
        r.classList.toggle('is-active', active.capture);
      });

      // Knowledge layer
      const kl = root.querySelector('[data-kl]');
      kl.classList.toggle('is-active', active.knowledge);

      // Density meter (drives in over the last steps)
      const density = root.querySelector('[data-density]');
      density.classList.toggle('is-validated', step >= 4);
      density.classList.toggle('is-retained',  step >= 5);
      density.classList.toggle('is-reusable',  step >= 5);

      // Applications
      [].forEach.call(appsWrap.children, function (a) {
        a.classList.toggle('is-active', active.apps);
      });

      // Connectors
      setLayer(layers.evidence,       active.evidence);
      setLayer(layers.engineToQ,      active.route);
      setLayer(layers.qToExpert,      active.route);
      setLayer(layers.expertToReturn, active.capture);
      setLayer(layers.returnToKL,     active.knowledge);
      setLayer(layers.klToApp,        active.apps);

      // Header dots
      [].forEach.call(dotsWrap.children, function (b, i) {
        b.classList.toggle('rq-mechanism-dot--active', i === step);
        b.classList.toggle('rq-mechanism-dot--done',   i < step);
      });

      // Rail
      const railIdx = step <= 1 ? 0 : (step === 2 || step === 3) ? 1 : step === 4 ? 2 : 3;
      let counter = 0;
      [].forEach.call(railWrap.children, function (el) {
        if (!el.classList.contains('rq-mechanism-rail-item')) return;
        el.classList.toggle('is-active', counter === railIdx);
        counter++;
      });

      // Caption
      const s = STEPS[step];
      root.querySelector('[data-caption-step]').textContent =
        'Step ' + String(step + 1).padStart(2, '0') + ' / ' + String(STEPS.length).padStart(2, '0');
      root.querySelector('[data-caption-title]').textContent = s.title;
      root.querySelector('[data-caption-desc]').textContent  = s.desc;
    }

    setPlaying(playing);
    render();
  }

  function bootstrap() {
    document.querySelectorAll('.rq-mechanism').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // Expose for manual init
  window.RequivoMechanism = { init: init, initAll: bootstrap };
})();
