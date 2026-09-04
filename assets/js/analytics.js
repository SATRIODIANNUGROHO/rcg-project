/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v8.0
 * Module: Analytics Engine, Double Donut & Weekly Charts
 * Includes: Dual Period Metrics, Standardized 26-Jul-2026 Weekly Intervals,
 * Mutu K1/K2 Distribution, and Double Donut Chart (Kabupaten & Desa).
 */

const AnalyticsManager = {
  chartWeekly: null,
  chartK1K2: null,
  chartOrigin: null,

  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const periodSelect = document.getElementById('analytics-period-select');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        const customWrap = document.getElementById('analytics-custom-date-wrap');
        if (customWrap) {
          customWrap.style.setProperty('display', e.target.value === 'custom' ? 'flex' : 'none', 'important');
        }
        this.renderPeriodAnalysis();
      });
    }

    const btnPeriodShow = document.getElementById('btn-analytics-period-show');
    if (btnPeriodShow) {
      btnPeriodShow.addEventListener('click', () => {
        this.renderPeriodAnalysis();
      });
    }

    const btnFilterWeek = document.getElementById('btn-filter-week-chart');
    if (btnFilterWeek) {
      btnFilterWeek.addEventListener('click', () => {
        this.renderWeeklyChart();
      });
    }
  },

  getThemeColors() {
    const isDark = document.body.classList.contains('dark-mode') || document.documentElement.classList.contains('dark-mode');
    const colors = {
      isDark,
      textColor: isDark ? '#F5F7FA' : '#0F172A',
      mutedColor: isDark ? '#AAB4C3' : '#64748B',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      borderColor: isDark ? '#16243A' : '#FFFFFF',
      k1Color: isDark ? '#38BDF8' : '#2563B8',
      k2Color: isDark ? '#FBBF24' : '#D69E2E',
      kabPalette: isDark
        ? ['#3671C6', '#D97706', '#059669', '#7C3AED', '#DC2626']
        : ['#163A5F', '#D69E2E', '#1F7A5A', '#6D28D9', '#C05621'],
      desaPalette: isDark
        ? ['#60A5FA', '#93C5FD', '#FCD34D', '#FDE68A', '#6EE7B7', '#A7F3D0', '#C4B5FD', '#FCA5A5']
        : ['#2563B8', '#60A5FA', '#E6A817', '#FBBF24', '#2D9D78', '#5EEAD4', '#8B5CF6', '#F87171']
    };

    const ChartClass = window.Chart || (typeof Chart !== 'undefined' ? Chart : null);
    if (ChartClass && ChartClass.defaults) {
      ChartClass.defaults.color = colors.textColor;
      if (ChartClass.defaults.font) {
        ChartClass.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
      }
    }

    return colors;
  },

  render() {
    const txs = StorageManager.getTransactions();

    // 1. Core Summary Stats
    const totalCount = txs.length;
    let totalNetWeight = 0;
    let totalK1Weight = 0;
    let totalK2Weight = 0;
    let totalGrandTotal = 0;
    let totalK1Total = 0;
    let totalK2Total = 0;

    let lunasCount = 0;
    let lunasTotal = 0;
    let belumLunasCount = 0;
    let belumLunasTotal = 0;

    const supplierMap = {};
    const materialMap = {};
    const originMap = {};

    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let todayCount = 0;
    let yesterdayCount = 0;

    txs.forEach(t => {
      const net = t.finalNetWeight || 0;
      const k1W = t.k1Weight || 0;
      const k2W = t.k2Weight || 0;
      const grand = t.grandTotal || 0;

      totalNetWeight += net;
      totalK1Weight += k1W;
      totalK2Weight += k2W;
      totalGrandTotal += grand;
      totalK1Total += (t.k1Total || 0);
      totalK2Total += (t.k2Total || 0);

      // Payment Breakdown
      if (t.paymentStatus === 'Lunas') {
        lunasCount++;
        lunasTotal += grand;
      } else {
        belumLunasCount++;
        belumLunasTotal += grand;
      }

      // Today vs Yesterday
      if (t.date === todayStr) todayCount++;
      if (t.date === yesterdayStr) yesterdayCount++;

      // Maps for Top aggregations
      if (t.supplier) supplierMap[t.supplier] = (supplierMap[t.supplier] || 0) + net;
      if (t.material) materialMap[t.material] = (materialMap[t.material] || 0) + net;
      const originKey = `${t.originRegion || 'Lainnya'} (${t.originArea || '-'})`;
      originMap[originKey] = (originMap[originKey] || 0) + net;
    });

    // Populate Top Cards
    const elTotalTx = document.getElementById('stat-total-tx');
    if (elTotalTx) elTotalTx.textContent = totalCount.toLocaleString('id-ID');

    const elTotalNet = document.getElementById('stat-total-net');
    if (elTotalNet) elTotalNet.textContent = `${totalNetWeight.toLocaleString('id-ID')} Kg`;

    const elK1Weight = document.getElementById('stat-k1-weight');
    if (elK1Weight) elK1Weight.textContent = `${totalK1Weight.toLocaleString('id-ID')} Kg`;

    const elK2Weight = document.getElementById('stat-k2-weight');
    if (elK2Weight) elK2Weight.textContent = `${totalK2Weight.toLocaleString('id-ID')} Kg`;

    const elTotalPay = document.getElementById('stat-total-pay');
    if (elTotalPay) elTotalPay.textContent = `Rp ${totalGrandTotal.toLocaleString('id-ID')}`;

    const elK1Pay = document.getElementById('stat-k1-pay');
    if (elK1Pay) elK1Pay.textContent = `Rp ${totalK1Total.toLocaleString('id-ID')}`;

    const elK2Pay = document.getElementById('stat-k2-pay');
    if (elK2Pay) elK2Pay.textContent = `Rp ${totalK2Total.toLocaleString('id-ID')}`;

    // Today Transactions Card
    const elTodayTx = document.getElementById('stat-today-tx');
    const elTodayTrend = document.getElementById('stat-today-trend');
    if (elTodayTx) elTodayTx.textContent = `${todayCount} Transaksi Hari Ini`;
    if (elTodayTrend) {
      if (yesterdayCount === 0) {
        elTodayTrend.textContent = todayCount > 0 ? '+100% dari kemarin' : '— 0% Belum ada data kemarin';
      } else {
        const diff = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
        elTodayTrend.textContent = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}% vs kemarin (${yesterdayCount} TRX)`;
      }
    }

    // Top Analytics Cards
    this.renderTopItem('stat-top-supplier', supplierMap);
    this.renderTopItem('stat-top-material', materialMap);
    this.renderTopItem('stat-top-origin', originMap);

    const elAvgWeight = document.getElementById('stat-avg-weight');
    if (elAvgWeight) {
      const avg = totalCount > 0 ? Math.round(totalNetWeight / totalCount) : 0;
      elAvgWeight.textContent = `Berat Rata-rata: ${avg.toLocaleString('id-ID')} Kg`;
    }

    const elLunas = document.getElementById('stat-pay-lunas');
    if (elLunas) elLunas.innerHTML = `<strong>${lunasCount} TRX</strong> (Rp ${lunasTotal.toLocaleString('id-ID')})`;

    const elBelumLunas = document.getElementById('stat-pay-belum-lunas');
    if (elBelumLunas) elBelumLunas.innerHTML = `<strong>${belumLunasCount} TRX</strong> (Rp ${belumLunasTotal.toLocaleString('id-ID')})`;

    // Period Analysis Banner (Berat Bersih & Pembayaran Periode)
    this.renderPeriodAnalysis();

    // Render Charts
    this.renderCharts(txs, totalK1Weight, totalK2Weight);
  },

  renderTopItem(elemId, dataMap) {
    const el = document.getElementById(elemId);
    if (!el) return;

    let topName = '-';
    let topVal = 0;

    Object.entries(dataMap).forEach(([name, val]) => {
      if (val > topVal) {
        topVal = val;
        topName = name;
      }
    });

    if (topVal > 0) {
      el.innerHTML = `<strong>${topName}</strong> <br><span class="mono-num text-small" style="color: var(--primary);">(${topVal.toLocaleString('id-ID')} Kg)</span>`;
    } else {
      el.innerHTML = `- <br><span class="mono-num text-small" style="color: var(--text-muted);">(0 Kg)</span>`;
    }
  },

  renderPeriodAnalysis() {
    const periodSelect = document.getElementById('analytics-period-select');
    const filter = periodSelect ? periodSelect.value : 'today';
    const txs = StorageManager.getTransactions();

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    let periodTxs = [];
    let periodLabel = '';

    if (filter === 'today') {
      periodTxs = txs.filter(t => t.date === todayStr);
      periodLabel = `Hari ini (${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()})`;
    } else if (filter === '7days') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      const past7Str = past7.toISOString().slice(0, 10);
      periodTxs = txs.filter(t => t.date >= past7Str && t.date <= todayStr);
      periodLabel = `7 Hari Terakhir (${past7Str} s/d ${todayStr})`;
    } else if (filter === '30days') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      const past30Str = past30.toISOString().slice(0, 10);
      periodTxs = txs.filter(t => t.date >= past30Str && t.date <= todayStr);
      periodLabel = `30 Hari Terakhir (${past30Str} s/d ${todayStr})`;
    } else if (filter === 'month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      periodTxs = txs.filter(t => t.date && t.date.startsWith(monthPrefix));
      periodLabel = `Bulan ini (${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })})`;
    } else if (filter === 'custom') {
      const start = document.getElementById('analytics-date-start')?.value || '2020-01-01';
      const end = document.getElementById('analytics-date-end')?.value || '2099-12-31';
      periodTxs = txs.filter(t => t.date >= start && t.date <= end);
      periodLabel = `Rentang kustom (${start} s/d ${end})`;
    } else {
      periodTxs = txs;
      periodLabel = `Seluruh waktu tercatat`;
    }

    const totalWeight = periodTxs.reduce((sum, t) => sum + (t.finalNetWeight || 0), 0);
    const totalPayment = periodTxs.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
    const count = periodTxs.length;

    // 1. Berat Bersih Periode
    const elWeight = document.getElementById('period-net-weight');
    const elWeightSub = document.getElementById('period-net-sub');
    if (elWeight) elWeight.textContent = `${totalWeight.toLocaleString('id-ID')} Kg`;
    if (elWeightSub) elWeightSub.textContent = `Total berat bersih ${periodLabel} • ${count} transaksi`;

    // 2. Pembayaran Periode
    const elPayment = document.getElementById('period-payment-total');
    const elPaymentSub = document.getElementById('period-payment-sub');
    if (elPayment) elPayment.textContent = `Rp ${totalPayment.toLocaleString('id-ID')}`;
    if (elPaymentSub) elPaymentSub.textContent = `Total nilai pembayaran ${periodLabel} • ${count} transaksi`;
  },

  renderCharts(txs, totalK1, totalK2) {
    const ChartClass = window.Chart || (typeof Chart !== 'undefined' ? Chart : null);
    if (!ChartClass) {
      console.warn('Chart.js library is not available');
      return;
    }
    const theme = this.getThemeColors();

    // 1. Weekly Transactions Bar Chart (Mulai 26 Juli 2026)
    try {
      this.renderWeeklyChart(txs);
    } catch (e) {
      console.error('Error rendering weekly chart:', e);
    }

    // 2. K1 vs K2 Doughnut Chart ("Komposisi Mutu Garam K1 dan Garam K2")
    try {
      const ctxK1K2 = document.getElementById('chart-k1-k2');
      if (ctxK1K2) {
        if (this.chartK1K2) this.chartK1K2.destroy();
        this.chartK1K2 = new ChartClass(ctxK1K2, {
          type: 'doughnut',
          data: {
            labels: ['Garam K1', 'Garam K2'],
            datasets: [{
              data: [totalK1 || 1, totalK2 || 0],
              backgroundColor: [theme.k1Color, theme.k2Color],
              borderColor: theme.borderColor,
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: theme.textColor,
                  font: { size: 12, family: "'Plus Jakarta Sans', sans-serif" },
                  padding: 14
                }
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.label}: ${ctx.raw.toLocaleString('id-ID')} Kg`
                }
              }
            }
          }
        });
      }
    } catch (e) {
      console.error('Error rendering K1/K2 chart:', e);
    }

    // 3. Sebaran Asal Garam: Double Donut Chart (Kabupaten & Desa)
    try {
      this.renderDoubleDonutOriginChart(txs);
    } catch (e) {
      console.error('Error rendering origin chart:', e);
    }
  },

  renderWeeklyChart(passedTxs = null) {
    const ctx = document.getElementById('chart-weekly');
    const ChartClass = window.Chart || (typeof Chart !== 'undefined' ? Chart : null);
    if (!ctx || !ChartClass) return;

    const theme = this.getThemeColors();
    const txs = passedTxs || StorageManager.getTransactions();

    const weekStartInput = document.getElementById('chart-week-start');
    const weekEndInput = document.getElementById('chart-week-end');
    const startW = parseInt(weekStartInput ? weekStartInput.value : 1, 10) || 1;
    const endW = parseInt(weekEndInput ? weekEndInput.value : 6, 10) || 6;

    const baseDate = new Date('2026-07-26T00:00:00');

    const labels = [];
    const datasetTonnage = [];
    const datasetTrxCount = [];

    for (let w = startW; w <= endW; w++) {
      const wStartDate = new Date(baseDate);
      wStartDate.setDate(baseDate.getDate() + (w - 1) * 7);

      const wEndDate = new Date(wStartDate);
      wEndDate.setDate(wStartDate.getDate() + 6);

      const startISO = wStartDate.toISOString().slice(0, 10);
      const endISO = wEndDate.toISOString().slice(0, 10);

      const startFmt = `${String(wStartDate.getDate()).padStart(2, '0')}/${String(wStartDate.getMonth() + 1).padStart(2, '0')}`;
      const endFmt = `${String(wEndDate.getDate()).padStart(2, '0')}/${String(wEndDate.getMonth() + 1).padStart(2, '0')}`;

      labels.push(`Minggu ${w} (${startFmt}-${endFmt})`);

      let weekTonnage = 0;
      let weekCount = 0;

      txs.forEach(t => {
        if (t.date && t.date >= startISO && t.date <= endISO) {
          weekTonnage += (t.finalNetWeight || 0);
          weekCount++;
        }
      });

      datasetTonnage.push(weekTonnage);
      datasetTrxCount.push(weekCount);
    }

    if (this.chartWeekly) this.chartWeekly.destroy();

    this.chartWeekly = new ChartClass(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Tonase (Kg)',
            data: datasetTonnage,
            backgroundColor: theme.k1Color,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Jumlah Transaksi',
            data: datasetTrxCount,
            type: 'line',
            borderColor: theme.k2Color,
            backgroundColor: theme.k2Color,
            borderWidth: 2.5,
            pointRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            ticks: { color: theme.mutedColor, font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" } },
            grid: { color: theme.gridColor }
          },
          y: {
            type: 'linear',
            position: 'left',
            ticks: {
              color: theme.mutedColor,
              callback: (v) => `${(v / 1000).toLocaleString('id-ID')} T`
            },
            grid: { color: theme.gridColor }
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: theme.k2Color, stepSize: 1 }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: theme.textColor, font: { size: 12, family: "'Plus Jakarta Sans', sans-serif" } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ctx.datasetIndex === 0
                ? `${ctx.dataset.label}: ${ctx.raw.toLocaleString('id-ID')} Kg`
                : `${ctx.dataset.label}: ${ctx.raw} Transaksi`
            }
          }
        }
      }
    });
  },

  getDesaColorShade(kabIndex, desaIndex, totalDesas, isDark) {
    const familiesDark = [
      ['#60A5FA', '#93C5FD', '#38BDF8', '#7DD3FC', '#2563EB', '#1D4ED8', '#BFDBFE', '#0284C7', '#0EA5E9', '#BAE6FD'], // Blue (Pamekasan)
      ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#D97706', '#B45309', '#EA580C', '#FB923C', '#F97316', '#FFEDD5'], // Amber (Sampang)
      ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#059669', '#047857', '#0D9488', '#2DD4BF', '#14B8A6', '#CCFBF1'], // Emerald (Sumenep)
      ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#7C3AED', '#6D28D9', '#9333EA', '#C084FC', '#A855F7', '#F3E8FF'], // Purple (Bangkalan)
      ['#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#E11D48', '#BE123C', '#9F1239', '#FFE4E6', '#FB7185', '#FFF1F2']  // Rose
    ];
    const familiesLight = [
      ['#2563B8', '#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#1E40AF', '#0284C7', '#38BDF8', '#0EA5E9', '#7DD3FC'], // Blue (Pamekasan)
      ['#E6A817', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#D97706', '#EA580C', '#FB923C', '#B45309', '#FED7AA'], // Amber (Sampang)
      ['#16A34A', '#22C55E', '#2D9D78', '#4ADE80', '#86EFAC', '#1F7A5A', '#047857', '#0D9488', '#2DD4BF', '#A7F3D0'], // Emerald (Sumenep)
      ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#6D28D9', '#5B21B6', '#9333EA', '#C084FC', '#A855F7', '#DDD6FE'], // Purple (Bangkalan)
      ['#EA580C', '#F97316', '#FB923C', '#FDBA74', '#C05621', '#9A3412', '#C2410C', '#FFEDD5', '#FED7AA', '#FFF7ED']  // Orange
    ];

    const families = isDark ? familiesDark : familiesLight;
    const fam = families[kabIndex % families.length];
    if (desaIndex < fam.length) {
      return fam[desaIndex];
    }
    const baseHues = [215, 38, 155, 270, 345];
    const hue = baseHues[kabIndex % baseHues.length];
    const lightness = isDark ? (42 + ((desaIndex * 8) % 40)) : (38 + ((desaIndex * 8) % 40));
    return `hsl(${hue}, 75%, ${lightness}%)`;
  },

  hiddenKabOrigin: new Set(),

  renderDoubleDonutOriginChart(txs) {
    const ctx = document.getElementById('chart-origin');
    const ChartClass = window.Chart || (typeof Chart !== 'undefined' ? Chart : null);
    if (!ctx || !ChartClass) return;
    const theme = this.getThemeColors();

    if (this.chartOrigin) this.chartOrigin.destroy();

    // 1. Hierarchical Grouping: Group by Kabupaten first, then by Desa
    const hierarchy = {};

    txs.forEach(t => {
      const kab = (t.originRegion && t.originRegion.trim()) || 'Pamekasan';
      const desa = (t.originArea && t.originArea.trim()) || 'Majungan';
      const net = parseFloat(t.finalNetWeight) || 0;

      if (!hierarchy[kab]) {
        hierarchy[kab] = {
          name: kab,
          total: 0,
          desas: {}
        };
      }

      hierarchy[kab].total += net;
      hierarchy[kab].desas[desa] = (hierarchy[kab].desas[desa] || 0) + net;
    });

    // 2. Sort Kabupaten by total weight descending for deterministic angle layout
    const kabList = Object.values(hierarchy).sort((a, b) => b.total - a.total);

    const kabLabels = [];
    const allKabData = [];
    const kabColors = [];

    const desaLabels = [];
    const allDesaData = [];
    const desaColors = [];
    const desaParents = [];

    kabList.forEach((kabObj, kabIdx) => {
      const kabColor = theme.kabPalette[kabIdx % theme.kabPalette.length];
      
      kabLabels.push(kabObj.name);
      allKabData.push(kabObj.total);
      kabColors.push(kabColor);

      // Sort desas within this kabupaten (by weight descending)
      const desaEntries = Object.entries(kabObj.desas).sort((a, b) => b[1] - a[1]);
      const totalDesasInKab = desaEntries.length;

      desaEntries.forEach(([desaName, desaWeight], desaIdx) => {
        desaLabels.push(desaName);
        allDesaData.push(desaWeight);
        desaParents.push(kabObj.name);
        desaColors.push(this.getDesaColorShade(kabIdx, desaIdx, totalDesasInKab, theme.isDark));
      });
    });

    if (kabLabels.length === 0) {
      kabLabels.push('Belum Ada Data');
      allKabData.push(1);
      kabColors.push(theme.kabPalette[0]);

      desaLabels.push('Belum Ada Data');
      allDesaData.push(1);
      desaColors.push(theme.desaPalette[0]);
      desaParents.push('Belum Ada Data');
    }

    // Build active dataset arrays respecting hiddenKabOrigin state
    const currentKabData = kabLabels.map((k, i) => this.hiddenKabOrigin.has(k) ? 0 : allKabData[i]);
    const currentDesaData = desaLabels.map((d, i) => this.hiddenKabOrigin.has(desaParents[i]) ? 0 : allDesaData[i]);

    this.chartOrigin = new ChartClass(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          // Outer Ring (Index 0): Desa Asal Garam (Aligned directly outside parent Kabupaten)
          {
            label: 'Desa Asal Garam',
            data: currentDesaData,
            backgroundColor: desaColors,
            borderColor: theme.borderColor,
            borderWidth: 2,
            weight: 1.3
          },
          // Inner Ring (Index 1): Kabupaten Asal Garam
          {
            label: 'Kabupaten Asal Garam',
            data: currentKabData,
            backgroundColor: kabColors,
            borderColor: theme.borderColor,
            borderWidth: 2,
            weight: 0.9
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            onClick: (e, legendItem, legend) => {
              const chart = legend.chart;
              const kabIdx = legendItem.index;
              const kabName = kabLabels[kabIdx];

              // Toggle Kabupaten visibility state
              if (this.hiddenKabOrigin.has(kabName)) {
                this.hiddenKabOrigin.delete(kabName);
              } else {
                this.hiddenKabOrigin.add(kabName);
              }

              // Update Inner Ring (Kabupaten) data
              kabLabels.forEach((k, kIdx) => {
                const isKabHidden = this.hiddenKabOrigin.has(k);
                chart.data.datasets[1].data[kIdx] = isKabHidden ? 0 : allKabData[kIdx];
              });

              // Update Outer Ring (Desa) data - cascaded to parent Kabupaten state
              desaLabels.forEach((d, dIdx) => {
                const parentKab = desaParents[dIdx];
                const isParentHidden = this.hiddenKabOrigin.has(parentKab);
                chart.data.datasets[0].data[dIdx] = isParentHidden ? 0 : allDesaData[dIdx];
              });

              chart.update();
            },
            labels: {
              color: theme.textColor,
              font: { size: 11.5, family: "'Plus Jakarta Sans', sans-serif" },
              padding: 12,
              generateLabels: () => {
                const totalAll = allKabData.reduce((a, b) => a + b, 0) || 1;
                return kabLabels.map((k, idx) => {
                  const val = allKabData[idx];
                  const isHidden = this.hiddenKabOrigin.has(k);
                  const pct = ((val / totalAll) * 100).toFixed(1);
                  return {
                    text: `Kab. ${k}: ${val.toLocaleString('id-ID')} Kg (${pct}%)`,
                    fillStyle: isHidden ? (theme.isDark ? '#334155' : '#CBD5E1') : kabColors[idx],
                    strokeStyle: theme.borderColor,
                    fontColor: isHidden ? theme.mutedColor : theme.textColor,
                    lineWidth: 1,
                    hidden: isHidden,
                    index: idx,
                    datasetIndex: 1
                  };
                });
              }
            }
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                const item = items[0];
                return item.datasetIndex === 1 ? 'Kabupaten Asal Garam' : 'Desa Asal Garam';
              },
              label: (ctx) => {
                const datasetIdx = ctx.datasetIndex;
                const activeTotal = kabLabels.reduce((sum, k, kIdx) => {
                  return sum + (this.hiddenKabOrigin.has(k) ? 0 : allKabData[kIdx]);
                }, 0) || 1;
                const grandTotal = allKabData.reduce((a, b) => a + b, 0) || 1;

                if (datasetIdx === 1) {
                  const kabName = kabLabels[ctx.dataIndex];
                  const val = allKabData[ctx.dataIndex];
                  const pctActive = ((val / activeTotal) * 100).toFixed(1);
                  const pctGrand = ((val / grandTotal) * 100).toFixed(1);
                  return `Kab. ${kabName}: ${val.toLocaleString('id-ID')} Kg (${pctActive}% aktif • ${pctGrand}% total)`;
                } else {
                  const desaName = desaLabels[ctx.dataIndex];
                  const parentKab = desaParents[ctx.dataIndex];
                  const val = allDesaData[ctx.dataIndex];
                  const kabObj = hierarchy[parentKab];
                  const kabTotal = kabObj ? kabObj.total : grandTotal;
                  const pctOfKab = ((val / (kabTotal || 1)) * 100).toFixed(1);
                  const pctActive = ((val / activeTotal) * 100).toFixed(1);
                  return `Desa ${desaName} (Kab. ${parentKab}): ${val.toLocaleString('id-ID')} Kg (${pctOfKab}% dari Kab. ${parentKab} • ${pctActive}% aktif)`;
                }
              }
            }
          }
        }
      }
    });
  }
};
