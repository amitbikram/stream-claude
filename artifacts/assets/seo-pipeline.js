(function(){
  let currentStep = -1;
  const state = { intake:{}, brief:{}, content:{}, page:{} };

  const stepDefs = [
    { key:'intake',  label:'Brief intake',       badge:'Step 1', badgeCls:'pp-badge-blue'   },
    { key:'brief',   label:'Brief generation',   badge:'Step 2', badgeCls:'pp-badge-purple' },
    { key:'content', label:'Content generation', badge:'Step 3', badgeCls:'pp-badge-teal'   },
    { key:'page',    label:'Page creation',      badge:'Step 4', badgeCls:'pp-badge-amber'  },
  ];

  function setStepState(idx, st) {
    const node = document.getElementById('step-node-' + idx);
    const line = document.getElementById('step-line-' + idx);
    node.className = 'pp-step-node' + (st === 'active' ? ' active' : st === 'done' ? ' done' : '');
    if (st === 'done') { node.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i>'; node.title = 'Click to go back'; node.onclick = () => goBack(idx); }
    else { node.innerHTML = idx + 1; node.onclick = null; }
    if (line) line.className = 'pp-step-line' + (st === 'done' ? ' done' : '');
    const sub = document.getElementById('step-sub-' + idx);
    if (sub) sub.className = 'pp-step-sub' + (st === 'active' ? ' active' : '');
  }

  function showSummary(idx, html) {
    const el = document.getElementById('step-summary-' + idx);
    el.style.display = 'block';
    el.innerHTML = html;
  }

  function clearPanel() {
    document.getElementById('pp-active-panel').innerHTML = '';
    document.getElementById('pp-cta-bar').style.display = 'none';
  }

  function setPanel(html) {
    const panel = document.getElementById('pp-active-panel');
    panel.innerHTML = '<hr class="pp-divider" />' + html;
  }

  function hasBrief()   { return !!(state.brief && state.brief.h1); }
  function hasContent() { return !!(state.content && state.content.hero); }
  function hasPage()    { return !!(state.page && state.page.created); }

  function enterBrief()   { hasBrief()   ? renderBriefReview()   : renderBriefLoading(); }
  function enterContent() { hasContent() ? renderContentReview() : renderContentLoading(); }
  function enterPage()    { hasPage()    ? renderPageCreated()   : renderPagePreCreate(); }

  window.startStep = function(idx) {
    currentStep = idx;
    for (let i = 0; i < 4; i++) {
      if (i < idx) setStepState(i, 'done');
      else if (i === idx) setStepState(i, 'active');
      else setStepState(i, '');
    }
    document.getElementById('pp-cta-bar').style.display = 'none';
    const renders = [renderIntake, enterBrief, enterContent, enterPage];
    renders[idx]();
  };

  window.goBack = function(idx) {
    for (let i = idx; i < 4; i++) setStepState(i, i === idx ? 'active' : '');
    currentStep = idx;
    document.getElementById('pp-cta-bar').style.display = 'none';
    const renders = [renderIntake, enterBrief, enterContent, enterPage];
    renders[idx]();
  };

  // ----- Host integration hooks -----
  // Claude/host should call these when MCP tools return data.
  // Until called, the widget stays on its loading panel for that step.
  window.populateBrief = function(data) {
    if (!data) return;
    state.brief = {
      h1: data.h1 || '',
      meta: data.meta || '',
      msg: data.msg || data.messaging || '',
      visual: data.visual || '',
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
    };
    if (currentStep === 1) renderBriefReview();
  };

  window.populateContent = function(data) {
    if (!data) return;
    state.content = {
      hero: data.hero || '',
      features: data.features || '',
      faqs: Array.isArray(data.faqs) ? data.faqs : (state.brief.faqs || []),
    };
    if (currentStep === 2) renderContentReview();
  };

  window.populatePage = function(data) {
    if (!data) return;
    state.page = Object.assign({}, data, { created: true });
    if (currentStep === 3) renderPageCreated();
  };

  function backBtn(toIdx) {
    return `<button class="pp-btn" onclick="goBack(${toIdx})" style="margin-right:auto;"><i class="ti ti-arrow-left" aria-hidden="true"></i> Back to step ${toIdx+1}</button>`;
  }

  function renderIntake() {
    const kw  = state.intake.kw   || '';
    const aud = state.intake.aud  || '';
    const tn  = state.intake.tone || '';
    const ctx = state.intake.ctx  || '';
    setPanel(`
<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <div class="pp-section-title">
      <span class="pp-section-badge pp-badge-blue"><i class="ti ti-bolt" style="font-size:11px;" aria-hidden="true"></i> Step 1 — Brief intake</span>
    </div>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-key" aria-hidden="true"></i> Primary keyword</div>
    <div class="pp-field">
      <div class="pp-label">Keyword <span class="pp-req">required</span></div>
      <input id="f-kw" type="text" value="${kw}" placeholder="e.g. AI sticker generator" autocomplete="off" />
      <div class="pp-chips">
        <button class="pp-chip" data-kw="AI logo generator">AI logo generator</button>
        <button class="pp-chip" data-kw="AI video editor">AI video editor</button>
        <button class="pp-chip" data-kw="background remover">background remover</button>
        <button class="pp-chip" data-kw="AI headshot generator">AI headshot generator</button>
      </div>
    </div>
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-users" aria-hidden="true"></i> Targeting</div>
    <div class="pp-row">
      <div class="pp-field">
        <div class="pp-label">Audience <span class="pp-opt">optional</span></div>
        <input id="f-aud" type="text" value="${aud}" placeholder="e.g. small business owners" />
      </div>
      <div class="pp-field">
        <div class="pp-label">Tone <span class="pp-opt">optional</span></div>
        <select id="f-tone">
          <option value="" ${tn===''?'selected':''}>Default</option>
          <option value="friendly and approachable" ${tn==='friendly and approachable'?'selected':''}>Friendly &amp; approachable</option>
          <option value="professional and authoritative" ${tn==='professional and authoritative'?'selected':''}>Professional &amp; authoritative</option>
          <option value="playful and energetic" ${tn==='playful and energetic'?'selected':''}>Playful &amp; energetic</option>
          <option value="technical and precise" ${tn==='technical and precise'?'selected':''}>Technical &amp; precise</option>
        </select>
      </div>
    </div>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-notes" aria-hidden="true"></i> Extra context</div>
    <div class="pp-field">
      <div class="pp-label">Notes <span class="pp-opt">angles, must-mentions, products, etc.</span></div>
      <textarea id="f-ctx" rows="3" placeholder="e.g. position around Adobe Firefly; emphasize photo-to-sticker mode">${ctx}</textarea>
    </div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem;">
    <span class="pp-status" id="intake-status"><i class="ti ti-point-filled"></i> Ready</span>
    <div style="flex:1;"></div>
    <button class="pp-btn pp-btn-primary" onclick="submitIntake()"><i class="ti ti-arrow-right" aria-hidden="true"></i> Generate brief ↗</button>
  </div>
</div>`);

    document.querySelectorAll('.pp-chip').forEach(c => {
      c.addEventListener('click', () => { document.getElementById('f-kw').value = c.dataset.kw; document.getElementById('f-kw').focus(); });
    });
  }

  window.submitIntake = function() {
    const kw = document.getElementById('f-kw').value.trim();
    if (!kw) { document.getElementById('f-kw').focus(); return; }
    state.intake = {
      kw, aud: document.getElementById('f-aud').value.trim(),
      tone: document.getElementById('f-tone').value,
      ctx: document.getElementById('f-ctx').value.trim(),
    };
    state.brief = {}; state.content = {}; state.page = {};
    const st = state.intake;
    showSummary(0, `<div class="pp-step-summary"><i class="ti ti-circle-check" aria-hidden="true"></i> <strong>${st.kw}</strong>${st.aud?' · '+st.aud:''} <span class="pp-step-edit-link" onclick="goBack(0)">edit</span></div>`);
    setStepState(0, 'done');
    setStepState(1, 'active');
    currentStep = 1;

    const lines = ['Generate a content brief using the Stream-MCP `generate_content_brief` tool.','',`Primary keyword: ${st.kw}`];
    if (st.aud)  lines.push(`Target audience: ${st.aud}`);
    if (st.tone) lines.push(`Tone: ${st.tone}`);
    if (st.ctx)  lines.push(`Extra context: ${st.ctx}`);
    lines.push('');
    lines.push('Stop after the brief — do not create a page yet.');

    renderBriefLoading();
    sendPrompt(lines.join('\n'));
  };

  function renderBriefLoading() {
    setPanel(`<div class="pp-form-wrap">
      <div class="pp-section-bar"><span class="pp-section-badge pp-badge-purple"><i class="ti ti-loader-2" style="font-size:11px; display:inline-block; animation:pp-spin 1s linear infinite;" aria-hidden="true"></i> Step 2 — Generating brief…</span></div>
      <div class="pp-card pp-c-purple" style="text-align:center; padding:2rem;">
        <i class="ti ti-sparkles" style="font-size:32px; color:#7F77DD; display:block; margin-bottom:12px;" aria-hidden="true"></i>
        <div style="font-size:14px; color:var(--color-text-secondary);">Generating your content brief…</div>
        <div style="font-size:12px; color:var(--color-text-tertiary); margin-top:4px;">The next step will appear when the brief is ready.</div>
      </div>
    </div>`);
  }

  function escAttr(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escText(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function renderBriefReview() {
    const b = state.brief || {};
    const faqs = Array.isArray(b.faqs) ? b.faqs : [];
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-purple"><i class="ti ti-file-text" style="font-size:11px;" aria-hidden="true"></i> Step 2 — Brief review</span>
    <span class="pp-dirty" id="brief-dirty">Unsaved edits</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-heading" aria-hidden="true"></i> Page H1</div>
    <input id="b-h1" type="text" value="${escAttr(b.h1)}" placeholder="e.g. Create unique logos with Adobe Firefly AI Logo Generator" oninput="markBriefDirty()" />
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-search" aria-hidden="true"></i> Meta description</div>
    <textarea id="b-meta" rows="2" placeholder="Short meta description (≤160 chars)" oninput="markBriefDirty()">${escText(b.meta)}</textarea>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-target" aria-hidden="true"></i> Core messaging</div>
    <textarea id="b-msg" rows="4" placeholder="Key messages, value props, must-mentions" oninput="markBriefDirty()">${escText(b.msg)}</textarea>
  </div>

  <div class="pp-card pp-c-coral">
    <div class="pp-card-label pp-lbl-coral"><i class="ti ti-photo" aria-hidden="true"></i> Visual tone</div>
    <textarea id="b-visual" rows="3" placeholder="Mood, palette, imagery direction" oninput="markBriefDirty()">${escText(b.visual)}</textarea>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQ topics</div>
    <div class="pp-faq-list" id="b-faqs">${faqs.map((f,i)=>`<div class="pp-faq-row"><span class="pp-faq-num">${i+1}</span><input class="pp-faq-inp" value="${escAttr(f)}" oninput="markBriefDirty()" /><button class="pp-faq-del" onclick="delBriefFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button></div>`).join('')}</div>
    <div class="pp-add-faq"><input class="pp-add-inp" id="b-new-faq" placeholder="Add a FAQ topic…" /><button class="pp-add-btn" onclick="addBriefFaq()"><i class="ti ti-plus" aria-hidden="true"></i> Add</button></div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem; flex-wrap:wrap;">
    ${backBtn(0)}
    <button class="pp-btn" onclick="doRegenerate()"><i class="ti ti-refresh" aria-hidden="true"></i> Regenerate ↗</button>
    <button class="pp-btn pp-btn-primary" onclick="proceedToContent()"><i class="ti ti-arrow-right" aria-hidden="true"></i> Generate page content from brief ↗</button>
  </div>
</div>`);

    document.getElementById('b-new-faq').addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); addBriefFaq(); } });
  }

  window.markBriefDirty = function() { const el = document.getElementById('brief-dirty'); if (el) el.classList.add('on'); };
  window.delBriefFaq = function(btn) { btn.closest('.pp-faq-row').remove(); renumFaqs('b-faqs'); markBriefDirty(); };
  window.addBriefFaq = function() {
    const inp = document.getElementById('b-new-faq'); const val = inp.value.trim(); if (!val) return;
    const list = document.getElementById('b-faqs'); const n = list.children.length + 1;
    const row = document.createElement('div'); row.className = 'pp-faq-row';
    row.innerHTML = `<span class="pp-faq-num">${n}</span><input class="pp-faq-inp" value="${val.replace(/"/g,'&quot;')}" oninput="markBriefDirty()" /><button class="pp-faq-del" onclick="delBriefFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button>`;
    list.appendChild(row); inp.value = ''; inp.focus(); markBriefDirty();
  };
  window.doRegenerate = function() {
    state.brief = {};
    renderBriefLoading();
    sendPrompt('Please regenerate the content brief using Stream-MCP `generate_content_brief` with the same keyword: ' + (state.intake.kw||''));
  };

  function collectBrief() {
    return {
      h1: document.getElementById('b-h1').value.trim(),
      meta: document.getElementById('b-meta').value.trim(),
      msg: document.getElementById('b-msg').value.trim(),
      visual: document.getElementById('b-visual').value.trim(),
      faqs: [...document.querySelectorAll('#b-faqs .pp-faq-inp')].map(i => i.value.trim()).filter(Boolean),
    };
  }

  window.proceedToContent = function() {
    state.brief = collectBrief();
    state.content = {};
    const b = state.brief;
    showSummary(1, `<div class="pp-step-summary"><i class="ti ti-circle-check" aria-hidden="true"></i> <strong>${escText(b.h1.slice(0,40))}…</strong> · ${b.faqs.length} FAQs <span class="pp-step-edit-link" onclick="goBack(1)">edit</span></div>`);
    setStepState(1, 'done'); setStepState(2, 'active'); currentStep = 2;

    renderContentLoading();
    sendPrompt(`Brief approved. Please generate full page content blocks using the brief below.\n\nH1: ${b.h1}\nMeta: ${b.meta}\nMessaging: ${b.msg}\nVisual tone: ${b.visual}\nFAQs:\n${b.faqs.map((f,i)=>`${i+1}. ${f}`).join('\n')}`);
  };

  function renderContentLoading() {
    setPanel(`<div class="pp-form-wrap">
      <div class="pp-section-bar"><span class="pp-section-badge pp-badge-teal"><i class="ti ti-loader-2" style="font-size:11px; display:inline-block; animation:pp-spin 1s linear infinite;" aria-hidden="true"></i> Step 3 — Generating page content…</span></div>
      <div class="pp-card pp-c-teal" style="text-align:center; padding:2rem;">
        <i class="ti ti-sparkles" style="font-size:32px; color:#1D9E75; display:block; margin-bottom:12px;" aria-hidden="true"></i>
        <div style="font-size:14px; color:var(--color-text-secondary);">Generating page content from your approved brief…</div>
        <div style="font-size:12px; color:var(--color-text-tertiary); margin-top:4px;">Hero copy, feature highlights, and FAQ answers.</div>
      </div>
    </div>`);
  }

  function renderContentReview() {
    const c = state.content || {};
    const faqs = Array.isArray(c.faqs) ? c.faqs : (state.brief.faqs || []);
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-teal"><i class="ti ti-layout" style="font-size:11px;" aria-hidden="true"></i> Step 3 — Content review</span>
    <span class="pp-dirty" id="content-dirty">Unsaved edits</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-file-description" aria-hidden="true"></i> Page overview</div>
    <div style="font-size:18px; font-weight:500; color:var(--color-text-primary); margin-bottom:6px;">${escText(state.brief.h1||'Page title')}</div>
    <div style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;">${escText(state.brief.meta||'')}</div>
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-target" aria-hidden="true"></i> Hero copy</div>
    <textarea id="c-hero" rows="3" placeholder="Hero copy for the page" oninput="markContentDirty()">${escText(c.hero)}</textarea>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-list-check" aria-hidden="true"></i> Feature highlights</div>
    <textarea id="c-features" rows="4" placeholder="One feature per line" oninput="markContentDirty()">${escText(c.features)}</textarea>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQ topics</div>
    <div class="pp-faq-list" id="c-faqs">${faqs.map((f,i)=>`<div class="pp-faq-row"><span class="pp-faq-num">${i+1}</span><input class="pp-faq-inp" value="${escAttr(f)}" oninput="markContentDirty()" /><button class="pp-faq-del" onclick="delContentFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button></div>`).join('')}</div>
    <div class="pp-add-faq"><input class="pp-add-inp" id="c-new-faq" placeholder="Add a FAQ topic…" /><button class="pp-add-btn" onclick="addContentFaq()"><i class="ti ti-plus" aria-hidden="true"></i> Add</button></div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem; flex-wrap:wrap;">
    ${backBtn(1)}
    <button class="pp-btn pp-btn-primary" onclick="proceedToPage()"><i class="ti ti-arrow-right" aria-hidden="true"></i> Continue to page creation ↗</button>
  </div>
</div>`);
    document.getElementById('c-new-faq').addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); addContentFaq(); } });
  }

  window.markContentDirty = function() { const el = document.getElementById('content-dirty'); if (el) el.classList.add('on'); };
  window.delContentFaq = function(btn) { btn.closest('.pp-faq-row').remove(); renumFaqs('c-faqs'); markContentDirty(); };
  window.addContentFaq = function() {
    const inp = document.getElementById('c-new-faq'); const val = inp.value.trim(); if (!val) return;
    const list = document.getElementById('c-faqs'); const n = list.children.length + 1;
    const row = document.createElement('div'); row.className = 'pp-faq-row';
    row.innerHTML = `<span class="pp-faq-num">${n}</span><input class="pp-faq-inp" value="${val.replace(/"/g,'&quot;')}" oninput="markContentDirty()" /><button class="pp-faq-del" onclick="delContentFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button>`;
    list.appendChild(row); inp.value = ''; inp.focus(); markContentDirty();
  };

  window.proceedToPage = function() {
    state.content = {
      hero: document.getElementById('c-hero').value.trim(),
      features: document.getElementById('c-features').value.trim(),
      faqs: [...document.querySelectorAll('#c-faqs .pp-faq-inp')].map(i=>i.value.trim()).filter(Boolean),
    };
    state.page = {};
    showSummary(2, `<div class="pp-step-summary"><i class="ti ti-circle-check" aria-hidden="true"></i> Hero copy + ${state.content.faqs.length} FAQs approved <span class="pp-step-edit-link" onclick="goBack(2)">edit</span></div>`);
    setStepState(2, 'done'); setStepState(3, 'active'); currentStep = 3;
    renderPagePreCreate();
  };

  function renderPagePreCreate() {
    const b = state.brief || {}; const c = state.content || {};
    const faqs = Array.isArray(c.faqs) ? c.faqs : [];
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-amber"><i class="ti ti-brand-adobe" style="font-size:11px;" aria-hidden="true"></i> Step 4 — Review &amp; create page</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-file-description" aria-hidden="true"></i> Page</div>
    <div style="font-size:18px; font-weight:500; color:var(--color-text-primary); margin-bottom:6px;">${escText(b.h1||'Page title')}</div>
    <div style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;">${escText(b.meta||'')}</div>
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-target" aria-hidden="true"></i> Hero copy</div>
    <div class="pp-da-prose">${escText(c.hero||'')}</div>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-list-check" aria-hidden="true"></i> Feature highlights</div>
    <div class="pp-da-prose">${escText(c.features||'').replace(/\n/g,'<br>')}</div>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQs</div>
    <div class="pp-faq-list">${faqs.map((f,i)=>`<div class="pp-faq-row"><span class="pp-faq-num">${i+1}</span><span style="font-size:13px;color:var(--color-text-primary);flex:1;">${escText(f)}</span></div>`).join('')}</div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem; flex-wrap:wrap;">
    ${backBtn(2)}
    <button class="pp-btn pp-btn-primary" onclick="doCreatePage()"><i class="ti ti-rocket" aria-hidden="true"></i> Create the page ↗</button>
  </div>
</div>`);
  }

  function renderPageLoading() {
    setPanel(`<div class="pp-form-wrap">
      <div class="pp-section-bar"><span class="pp-section-badge pp-badge-amber"><i class="ti ti-loader-2" style="font-size:11px; display:inline-block; animation:pp-spin 1s linear infinite;" aria-hidden="true"></i> Step 4 — Creating page in AEM DA…</span></div>
      <div class="pp-card pp-c-amber" style="text-align:center; padding:2rem;">
        <i class="ti ti-brand-adobe" style="font-size:32px; color:#BA7517; display:block; margin-bottom:12px;" aria-hidden="true"></i>
        <div style="font-size:14px; color:var(--color-text-secondary);">Creating the page in DA and fetching the live source…</div>
        <div style="font-size:12px; color:var(--color-text-tertiary); margin-top:4px;">The preview will appear once the page is live.</div>
      </div>
    </div>`);
  }

  function renderPageCreated() {
    const b = state.brief || {}; const c = state.content || {}; const p = state.page || {};
    const faqs = Array.isArray(c.faqs) ? c.faqs : [];
    const url = p.url || p.editUrl || '';
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-amber"><i class="ti ti-brand-adobe" style="font-size:11px;" aria-hidden="true"></i> Step 4 — Page live</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-file-description" aria-hidden="true"></i> Page</div>
    <div style="font-size:18px; font-weight:500; color:var(--color-text-primary); margin-bottom:6px;">${escText(b.h1||'Page title')}</div>
    <div style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;">${escText(b.meta||'')}</div>
    <div class="pp-da-pills" style="margin-top:10px;">
      <span class="pp-da-pill"><i class="ti ti-circle-check" aria-hidden="true"></i> Page created</span>
      ${url ? `<span class="pp-da-pill" title="${escAttr(url)}"><i class="ti ti-link" aria-hidden="true"></i> ${escText(url.replace(/^https?:\/\//,'').slice(0,40))}${url.length>40?'…':''}</span>` : ''}
    </div>
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-target" aria-hidden="true"></i> Hero copy</div>
    <div class="pp-da-prose">${escText(c.hero||'')}</div>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-list-check" aria-hidden="true"></i> Feature highlights</div>
    <div class="pp-da-prose">${escText(c.features||'').replace(/\n/g,'<br>')}</div>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQs</div>
    <div class="pp-faq-list">${faqs.map((f,i)=>`<div class="pp-faq-row"><span class="pp-faq-num">${i+1}</span><span style="font-size:13px;color:var(--color-text-primary);flex:1;">${escText(f)}</span></div>`).join('')}</div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem; flex-wrap:wrap;">
    ${backBtn(2)}
    <button class="pp-btn" onclick="doPreflight()"><i class="ti ti-clipboard-check" aria-hidden="true"></i> Run preflight ↗</button>
    <button class="pp-btn" onclick="doOpenDA()"><i class="ti ti-external-link" aria-hidden="true"></i> Open in DA</button>
    <button class="pp-btn pp-btn-primary" onclick="doPushDA()"><i class="ti ti-upload" aria-hidden="true"></i> Push updates ↗</button>
  </div>
</div>`);
    showSummary(3, `<div class="pp-step-summary"><i class="ti ti-circle-check" aria-hidden="true"></i> Page created in AEM DA</div>`);
  }

  window.doCreatePage = function() {
    const b = state.brief; const c = state.content;
    renderPageLoading();
    sendPrompt(`Please create the page in AEM DA now.\n\nCall Stream-MCP \`create_page_from_brief\` with the final content below, then immediately call AEM DA Prod MCP \`da_get_source\` on the returned da.live editor URL.\n\nH1: ${b.h1}\nMeta: ${b.meta}\nHero: ${c.hero}\nFeatures:\n${c.features}\nFAQs:\n${c.faqs.map((f,i)=>`${i+1}. ${f}`).join('\n')}`);
  };

  window.doPreflight = function() { sendPrompt('Please run `generate_preflight_report` on the current da.live draft using Stream-MCP and show the results.'); };
  window.doOpenDA    = function() { sendPrompt('Please share the da.live editor URL for this page so I can open it.'); };
  window.doPushDA    = function() { sendPrompt('Please push the latest content updates to DA using AEM DA Prod MCP `da_create_source` on the current page URL.'); };

  function renumFaqs(listId) {
    document.querySelectorAll('#' + listId + ' .pp-faq-row').forEach((r,i) => r.querySelector('.pp-faq-num').textContent = i+1);
  }
})();
