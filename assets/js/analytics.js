/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Analytics Engine & High-Contrast Charts
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
    const isDark = document.body.classList.contains('dark-mode');
    return {
      isDark,
      textColor: isDark ? '#F8FAFC' : '#0F172A',
      mutedColor: isDark ? '#94A3B8' : '#64748B',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      borderColor: isDark ? '#1E293B' : '#FFFFFF',
      k1Color: isDark ? '#38BDF8' : '#2563B8',
      k2Color: isDark ? '#FBBF24' : '#D69E2E',
      kabPalette: isDark
        ? ['#2563EB', '#D97706', '#059669', '#7C3AED', '#DC2626']
        : ['#163A5F', '#D69E2E', '#1F7A5A', '#6D28D9', '#C05621'],
      desaPalette: isDark
        ? ['#60A5FA', '#93C5FD', '#FCD34D', '#FDE68A', '#6EE7B7', '#A7F3D0', '#C4B5FD', '#FCA5A5']
        : ['#2563B8', '#60A5FA', '#E6A817', '#FBBF24', '#2D9D78', '#5EEAD4', '#8B5CF6', '#F87171']
    };
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
    if (typeof Chart === 'undefined') return;
    const theme = this.getThemeColors();

    // 1. Weekly Transactions Bar Chart (Mulai 26 Juli 2026)
    this.renderWeeklyChart(txs);

    // 2. K1 vs K2 Doughnut Chart ("Komposisi Mutu Garam K1 dan Garam K2")
    const ctxK1K2 = document.getElementById('chart-k1-k2');
    if (ctxK1K2) {
      if (this.chartK1K2) this.chartK1K2.destroy();
      this.chartK1K2 = new Chart(ctxK1K2, {
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

    // 3. Sebaran Asal Garam: Double Donut Chart (Kabupaten & Desa)
    this.renderDoubleDonutOriginChart(txs);
  },

  renderWeeklyChart(passedTxs = null) {
    const ctx = document.getElementById('chart-weekly');
    if (!ctx || typeof Chart === 'undefined') return;

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

    this.chartWeekly = new Chart(ctx, {
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

  renderDoubleDonutOriginChart(txs) {
    const ctx = document.getElementById('chart-origin');
    if (!ctx || typeof Chart === 'undefined') return;
    const theme = this.getThemeColors();

    if (this.chartOrigin) this.chartOrigin.destroy();

    // 1. Group data by Kabupaten (Inner Ring) and Desa (Outer Ring)
    const kabMap = {};
    const desaMap = {};

    txs.forEach(t => {
      const kab = t.originRegion || 'Pamekasan';
      const desa = t.originArea || 'Majungan';
      const net = t.finalNetWeight || 0;

      kabMap[kab] = (kabMap[kab] || 0) + net;

      const desaKey = `${desa} (${kab})`;
      desaMap[desaKey] = (desaMap[desaKey] || 0) + net;
    });

    const kabLabels = Object.keys(kabMap);
    const kabData = Object.values(kabMap);

    const desaLabels = Object.keys(desaMap);
    const desaData = Object.values(desaMap);

    if (kabLabels.length === 0) {
      kabLabels.push('Belum Ada Data');
      kabData.push(1);
      desaLabels.push('Belum Ada Data');
      desaData.push(1);
    }

    this.chartOrigin = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [
          // Outer Ring: Desa Asal Garam
          {
            label: 'Desa Asal Garam',
            data: desaData,
            backgroundColor: theme.desaPalette.slice(0, desaLabels.length),
            borderColor: theme.borderColor,
            borderWidth: 2,
            weight: 1.3
          },
          // Inner Ring: Kabupaten Asal Garam
          {
            label: 'Kabupaten Asal Garam',
            data: kabData,
            backgroundColor: theme.kabPalette.slice(0, kabLabels.length),
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
            labels: {
              color: theme.textColor,
              font: { size: 11.5, family: "'Plus Jakarta Sans', sans-serif" },
              padding: 12,
              generateLabels: () => {
                const labels = [];
                kabLabels.forEach((k, idx) => {
                  labels.push({
                    text: `Kab. ${k} (${kabData[idx].toLocaleString('id-ID')} Kg)`,
                    fillStyle: theme.kabPalette[idx % theme.kabPalette.length],
                    strokeStyle: theme.borderColor,
                    lineWidth: 1
                  });
                });
                return labels;
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
                const labelName = datasetIdx === 1 ? kabLabels[ctx.dataIndex] : desaLabels[ctx.dataIndex];
                return `${labelName}: ${ctx.raw.toLocaleString('id-ID')} Kg`;
              }
            }
          }
        }
      }
    });
  }
};
