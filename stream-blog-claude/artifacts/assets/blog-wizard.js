(function(){
  // ----- State -----
  const SKILLS = [
    { name: 'blog-brand-voice.md',         url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/blog-brand-voice.md' },
    { name: 'blog-longform-principles.md', url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/blog-longform-principles.md' },
    { name: 'blog-seo.md',                 url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/blog-seo.md' },
    { name: 'brand-guideline-skill.md',    url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/SKILL.md' },
    { name: 'brand-marks.md',              url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/brand-marks.md' },
    { name: 'brand-overview.md',           url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/brand-overview.md' },
    { name: 'brand-voice.md',              url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/brand-voice.md' },
    { name: 'color.md',                    url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/color.md' },
    { name: 'editorial-legal.md',          url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/editorial-legal.md' },
    { name: 'imagery.md',                  url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/imagery.md' },
    { name: 'lockups.md',                  url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/lockups.md' },
    { name: 'templates-events-gear.md',    url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/templates-events-gear.md' },
    { name: 'typography.md',               url: 'https://github.com/Adobe-acom/stream-service/blob/develop/src/skills/adobe-brand-guidelines/references/typography.md' },
    { name: 'block-generation-skills',     url: 'https://github.com/Adobe-acom/stream-service/tree/develop/src/skills/blocks' },
  ];

  const STEP_LABELS = ['Article Proposal', 'Skills Review', 'Brief Generation', 'Page Creation'];

  const state = {
    proposal: { mainObjective: '', focusPoints: '', category: 'thought leadership', articleProposal: '' },
    skills:   { disabled: new Set(), custom: [] },
    brief:    { text: '', status: 'idle' },   // idle | loading | ready
    page:     { items: [], url: '', app_url: '', status: 'idle' },  // idle | streaming | complete
  };
  let currentStep = -1; // -1 = welcome; 0..3 = wizard steps

  // ----- HTML escape helpers -----
  function escAttr(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escText(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ----- SVG icons -----
  const SVG_CHEVRON_LEFT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_OPEN = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1h4v4M11 1L5.5 6.5M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // Feather "ban"/"slash" icon — stroke-based so it renders reliably at small sizes
  const SVG_BAN = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/></svg>';
  const SVG_UPLOAD = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 20H17C18.1 20 19 19.1 19 18V14M5 14V18C5 19.1 5.9 20 7 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_EXT = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M18 15.75V12.0308C18 11.6167 17.6641 11.2808 17.25 11.2808C16.8359 11.2808 16.5 11.6167 16.5 12.0308V15.75C16.5 16.1636 16.1636 16.5 15.75 16.5H4.25C3.83643 16.5 3.5 16.1636 3.5 15.75V4.25C3.5 3.83643 3.83643 3.5 4.25 3.5H8.06104C8.4751 3.5 8.81104 3.16406 8.81104 2.75C8.81104 2.33594 8.4751 2 8.06104 2H4.25C3.00928 2 2 3.00928 2 4.25V15.75C2 16.9907 3.00928 18 4.25 18H15.75C16.9907 18 18 16.9907 18 15.75Z" fill="currentColor"/><path d="M19 1.75V5.99268C19 6.40674 18.6641 6.74268 18.25 6.74268C17.8359 6.74268 17.5 6.40674 17.5 5.99268V3.56055L11.0303 10.0303C10.8838 10.1768 10.6919 10.25 10.5 10.25C10.3081 10.25 10.1162 10.1768 9.96973 10.0303C9.67676 9.73731 9.67676 9.2627 9.96973 8.96973L16.4395 2.5H14.0073C13.5933 2.5 13.2573 2.16406 13.2573 1.75C13.2573 1.33594 13.5933 1 14.0073 1H18.25C18.6641 1 19 1.33594 19 1.75Z" fill="currentColor"/></svg>';
  const SVG_SUCCESS = '<svg class="page-gen__success-svg" width="40" height="40" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 18.75C5.17529 18.75 1.25 14.8252 1.25 10C1.25 5.1748 5.17529 1.25 10 1.25C14.8247 1.25 18.75 5.1748 18.75 10C18.75 14.8252 14.8247 18.75 10 18.75ZM10 2.75C6.00244 2.75 2.75 6.00195 2.75 10C2.75 13.998 6.00244 17.25 10 17.25C13.9976 17.25 17.25 13.998 17.25 10C17.25 6.00195 13.9976 2.75 10 2.75Z" fill="#079355"/><path class="page-gen__svg-check" d="M9.18263 13.9434C8.97072 13.9434 8.76759 13.8535 8.62501 13.6953L5.98146 10.7559C5.7046 10.4473 5.72951 9.97363 6.03761 9.69629C6.34571 9.41895 6.82032 9.44531 7.09669 9.75195L9.12355 12.0059L12.8228 6.95996C13.0674 6.62598 13.5381 6.55273 13.8711 6.79883C14.2051 7.04297 14.2774 7.5127 14.0327 7.84668L9.78761 13.6367C9.65382 13.8193 9.44532 13.9316 9.22023 13.9424C9.20753 13.9434 9.19484 13.9434 9.18263 13.9434Z" fill="#079355"/></svg>';

  // ----- DOM helpers -----
  function root() { return document.getElementById('bw-root'); }
  function setRoot(html) { root().innerHTML = html; }

  // ----- Wizard bar -----
  function wizardBarHtml() {
    const parts = [];
    for (let i = 0; i < 4; i++) {
      const isDone   = i < currentStep;
      const isActive = i === currentStep;
      const cls = 'wizard-bar__step' + (isActive ? ' wizard-bar__step--active' : isDone ? ' wizard-bar__step--done' : '');
      const circleAttrs = isDone ? ` onclick="bwGoBack(${i})" title="Go back to ${escAttr(STEP_LABELS[i])}"` : '';
      const labelAttrs  = isDone ? ` onclick="bwGoBack(${i})"` : '';
      const circleInner = isDone ? '&#10003;' : String(i + 1);
      parts.push(
        `<div class="${cls}">` +
          `<div class="wizard-bar__circle"${circleAttrs}>${circleInner}</div>` +
          `<span class="wizard-bar__label"${labelAttrs}>${escText(STEP_LABELS[i])}</span>` +
        `</div>`
      );
      if (i < 3) {
        const connCls = 'wizard-bar__connector' + (i < currentStep ? ' wizard-bar__connector--done' : '');
        parts.push(`<div class="${connCls}"></div>`);
      }
    }
    return `<div class="wizard-bar">${parts.join('')}</div>`;
  }

  function wizardChrome(stepInner) {
    return (
      `<div class="brief-intake-panel">` +
        `<header class="brief-intake-panel__toolbar">` +
          `<button type="button" class="brief-intake-panel__close" onclick="bwClose()" aria-label="Close and return to welcome">${SVG_CHEVRON_LEFT}<span>Close</span></button>` +
          `<div class="brief-intake-panel__toolbar-spacer"></div>` +
          `<button type="button" class="brief-intake-panel__btn-secondary" onclick="bwReset()">Reset</button>` +
        `</header>` +
        wizardBarHtml() +
        `<div class="brief-intake-panel__sheet">${stepInner}</div>` +
      `</div>`
    );
  }

  // ----- Welcome view -----
  function renderWelcome() {
    currentStep = -1;
    const stepDescs = [
      'Enter the objective and focus areas for your blog page.',
      'Review the AI skills and guidelines used in content generation.',
      'Generate and review the AI-generated blog brief.',
      'Create the blog page from the brief.',
    ];
    const steps = STEP_LABELS.map((label, i) => (
      `<li class="blog-welcome__step">` +
        `<div class="blog-welcome__step-left">` +
          `<div class="blog-welcome__step-num">${i + 1}</div>` +
          `<div class="blog-welcome__step-line"></div>` +
        `</div>` +
        `<div class="blog-welcome__step-body">` +
          `<p class="blog-welcome__step-title">${escText(label)}</p>` +
          `<p class="blog-welcome__step-desc">${escText(stepDescs[i])}</p>` +
        `</div>` +
      `</li>`
    )).join('');

    setRoot(
      `<div class="blog-welcome">` +
        `<header class="blog-welcome__header">` +
          `<h1 class="blog-welcome__title">Generate an AI-powered Blog page</h1>` +
          `<p class="blog-welcome__sub">Follow this guided wizard to create a fully AI-generated blog page — from keywords to live content.</p>` +
        `</header>` +
        `<ol class="blog-welcome__steps">${steps}</ol>` +
        `<div class="blog-welcome__cta-row">` +
          `<button type="button" class="brief-intake-panel__btn-primary" onclick="bwStart()">Get Started ↗</button>` +
        `</div>` +
      `</div>`
    );
  }

  // ----- Step 1: Article Proposal -----
  function renderProposal() {
    const p = state.proposal;
    const opts = [
      ['thought leadership', 'Thought Leadership'],
      ['customer story',     'Customer Story'],
      ['informational',      'Informational'],
      ['event',              'Event'],
    ].map(([v, l]) => `<option value="${escAttr(v)}"${p.category === v ? ' selected' : ''}>${escText(l)}</option>`).join('');

    const inner =
      `<div class="wizard-step-content">` +
        `<div class="wizard-step-content__header">` +
          `<h2 class="wizard-step-content__title">Keywords</h2>` +
          `<p class="wizard-step-content__desc">Enter keywords and a paragraph that describes the topic of your blog page.</p>` +
        `</div>` +
        `<div class="wizard-step-content__body">` +
          `<div class="brief-intake-panel__keyword-row brief-intake-panel__keyword-row--3col">` +
            `<label class="brief-intake-panel__field">` +
              `<span class="brief-intake-panel__label">Main Objective <span class="brief-intake-panel__required" aria-hidden="true">*</span></span>` +
              `<input type="text" id="bw-objective" class="brief-intake-panel__input" placeholder="e.g. agentic marketing strategy" autocomplete="off" value="${escAttr(p.mainObjective)}" oninput="bwOnProposalInput()" />` +
            `</label>` +
            `<label class="brief-intake-panel__field">` +
              `<span class="brief-intake-panel__label">Focus Points <span class="brief-intake-panel__optional">(optional)</span></span>` +
              `<input type="text" id="bw-focus" class="brief-intake-panel__input" placeholder="e.g. marketing to AI agents, customer experience orchestration" autocomplete="off" value="${escAttr(p.focusPoints)}" />` +
            `</label>` +
            `<label class="brief-intake-panel__field">` +
              `<span class="brief-intake-panel__label">Blog Category</span>` +
              `<select id="bw-category" class="brief-intake-panel__select">${opts}</select>` +
            `</label>` +
          `</div>` +
          `<label class="brief-intake-panel__field">` +
            `<span class="brief-intake-panel__label">Article Proposal <span class="brief-intake-panel__optional">(optional)</span></span>` +
            `<textarea id="bw-proposal" class="brief-intake-panel__textarea" placeholder="Describe the topic of your blog page in a few sentences…" rows="5">${escText(p.articleProposal)}</textarea>` +
          `</label>` +
        `</div>` +
        `<div class="wizard-nav">` +
          `<button type="button" class="brief-intake-panel__btn-secondary wizard-nav__btn" disabled>← Back</button>` +
          `<div class="wizard-nav__spacer"></div>` +
          `<button type="button" id="bw-next-1" class="brief-intake-panel__btn-primary wizard-nav__btn" onclick="bwSubmitProposal()"${p.mainObjective.trim() ? '' : ' disabled'}>Next - Skills Review →</button>` +
        `</div>` +
      `</div>`;

    setRoot(wizardChrome(inner));
  }

  window.bwOnProposalInput = function() {
    const v = (document.getElementById('bw-objective').value || '').trim();
    const btn = document.getElementById('bw-next-1');
    if (btn) btn.disabled = !v;
  };

  function collectProposal() {
    state.proposal = {
      mainObjective:   (document.getElementById('bw-objective').value || '').trim(),
      focusPoints:     (document.getElementById('bw-focus').value || '').trim(),
      category:        document.getElementById('bw-category').value,
      articleProposal: (document.getElementById('bw-proposal').value || '').trim(),
    };
  }

  window.bwSubmitProposal = function() {
    collectProposal();
    if (!state.proposal.mainObjective) { document.getElementById('bw-objective').focus(); return; }
    currentStep = 1;
    renderSkills();
  };

  // ----- Step 2: Skills Review -----
  function activeSkillsList() {
    const enabled = SKILLS.filter(s => !state.skills.disabled.has(s.name));
    const custom = state.skills.custom.filter(s => !state.skills.disabled.has(s.name));
    return enabled.concat(custom);
  }

  function skillRowHtml(s, disabled) {
    const isCustom = !!s.isCustom;
    return (
      `<li class="wizard-skills-list__item${disabled ? ' wizard-skills-list__item--disabled' : ''}" data-skill-name="${escAttr(s.name)}">` +
        `<div class="wizard-skills-list__row">` +
          `<a href="${escAttr(s.url || '#')}" target="_blank" rel="noreferrer" class="wizard-skills-list__name-link">${escText(s.name)}</a>` +
          (isCustom ? `<span class="wizard-skills-list__custom-badge">custom</span>` : '') +
          `<div class="wizard-skills-list__actions">` +
            (s.url ? `<a href="${escAttr(s.url)}" target="_blank" rel="noreferrer" class="wizard-skills-list__action-btn" aria-label="Open ${escAttr(s.name)}">${SVG_OPEN}</a>` : '') +
            `<button type="button" class="wizard-skills-list__action-btn wizard-skills-list__action-btn--disable" aria-label="${disabled ? 'Enable' : 'Disable'} ${escAttr(s.name)}" aria-pressed="${disabled}" onclick="bwToggleSkill('${escAttr(s.name)}')">${SVG_BAN}</button>` +
          `</div>` +
        `</div>` +
      `</li>`
    );
  }

  function updateActiveBadge() {
    const badge = document.getElementById('bw-active-badge');
    if (badge) badge.textContent = activeSkillsList().length + ' active';
  }

  function renderSkills() {
    const allRows = SKILLS.concat(state.skills.custom);
    const rows = allRows.map(s => skillRowHtml(s, state.skills.disabled.has(s.name))).join('');

    const active = activeSkillsList().length;

    const inner =
      `<div class="wizard-step-content">` +
        `<div class="wizard-step-content__header">` +
          `<div class="wizard-skills-header-row">` +
            `<div>` +
              `<h2 class="wizard-step-content__title">Skills &amp; Guidelines</h2>` +
              `<p class="wizard-step-content__desc">The following skills will be used to generate your blog. Remove any you don't need, or upload a custom skill.</p>` +
            `</div>` +
            `<span class="wizard-skills-active-badge" id="bw-active-badge">${active} active</span>` +
          `</div>` +
        `</div>` +
        `<div class="wizard-step-content__body">` +
          `<ul class="wizard-skills-list">${rows}</ul>` +
          `<div class="wizard-skills-upload">` +
            `<input type="file" id="bw-skill-file" accept=".md" multiple style="display:none" onchange="bwHandleSkillUpload(event)" />` +
            `<button type="button" class="wizard-skills-upload__btn" onclick="document.getElementById('bw-skill-file').click()">${SVG_UPLOAD}Upload custom skill (.md)</button>` +
          `</div>` +
        `</div>` +
        `<div class="wizard-nav">` +
          `<button type="button" class="brief-intake-panel__btn-secondary wizard-nav__btn" onclick="bwGoBack(0)">← Back</button>` +
          `<div class="wizard-nav__spacer"></div>` +
          `<button type="button" class="brief-intake-panel__btn-primary wizard-nav__btn" onclick="bwGenerateBrief()">Next - Generate Brief →</button>` +
        `</div>` +
      `</div>`;

    setRoot(wizardChrome(inner));
  }

  window.bwToggleSkill = function(name) {
    const wasDisabled = state.skills.disabled.has(name);
    if (wasDisabled) state.skills.disabled.delete(name);
    else state.skills.disabled.add(name);
    const nowDisabled = !wasDisabled;

    // Surgical update — toggle the affected row in place, no full re-render
    const li = document.querySelector('.wizard-skills-list__item[data-skill-name="' + CSS.escape(name) + '"]');
    if (li) {
      li.classList.toggle('wizard-skills-list__item--disabled', nowDisabled);
      const btn = li.querySelector('.wizard-skills-list__action-btn--disable');
      if (btn) {
        btn.setAttribute('aria-pressed', String(nowDisabled));
        btn.setAttribute('aria-label', (nowDisabled ? 'Enable ' : 'Disable ') + name);
      }
    }
    updateActiveBadge();
  };

  window.bwHandleSkillUpload = function(ev) {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;
    let pending = files.length;
    const added = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (!state.skills.custom.some(s => s.name === file.name)) {
          const skill = { name: file.name, content: e.target.result, isCustom: true };
          state.skills.custom.push(skill);
          added.push(skill);
        }
        if (--pending === 0) {
          // Surgical append — insert just the new rows, no full re-render
          const list = document.querySelector('.wizard-skills-list');
          if (list) {
            added.forEach(s => list.insertAdjacentHTML('beforeend', skillRowHtml(s, false)));
          }
          updateActiveBadge();
        }
      };
      reader.readAsText(file);
    });
    ev.target.value = '';
  };

  // ----- Step 3: Brief Generation -----
  window.bwGenerateBrief = function() {
    currentStep = 2;
    state.brief.status = 'loading';
    state.brief.text = '';
    renderBriefLoading();

    // The proposal + skills live only in the widget's IIFE closure at this
    // point. There is no prior `data-state`-baked widget render to read from
    // (steps 1 & 2 are client-side, no Claude turn). So we must include them
    // inline in the trigger — they can't be inferred from chat history.
    const p = state.proposal;
    const active = activeSkillsList();
    const activeNames = active.map(s => s.name);
    const customWithContent = active.filter(s => s.isCustom && s.content);

    const lines = ['Generate the blog brief now.', ''];
    lines.push(`Main Objective: ${p.mainObjective}`);
    if (p.focusPoints)     lines.push(`Focus Points: ${p.focusPoints}`);
    if (p.category)        lines.push(`Blog Category: ${p.category}`);
    if (p.articleProposal) lines.push(`Article Proposal: ${p.articleProposal}`);
    lines.push('', `Active skills (${activeNames.length}): ${activeNames.join(', ')}`);
    if (customWithContent.length) {
      lines.push('', 'Custom uploaded skills:');
      customWithContent.forEach(s => {
        lines.push('', `--- ${s.name} ---`, s.content);
      });
    }

    sendPrompt(lines.join('\n'));
  };

  function renderBriefLoading() {
    const inner =
      `<div class="wizard-step-content">` +
        `<div class="wizard-step-content__header">` +
          `<h2 class="wizard-step-content__title">Blog Brief</h2>` +
          `<p class="wizard-step-content__desc">Generating your blog brief…</p>` +
        `</div>` +
        `<div class="bw-loading">` +
          `<div class="bw-loading__spinner"></div>` +
          `<p class="bw-loading__title">Generating your blog brief…</p>` +
          `<p class="bw-loading__sub">The next step will appear when the brief is ready.</p>` +
        `</div>` +
        `<div class="wizard-nav">` +
          `<button type="button" class="brief-intake-panel__btn-secondary wizard-nav__btn" onclick="bwGoBack(1)">← Back</button>` +
        `</div>` +
      `</div>`;
    setRoot(wizardChrome(inner));
  }

  function renderBriefReview() {
    const b = state.brief;
    const inner =
      `<div class="wizard-step-content">` +
        `<div class="wizard-step-content__header">` +
          `<h2 class="wizard-step-content__title">Blog Brief</h2>` +
          `<p class="wizard-step-content__desc">Your brief is ready. Review it below or regenerate with new instructions.</p>` +
        `</div>` +
        `<div class="wizard-step-content__body">` +
          `<label class="brief-intake-panel__field">` +
            `<span class="brief-intake-panel__label">Brief</span>` +
            `<textarea id="bw-brief" class="brief-intake-panel__textarea brief-intake-panel__textarea--brief" placeholder="Your brief will appear here." rows="14">${escText(b.text)}</textarea>` +
          `</label>` +
          `<div class="wizard-regenerate">` +
            `<textarea id="bw-regen-input" class="brief-intake-panel__textarea brief-intake-panel__regenerate-input" placeholder="e.g. Make it more conversational, add a section on ROI…" rows="2" oninput="bwOnRegenInput()"></textarea>` +
            `<button type="button" id="bw-regen-btn" class="brief-intake-panel__btn-secondary wizard-nav__btn" onclick="bwRegenerateBrief()" disabled>Regenerate brief</button>` +
          `</div>` +
        `</div>` +
        `<div class="wizard-nav">` +
          `<button type="button" class="brief-intake-panel__btn-secondary wizard-nav__btn" onclick="bwGoBack(1)">← Back</button>` +
          `<div class="wizard-nav__spacer"></div>` +
          `<button type="button" class="brief-intake-panel__btn-primary wizard-nav__btn" onclick="bwCreatePage()">Next - Create Page →</button>` +
        `</div>` +
      `</div>`;
    setRoot(wizardChrome(inner));
  }

  window.bwOnRegenInput = function() {
    const v = (document.getElementById('bw-regen-input').value || '').trim();
    const btn = document.getElementById('bw-regen-btn');
    if (btn) btn.disabled = !v;
  };

  window.bwRegenerateBrief = function() {
    const instructions = (document.getElementById('bw-regen-input').value || '').trim();
    if (!instructions) return;
    state.brief.status = 'loading';
    state.brief.text = '';
    renderBriefLoading();
    sendPrompt('Regenerate the blog brief with these revisions:\n\n' + instructions);
  };

  // ----- Step 4: Page Creation -----
  window.bwCreatePage = function() {
    // capture any in-form edits so they aren't lost when the form unmounts
    const briefEl = document.getElementById('bw-brief');
    if (briefEl) state.brief.text = (briefEl.value || '').trim();

    currentStep = 3;
    state.page = { items: [], url: '', status: 'streaming' };
    renderPageStreaming();
    // brief is included so any user edits to the textarea are carried into
    // the next Claude turn (the prior data-state only has Claude's last version)
    sendPrompt('Create the blog page from this brief:\n\n' + state.brief.text);
  };

  function feedItemHtml(item) {
    const isImg = item.type === 'IMG';
    const cls = 'page-gen__feed-item ' + (isImg ? 'page-gen__feed-item--image' : 'page-gen__feed-item--text');
    return `<div class="${cls}"><span class="page-gen__feed-badge">${escText(item.type || 'TEXT')}</span><p class="page-gen__feed-text">${escText(item.text || '')}</p></div>`;
  }

  function renderPageStreaming() {
    const items = state.page.items;
    const feed = items.length
      ? items.map(feedItemHtml).join('')
      : `<div style="font-size:12px;color:var(--color-text-tertiary);padding:8px;">Waiting for content blocks…</div>`;
    const inner =
      `<div class="wizard-step-content">` +
        `<div class="wizard-step-content__header">` +
          `<h2 class="wizard-step-content__title">Page Creation</h2>` +
          `<p class="wizard-step-content__desc">Generating page content in real time. The success state will appear when the page is live.</p>` +
        `</div>` +
        `<div class="wizard-step-content__body">` +
          `<div class="page-gen__streaming-status">Streaming page content…</div>` +
          `<div class="page-gen__feed" id="bw-feed">${feed}</div>` +
        `</div>` +
        `<div class="wizard-nav">` +
          `<button type="button" class="brief-intake-panel__btn-secondary wizard-nav__btn" onclick="bwGoBack(2)">← Back</button>` +
        `</div>` +
      `</div>`;
    setRoot(wizardChrome(inner));
  }

  function renderPageComplete() {
    const p = state.page;
    const url = p.url || '';
    const items = p.items || [];
    const feed = items.length
      ? items.map(feedItemHtml).join('')
      : `<div style="font-size:12px;color:var(--color-text-tertiary);padding:8px;">No log items recorded.</div>`;
    const inner =
      `<div class="wizard-step-content">` +
        `<div class="wizard-step-content__header">` +
          `<h2 class="wizard-step-content__title">Page Creation</h2>` +
          `<p class="wizard-step-content__desc">Your blog page is live and ready.</p>` +
        `</div>` +
        `<div class="wizard-step-content__body">` +
          `<div class="page-gen__success">` +
            SVG_SUCCESS +
            `<div class="page-gen__success-body">` +
              `<p class="page-gen__success-eyebrow">Your blog page is ready!</p>` +
              `<div class="page-gen__url-row">` +
                `<span class="page-gen__url-text">${escText(url)}</span>` +
                (url ? `<a href="${escAttr(url)}" target="_blank" rel="noreferrer" class="page-gen__url-open" aria-label="Open page in new tab">${SVG_EXT}</a>` : '') +
              `</div>` +
            `</div>` +
          `</div>` +
          `<details class="page-gen__feed-details">` +
            `<summary class="page-gen__feed-summary">View generation log</summary>` +
            `<div class="page-gen__feed page-gen__feed--collapsed">${feed}</div>` +
          `</details>` +
        `</div>` +
        `<div class="wizard-nav">` +
          `<button type="button" class="brief-intake-panel__btn-secondary wizard-nav__btn" onclick="bwGoBack(2)">← Back</button>` +
          `<div class="wizard-nav__spacer"></div>` +
          `<button type="button" class="brief-intake-panel__btn-primary wizard-nav__btn" onclick="bwProceedPreviewCollab()">Proceed to Preview &amp; Collab →</button>` +
        `</div>` +
      `</div>`;
    setRoot(wizardChrome(inner));
  }

  window.bwProceedPreviewCollab = function() {
    const url = (state.page && state.page.app_url) || '';
    if (!url) {
      sendPrompt('Please share the preview & collaboration app URL for this blog page.');
      return;
    }
    // Prefer host-provided openLink (sandbox-aware); fall back to window.open
    if (typeof openLink === 'function') openLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  // ----- Navigation -----
  function enterStep(idx) {
    currentStep = idx;
    if (idx === 0) renderProposal();
    else if (idx === 1) renderSkills();
    else if (idx === 2) {
      if (state.brief.status === 'ready' && state.brief.text) renderBriefReview();
      else renderBriefLoading();
    } else if (idx === 3) {
      if (state.page.status === 'complete') renderPageComplete();
      else renderPageStreaming();
    }
  }

  window.bwStart = function() { enterStep(0); };

  window.bwGoBack = function(idx) {
    if (idx === 0) { collectStepFormsIfPresent(); }
    enterStep(idx);
  };

  function collectStepFormsIfPresent() {
    // best-effort: if the proposal form is mounted, capture its fields
    if (document.getElementById('bw-objective')) collectProposal();
    if (document.getElementById('bw-brief')) state.brief.text = (document.getElementById('bw-brief').value || '').trim();
  }

  window.bwClose = function() {
    collectStepFormsIfPresent();
    renderWelcome();
  };

  window.bwReset = function() {
    state.proposal = { mainObjective: '', focusPoints: '', category: 'thought leadership', articleProposal: '' };
    state.skills   = { disabled: new Set(), custom: [] };
    state.brief    = { text: '', status: 'idle' };
    state.page     = { items: [], url: '', status: 'idle' };
    enterStep(0);
  };

  // ----- Populate hooks (called by Claude/host when MCP tools return) -----
  window.populateBlogBrief = function(text) {
    state.brief.text = String(text == null ? '' : text);
    state.brief.status = 'ready';
    if (currentStep === 2) renderBriefReview();
  };

  window.populateBlogStreamItem = function(item) {
    if (!item || typeof item !== 'object') return;
    const normalized = { type: String(item.type || 'TEXT').toUpperCase(), text: String(item.text || '') };
    state.page.items.push(normalized);
    state.page.status = 'streaming';
    if (currentStep === 3) {
      const feed = document.getElementById('bw-feed');
      if (feed) {
        // remove the "waiting" placeholder on first item
        if (state.page.items.length === 1) feed.innerHTML = '';
        feed.insertAdjacentHTML('beforeend', feedItemHtml(normalized));
        feed.scrollTop = feed.scrollHeight;
      } else {
        renderPageStreaming();
      }
    }
  };

  window.populateBlogPageComplete = function(data) {
    data = data || {};
    if (Array.isArray(data.items)) {
      // back-fill log if streaming wasn't used
      for (const it of data.items) {
        state.page.items.push({ type: String(it.type || 'TEXT').toUpperCase(), text: String(it.text || '') });
      }
    }
    state.page.url = data.url || '';
    state.page.status = 'complete';
    if (currentStep === 3) renderPageComplete();
  };

  // ----- Hydration from baked state (primary data-delivery path) -----
  // Claude re-renders the widget on each turn via show_widget, encoding the
  // current state as JSON on `bw-root[data-state]`. We hydrate from it at
  // boot, then dispatch into the right step in the right sub-state.
  function hydrateFromBaked() {
    const r = document.getElementById('bw-root');
    if (!r || !r.dataset || !r.dataset.state) return false;
    let baked;
    try { baked = JSON.parse(r.dataset.state); } catch (_) { return false; }
    if (!baked || typeof baked !== 'object') return false;

    if (baked.proposal) Object.assign(state.proposal, baked.proposal);
    if (baked.skills) {
      if (Array.isArray(baked.skills.disabled)) state.skills.disabled = new Set(baked.skills.disabled);
      if (Array.isArray(baked.skills.custom))   state.skills.custom = baked.skills.custom.map(s => Object.assign({}, s, { isCustom: true }));
    }
    if (baked.brief) Object.assign(state.brief, baked.brief);
    if (baked.page) {
      Object.assign(state.page, baked.page);
      if (!Array.isArray(state.page.items)) state.page.items = [];
    }
    if (Number.isInteger(baked.currentStep)) currentStep = baked.currentStep;
    return true;
  }

  // ----- Boot -----
  if (hydrateFromBaked() && currentStep >= 0) {
    enterStep(currentStep);
  } else {
    renderWelcome();
  }
})();
