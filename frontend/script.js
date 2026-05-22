const API = "https://aipetscommunity-2.onrender.com";


// ─── File Preview ───
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('fileNameDisplay').textContent = file.name;
  document.querySelector('.upload-zone').classList.add('has-file');
  document.querySelector('.upload-text').textContent = 'File Loaded';

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('preview-img').src = ev.target.result;
      document.getElementById('preview-wrap').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('preview-wrap').classList.add('hidden');
  }
});

// ─── Analyze ───
async function analyzeImage() {
  const file = document.getElementById('fileInput').files[0];
  const description = document.getElementById('textInput').value.trim();
  const errEl = document.getElementById('error-msg');

  errEl.classList.add('hidden');
  errEl.textContent = '';

  if (!file && !description) {
    errEl.textContent = 'Please provide an image asset or explicit structural symptoms description.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  document.getElementById('loading').classList.remove('hidden');

  const formData = new FormData();
  if (file) formData.append('file', file);
  if (description) formData.append('description', description);

  try {
    const res = await fetch(`${API}/analyze`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`Server execution error status: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showResult(data);
  } catch (err) {
    document.getElementById('loading').classList.add('hidden');
    btn.disabled = false;
    errEl.textContent = err.message.includes('Failed to fetch')
      ? 'Unable to communicate with host server backend pipeline.'
      : `Error: ${err.message}`;
    errEl.classList.remove('hidden');
  }
}

// ─── Render Evaluation Result ───
function showResult(d) {
  document.getElementById('loading').classList.add('hidden');
  document.getElementById('upload-page').classList.add('hidden');
  document.getElementById('result-page').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const score = typeof d.score === 'number' ? d.score : 70;
  const urgency = d.urgency || 'Monitor condition at home';
  const observations = Array.isArray(d.observations) ? d.observations : [];
  const conditions = Array.isArray(d.conditions) ? d.conditions : [];
  const analysis = d.analysis || '';
  const recommendation = d.recommendation || 'No critical issues noted.';
  const disclaimer = d.disclaimer || 'Diagnostic assessment provided by automated AI processing system components.';
  const animal = d.animal || 'pet';

  const urgencyLower = urgency.toLowerCase();
  let urgencyClass = 'ok', urgencyIcon = '✔';
  if (urgencyLower.includes('urgent')) { urgencyClass = 'danger'; urgencyIcon = '⚠'; }
  else if (urgencyLower.includes('soon'))  { urgencyClass = 'warn';   urgencyIcon = '⚡'; }

  const likelihoodRank = { high: 3, medium: 2, low: 1 };
  const worstLikelihood = conditions.reduce((worst, c) => {
    const rank = likelihoodRank[(c.likelihood || 'low').toLowerCase()] || 1;
    return Math.max(worst, rank);
  }, 0);

  let scoreColor, scoreStatus;
  if (urgencyLower.includes('urgent') || worstLikelihood === 3) {
    scoreColor  = '#ef4444';
    scoreStatus = 'Needs Urgent Attention';
  } else if (urgencyLower.includes('soon') || worstLikelihood === 2) {
    scoreColor  = '#f59e0b';
    scoreStatus = 'Requires Evaluation';
  } else {
    scoreColor  = '#00ff00'; // Pure premium green matching logo.jpg
    scoreStatus = 'Optimal Health';
  }

  const obsHTML = observations.length
    ? `<div class="obs-section">
        <div class="section-label">Identified Anomalies</div>
        <div class="obs-grid">
          ${observations.map(o => `<span class="obs-chip ${o.type || 'ok'}"><span class="dot"></span>${o.label}</span>`).join('')}
        </div>
      </div>`
    : '';

  const condHTML = conditions.length
    ? `<div class="section-label" style="margin-bottom:12px;">Detected Clinical Pathology</div>
       ${conditions.map(c => {
          const lk = (c.likelihood || 'low').toLowerCase();
          return `
          <div class="condition-card">
            <div class="condition-head">
              <div class="condition-name">${escHtml(c.name || 'Unknown Condition')}</div>
              <span class="likelihood-badge ${lk}">${lk} probability</span>
            </div>
            <div class="condition-body">
              ${c.what_is_it ? `<div class="condition-row"><div class="condition-row-label">Clinical Definition</div><div class="condition-row-val">${escHtml(c.what_is_it)}</div></div>` : ''}
              ${c.why_happens ? `<div class="condition-row"><div class="condition-row-label">Etiology & Triggers</div><div class="condition-row-val">${escHtml(c.why_happens)}</div></div>` : ''}
              ${c.warning ? `<div class="condition-row"><div class="condition-row-label" style="color:#ef4444;">⚠ Critical Contraindications</div><div class="condition-row-val" style="color:#f87171;">${escHtml(c.warning)}</div></div>` : ''}
              
              ${(c.medicines && c.medicines.length) ? `<div class="condition-row"><div class="condition-row-label">Recommended Pharmacology</div><div class="condition-row-val">
                  ${c.medicines.map(m => `<div style="margin-bottom:6px; padding:10px; background:rgba(255,255,255,0.01); border-radius:8px; border:1px solid var(--border);"><div style="font-weight:700; font-size:13px; color:#fff;">${escHtml(m.name)}</div><div style="font-size:12px; color:#71717a; margin-top:2px;">${escHtml(m.type || 'Therapeutic')} · ${escHtml(m.dispensing || 'As directed')}</div></div>`).join('')}
              </div></div>` : ''}

              ${(c.topical_treatments && c.topical_treatments.length) ? `<div class="condition-row"><div class="condition-row-label">Topical Treatments / Supplements</div><div class="condition-row-val">
                  ${c.topical_treatments.map(t => `<div style="display:flex; align-items:center; justify-content:between; gap:12px; margin-bottom:8px; padding:10px; background:rgba(255,255,255,0.01); border-radius:8px; border:1px solid var(--border);">${t.image_url ? `<img src="${escHtml(t.image_url)}" style="width:40px; height:40px; object-fit:contain; border-radius:4px;">` : ''}<div style="flex:1;"><div style="font-weight:700; font-size:13px; color:#fff;">${escHtml(t.name)}</div></div>${t.buy_link ? `<a href="${escHtml(t.buy_link)}" target="_blank" style="color:var(--green); text-decoration:none; font-size:12px; font-weight:600; background:rgba(0,255,0,0.05); padding:4px 8px; border-radius:4px; border:1px solid rgba(0,255,0,0.15)">Source ↗</a>` : ''}</div>`).join('')}
              </div></div>` : ''}
              
              ${c.see_vet ? `<div class="vet-flag">⚠ Veterinary Practitioner Action Required</div>` : ''}
            </div>
          </div>`;
       }).join('')}`
    : `<div class="condition-card" style="padding:20px; font-size:14px; color:#a1a1aa;">✔ No significant structural dermatology issues detected. Your ${animal} presents baseline vital symmetry.</div>`;

  const r = 38, cx = 45, cy = 45, circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  document.getElementById('result-content').innerHTML = `
    <div class="score-section">
      <div class="score-ring-wrap">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="6"/>
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${scoreColor}" stroke-width="6" stroke-dasharray="${filled} ${circ}" stroke-dashoffset="${circ / 4}" stroke-linecap="round"/>
        </svg>
        <div class="score-num">
          <span class="score-big" style="color:${scoreColor}">${score}</span>
          <span class="score-label">INDEX</span>
        </div>
      </div>
      <div class="score-meta">
        <h3>${scoreStatus}</h3>
        <p>${analysis || `Morphology scan complete for patient system.`}</p>
        <div class="urgency-badge ${urgencyClass}">${urgencyIcon} ${urgency}</div>
      </div>
    </div>
    ${obsHTML}
    ${condHTML}
    <div class="rec-box"><div class="rec-title">Clinical Recommendation</div><p>${escHtml(recommendation)}</p></div>
    <div class="disclaimer">${escHtml(disclaimer)}</div>
  `;
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

