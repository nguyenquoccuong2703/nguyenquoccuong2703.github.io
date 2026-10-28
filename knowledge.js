(function () {
  const cur = document.querySelector('.ktabs [aria-current]');
  if (cur) { const bar = cur.parentElement; bar.scrollLeft = cur.offsetLeft - (bar.clientWidth - cur.clientWidth) / 2; }
  const REPO = 'nguyenquoccuong2703/nguyenquoccuong2703.github.io';
  const hidden = /^(index\.json|readme\.md|\.gitkeep)$/i;
  const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
  const prettify = n => n.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, c => c.toUpperCase());
  const size = b => b > 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';

  async function load(folder) {
    const dir = 'knowledge/' + folder;
    let meta = {};
    try { const r = await fetch(dir + '/index.json', { cache: 'no-store' }); if (r.ok) meta = (await r.json()).files || {}; } catch (e) {}
    let files;
    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${dir}`);
      if (!r.ok) throw new Error(r.status);
      files = (await r.json()).filter(f => f.type === 'file' && !hidden.test(f.name));
    } catch (e) {
      files = Object.keys(meta).filter(n => n !== 'example-file-name.pdf').map(name => ({ name, size: 0 }));
    }
    return files.map(f => {
      const m = meta[f.name] || {};
      return { name: f.name, path: dir + '/' + encodeURIComponent(f.name), ext: (f.name.split('.').pop() || 'file').toUpperCase().slice(0, 4),
               size: f.size, title: m.title || prettify(f.name), desc: m.description || '', date: m.date || '' };
    }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
  }

  const list = document.getElementById('docs');
  if (list) {
    load(list.dataset.folder).then(docs => {
      if (!docs.length) { list.innerHTML = '<li class="empty">New files for this topic are on the way. Check back soon.</li>'; return; }
      list.innerHTML = docs.map(d => `
        <li class="doc">
          <span class="type">${esc(d.ext)}</span>
          <div><h2>${esc(d.title)}</h2><p>${[d.desc, d.date, d.size ? size(d.size) : ''].filter(Boolean).map(esc).join(', ')}</p></div>
          ${d.ext === 'HTML' ? `<a class="open-doc" href="${d.path}">Read article</a>` : `<a class="open-doc" href="${d.path}" target="_blank" rel="noopener">Open file</a>`}
        </li>`).join('');
    });
  }
  document.querySelectorAll('[data-count]').forEach(el => {
    load(el.dataset.count).then(docs => { el.textContent = docs.length ? docs.length + (docs.length === 1 ? ' file' : ' files') : 'Coming soon'; });
  });
})();
