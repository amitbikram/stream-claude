(function(){
  let mode = 'preview';
  let daUrl = 'da.live/editor/…/ai-logo-generator';

  window.setMode = function(m) {
    mode = m;
    ['preview','edit','source'].forEach(id => {
      document.getElementById('mode-' + id).style.display = id === m ? 'block' : 'none';
      document.getElementById('btn-' + id).classList.toggle('active', id === m);
    });
    if (m === 'source') syncToRaw();
    if (m === 'preview') syncToPreview();
  };

  function syncToPreview() {
    document.getElementById('pv-h1').textContent    = document.getElementById('ed-h1').value.trim();
    document.getElementById('pv-meta').textContent  = document.getElementById('ed-meta').value.trim();
    document.getElementById('pv-hero').textContent  = document.getElementById('ed-hero').value.trim();
    document.getElementById('pv-features').textContent = document.getElementById('ed-features').value.trim();
    const faqs = [...document.querySelectorAll('#ed-faqs .da-faq-inp')].map(i => i.value.trim()).filter(Boolean);
    document.getElementById('pv-faqs').innerHTML = faqs.map((q,i) =>
      `<div class="da-faq-row"><span class="da-faq-num">${i+1}</span><span class="da-faq-view">${q}</span></div>`
    ).join('');
  }

  function syncToRaw() {
    const h1   = document.getElementById('ed-h1').value.trim();
    const meta = document.getElementById('ed-meta').value.trim();
    const hero = document.getElementById('ed-hero').value.trim();
    const feats = document.getElementById('ed-features').value.trim().split('\n').filter(Boolean);
    const faqs  = [...document.querySelectorAll('#ed-faqs .da-faq-inp')].map(i => i.value.trim()).filter(Boolean);
    document.getElementById('da-raw').value =
      `# ${h1}\n\n${meta}\n\n## Hero\n| Hero |\n| --- |\n| ${hero} |\n\n## Features\n| Features |\n| --- |\n` +
      feats.map(f => `| ${f} |`).join('\n') +
      `\n\n## FAQ\n| FAQ |\n| --- |\n` + faqs.map(f => `| ${f} |`).join('\n');
  }

  window.markDirty = function() {
    document.getElementById('da-dirty').classList.add('on');
    document.getElementById('da-push-btn').disabled = false;
  };

  window.delFaq = function(btn) {
    btn.closest('.da-faq-row').remove();
    document.querySelectorAll('#ed-faqs .da-faq-row').forEach((r,i) => r.querySelector('.da-faq-num').textContent = i+1);
    markDirty();
  };

  window.addFaq = function() {
    const inp = document.getElementById('ed-new-faq');
    const val = inp.value.trim();
    if (!val) { inp.focus(); return; }
    const list = document.getElementById('ed-faqs');
    const n = list.children.length + 1;
    const row = document.createElement('div');
    row.className = 'da-faq-row';
    row.innerHTML = `<span class="da-faq-num">${n}</span><input class="da-faq-inp" value="${val.replace(/"/g,'&quot;')}" oninput="markDirty()" /><button class="da-faq-del" onclick="delFaq(this)" aria-label="Remove FAQ"><i class="ti ti-x"></i></button>`;
    list.appendChild(row);
    inp.value = '';
    inp.focus();
    markDirty();
  };

  document.getElementById('ed-new-faq').addEventListener('keydown', e => { if (e.key==='Enter') { e.preventDefault(); addFaq(); } });

  function getSource() { syncToRaw(); return document.getElementById('da-raw').value.trim(); }

  function setPushStatus(msg, cls) {
    const el = document.getElementById('da-push-st');
    el.className = 'da-push-status on' + (cls ? ' ' + cls : '');
    el.innerHTML = msg;
  }

  window.doPush = function() {
    const src = getSource();
    setPushStatus('<i class="ti ti-loader-2 da-spin"></i> Pushing…', '');
    document.getElementById('da-push-btn').disabled = true;
    sendPrompt('Please push the updated page source to DA using the AEM DA Prod MCP `da_create_source` tool.\n\nTarget URL: ' + daUrl + '\n\nUpdated source:\n\n' + src);
    setTimeout(() => {
      document.getElementById('da-dirty').classList.remove('on');
      setPushStatus('<i class="ti ti-circle-check"></i> Pushed successfully', 'ok');
      document.getElementById('da-time').textContent = 'Updated at ' + new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    }, 900);
  };

  window.doRefresh = function() { sendPrompt('Please re-fetch the page source using the AEM DA Prod MCP `da_get_source` tool and update the preview.'); };
  window.doOpenDA  = function() { openLink('https://' + daUrl.replace(/^https?:\/\//,'')); };
  window.doPreflight = function() { sendPrompt('Please run `generate_preflight_report` on the current page draft using Stream-MCP and show the results.'); };

  document.getElementById('da-time').textContent = 'Fetched at ' + new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
})();
