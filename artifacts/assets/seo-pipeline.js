(function(){
  let currentStep = -1;
  const state = { intake:{}, brief:{}, content:{}, page:{} };

  const stepDefs = [
    { key:'intake',  label:'Brief intake',       badge:'Step 1', badgeCls:'pp-badge-blue'   },
    { key:'brief',   label:'Brief generation',   badge:'Step 2', badgeCls:'pp-badge-purple' },
    { key:'content', label:'Content generation', badge:'Step 3', badgeCls:'pp-badge-teal'   },
    { key:'page',    label:'Page generation',    badge:'Step 4', badgeCls:'pp-badge-amber'  },
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

  window.startStep = function(idx) {
    currentStep = idx;
    for (let i = 0; i < 4; i++) {
      if (i < idx) setStepState(i, 'done');
      else if (i === idx) setStepState(i, 'active');
      else setStepState(i, '');
    }
    document.getElementById('pp-cta-bar').style.display = 'none';
    const renders = [renderIntake, renderBriefReview, renderContentReview, renderPagePreview];
    renders[idx]();
  };

  window.goBack = function(idx) {
    for (let i = idx; i < 4; i++) setStepState(i, i === idx ? 'active' : '');
    currentStep = idx;
    document.getElementById('pp-cta-bar').style.display = 'none';
    const renders = [renderIntake, renderBriefReview, renderContentReview, renderPagePreview];
    renders[idx]();
  };

  function backBtn(toIdx) {
    return `<button class="pp-btn" onclick="goBack(${toIdx})" style="margin-right:auto;"><i class="ti ti-arrow-left" aria-hidden="true"></i> Back to step ${toIdx+1}</button>`;
  }

  function renderIntake() {
    const kw  = state.intake.kw   || '';
    const aud = state.intake.aud  || '';
    const tn  = state.intake.tone || '';
    const ctx = state.intake.ctx  || '';
    const nx  = state.intake.next || 'brief-only';
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

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-route" aria-hidden="true"></i> After the brief</div>
    <div class="pp-next-opts" id="f-next-opts">
      <label class="pp-next-opt ${nx==='brief-only'?'sel':''}"><input type="radio" name="f-next" value="brief-only" ${nx==='brief-only'?'checked':''} /><div><div class="pp-opt-title">Brief only</div><div class="pp-opt-desc">Stop after the brief — review before proceeding</div></div></label>
      <label class="pp-next-opt ${nx==='brief-page'?'sel':''}"><input type="radio" name="f-next" value="brief-page" ${nx==='brief-page'?'checked':''} /><div><div class="pp-opt-title">Brief → create page</div><div class="pp-opt-desc">Generate brief, then call <code>create_page_from_brief</code></div></div></label>
      <label class="pp-next-opt ${nx==='brief-page-preflight'?'sel':''}"><input type="radio" name="f-next" value="brief-page-preflight" ${nx==='brief-page-preflight'?'checked':''} /><div><div class="pp-opt-title">Brief → page → preflight</div><div class="pp-opt-desc">Full pipeline including <code>generate_preflight_report</code></div></div></label>
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
    document.querySelectorAll('.pp-next-opt').forEach(opt => {
      opt.addEventListener('click', () => { document.querySelectorAll('.pp-next-opt').forEach(o => o.classList.remove('sel')); opt.classList.add('sel'); });
    });
  }

  window.submitIntake = function() {
    const kw = document.getElementById('f-kw').value.trim();
    if (!kw) { document.getElementById('f-kw').focus(); return; }
    state.intake = {
      kw, aud: document.getElementById('f-aud').value.trim(),
      tone: document.getElementById('f-tone').value,
      ctx: document.getElementById('f-ctx').value.trim(),
      next: document.querySelector('input[name=f-next]:checked').value,
    };
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
    if (st.next === 'brief-page') lines.push('After the brief, call `create_page_from_brief`.');
    else if (st.next === 'brief-page-preflight') lines.push('After the brief, call `create_page_from_brief`, then `generate_preflight_report`.');
    else lines.push('Stop after the brief — do not create a page yet.');

    setPanel(`<div class="pp-form-wrap">
      <div class="pp-section-bar"><span class="pp-section-badge pp-badge-purple"><i class="ti ti-loader-2" style="font-size:11px; display:inline-block; animation:pp-spin 1s linear infinite;" aria-hidden="true"></i> Step 2 — Generating brief…</span></div>
      <div class="pp-card pp-c-purple" style="text-align:center; padding:2rem;">
        <i class="ti ti-sparkles" style="font-size:32px; color:#7F77DD; display:block; margin-bottom:12px;" aria-hidden="true"></i>
        <div style="font-size:14px; color:var(--color-text-secondary);">Claude is generating your content brief…</div>
        <div style="font-size:12px; color:var(--color-text-tertiary); margin-top:4px;">Results will appear in the chat below</div>
      </div>
    </div>`);

    sendPrompt(lines.join('\n'));
    setTimeout(() => renderBriefReview(), 800);
  };

  function renderBriefReview() {
    const b = state.brief;
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-purple"><i class="ti ti-file-text" style="font-size:11px;" aria-hidden="true"></i> Step 2 — Brief review</span>
    <span class="pp-dirty" id="brief-dirty">Unsaved edits</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-heading" aria-hidden="true"></i> Page H1</div>
    <input id="b-h1" type="text" value="${b.h1||'Create unique logos with Adobe Firefly AI Logo Generator'}" oninput="markBriefDirty()" />
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-search" aria-hidden="true"></i> Meta description</div>
    <textarea id="b-meta" rows="2" oninput="markBriefDirty()">${b.meta||'Design custom logos fast and easily with Adobe Firefly AI Logo Generator. Generate commercially safe logos that fit your brand perfectly.'}</textarea>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-target" aria-hidden="true"></i> Core messaging</div>
    <textarea id="b-msg" rows="4" oninput="markBriefDirty()">${b.msg||'Focus on how the AI logo generator helps users create unique, professional logos quickly — no design experience needed. Emphasize customization, creative control, and commercial safety.'}</textarea>
  </div>

  <div class="pp-card pp-c-coral">
    <div class="pp-card-label pp-lbl-coral"><i class="ti ti-photo" aria-hidden="true"></i> Visual tone</div>
    <textarea id="b-visual" rows="3" oninput="markBriefDirty()">${b.visual||'Bright, colorful, fresh, and inspiring. Show polished logo examples on vibrant backgrounds — optimistic and approachable.'}</textarea>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQ topics</div>
    <div class="pp-faq-list" id="b-faqs">
      <div class="pp-faq-row"><span class="pp-faq-num">1</span><input class="pp-faq-inp" value="How do I customize logos with Adobe Firefly?" oninput="markBriefDirty()" /><button class="pp-faq-del" onclick="delBriefFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button></div>
      <div class="pp-faq-row"><span class="pp-faq-num">2</span><input class="pp-faq-inp" value="Can I use logos commercially?" oninput="markBriefDirty()" /><button class="pp-faq-del" onclick="delBriefFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button></div>
      <div class="pp-faq-row"><span class="pp-faq-num">3</span><input class="pp-faq-inp" value="What file formats can I export?" oninput="markBriefDirty()" /><button class="pp-faq-del" onclick="delBriefFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button></div>
    </div>
    <div class="pp-add-faq"><input class="pp-add-inp" id="b-new-faq" placeholder="Add a FAQ topic…" /><button class="pp-add-btn" onclick="addBriefFaq()"><i class="ti ti-plus" aria-hidden="true"></i> Add</button></div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem; flex-wrap:wrap;">
    ${backBtn(0)}
    <button class="pp-btn" onclick="doRegenerate()"><i class="ti ti-refresh" aria-hidden="true"></i> Regenerate ↗</button>
    <button class="pp-btn pp-btn-primary" onclick="proceedToContent()"><i class="ti ti-arrow-right" aria-hidden="true"></i> Proceed to content ↗</button>
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
  window.doRegenerate = function() { sendPrompt('Please regenerate the content brief using Stream-MCP `generate_content_brief` with the same keyword: ' + (state.intake.kw||'')); };

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
    const b = state.brief;
    showSummary(1, `<div class="pp-step-summary"><i class="ti ti-circle-check" aria-hidden="true"></i> <strong>${b.h1.slice(0,40)}…</strong> · ${b.faqs.length} FAQs <span class="pp-step-edit-link" onclick="goBack(1)">edit</span></div>`);
    setStepState(1, 'done'); setStepState(2, 'active'); currentStep = 2;

    sendPrompt(`Brief approved. Please generate full page content blocks using the brief below.\n\nH1: ${b.h1}\nMeta: ${b.meta}\nMessaging: ${b.msg}\nVisual tone: ${b.visual}\nFAQs:\n${b.faqs.map((f,i)=>`${i+1}. ${f}`).join('\n')}`);
    renderContentReview();
  };

  function renderContentReview() {
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-teal"><i class="ti ti-layout" style="font-size:11px;" aria-hidden="true"></i> Step 3 — Content review</span>
    <span class="pp-dirty" id="content-dirty">Unsaved edits</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-file-description" aria-hidden="true"></i> Page overview</div>
    <div style="font-size:18px; font-weight:500; color:var(--color-text-primary); margin-bottom:6px;">${state.brief.h1||'Page title'}</div>
    <div style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;">${state.brief.meta||''}</div>
    <div class="pp-da-pills" style="margin-top:10px;">
      <span class="pp-da-pill"><i class="ti ti-layout" aria-hidden="true"></i> Feature page</span>
      <span class="pp-da-pill"><i class="ti ti-photo" aria-hidden="true"></i> 4 images</span>
      <span class="pp-da-pill"><i class="ti ti-stack" aria-hidden="true"></i> 5 blocks</span>
    </div>
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-target" aria-hidden="true"></i> Hero copy</div>
    <textarea id="c-hero" rows="3" oninput="markContentDirty()">Make stunning logos in minutes — no designer required. Adobe Firefly AI Logo Generator turns your ideas into polished, commercially safe logos. Customize colors, styles, and layouts to perfectly match your brand.</textarea>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-list-check" aria-hidden="true"></i> Feature highlights</div>
    <textarea id="c-features" rows="3" oninput="markContentDirty()">Commercial-safe by design — every logo is ready to use in any project.
Full creative control with real-time customization.
Built for entrepreneurs, small businesses, and creatives.</textarea>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQ topics</div>
    <div class="pp-faq-list" id="c-faqs">${(state.brief.faqs||[]).map((f,i)=>`<div class="pp-faq-row"><span class="pp-faq-num">${i+1}</span><input class="pp-faq-inp" value="${f.replace(/"/g,'&quot;')}" oninput="markContentDirty()" /><button class="pp-faq-del" onclick="delContentFaq(this)" aria-label="Remove"><i class="ti ti-x"></i></button></div>`).join('')}</div>
    <div class="pp-add-faq"><input class="pp-add-inp" id="c-new-faq" placeholder="Add a FAQ topic…" /><button class="pp-add-btn" onclick="addContentFaq()"><i class="ti ti-plus" aria-hidden="true"></i> Add</button></div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-top:1rem; flex-wrap:wrap;">
    ${backBtn(1)}
    <button class="pp-btn pp-btn-primary" onclick="proceedToPage()"><i class="ti ti-arrow-right" aria-hidden="true"></i> Generate page ↗</button>
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
    showSummary(2, `<div class="pp-step-summary"><i class="ti ti-circle-check" aria-hidden="true"></i> Hero copy + ${state.content.faqs.length} FAQs approved <span class="pp-step-edit-link" onclick="goBack(2)">edit</span></div>`);
    setStepState(2, 'done'); setStepState(3, 'active'); currentStep = 3;
    const b = state.brief; const c = state.content;
    sendPrompt(`Content approved. Please create the page using Stream-MCP \`create_page_from_brief\` with the final content below.\n\nH1: ${b.h1}\nMeta: ${b.meta}\nHero: ${c.hero}\nFeatures:\n${c.features}\nFAQs:\n${c.faqs.map((f,i)=>`${i+1}. ${f}`).join('\n')}\n\nAfter creating, fetch the source with AEM DA Prod MCP \`da_get_source\` and show the DA preview.`);
    renderPagePreview();
  };

  function renderPagePreview() {
    setPanel(`<div class="pp-form-wrap">
  <div class="pp-section-bar">
    <span class="pp-section-badge pp-badge-amber"><i class="ti ti-brand-adobe" style="font-size:11px;" aria-hidden="true"></i> Step 4 — Page preview</span>
  </div>

  <div class="pp-card pp-c-blue">
    <div class="pp-card-label pp-lbl-blue"><i class="ti ti-file-description" aria-hidden="true"></i> Page</div>
    <div style="font-size:18px; font-weight:500; color:var(--color-text-primary); margin-bottom:6px;" id="pg-h1">${state.brief.h1||'Page title'}</div>
    <div style="font-size:13px; color:var(--color-text-secondary); line-height:1.5;" id="pg-meta">${state.brief.meta||''}</div>
    <div class="pp-da-pills" style="margin-top:10px;">
      <span class="pp-da-pill"><i class="ti ti-circle-check" aria-hidden="true"></i> Page created</span>
      <span class="pp-da-pill"><i class="ti ti-photo" aria-hidden="true"></i> 4 images</span>
      <span class="pp-da-pill"><i class="ti ti-stack" aria-hidden="true"></i> 5 blocks</span>
    </div>
  </div>

  <div class="pp-card pp-c-purple">
    <div class="pp-card-label pp-lbl-purple"><i class="ti ti-target" aria-hidden="true"></i> Hero copy</div>
    <div class="pp-da-prose" id="pg-hero">${state.content.hero||''}</div>
  </div>

  <div class="pp-card pp-c-teal">
    <div class="pp-card-label pp-lbl-teal"><i class="ti ti-list-check" aria-hidden="true"></i> Feature highlights</div>
    <div class="pp-da-prose" id="pg-features">${(state.content.features||'').replace(/\n/g,'<br>')}</div>
  </div>

  <div class="pp-card pp-c-amber">
    <div class="pp-card-label pp-lbl-amber"><i class="ti ti-help-circle" aria-hidden="true"></i> FAQs</div>
    <div class="pp-faq-list">${(state.content.faqs||[]).map((f,i)=>`<div class="pp-faq-row"><span class="pp-faq-num">${i+1}</span><span style="font-size:13px;color:var(--color-text-primary);flex:1;">${f}</span></div>`).join('')}</div>
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

  window.doPreflight = function() { sendPrompt('Please run `generate_preflight_report` on the current da.live draft using Stream-MCP and show the results.'); };
  window.doOpenDA    = function() { sendPrompt('Please share the da.live editor URL for this page so I can open it.'); };
  window.doPushDA    = function() { sendPrompt('Please push the latest content updates to DA using AEM DA Prod MCP `da_create_source` on the current page URL.'); };

  function renumFaqs(listId) {
    document.querySelectorAll('#' + listId + ' .pp-faq-row').forEach((r,i) => r.querySelector('.pp-faq-num').textContent = i+1);
  }
})();
