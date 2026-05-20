(function(){
  let editing = false;
  const editableIds = ['bv-h1','bv-meta','bv-messaging','bv-visual'];

  function renumber() {
    document.querySelectorAll('#bv-faq-list .bv-faq-item').forEach((item, i) => {
      item.querySelector('.bv-faq-num').textContent = i + 1;
    });
  }

  window.toggleEdit = function() {
    editing = !editing;
    const root = document.getElementById('bv-root');
    root.classList.toggle('bv-editing', editing);
    editableIds.forEach(id => {
      const el = document.getElementById(id);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.readOnly = !editing;
    });
    document.querySelectorAll('.bv-faq-text').forEach(el => el.readOnly = !editing);
    const btn = document.getElementById('bv-toggle');
    const hint = document.getElementById('bv-hint');
    btn.innerHTML = editing ? '<i class="ti ti-check" aria-hidden="true"></i> Done' : '<i class="ti ti-edit" aria-hidden="true"></i> Edit';
    hint.textContent = editing ? 'editing' : 'click to edit';
    if (editing) document.getElementById('bv-h1').focus();
  };

  window.delFaq = function(btn) {
    btn.closest('.bv-faq-item').remove();
    renumber();
  };

  window.addFaq = function() {
    const input = document.getElementById('bv-new-faq');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const list = document.getElementById('bv-faq-list');
    const num = list.children.length + 1;
    const item = document.createElement('div');
    item.className = 'bv-faq-item';
    item.innerHTML = `<span class="bv-faq-num">${num}</span><input class="bv-faq-text" value="${text.replace(/"/g,'&quot;')}" ${editing ? '' : 'readonly'} /><button class="bv-faq-del" onclick="delFaq(this)" aria-label="Remove FAQ"><i class="ti ti-x"></i></button>`;
    list.appendChild(item);
    input.value = '';
    input.focus();
  };

  document.getElementById('bv-new-faq').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addFaq(); }
  });

  function collect() {
    const faqs = [...document.querySelectorAll('.bv-faq-text')].map(el => el.value.trim()).filter(Boolean);
    return {
      h1: document.getElementById('bv-h1').value.trim(),
      meta: document.getElementById('bv-meta').value.trim(),
      messaging: document.getElementById('bv-messaging').value.trim(),
      visual: document.getElementById('bv-visual').value.trim(),
      faqs,
    };
  }

  window.doRegenerate = function() {
    const b = collect();
    sendPrompt('Please regenerate the content brief using the Stream-MCP `generate_content_brief` tool.\nUse the same keyword and settings as before but produce a fresh version.\n\nCurrent H1 for reference: ' + b.h1);
  };

  window.doTweak = function() {
    const b = collect();
    sendPrompt(
      'I have edited the brief. Please review my changes and suggest further improvements, or confirm it looks good.\n\n' +
      `H1: ${b.h1}\nMeta: ${b.meta}\nMessaging: ${b.messaging}\nVisual tone: ${b.visual}\nFAQs:\n` +
      b.faqs.map((f,i) => `${i+1}. ${f}`).join('\n')
    );
  };

  window.doProceed = function() {
    const b = collect();
    sendPrompt(
      'The brief looks good. Please proceed to create the page using the Stream-MCP `create_page_from_brief` tool.\n\n' +
      `H1: ${b.h1}\nMeta: ${b.meta}\nMessaging: ${b.messaging}\nVisual tone: ${b.visual}\nFAQs:\n` +
      b.faqs.map((f,i) => `${i+1}. ${f}`).join('\n')
    );
  };
})();
