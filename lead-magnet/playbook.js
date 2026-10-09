// Lead Magnet: The Figma Production Architect Playbook & Live Design Audit Matrix
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Audit Checklist Data
  const auditItems = [
    { id: 'AL-01', cat: 'autolayout', title: 'Zero Manual Floating Layers in Components', desc: 'All nested elements rely on Auto Layout frames with explicit direction and padding.', priority: 'critical', done: true },
    { id: 'AL-02', cat: 'autolayout', title: 'Responsive Constraints (Fill vs Hug)', desc: 'Wrapper frames use Fill Container horizontally; inner items set to Hug contents.', priority: 'critical', done: true },
    { id: 'AL-03', cat: 'autolayout', title: 'Min & Max Width Bounds Configured', desc: 'Prevents card components from exploding on ultra-wide screens or breaking on mobile.', priority: 'high', done: false },
    { id: 'AL-04', cat: 'autolayout', title: 'Auto Layout Wrap on Pill/Tag Lists', desc: 'Ensures tag clouds wrap gracefully to the next line without manual row breaks.', priority: 'high', done: true },
    { id: 'AL-05', cat: 'autolayout', title: 'Negative Spacing Applied for Avatars', desc: 'Avatar clusters use negative gap rather than detached absolute positioning.', priority: 'medium', done: false },
    { id: 'TK-01', cat: 'tokens', title: 'Zero Detached Hex Values in Styles', desc: '100% of color fills, strokes, and text values reference bound Figma Variables.', priority: 'critical', done: true },
    { id: 'TK-02', cat: 'tokens', title: 'Semantic Token Layer Configured', desc: 'Raw color primitives (blue-500) aliased to semantic roles (action-primary).', priority: 'high', done: false },
    { id: 'TK-03', cat: 'tokens', title: 'Light & Dark Mode Variable Collections', desc: 'Enables 1-click team switching without duplicating artboards.', priority: 'high', done: true },
    { id: 'TK-04', cat: 'tokens', title: '8pt / 4pt Spacing System Linked', desc: 'Number variables applied to padding, item gaps, and corner radiuses.', priority: 'critical', done: true },
    { id: 'TY-01', cat: 'typography', title: 'Standardized Font Scale with Line Heights', desc: 'Proportional line heights defined to avoid localized text clipping.', priority: 'high', done: false },
    { id: 'TY-02', cat: 'typography', title: 'Auto-Height Resizing on Text Layers', desc: 'Prevents unexpected overflow when text expands during translation.', priority: 'critical', done: true },
    { id: 'CP-01', cat: 'components', title: 'Clean Slash Naming & Component Sets', desc: 'Organized as Category/Component/Variant (e.g. Button/Primary/Default).', priority: 'high', done: true },
    { id: 'CP-02', cat: 'components', title: 'Component Properties (Boolean, Swap, Text)', desc: 'Replaced massive combinatorial variant matrix with modern component props.', priority: 'critical', done: true },
    { id: 'CP-03', cat: 'components', title: 'Complete Interactive States Set', desc: 'Interactive variants: Default, Hover, Focused, Pressed, Disabled.', priority: 'critical', done: false },
    { id: 'A11Y-01', cat: 'a11y', title: 'WCAG 2.1 AA Contrast Ratios (>= 4.5:1)', desc: 'Body text and critical icons verified against background tokens.', priority: 'critical', done: true },
    { id: 'A11Y-02', cat: 'a11y', title: 'Accessible Focus Ring States Designed', desc: 'Visible 3:1+ focus outlines defined for keyboard navigability.', priority: 'critical', done: false },
    { id: 'A11Y-03', cat: 'a11y', title: 'Minimum 44x44px Touch Targets', desc: 'Mobile interactive items have adequate hit areas for fingertips.', priority: 'high', done: true },
    { id: 'DEV-01', cat: 'handoff', title: 'Figma Dev Mode Annotations Added', desc: 'Key measurements, animations, and API data payloads annotated.', priority: 'high', done: false },
    { id: 'DEV-02', cat: 'handoff', title: 'Vector Icons Cleaned & Standardized (24x24)', desc: 'Outlined strokes, unified bounding boxes, and fill-currentColor ready.', priority: 'critical', done: true },
    { id: 'DEV-03', cat: 'handoff', title: 'Token Parity with Codebase (CSS/Tailwind)', desc: 'Design variable names 100% matched to developer tokens in Git.', priority: 'critical', done: true }
  ];

  // Load saved state or default
  const savedState = localStorage.getItem('figma_audit_checklist_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      auditItems.forEach(item => {
        if (typeof parsed[item.id] === 'boolean') {
          item.done = parsed[item.id];
        }
      });
    } catch (e) {
      console.warn('Failed to parse checklist state', e);
    }
  }

  const checklistContainer = document.getElementById('checklistContainer');
  const scoreNumberEl = document.getElementById('scoreNumber');
  const scoreCircle = document.getElementById('scoreCircleProgress');
  const scoreStatusBadge = document.getElementById('scoreStatusBadge');
  const completedCountEl = document.getElementById('completedCount');
  const totalCountEl = document.getElementById('totalCount');

  let activeCategory = 'all';

  function saveChecklistState() {
    const state = {};
    auditItems.forEach(item => { state[item.id] = item.done; });
    localStorage.setItem('figma_audit_checklist_state', JSON.stringify(state));
  }

  function updateScore() {
    const total = auditItems.length;
    const completed = auditItems.filter(i => i.done).length;
    const percent = Math.round((completed / total) * 100);

    if (scoreNumberEl) scoreNumberEl.textContent = `${percent}%`;
    if (completedCountEl) completedCountEl.textContent = completed;
    if (totalCountEl) totalCountEl.textContent = total;

    // SVG stroke dash offset
    // Circumference = 2 * PI * 70 approx 440
    if (scoreCircle) {
      const offset = 440 - (440 * (percent / 100));
      scoreCircle.style.strokeDashoffset = offset;
    }

    if (scoreStatusBadge) {
      if (percent >= 85) {
        scoreStatusBadge.className = 'score-status-badge status-excellent';
        scoreStatusBadge.textContent = 'Production Ready 🚀';
      } else if (percent >= 60) {
        scoreStatusBadge.className = 'score-status-badge status-good';
        scoreStatusBadge.textContent = 'Nearly Ready ⚡';
      } else {
        scoreStatusBadge.className = 'score-status-badge status-needs-work';
        scoreStatusBadge.textContent = 'Needs Review ⚠️';
      }
    }
  }

  function renderChecklist() {
    if (!checklistContainer) return;
    checklistContainer.innerHTML = '';

    const filtered = auditItems.filter(item => {
      if (activeCategory === 'all') return true;
      return item.cat === activeCategory;
    });

    filtered.forEach(item => {
      const el = document.createElement('div');
      el.className = `check-item ${item.done ? 'completed' : ''}`;
      el.dataset.id = item.id;

      const priorityTagClass = `tag-${item.priority}`;

      el.innerHTML = `
        <div class="custom-checkbox">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="check-details">
          <div class="check-title-row">
            <span class="badge-tag ${priorityTagClass}">${item.priority}</span>
            <span class="check-title">${item.title}</span>
            <span style="font-size:0.75rem; color:var(--text-dim); font-family:var(--font-mono);">${item.id}</span>
          </div>
          <div class="check-desc">${item.desc}</div>
        </div>
      `;

      el.addEventListener('click', () => {
        item.done = !item.done;
        el.classList.toggle('completed', item.done);
        saveChecklistState();
        updateScore();
      });

      checklistContainer.appendChild(el);
    });

    updateScore();
  }

  // Filter Chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      renderChecklist();
    });
  });

  // Initial render
  renderChecklist();

  // Export Audit Report
  const exportAuditBtn = document.getElementById('exportAuditBtn');
  if (exportAuditBtn) {
    exportAuditBtn.addEventListener('click', () => {
      const completed = auditItems.filter(i => i.done);
      const pending = auditItems.filter(i => !i.done);
      const pct = Math.round((completed.length / auditItems.length) * 100);

      let markdown = `# Figma Production Readiness Audit Report\n`;
      markdown += `Generated: ${new Date().toLocaleDateString()}\n`;
      markdown += `Overall Score: ${pct}% (${completed.length}/${auditItems.length} items completed)\n\n`;
      
      markdown += `## ✅ Completed Items (${completed.length})\n`;
      completed.forEach(item => {
        markdown += `- [x] **${item.id}**: ${item.title} (${item.priority.toUpperCase()})\n`;
      });

      markdown += `\n## ⚠️ Action Items Remaining (${pending.length})\n`;
      pending.forEach(item => {
        markdown += `- [ ] **${item.id}**: ${item.title} (${item.priority.toUpperCase()}) - ${item.desc}\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `figma-audit-report-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Live Token Generator Tab
  const brandColorInput = document.getElementById('brandColorInput');
  const brandColorPicker = document.getElementById('brandColorPicker');
  const borderRadiusInput = document.getElementById('borderRadiusInput');
  const baseSpacingInput = document.getElementById('baseSpacingInput');
  const codeOutputEl = document.getElementById('tokenCodeOutput');
  const codeTabBtns = document.querySelectorAll('.code-tab-btn');
  const copyCodeBtn = document.getElementById('copyTokenCodeBtn');

  let activeCodeTab = 'tokens-json';

  function syncColors(source) {
    if (source === 'picker' && brandColorInput && brandColorPicker) {
      brandColorInput.value = brandColorPicker.value;
    } else if (source === 'input' && brandColorInput && brandColorPicker) {
      if (/^#[0-9A-Fa-f]{6}$/.test(brandColorInput.value)) {
        brandColorPicker.value = brandColorInput.value;
      }
    }
    updateTokenOutput();
  }

  if (brandColorPicker) brandColorPicker.addEventListener('input', () => syncColors('picker'));
  if (brandColorInput) brandColorInput.addEventListener('input', () => syncColors('input'));
  if (borderRadiusInput) borderRadiusInput.addEventListener('input', updateTokenOutput);
  if (baseSpacingInput) baseSpacingInput.addEventListener('input', updateTokenOutput);

  codeTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      codeTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCodeTab = btn.dataset.lang;
      updateTokenOutput();
    });
  });

  function updateTokenOutput() {
    if (!codeOutputEl) return;
    const brand = brandColorInput ? brandColorInput.value : '#A259FF';
    const radius = borderRadiusInput ? borderRadiusInput.value : '8';
    const baseSpace = baseSpacingInput ? baseSpacingInput.value : '4';

    if (activeCodeTab === 'tokens-json') {
      const obj = {
        "color": {
          "primary": { "value": brand, "type": "color" },
          "surface": { "value": "#18191B", "type": "color" },
          "border": { "value": "#272B3A", "type": "color" },
          "success": { "value": "#0ACF83", "type": "color" }
        },
        "spacing": {
          "base": { "value": `${baseSpace}px`, "type": "spacing" },
          "sm": { "value": `${baseSpace * 2}px`, "type": "spacing" },
          "md": { "value": `${baseSpace * 4}px`, "type": "spacing" },
          "lg": { "value": `${baseSpace * 6}px`, "type": "spacing" },
          "xl": { "value": `${baseSpace * 8}px`, "type": "spacing" }
        },
        "borderRadius": {
          "sm": { "value": `${radius / 2}px`, "type": "borderRadius" },
          "md": { "value": `${radius}px`, "type": "borderRadius" },
          "lg": { "value": `${radius * 2}px`, "type": "borderRadius" }
        }
      };
      codeOutputEl.textContent = JSON.stringify(obj, null, 2);
    } else if (activeCodeTab === 'css-vars') {
      codeOutputEl.textContent = `:root {
  /* Brand & Core Colors */
  --figma-token-primary: ${brand};
  --figma-token-surface: #18191b;
  --figma-token-border: #272b3a;
  --figma-token-success: #0acf83;

  /* Spacing Scale (${baseSpace}pt system) */
  --spacing-base: ${baseSpace}px;
  --spacing-sm: ${baseSpace * 2}px;
  --spacing-md: ${baseSpace * 4}px;
  --spacing-lg: ${baseSpace * 6}px;
  --spacing-xl: ${baseSpace * 8}px;

  /* Border Radii */
  --radius-sm: ${radius / 2}px;
  --radius-md: ${radius}px;
  --radius-lg: ${radius * 2}px;
  --radius-full: 9999px;
}`;
    } else if (activeCodeTab === 'tailwind') {
      codeOutputEl.textContent = `// tailwind.config.js - Figma Design Token Export
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '${brand}',
        surface: '#18191b',
        border: '#272b3a'
      },
      borderRadius: {
        sm: '${radius / 2}px',
        md: '${radius}px',
        lg: '${radius * 2}px'
      },
      spacing: {
        base: '${baseSpace}px',
        sm: '${baseSpace * 2}px',
        md: '${baseSpace * 4}px',
        lg: '${baseSpace * 6}px'
      }
    }
  }
};`;
    }
  }

  updateTokenOutput();

  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      if (!codeOutputEl) return;
      navigator.clipboard.writeText(codeOutputEl.textContent).then(() => {
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = 'Copied! ✅';
        setTimeout(() => { copyCodeBtn.textContent = originalText; }, 2000);
      });
    });
  }

  // Interactive Auto Layout Visualizer
  const layoutAlignBtns = document.querySelectorAll('.layout-align-btn');
  const layoutDemoBox = document.getElementById('layoutDemoContainer');

  if (layoutAlignBtns && layoutDemoBox) {
    layoutAlignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        layoutAlignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.mode;
        
        if (mode === 'hug') {
          layoutDemoBox.style.width = 'fit-content';
          layoutDemoBox.style.flexWrap = 'nowrap';
          layoutDemoBox.style.justifyContent = 'flex-start';
        } else if (mode === 'fill') {
          layoutDemoBox.style.width = '100%';
          layoutDemoBox.style.flexWrap = 'nowrap';
          layoutDemoBox.style.justifyContent = 'space-between';
        } else if (mode === 'wrap') {
          layoutDemoBox.style.width = '240px';
          layoutDemoBox.style.flexWrap = 'wrap';
          layoutDemoBox.style.justifyContent = 'flex-start';
        }
      });
    });
  }
});
