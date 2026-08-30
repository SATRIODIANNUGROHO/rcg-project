/**
 * PT. REKA CIPTA GARAM - SALT WEIGHING SYSTEM v7.5.0
 * Module: Analytics Engine & High-Contrast Charts
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
      periodSelect.addEventListener('change', () => this.renderPeriodAnalysis());
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
      piePalette: isDark
        ? ['#38BDF8', '#818CF8', '#FBBF24', '#34D399', '#FB923C', '#94A3B8']
        : ['#163A5F', '#2563B8', '#D69E2E', '#1F7A5A', '#E6A817', '#94A3B8']
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

    // Period Analysis Banner
    this.renderPeriodAnalysis();

    // Render Charts
    this.renderCharts(txs, totalK1Weight, totalK2Weight, originMap);
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
      periodLabel = `Total berat bersih hari ini (${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()})`;
    } else if (filter === 'month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      periodTxs = txs.filter(t => t.date && t.date.startsWith(monthPrefix));
      periodLabel = `Total berat bersih bulan ini (${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })})`;
    } else {
      periodTxs = txs;
      periodLabel = `Total seluruh berat bersih tercatat`;
    }

    const totalWeight = periodTxs.reduce((sum, t) => sum + (t.finalNetWeight || 0), 0);
    const count = periodTxs.length;

    const elWeight = document.getElementById('period-net-weight');
    const elSub = document.getElementById('period-net-sub');

    if (elWeight) elWeight.textContent = `${totalWeight.toLocaleString('id-ID')} Kg`;
    if (elSub) elSub.textContent = `${periodLabel} • ${count} transaksi`;
  },

  renderCharts(txs, totalK1, totalK2, originMap) {
    if (typeof Chart === 'undefined') return;
    const theme = this.getThemeColors();

    // 1. Weekly Transactions Bar Chart
    this.renderWeeklyChart(txs);

    // 2. K1 vs K2 Doughnut Chart
    const ctxK1K2 = document.getElementById('chart-k1-k2');
    if (ctxK1K2) {
      if (this.chartK1K2) this.chartK1K2.destroy();
      this.chartK1K2 = new Chart(ctxK1K2, {
        type: 'doughnut',
        data: {
          labels: ['K1 (Garam Super)', 'K2 (Garam Standar)'],
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

    // 3. Origin Distribution Pie Chart
    const ctxOrigin = document.getElementById('chart-origin');
    if (ctxOrigin) {
      if (this.chartOrigin) this.chartOrigin.destroy();

      const labels = Object.keys(originMap).slice(0, 6);
      const data = Object.values(originMap).slice(0, 6);

      this.chartOrigin = new Chart(ctxOrigin, {
        type: 'pie',
        data: {
          labels: labels.length ? labels : ['Belum Ada Data'],
          datasets: [{
            data: data.length ? data : [1],
            backgroundColor: theme.piePalette,
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
  },

  renderWeeklyChart(passedTxs = null) {
    const ctx = document.getElementById('chart-weekly');
    if (!ctx || typeof Chart === 'undefined') return;

    const theme = this.getThemeColors();
    const txs = passedTxs || StorageManager.getTransactions();

    const weekStartInput = document.getElementById('chart-week-start');
    const weekEndInput = document.getElementById('chart-week-end');
    const startW = parseInt(weekStartInput ? weekStartInput.value : 1) || 1;
    const endW = parseInt(weekEndInput ? weekEndInput.value : 4) || 4;

    const labels = [];
    const datasetTonnage = [];
    const datasetTrxCount = [];

    for (let w = startW; w <= endW; w++) {
      labels.push(`Minggu ${w}`);
      let weekTonnage = 0;
      let weekCount = 0;

      txs.forEach(t => {
        const day = parseInt(t.date ? t.date.slice(-2) : 1) || 1;
        const assignedWeek = Math.min(4, Math.ceil(day / 7));
        if (assignedWeek === w) {
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
            borderWidth: 3,
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: theme.mutedColor,
              font: { size: 11.5, family: "'Plus Jakarta Sans', sans-serif" }
            },
            grid: {
              color: theme.gridColor
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: theme.mutedColor,
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }
            },
            grid: {
              color: theme.gridColor
            },
            title: {
              display: true,
              text: 'Tonase (Kg)',
              color: theme.textColor,
              font: { size: 11.5, weight: '600', family: "'Plus Jakarta Sans', sans-serif" }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: {
              color: theme.mutedColor,
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }
            },
            title: {
              display: true,
              text: 'Jumlah Truk',
              color: theme.textColor,
              font: { size: 11.5, weight: '600', family: "'Plus Jakarta Sans', sans-serif" }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: theme.textColor,
              font: { size: 12, weight: '600', family: "'Plus Jakarta Sans', sans-serif" },
              padding: 12
            }
          }
        }
      }
    });
  }
};
