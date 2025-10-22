/* INTUITY UI plumbing — layout + animations + placeholders for JSON integration
   Stage B: No data fetches yet. Hook points are provided.
*/

document.addEventListener('DOMContentLoaded', () => {
  // DOM references
  const levelBtns = Array.from(document.querySelectorAll('.level-btn'));
  const samplesBtn = document.getElementById('samplesBtn');
  const usefulBtn = document.getElementById('usefulBtn');
  const writeBtn = document.getElementById('writeBtn');
  const modal = document.getElementById('modal');
  const modalInner = document.getElementById('modalInner');
  const modalClose = document.getElementById('modalClose');
  const modalBackdrop = document.getElementById('modalBackdrop');

  const writerScreen = document.getElementById('writer');
  const writerBack = document.getElementById('writerBack');
  const writerSave = document.getElementById('writerSave');
  const writerArea = document.getElementById('writerArea');
  const writerLevelSpan = document.getElementById('writerLevel');
  const suggestionsEl = document.getElementById('suggestions');
  const insertSelected = document.getElementById('insertSelected');
  const clearWriter = document.getElementById('clearWriter');

  let currentLevel = 'B2';
  let selectedSuggestion = null;

  // ---- LEVEL BUTTONS ----
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      levelBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      currentLevel = btn.dataset.level;
      // update any UI that depends on level
      showToast(`Level set to ${currentLevel}`);
      // placeholder: call to load level phrases when ready
      // loadLevelPhrases(currentLevel);
    });
  });

  // ---- MODAL HANDLING ----
  function openModal(htmlContent = '') {
    modalInner.innerHTML = htmlContent;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    // focus trap could be added here
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    modalInner.innerHTML = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // keyboard escape to close modal or writer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modal.classList.contains('hidden')) closeModal();
      else if (!writerScreen.classList.contains('hidden')) toggleWriter(false);
    }
  });

  // ---- ACTION BUTTONS (Samples / Useful / Write) ----
  samplesBtn.addEventListener('click', () => {
    // placeholder content: will be replaced with real samples fetched from samples/ folder
    const html = `
      <h3 id="modalTitle">Samples — ${currentLevel}</h3>
      <p>Sample topics & example paragraphs (Cambridge-aligned) will appear here.</p>
      <div style="margin-top:12px;">
        <div class="sample-block"><strong>Topic:</strong> The role of social media in modern life.</div>
        <div class="sample-block" style="margin-top:8px; color:var(--muted)">Sample intro: In an era characterised by rapid digital change, social media has reshaped how individuals communicate...</div>
      </div>
    `;
    openModal(html);
  });

  usefulBtn.addEventListener('click', () => {
    // placeholder useful expressions
    const html = `
      <h3 id="modalTitle">Useful Expressions — ${currentLevel}</h3>
      <p>Common linking words and thesis frames suitable for the selected level.</p>
      <ul style="margin-top:12px;color:var(--muted);line-height:1.6">
        <li><strong>Because</strong> — to give reasons</li>
        <li><strong>Consequently</strong> — to show result</li>
        <li><strong>However</strong> — to show contrast</li>
      </ul>
    `;
    openModal(html);
  });

  writeBtn.addEventListener('click', () => {
    // open minimal fullscreen writer
    toggleWriter(true);
    // render placeholder suggestions (will be replaced when JSON exists)
    renderSuggestionsPlaceholder(currentLevel);
  });

  // ---- WRITER MODE ----
  function toggleWriter(show) {
    if (show) {
      writerScreen.classList.remove('hidden');
      writerScreen.setAttribute('aria-hidden', 'false');
      writerArea.focus();
      writerLevelSpan.textContent = currentLevel;
      document.body.style.overflow = 'hidden';
    } else {
      writerScreen.classList.add('hidden');
      writerScreen.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  writerBack.addEventListener('click', () => toggleWriter(false));
  writerSave.addEventListener('click', () => {
    // simple save to file (client-side)
    const content = writerArea.value;
    if (!content.trim()) {
      showToast('Nothing to save yet.');
      return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `intuity_${currentLevel}_paragraph.txt`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('Saved locally.');
  });

  clearWriter.addEventListener('click', () => {
    writerArea.value = '';
    writerArea.focus();
  });

  // ---- SUGGESTIONS AREA ----
  function renderSuggestionsPlaceholder(level) {
    suggestionsEl.innerHTML = '';
    const info = document.createElement('div');
    info.className = 's-ghost';
    info.textContent = `Suggestions for ${level} will be loaded here from your phrase libraries.`;
    suggestionsEl.appendChild(info);
  }

  // when a phrase is clicked later, we'll set it as selected; placeholder below
  suggestionsEl.addEventListener('click', (e) => {
    const item = e.target.closest('.phrase-item');
    if (!item) return;
    // mark selected visually
    Array.from(suggestionsEl.querySelectorAll('.phrase-item')).forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    selectedSuggestion = item.textContent;
  });

  insertSelected.addEventListener('click', () => {
    if (!selectedSuggestion) { showToast('Select a suggestion first'); return; }
    insertIntoWriter(selectedSuggestion);
  });

  function insertIntoWriter(text) {
    const ta = writerArea;
    // smart insert: if selection present replace; else append with spacing logic
    if (document.activeElement === ta && ta.selectionStart !== ta.selectionEnd) {
      const start = ta.selectionStart, end = ta.selectionEnd;
      ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
      ta.selectionStart = ta.selectionEnd = start + text.length;
    } else {
      const trimmed = ta.value.trim();
      if (!trimmed) ta.value = text;
      else {
        const last = trimmed.slice(-1);
        if (['.', '?', '!', ':'].includes(last)) ta.value = trimmed + ' ' + text;
        else ta.value = trimmed + ' ' + text;
      }
    }
    ta.focus();
  }

  // ---- TOAST (tiny feedback) ----
  let toastTimer = null;
  function showToast(msg) {
    // quick lightweight toast at top-right
    let el = document.getElementById('intuityToast');
    if (!el) {
      el = document.createElement('div'); el.id = 'intuityToast';
      el.style.position = 'fixed'; el.style.top = '18px'; el.style.right = '18px';
      el.style.background = 'rgba(10,10,10,0.9)'; el.style.color = 'var(--beige)';
      el.style.padding = '10px 14px'; el.style.borderRadius = '10px'; el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)';
      el.style.zIndex = 6000; document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 1600);
  }

  // ---- PLACEHOLDERS: LOAD PHRASES (to be implemented when JSON available) ----
  // function loadLevelPhrases(level) {
  //   // Hook: fetch(`samples/${level}-level.json`) and populate suggestions
  //   // Example:
  //   // fetch(`samples/${level}-level.json`).then(r => r.json()).then(data => populateSuggestions(data));
  // }

  // function populateSuggestions(data) {
  //   // data structure expected: { intro:[], body:[], conclusion:[] }
  //   // Render initial 'body' suggestions or per selected subcategory
  // }

  // ---- initial state ----
  renderSuggestionsPlaceholder(currentLevel);
});

