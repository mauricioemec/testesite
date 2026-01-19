/**
 * Charts Manager for Financial Control Application
 * Handles chart creation and management using Chart.js
 */

const Charts = {
    // Store chart instances to allow updates/destruction
    instances: {},

    // Default colors
    colors: {
        primary: '#4f46e5',
        secondary: '#10b981',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        indigo: '#6366f1',
        teal: '#14b8a6'
    },

    /**
     * Get default chart options
     */
    getDefaultOptions() {
        const isDark = document.body.classList.contains('dark-theme');
        const textColor = isDark ? '#f9fafb' : '#111827';
        const gridColor = isDark ? '#374151' : '#e5e7eb';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += Utils.formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return Utils.formatCurrency(value);
                        }
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        };
    },

    /**
     * Destroy chart instance
     * @param {string} chartId - Chart instance ID
     */
    destroy(chartId) {
        if (this.instances[chartId]) {
            this.instances[chartId].destroy();
            delete this.instances[chartId];
        }
    },

    /**
     * Create line chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Chart} Chart instance
     */
    createLineChart(canvasId, data, options = {}) {
        this.destroy(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultOptions = this.getDefaultOptions();

        this.instances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                ...defaultOptions,
                ...options,
                plugins: {
                    ...defaultOptions.plugins,
                    ...options.plugins
                }
            }
        });

        return this.instances[canvasId];
    },

    /**
     * Create bar chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Chart} Chart instance
     */
    createBarChart(canvasId, data, options = {}) {
        this.destroy(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultOptions = this.getDefaultOptions();

        this.instances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                ...defaultOptions,
                ...options,
                plugins: {
                    ...defaultOptions.plugins,
                    ...options.plugins
                }
            }
        });

        return this.instances[canvasId];
    },

    /**
     * Create pie/doughnut chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} data - Chart data
     * @param {string} type - 'pie' or 'doughnut'
     * @param {Object} options - Additional options
     * @returns {Chart} Chart instance
     */
    createPieChart(canvasId, data, type = 'doughnut', options = {}) {
        this.destroy(canvasId);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const defaultOptions = this.getDefaultOptions();

        // Remove scales for pie/doughnut charts
        delete defaultOptions.scales;

        this.instances[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                ...defaultOptions,
                ...options,
                plugins: {
                    ...defaultOptions.plugins,
                    ...options.plugins,
                    tooltip: {
                        ...defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += Utils.formatCurrency(context.parsed);

                                // Calculate percentage
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                label += ` (${percentage}%)`;

                                return label;
                            }
                        }
                    }
                }
            }
        });

        return this.instances[canvasId];
    },

    /**
     * Create monthly revenue chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} monthlyData - Array of {month, revenue} objects
     */
    createMonthlyRevenueChart(canvasId, monthlyData) {
        const labels = monthlyData.map(d => Utils.getShortMonthName(d.month));
        const values = monthlyData.map(d => d.revenue);

        const data = {
            labels: labels,
            datasets: [{
                label: 'Receita Mensal',
                data: values,
                borderColor: this.colors.primary,
                backgroundColor: this.colors.primary + '20',
                tension: 0.4,
                fill: true
            }]
        };

        return this.createLineChart(canvasId, data);
    },

    /**
     * Create revenue vs expenses chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} monthlyData - Array of {month, revenue, expenses} objects
     */
    createRevenueExpensesChart(canvasId, monthlyData) {
        const labels = monthlyData.map(d => Utils.getShortMonthName(d.month));
        const revenues = monthlyData.map(d => d.revenue);
        const expenses = monthlyData.map(d => d.expenses);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: revenues,
                    backgroundColor: this.colors.success + '80',
                    borderColor: this.colors.success,
                    borderWidth: 2
                },
                {
                    label: 'Despesas',
                    data: expenses,
                    backgroundColor: this.colors.danger + '80',
                    borderColor: this.colors.danger,
                    borderWidth: 2
                }
            ]
        };

        return this.createBarChart(canvasId, data);
    },

    /**
     * Create occupancy rate chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} properties - Array of property data with occupancy
     */
    createOccupancyChart(canvasId, properties) {
        const labels = properties.map(p => p.name);
        const values = properties.map(p => p.occupancy * 100);

        const data = {
            labels: labels,
            datasets: [{
                label: 'Taxa de Ocupação (%)',
                data: values,
                backgroundColor: properties.map((p, i) => {
                    const colors = [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.info,
                        this.colors.purple,
                        this.colors.pink,
                        this.colors.teal
                    ];
                    return colors[i % colors.length] + '80';
                }),
                borderColor: properties.map((p, i) => {
                    const colors = [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.info,
                        this.colors.purple,
                        this.colors.pink,
                        this.colors.teal
                    ];
                    return colors[i % colors.length];
                }),
                borderWidth: 2
            }]
        };

        const options = {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        };

        return this.createBarChart(canvasId, data, options);
    },

    /**
     * Create expense distribution chart
     * @param {string} canvasId - Canvas element ID
     * @param {Object} expensesByCategory - Object with category: amount
     */
    createExpenseDistributionChart(canvasId, expensesByCategory) {
        const labels = Object.keys(expensesByCategory);
        const values = Object.values(expensesByCategory);

        const backgroundColors = [
            this.colors.primary + '80',
            this.colors.secondary + '80',
            this.colors.warning + '80',
            this.colors.danger + '80',
            this.colors.info + '80',
            this.colors.purple + '80',
            this.colors.pink + '80',
            this.colors.teal + '80'
        ];

        const borderColors = [
            this.colors.primary,
            this.colors.secondary,
            this.colors.warning,
            this.colors.danger,
            this.colors.info,
            this.colors.purple,
            this.colors.pink,
            this.colors.teal
        ];

        const data = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2
            }]
        };

        return this.createPieChart(canvasId, data, 'doughnut');
    },

    /**
     * Create equity evolution chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} equityData - Array of {month, value, debt, equity} objects
     */
    createEquityEvolutionChart(canvasId, equityData) {
        const labels = equityData.map(d => Utils.getShortMonthName(d.month));
        const values = equityData.map(d => d.value);
        const debts = equityData.map(d => d.debt);
        const equities = equityData.map(d => d.equity);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Valor dos Imóveis',
                    data: values,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Dívida',
                    data: debts,
                    borderColor: this.colors.danger,
                    backgroundColor: this.colors.danger + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Patrimônio Líquido',
                    data: equities,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        return this.createLineChart(canvasId, data);
    },

    /**
     * Create DRE waterfall chart (simplified as bar chart)
     * @param {string} canvasId - Canvas element ID
     * @param {Object} dreData - DRE calculation result
     */
    createDREChart(canvasId, dreData) {
        const labels = [
            'Receita Bruta',
            'Deduções',
            'Receita Líquida',
            'Custos Variáveis',
            'Lucro Bruto',
            'Despesas Fixas',
            'EBITDA',
            'Depreciação',
            'EBIT',
            'Desp. Financeiras',
            'Lucro Líquido'
        ];

        const values = [
            dreData.receitaBruta,
            -dreData.deducoes,
            dreData.receitaLiquida,
            -dreData.custosVariaveis,
            dreData.lucroBruto,
            -dreData.despesasFixas,
            dreData.ebitda,
            -dreData.depreciacao,
            dreData.ebit,
            -dreData.despesasFinanceiras,
            dreData.lucroLiquido
        ];

        const backgroundColors = values.map(v => {
            if (v >= 0) return this.colors.success + '80';
            return this.colors.danger + '80';
        });

        const borderColors = values.map(v => {
            if (v >= 0) return this.colors.success;
            return this.colors.danger;
        });

        const data = {
            labels: labels,
            datasets: [{
                label: 'Valor',
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2
            }]
        };

        return this.createBarChart(canvasId, data);
    },

    /**
     * Create projection chart (5 years)
     * @param {string} canvasId - Canvas element ID
     * @param {Array} projectionData - Array of yearly projections
     */
    createProjectionChart(canvasId, projectionData) {
        const labels = projectionData.map((d, i) => `Ano ${i + 1}`);
        const revenues = projectionData.map(d => d.revenue);
        const ebitdas = projectionData.map(d => d.ebitda);
        const profits = projectionData.map(d => d.profit);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Receita',
                    data: revenues,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'EBITDA',
                    data: ebitdas,
                    borderColor: this.colors.info,
                    backgroundColor: this.colors.info + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Lucro Líquido',
                    data: profits,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        return this.createLineChart(canvasId, data);
    },

    /**
     * Create cash flow chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} cashFlowData - Array of monthly cash flow
     */
    createCashFlowChart(canvasId, cashFlowData) {
        const labels = cashFlowData.map(d => Utils.getShortMonthName(d.month));
        const operational = cashFlowData.map(d => d.operational);
        const investment = cashFlowData.map(d => d.investment);
        const financing = cashFlowData.map(d => d.financing);
        const total = cashFlowData.map(d => d.total);

        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Operacional',
                    data: operational,
                    backgroundColor: this.colors.success + '80',
                    borderColor: this.colors.success,
                    borderWidth: 1
                },
                {
                    label: 'Investimento',
                    data: investment,
                    backgroundColor: this.colors.warning + '80',
                    borderColor: this.colors.warning,
                    borderWidth: 1
                },
                {
                    label: 'Financiamento',
                    data: financing,
                    backgroundColor: this.colors.info + '80',
                    borderColor: this.colors.info,
                    borderWidth: 1
                },
                {
                    label: 'Total',
                    data: total,
                    borderColor: this.colors.primary,
                    backgroundColor: this.colors.primary + '20',
                    type: 'line',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }
            ]
        };

        return this.createBarChart(canvasId, data, {
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        });
    },

    /**
     * Update chart data
     * @param {string} chartId - Chart instance ID
     * @param {Object} newData - New data object
     */
    updateChart(chartId, newData) {
        const chart = this.instances[chartId];
        if (!chart) return;

        chart.data = newData;
        chart.update();
    },

    /**
     * Update chart theme (for dark mode toggle)
     */
    updateAllChartsTheme() {
        Object.keys(this.instances).forEach(chartId => {
            const chart = this.instances[chartId];
            if (!chart) return;

            const defaultOptions = this.getDefaultOptions();

            // Update text colors
            if (chart.options.plugins && chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = defaultOptions.plugins.legend.labels.color;
            }

            // Update scales
            if (chart.options.scales) {
                if (chart.options.scales.x) {
                    chart.options.scales.x.ticks.color = defaultOptions.scales.x.ticks.color;
                    chart.options.scales.x.grid.color = defaultOptions.scales.x.grid.color;
                }
                if (chart.options.scales.y) {
                    chart.options.scales.y.ticks.color = defaultOptions.scales.y.ticks.color;
                    chart.options.scales.y.grid.color = defaultOptions.scales.y.grid.color;
                }
            }

            chart.update();
        });
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Charts;
}
