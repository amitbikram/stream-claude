(function(){
  const $ = id => document.getElementById(id);

  document.querySelectorAll('.bg-chip').forEach(c => {
    c.addEventListener('click', () => { $('bg-kw').value = c.dataset.kw; $('bg-kw').focus(); });
  });

  document.querySelectorAll('.bg-next-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.bg-next-opt').forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
    });
  });

  function setStatus(msg, type) {
    const el = $('bg-status');
    el.className = 'bg-status' + (type ? ' ' + type : '');
    const icons = { err: 'ti-alert-circle', ok: 'ti-circle-check', loading: 'ti-loader-2' };
    el.innerHTML = `<i class="ti ${icons[type] || 'ti-point-filled'}"></i> ${msg}`;
  }

  $('bg-submit').addEventListener('click', () => {
    const keyword = $('bg-kw').value.trim();
    if (!keyword) { setStatus('Enter a keyword to continue.', 'err'); $('bg-kw').focus(); return; }

    const audience = $('bg-audience').value.trim();
    const tone     = $('bg-tone').value;
    const context  = $('bg-context').value.trim();
    const next     = document.querySelector('input[name=bg-next]:checked').value;

    const lines = [
      'Generate a content brief using the Stream-MCP `generate_content_brief` tool.',
      '', `Primary keyword: ${keyword}`,
    ];
    if (audience) lines.push(`Target audience: ${audience}`);
    if (tone)     lines.push(`Tone: ${tone}`);
    if (context)  lines.push(`Extra context: ${context}`);
    lines.push('');
    if (next === 'brief-page') {
      lines.push('After the brief is generated, also call `create_page_from_brief` with the returned thread_id.');
    } else if (next === 'brief-page-preflight') {
      lines.push('After the brief is generated, call `create_page_from_brief`, then run `generate_preflight_report` on the resulting edit URL.');
    } else {
      lines.push('Stop after the brief — do not create a page yet.');
    }

    setStatus('Sending to Claude…', 'loading');
    sendPrompt(lines.join('\n'));
    setTimeout(() => setStatus('Sent — check the chat below', 'ok'), 800);
  });
})();
