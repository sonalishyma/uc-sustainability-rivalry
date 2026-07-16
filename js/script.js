/* UC Sustainability Rivalry — charts & interactions
   Requires: data.js, Chart.js (UMD) + chartjs-plugin-datalabels, loaded before this file. */

(function () {
  "use strict";

  const ORDER = Object.keys(CAMPUSES).sort((a, b) => RANKS[a].total - RANKS[b].total);
  const css = getComputedStyle(document.documentElement);
  const V = (name) => css.getPropertyValue(name).trim();
  const NAVY = V("--navy"), NAVY2 = V("--navy-2"), GOLD = V("--gold"), GOLD_DARK = V("--gold-dark");
  const MUTED = V("--muted"), LINE = V("--line"), INK = V("--ink");
  const GOOD = V("--good"), WARN = V("--warn"), CRIT = V("--crit");

  Chart.defaults.font.family = "Archivo, system-ui, sans-serif";
  Chart.defaults.color = INK;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = NAVY;
  Chart.defaults.plugins.tooltip.titleColor = GOLD;
  Chart.defaults.plugins.tooltip.bodyColor = "#fff";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
  Chart.defaults.plugins.tooltip.displayColors = false;

  /* ---------- color helpers ---------- */
  function hex2rgb(h) {
    h = h.replace("#", "");
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function mix(c1, c2, t) {
    const a = hex2rgb(c1), b = hex2rgb(c2);
    return `rgb(${lerp(a[0], b[0], t)},${lerp(a[1], b[1], t)},${lerp(a[2], b[2], t)})`;
  }
  /* rank 1 (best) -> good, rank 5 -> warn, rank 9 (worst) -> crit */
  function rankColor(rank) {
    if (rank <= 5) return mix(GOOD, WARN, (rank - 1) / 4);
    return mix(WARN, CRIT, (rank - 5) / 4);
  }

  /* ---------- tooltip (shared floating element, used by the grid) ---------- */
  const tip = document.getElementById("tip");
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.style.opacity = 1;
    const r = tip.getBoundingClientRect();
    let left = x + 14, top = y + 14;
    if (left + r.width > window.innerWidth - 10) left = x - r.width - 14;
    if (top + r.height > window.innerHeight - 10) top = y - r.height - 14;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  }
  function hideTip() { tip.style.opacity = 0; }

  /* ================= STANDINGS — Chart.js horizontal bar ================= */
  function buildStandings() {
    const ctx = document.getElementById("standingsChart");
    const labels = ORDER.map((k) => CAMPUSES[k].name);
    const totals = ORDER.map((k) => RANKS[k].total);
    const colors = ORDER.map((k) => (CAMPUSES[k].home ? GOLD : NAVY2));

    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: totals,
          backgroundColor: colors,
          borderRadius: 5,
          maxBarThickness: 22,
          categoryPercentage: 0.7,
          barPercentage: 0.85,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        layout: { padding: { left: 6, right: 34 } },
        scales: {
          x: { min: 0, max: 50, grid: { color: LINE }, ticks: { stepSize: 10 } },
          y: { grid: { display: false }, ticks: { font: { weight: 700, family: "Archivo" }, color: NAVY } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (item) => `Total score: ${item.raw}  (lower = better; a perfect score is 7)`,
            },
          },
          datalabels: {
            anchor: "end", align: "right", color: NAVY, font: { weight: 700, size: 12 },
            formatter: (v) => v,
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  }

  /* ================= THE GRID — custom heatmap table ================= */
  function buildGrid() {
    const tbody = document.getElementById("gridBody");
    let rows = "";
    ORDER.forEach((k) => {
      const r = RANKS[k];
      rows += `<tr><td class="camp" data-camp="${k}">${badgeHTML(k, "sm")}${CAMPUSES[k].name} <span style="color:var(--faint)">(${r.total})</span></td>`;
      METRICS.forEach((m) => {
        rows += `<td tabindex="0" style="background:${rankColor(r[m.key])}" data-camp="${k}" data-m="${m.key}">${r[m.key]}</td>`;
      });
      rows += `<td class="tot">${r.total}</td></tr>`;
    });
    tbody.innerHTML = rows;

    document.querySelectorAll("table.grid td[data-m]").forEach((cell) => {
      cell.addEventListener("mouseenter", (e) => cellTip(e, cell));
      cell.addEventListener("focus", (e) => cellTip(e, cell));
      cell.addEventListener("mouseleave", hideTip);
      cell.addEventListener("blur", hideTip);
      cell.addEventListener("mousemove", (e) => positionTip(e));
    });
    document.querySelectorAll("table.grid td.camp").forEach((cell) => {
      cell.addEventListener("click", () => selectCampus(cell.dataset.camp, true));
    });
  }
  function positionTip(e) { tip.style.left = (e.clientX + 14) + "px"; tip.style.top = (e.clientY + 14) + "px"; }
  function cellTip(e, cell) {
    const camp = cell.dataset.camp, m = cell.dataset.m, rank = RANKS[camp][m];
    const detail = rawDetail(camp, m);
    showTip(`<div class="t">${CAMPUSES[camp].name} — ${METRICS.find(x=>x.key===m).label}</div>Rank #${rank} of 9 · ${detail}`, e.clientX, e.clientY);
  }
  function rawDetail(camp, m) {
    const r = RAW[m][camp];
    switch (m) {
      case "buildings": return `weighted score ${r.score} (${r.platinum}P / ${r.gold}G / ${r.silver}S / ${r.certified}C, ${r.total} buildings)`;
      case "emissions": return `composite intensity score ${r.score.toFixed(1)} (scope 1–3: ${r.scope.toLocaleString()}, renewables: ${r.renewable.toLocaleString()}, ${r.acres.toLocaleString()} acres)`;
      case "eui": { const d = r.actual - r.target; return `target ${r.target} → actual ${r.actual} (${d > 0 ? "+" : ""}${d} vs goal)`; }
      case "water": return `goal ${r.goal.toLocaleString()} → actual ${r.actual.toLocaleString()} gal/capita${r.approx ? " (goal approximated)" : ""}`;
      case "curriculum": return `STARS curriculum score ${(r * 100).toFixed(1)}%`;
      case "air": return `STARS air & climate ${(r * 100).toFixed(1)}% of possible`;
      case "waste": return `STARS waste score ${(r * 100).toFixed(1)}%`;
    }
  }
  document.querySelectorAll("table.grid th[data-desc]").forEach((th) => {
    th.addEventListener("mouseenter", (e) => showTip(`<div class="t">${th.textContent}</div>${th.dataset.desc}`, e.clientX, e.clientY));
    th.addEventListener("mousemove", positionTip);
    th.addEventListener("mouseleave", hideTip);
  });

  /* ================= CAMPUS PROFILES — Chart.js radar ================= */
  let radarChart;
  function avgScore(mKey) {
    const vals = ORDER.map((k) => 10 - RANKS[k][mKey]);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function buildProfileChips() {
    const wrap = document.getElementById("chips");
    wrap.innerHTML = ORDER.map((k) =>
      `<button class="chip${k === "UCSD" ? " homechip" : ""}" aria-pressed="false" data-id="${k}">${badgeHTML(k, "sm")}${k}</button>`
    ).join("");
    wrap.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => selectCampus(b.dataset.id, false)));
  }
  function selectCampus(id, scrollTo) {
    document.querySelectorAll("#chips .chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    renderProfile(id);
    if (scrollTo) document.getElementById("campus").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderProfile(id) {
    const r = RANKS[id];
    document.getElementById("profileName").innerHTML = badgeHTML(id, "lg") + CAMPUSES[id].name;
    document.getElementById("profileSub").textContent = `${r.total} points · #${ORDER.indexOf(id) + 1} overall of 9`;

    const rows = METRICS.map((m) => {
      const rank = r[m.key];
      const pct = ((9 - rank + 1) / 9) * 100;
      return `<div class="mrow">
        <div class="lab">${m.label}<small>${rawDetail(id, m.key)}</small></div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${rankColor(rank)}"></div></div>
        <div class="rk">#${rank}</div>
      </div>`;
    }).join("");
    document.getElementById("profileRows").innerHTML = rows;

    const campusData = METRICS.map((m) => 10 - r[m.key]);
    const avgData = METRICS.map((m) => avgScore(m.key));
    if (radarChart) {
      radarChart.data.datasets[0].data = campusData;
      radarChart.data.datasets[0].label = CAMPUSES[id].name;
      radarChart.update();
    } else {
      radarChart = new Chart(document.getElementById("radarChart"), {
        type: "radar",
        data: {
          labels: METRICS.map((m) => m.short),
          datasets: [
            {
              label: CAMPUSES[id].name,
              data: campusData,
              borderColor: NAVY2, backgroundColor: "rgba(31,58,102,.14)",
              borderWidth: 2, pointRadius: 4, pointBackgroundColor: NAVY2,
            },
            {
              label: "9-campus average",
              data: avgData,
              borderColor: MUTED, backgroundColor: "rgba(93,110,136,.08)",
              borderWidth: 2, borderDash: [4, 3], pointRadius: 3, pointBackgroundColor: MUTED,
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: {
            r: {
              min: 0, max: 9, ticks: { display: false, stepSize: 3 },
              grid: { color: LINE }, angleLines: { color: LINE },
              pointLabels: { font: { size: 11, weight: 700 }, color: MUTED },
            },
          },
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
            tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${item.raw.toFixed(1)} / 9 (higher = better rank)` } },
          },
        },
      });
    }
  }

  /* ================= TARGETS deep-dive — diverging bars ================= */
  const TG = {
    eui: {
      title: "Percent over (+) or under (−) each campus's own energy-use-intensity target.",
      values: ORDER.slice()
        .map((k) => ({ k, pct: ((RAW.eui[k].actual - RAW.eui[k].target) / RAW.eui[k].target) * 100 }))
        .sort((a, b) => a.pct - b.pct),
    },
    water: {
      title: "Percent over (+) or under (−) each campus's own 2025 water-use goal (gallons per capita).",
      values: ORDER.slice().sort((a, b) => (RAW.water[a].diff / RAW.water[a].goal) - (RAW.water[b].diff / RAW.water[b].goal))
        .map((k) => ({ k, pct: (RAW.water[k].diff / RAW.water[k].goal) * 100 })),
    },
    emissions: {
      title: "Composite emissions-intensity score — (Scope 1–3 emissions − renewable energy use) per acre. Below zero means renewables outweigh the emissions term.",
      values: ORDER.slice().sort((a, b) => RAW.emissions[a].score - RAW.emissions[b].score)
        .map((k) => ({ k, pct: RAW.emissions[k].score })),
    },
  };
  function renderDvg(which) {
    const set = TG[which];
    const maxAbs = Math.max(...set.values.map((v) => Math.abs(v.pct)), 1);
    const rows = set.values.map((v) => {
      const half = Math.max(1.2, Math.min(50, (Math.abs(v.pct) / maxAbs) * 50));
      const isNeg = v.pct < 0;
      const left = isNeg ? 50 - half : 50;
      const color = isNeg ? GOOD : CRIT;
      const label = which === "emissions" ? v.pct.toFixed(1) : `${v.pct > 0 ? "+" : ""}${v.pct.toFixed(0)}%`;
      /* label rides inside the pill (white) only once the pill is wide enough to hold
         it with room to spare; short pills near the zero line put the label outside
         in ink text instead, so it's never clipped or squashed against the axis. */
      const fitsInside = half >= 11;
      let labelStyle, labelClass = "seglabel";
      if (fitsInside) {
        labelClass += " inside";
        labelStyle = isNeg
          ? `left:${left}%; width:${half}%; justify-content:flex-start; padding-left:8px; color:#fff;`
          : `left:${left}%; width:${half}%; justify-content:flex-end; padding-right:8px; color:#fff;`;
      } else {
        labelStyle = isNeg
          ? `left:${left}%; transform:translateX(-100%); padding-right:8px; justify-content:flex-end;`
          : `left:${left + half}%; padding-left:8px; justify-content:flex-start;`;
      }
      return `<div class="drow"><div class="nm">${CAMPUSES[v.k].name}</div>
        <div class="axis"><div class="zero"></div>
          <div class="seg" style="left:${left}%;width:${half}%;background:${color}"></div>
          <div class="${labelClass}" style="${labelStyle}">${label}</div>
        </div></div>`;
    }).join("");
    document.getElementById("dvg").innerHTML = rows;
    document.getElementById("dnote").textContent = set.title;
  }
  function buildToggle() {
    const btns = { eui: document.getElementById("tgEUI"), water: document.getElementById("tgWater"), emissions: document.getElementById("tgEmissions") };
    Object.entries(btns).forEach(([key, btn]) => {
      btn.addEventListener("click", () => {
        Object.values(btns).forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        renderDvg(key);
      });
    });
    renderDvg("eui");
  }

  /* ================= LEED — Chart.js stacked horizontal bar ================= */
  function buildLeed() {
    const order = Object.keys(RAW.buildings).sort((a, b) => RAW.buildings[b].score - RAW.buildings[a].score);
    const labels = order.map((k) => CAMPUSES[k].name);
    const mk = (key) => order.map((k) => RAW.buildings[k][key]);
    new Chart(document.getElementById("leedChart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Platinum", data: mk("platinum"), backgroundColor: NAVY2 },
          { label: "Gold", data: mk("gold"), backgroundColor: GOLD },
          { label: "Silver", data: mk("silver"), backgroundColor: "#B9C4CE" },
          { label: "Certified", data: mk("certified"), backgroundColor: "#DCE6EF" },
        ].map((d) => ({ ...d, maxBarThickness: 22, borderWidth: 0, borderSkipped: false })),
      },
      options: {
        indexAxis: "y",
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { stacked: true, grid: { color: LINE } },
          y: { stacked: true, grid: { display: false }, ticks: { font: { weight: 700 }, color: NAVY } },
        },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } },
          tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${item.raw} buildings` } },
        },
      },
    });
  }

  /* ================= scroll reveal ================= */
  function buildReveal() {
    const els = document.querySelectorAll(".rev");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  /* ================= init ================= */
  function init() {
    buildStandings();
    buildGrid();
    buildProfileChips();
    selectCampus("UCSD", false);
    buildToggle();
    buildLeed();
    buildReveal();
  }
  document.addEventListener("DOMContentLoaded", () => {
    /* wait for Archivo to finish loading first — otherwise Chart.js measures
       y-axis label widths against the fallback system font and clips the
       real glyphs once the webfont swaps in. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }
  });
})();
