/**
 * Main Application File for Financial Control System
 * Handles SPA navigation and all 15 pages
 */

const App = {
    currentPage: 'dashboard',

    /**
     * Initialize application
     */
    init() {
        // Initialize data manager
        DataManager.init();

        // Setup event listeners
        this.setupNavigation();
        this.setupHeader();
        this.setupTheme();

        // Load initial page
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.navigateTo(hash);

        // Setup hash change listener
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'dashboard';
            this.navigateTo(page);
        });
    },

    /**
     * Setup navigation
     */
    setupNavigation() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar on link click (mobile)
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                }
            });
        });

        // Close sidebar when clicking outside (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    },

    /**
     * Setup header buttons
     */
    setupHeader() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Import data
        const importBtn = document.getElementById('import-data');
        const importInput = document.getElementById('import-file-input');

        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => {
                importInput.click();
            });

            importInput.addEventListener('change', (e) => {
                this.importData(e.target.files[0]);
            });
        }

        // Help toggle
        const helpToggle = document.getElementById('help-toggle');
        const helpPanel = document.getElementById('help-panel');
        const closeHelp = document.getElementById('close-help');

        if (helpToggle && helpPanel) {
            helpToggle.addEventListener('click', () => {
                helpPanel.classList.toggle('hidden');
            });
        }

        if (closeHelp) {
            closeHelp.addEventListener('click', () => {
                helpPanel.classList.add('hidden');
            });
        }

        // Clear data
        const clearData = document.getElementById('clear-data');
        if (clearData) {
            clearData.addEventListener('click', () => {
                this.clearAllData();
            });
        }
    },

    /**
     * Setup theme
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    },

    /**
     * Toggle dark/light theme
     */
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        // Update charts theme
        Charts.updateAllChartsTheme();
    },

    /**
     * Navigate to page
     * @param {string} page - Page name
     */
    navigateTo(page) {
        this.currentPage = page;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Load page content
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        // Get page content
        const pageContent = this.getPageContent(page);
        mainContent.innerHTML = pageContent;

        // Initialize page-specific functionality
        this.initPage(page);
    },

    /**
     * Get page content HTML
     * @param {string} page - Page name
     * @returns {string} HTML content
     */
    getPageContent(page) {
        const pages = {
            'dashboard': this.getDashboardPage(),
            'imoveis': this.getImoveisPage(),
            'financiamentos': this.getFinanciamentosPage(),
            'consorcios': this.getConsorciosPage(),
            'reformas': this.getReformasPage(),
            'receitas': this.getReceitasPage(),
            'despesas': this.getDespesasPage(),
            'dre': this.getDREPage(),
            'balanco': this.getBalancoPage(),
            'fluxo-caixa': this.getFluxoCaixaPage(),
            'valorizacao': this.getValorizacaoPage(),
            'projecao': this.getProjecaoPage(),
            'valuation': this.getValuationPage(),
            'calendario': this.getCalendarioPage(),
            'documentacao': this.getDocumentacaoPage()
        };

        return pages[page] || this.get404Page();
    },

    /**
     * Initialize page-specific functionality
     * @param {string} page - Page name
     */
    initPage(page) {
        const initFunctions = {
            'dashboard': () => this.initDashboard(),
            'imoveis': () => this.initImoveis(),
            'financiamentos': () => this.initFinanciamentos(),
            'consorcios': () => this.initConsorcios(),
            'reformas': () => this.initReformas(),
            'receitas': () => this.initReceitas(),
            'despesas': () => this.initDespesas(),
            'dre': () => this.initDRE(),
            'balanco': () => this.initBalanco(),
            'fluxo-caixa': () => this.initFluxoCaixa(),
            'valorizacao': () => this.initValorizacao(),
            'projecao': () => this.initProjecao(),
            'valuation': () => this.initValuation(),
            'calendario': () => this.initCalendario(),
            'documentacao': () => this.initDocumentacao()
        };

        if (initFunctions[page]) {
            setTimeout(() => initFunctions[page](), 0);
        }
    },

    // ==========================================
    // PAGE CONTENT METHODS
    // ==========================================

    /**
     * Get Dashboard page content
     */
    getDashboardPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-chart-line"></i> Dashboard</h1>
                <p class="text-muted">Visão geral do seu portfólio</p>
            </div>

            <!-- KPIs -->
            <div class="kpi-grid" id="kpi-grid"></div>

            <!-- Charts -->
            <div class="dashboard-grid">
                <div class="col-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-line"></i> Evolução de Receita</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="revenue-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-bar"></i> Ocupação por Imóvel</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="occupancy-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-pie"></i> Distribuição de Despesas</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="expenses-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title"><i class="fas fa-chart-area"></i> Evolução do Patrimônio</h3>
                        </div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="equity-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-history"></i> Atividades Recentes</h3>
                </div>
                <div class="card-body">
                    <ul class="activity-list" id="recent-activity"></ul>
                </div>
            </div>
        `;
    },

    /**
     * Get Imoveis page content
     */
    getImoveisPage() {
        return `
            <div class="page-header flex-between">
                <div>
                    <h1><i class="fas fa-home"></i> Imóveis</h1>
                    <p class="text-muted">Gerencie seu portfólio de imóveis</p>
                </div>
                <button class="btn btn-primary" id="add-imovel">
                    <i class="fas fa-plus"></i> Adicionar Imóvel
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Lista de Imóveis</h3>
                    <div class="flex gap-2">
                        <input type="text" id="search-imoveis" class="form-input" placeholder="Buscar imóveis..." style="width: 300px;">
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table id="imoveis-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Endereço</th>
                                    <th>Data Aquisição</th>
                                    <th>Valor Compra</th>
                                    <th>Valor Atual</th>
                                    <th>Valorização</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="imoveis-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Financiamentos page content
     */
    getFinanciamentosPage() {
        return `
            <div class="page-header flex-between">
                <div>
                    <h1><i class="fas fa-landmark"></i> Financiamentos</h1>
                    <p class="text-muted">Gerencie seus financiamentos imobiliários</p>
                </div>
                <button class="btn btn-primary" id="add-financiamento">
                    <i class="fas fa-plus"></i> Adicionar Financiamento
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Financiamentos Ativos</h3>
                </div>
                <div class="card-body">
                    <div id="financiamentos-list"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get Consorcios page content
     */
    getConsorciosPage() {
        return `
            <div class="page-header flex-between">
                <div>
                    <h1><i class="fas fa-users"></i> Consórcios</h1>
                    <p class="text-muted">Gerencie seus consórcios imobiliários</p>
                </div>
                <button class="btn btn-primary" id="add-consorcio">
                    <i class="fas fa-plus"></i> Adicionar Consórcio
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Consórcios Ativos</h3>
                </div>
                <div class="card-body">
                    <div id="consorcios-list"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get Reformas page content
     */
    getReformasPage() {
        return `
            <div class="page-header flex-between">
                <div>
                    <h1><i class="fas fa-hammer"></i> Reformas e Benfeitorias</h1>
                    <p class="text-muted">Registre reformas e benfeitorias realizadas</p>
                </div>
                <button class="btn btn-primary" id="add-reforma">
                    <i class="fas fa-plus"></i> Adicionar Reforma
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Lista de Reformas</h3>
                    <div class="flex gap-2">
                        <select id="filter-imovel-reforma" class="form-select" style="width: 250px;">
                            <option value="">Todos os imóveis</option>
                        </select>
                        <select id="filter-status-reforma" class="form-select" style="width: 200px;">
                            <option value="">Todos os status</option>
                            <option value="planejada">Planejada</option>
                            <option value="em-andamento">Em Andamento</option>
                            <option value="concluida">Concluída</option>
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table id="reformas-table">
                            <thead>
                                <tr>
                                    <th>Imóvel</th>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Início</th>
                                    <th>Conclusão</th>
                                    <th>Orçado</th>
                                    <th>Realizado</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="reformas-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Receitas page content
     */
    getReceitasPage() {
        return `
            <div class="page-header flex-between">
                <div>
                    <h1><i class="fas fa-dollar-sign"></i> Receitas Operacionais</h1>
                    <p class="text-muted">Registre reservas e receitas de hospedagem</p>
                </div>
                <button class="btn btn-primary" id="add-receita">
                    <i class="fas fa-plus"></i> Adicionar Receita
                </button>
            </div>

            <!-- Summary Cards -->
            <div class="metrics-row" id="receitas-summary"></div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Histórico de Receitas</h3>
                    <div class="flex gap-2">
                        <input type="month" id="filter-month" class="form-input" style="width: 200px;">
                        <select id="filter-imovel-receita" class="form-select" style="width: 250px;">
                            <option value="">Todos os imóveis</option>
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table id="receitas-table">
                            <thead>
                                <tr>
                                    <th>Imóvel</th>
                                    <th>Hóspede</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Diárias</th>
                                    <th>Plataforma</th>
                                    <th>Valor Bruto</th>
                                    <th>Taxas</th>
                                    <th>Valor Líquido</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="receitas-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Despesas page content
     */
    getDespesasPage() {
        return `
            <div class="page-header flex-between">
                <div>
                    <h1><i class="fas fa-receipt"></i> Despesas Operacionais</h1>
                    <p class="text-muted">Registre todas as despesas operacionais</p>
                </div>
                <button class="btn btn-primary" id="add-despesa">
                    <i class="fas fa-plus"></i> Adicionar Despesa
                </button>
            </div>

            <!-- Summary Cards -->
            <div class="metrics-row" id="despesas-summary"></div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Histórico de Despesas</h3>
                    <div class="flex gap-2">
                        <input type="month" id="filter-month-despesa" class="form-input" style="width: 200px;">
                        <select id="filter-categoria" class="form-select" style="width: 200px;">
                            <option value="">Todas as categorias</option>
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table id="despesas-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Imóvel</th>
                                    <th>Categoria</th>
                                    <th>Descrição</th>
                                    <th>Fornecedor</th>
                                    <th>Valor</th>
                                    <th>Recorrência</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="despesas-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get DRE page content
     */
    getDREPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-chart-bar"></i> DRE - Demonstração do Resultado</h1>
                <p class="text-muted">Demonstração do resultado do exercício</p>
            </div>

            <div class="card">
                <div class="card-header flex-between">
                    <h3 class="card-title">Período de Análise</h3>
                    <div class="flex gap-2">
                        <input type="month" id="dre-month" class="form-input" style="width: 200px;">
                        <button class="btn btn-primary" id="calc-dre">
                            <i class="fas fa-calculator"></i> Calcular
                        </button>
                        <button class="btn btn-secondary" id="export-dre">
                            <i class="fas fa-file-excel"></i> Exportar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="dre-result"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Gráfico DRE</h3>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="dre-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Balanco page content
     */
    getBalancoPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-balance-scale"></i> Balanço Patrimonial</h1>
                <p class="text-muted">Demonstração da situação patrimonial</p>
            </div>

            <div class="card">
                <div class="card-header flex-between">
                    <h3 class="card-title">Data Base</h3>
                    <div class="flex gap-2">
                        <input type="date" id="balanco-date" class="form-input" style="width: 200px;">
                        <button class="btn btn-primary" id="calc-balanco">
                            <i class="fas fa-calculator"></i> Calcular
                        </button>
                        <button class="btn btn-secondary" id="export-balanco">
                            <i class="fas fa-file-excel"></i> Exportar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="dashboard-grid">
                        <div class="col-6">
                            <h3 class="mb-3">ATIVO</h3>
                            <div id="balanco-ativo"></div>
                        </div>
                        <div class="col-6">
                            <h3 class="mb-3">PASSIVO E PATRIMÔNIO LÍQUIDO</h3>
                            <div id="balanco-passivo"></div>
                        </div>
                    </div>

                    <div id="balanco-validation" class="mt-4"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get Fluxo de Caixa page content
     */
    getFluxoCaixaPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-exchange-alt"></i> Fluxo de Caixa</h1>
                <p class="text-muted">Demonstração do fluxo de caixa</p>
            </div>

            <div class="card">
                <div class="card-header flex-between">
                    <h3 class="card-title">Período de Análise</h3>
                    <div class="flex gap-2">
                        <input type="month" id="fluxo-month" class="form-input" style="width: 200px;">
                        <button class="btn btn-primary" id="calc-fluxo">
                            <i class="fas fa-calculator"></i> Calcular
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="fluxo-result"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Gráfico de Fluxo de Caixa</h3>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="fluxo-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Valorizacao page content
     */
    getValorizacaoPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-chart-area"></i> Valorização do Patrimônio Imobiliário</h1>
                <p class="text-muted">Acompanhe a valorização dos seus imóveis</p>
            </div>

            <!-- Summary Cards -->
            <div class="financial-summary">
                <h2>Resumo da Carteira</h2>
                <div class="financial-grid" id="valorizacao-summary"></div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Valorização por Imóvel</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table id="valorizacao-table">
                            <thead>
                                <tr>
                                    <th>Imóvel</th>
                                    <th>Custo Total</th>
                                    <th>Valor Mercado</th>
                                    <th>Valorização R$</th>
                                    <th>Valorização %</th>
                                    <th>Anualizado %</th>
                                    <th>Saldo Devedor</th>
                                    <th>Equity</th>
                                    <th>LTV</th>
                                </tr>
                            </thead>
                            <tbody id="valorizacao-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Projecao page content
     */
    getProjecaoPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-crystal-ball"></i> Projeção 5 Anos</h1>
                <p class="text-muted">Projeções financeiras para os próximos 5 anos</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Premissas de Projeção</h3>
                    <button class="btn btn-primary" id="update-premissas">
                        <i class="fas fa-save"></i> Salvar Premissas
                    </button>
                </div>
                <div class="card-body">
                    <div id="premissas-form"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Projeção Anual</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table id="projecao-table">
                            <thead>
                                <tr>
                                    <th>Métrica</th>
                                    <th>Ano 1</th>
                                    <th>Ano 2</th>
                                    <th>Ano 3</th>
                                    <th>Ano 4</th>
                                    <th>Ano 5</th>
                                </tr>
                            </thead>
                            <tbody id="projecao-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Gráfico de Projeção</h3>
                </div>
                <div class="card-body">
                    <div class="chart-container">
                        <canvas id="projecao-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Valuation page content
     */
    getValuationPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-gem"></i> Preparação para Valuation</h1>
                <p class="text-muted">Métricas e cálculos para valuation da empresa</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Parâmetros de Valuation</h3>
                    <button class="btn btn-primary" id="calc-valuation">
                        <i class="fas fa-calculator"></i> Calcular Valuation
                    </button>
                </div>
                <div class="card-body">
                    <div id="valuation-params"></div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="col-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">DCF - Fluxo de Caixa Descontado</h3>
                        </div>
                        <div class="card-body">
                            <div id="valuation-dcf"></div>
                        </div>
                    </div>
                </div>

                <div class="col-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">NAV - Valor Patrimonial</h3>
                        </div>
                        <div class="card-body">
                            <div id="valuation-nav"></div>
                        </div>
                    </div>
                </div>

                <div class="col-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Múltiplos</h3>
                        </div>
                        <div class="card-body">
                            <div id="valuation-multiples"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Calendario page content
     */
    getCalendarioPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-calendar-alt"></i> Calendário de Obrigações</h1>
                <p class="text-muted">Acompanhe vencimentos e obrigações</p>
            </div>

            <div class="card">
                <div class="card-header flex-between">
                    <h3 class="card-title">Próximos Vencimentos</h3>
                    <input type="month" id="calendario-month" class="form-input" style="width: 200px;">
                </div>
                <div class="card-body">
                    <div id="calendario-list"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Alertas</h3>
                </div>
                <div class="card-body">
                    <div id="alertas-list"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get Documentacao page content
     */
    getDocumentacaoPage() {
        return `
            <div class="page-header">
                <h1><i class="fas fa-file-alt"></i> Documentação e Controle</h1>
                <p class="text-muted">Gerencie documentos e checklists</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Checklist de Documentos por Imóvel</h3>
                    <select id="doc-imovel-select" class="form-select" style="width: 300px;">
                        <option value="">Selecione um imóvel</option>
                    </select>
                </div>
                <div class="card-body">
                    <div id="documentos-checklist"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Controle de Contratos</h3>
                </div>
                <div class="card-body">
                    <div id="contratos-list"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get 404 page content
     */
    get404Page() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="empty-state-title">Página não encontrada</h2>
                <p class="empty-state-description">A página que você está procurando não existe.</p>
                <a href="#dashboard" class="btn btn-primary">Voltar ao Dashboard</a>
            </div>
        `;
    },

    // ==========================================
    // PAGE INITIALIZATION METHODS
    // ==========================================

    /**
     * Initialize Dashboard
     */
    initDashboard() {
        // Load KPIs
        this.loadDashboardKPIs();

        // Load charts
        this.loadDashboardCharts();

        // Load recent activity
        this.loadRecentActivity();
    },

    /**
     * Load Dashboard KPIs
     */
    loadDashboardKPIs() {
        const grid = document.getElementById('kpi-grid');
        if (!grid) return;

        const imoveis = DataManager.getImoveisAtivos();
        const totalValue = DataManager.getTotalPropertyValue();
        const totalDebt = DataManager.getTotalDebt();
        const equity = DataManager.getTotalEquity();

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyRevenue = DataManager.getMonthlyRevenue(currentYear, currentMonth);
        const occupancy = DataManager.getOccupancyRate(currentYear, currentMonth);
        const adr = DataManager.getADR(currentYear, currentMonth);
        const revpar = DataManager.getRevPAR(currentYear, currentMonth);

        grid.innerHTML = `
            <div class="kpi-card primary">
                <div class="kpi-label"><i class="fas fa-wallet"></i> Patrimônio Líquido</div>
                <div class="kpi-value">${Utils.formatCurrency(equity)}</div>
                <div class="kpi-change">${imoveis.length} imóveis ativos</div>
            </div>

            <div class="kpi-card success">
                <div class="kpi-label"><i class="fas fa-dollar-sign"></i> Receita Mensal</div>
                <div class="kpi-value">${Utils.formatCurrency(monthlyRevenue)}</div>
                <div class="kpi-change">Mês atual</div>
            </div>

            <div class="kpi-card info">
                <div class="kpi-label"><i class="fas fa-percentage"></i> Ocupação Média</div>
                <div class="kpi-value">${Utils.formatPercent(occupancy)}</div>
                <div class="kpi-change">Taxa mensal</div>
            </div>

            <div class="kpi-card warning">
                <div class="kpi-label"><i class="fas fa-chart-line"></i> ADR</div>
                <div class="kpi-value">${Utils.formatCurrency(adr)}</div>
                <div class="kpi-change">Diária média</div>
            </div>

            <div class="kpi-card">
                <div class="kpi-label"><i class="fas fa-chart-area"></i> RevPAR</div>
                <div class="kpi-value">${Utils.formatCurrency(revpar)}</div>
                <div class="kpi-change">Por quarto disponível</div>
            </div>

            <div class="kpi-card danger">
                <div class="kpi-label"><i class="fas fa-landmark"></i> Dívida Total</div>
                <div class="kpi-value">${Utils.formatCurrency(totalDebt)}</div>
                <div class="kpi-change">LTV: ${Utils.formatPercent(totalValue > 0 ? totalDebt / totalValue : 0)}</div>
            </div>
        `;
    },

    /**
     * Load Dashboard Charts
     */
    loadDashboardCharts() {
        // Revenue chart - last 12 months
        const revenueData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const revenue = DataManager.getMonthlyRevenue(date.getFullYear(), date.getMonth());
            revenueData.push({ month: date.getMonth(), revenue });
        }
        Charts.createMonthlyRevenueChart('revenue-chart', revenueData);

        // Occupancy chart by property
        const imoveis = DataManager.getImoveisAtivos();
        const now = new Date();
        const occupancyData = imoveis.map(imovel => ({
            name: imovel.nome,
            occupancy: 0.75 // Placeholder - would need actual calculation
        }));
        if (occupancyData.length > 0) {
            Charts.createOccupancyChart('occupancy-chart', occupancyData);
        }

        // Expense distribution - placeholder
        const expensesByCategory = {
            'Limpeza': 5000,
            'Condomínio': 3000,
            'IPTU': 2000,
            'Manutenção': 4000,
            'Outros': 2000
        };
        Charts.createExpenseDistributionChart('expenses-chart', expensesByCategory);

        // Equity evolution - placeholder
        const equityData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            equityData.push({
                month: date.getMonth(),
                value: DataManager.getTotalPropertyValue(),
                debt: DataManager.getTotalDebt(),
                equity: DataManager.getTotalEquity()
            });
        }
        Charts.createEquityEvolutionChart('equity-chart', equityData);
    },

    /**
     * Load Recent Activity
     */
    loadRecentActivity() {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        // Placeholder activity
        container.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon revenue">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Nova receita registrada</div>
                    <div class="activity-description">Reserva confirmada - Apto Centro</div>
                    <div class="activity-time">Há 2 horas</div>
                </div>
                <div class="activity-value">${Utils.formatCurrency(1500)}</div>
            </li>
            <li class="activity-item">
                <div class="activity-icon expense">
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Despesa lançada</div>
                    <div class="activity-description">Condomínio - Apto Jardins</div>
                    <div class="activity-time">Há 5 horas</div>
                </div>
                <div class="activity-value">${Utils.formatCurrency(-800)}</div>
            </li>
        `;
    },

    /**
     * Initialize Imoveis page
     */
    initImoveis() {
        this.loadImoveisList();

        // Add button
        const addBtn = document.getElementById('add-imovel');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showImovelForm());
        }

        // Search
        const searchInput = document.getElementById('search-imoveis');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterImoveis(e.target.value));
        }
    },

    /**
     * Load imoveis list
     */
    loadImoveisList() {
        const tbody = document.getElementById('imoveis-tbody');
        if (!tbody) return;

        const imoveis = DataManager.getImoveis();

        if (imoveis.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <div class="empty-state-icon"><i class="fas fa-home"></i></div>
                            <h3 class="empty-state-title">Nenhum imóvel cadastrado</h3>
                            <p class="empty-state-description">Clique em "Adicionar Imóvel" para começar</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = imoveis.map(imovel => {
            const valorizacao = imovel.valorMercadoAtual && imovel.valorCompra ?
                ((imovel.valorMercadoAtual - imovel.valorCompra) / imovel.valorCompra) : 0;

            return `
                <tr>
                    <td><strong>${imovel.nome}</strong></td>
                    <td>${imovel.endereco || '-'}</td>
                    <td>${Utils.formatDate(imovel.dataAquisicao)}</td>
                    <td>${Utils.formatCurrency(imovel.valorCompra)}</td>
                    <td>${Utils.formatCurrency(imovel.valorMercadoAtual || imovel.valorCompra)}</td>
                    <td class="${valorizacao >= 0 ? 'text-success' : 'text-danger'}">
                        ${Utils.formatPercent(valorizacao)}
                    </td>
                    <td>
                        <span class="badge badge-${imovel.status === 'ativo' ? 'success' : 'secondary'}">
                            ${imovel.status || 'ativo'}
                        </span>
                    </td>
                    <td class="table-actions">
                        <button class="btn btn-sm btn-secondary" onclick="App.editImovel('${imovel.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="App.deleteImovel('${imovel.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Show imovel form
     */
    showImovelForm(imovelId = null) {
        const imovel = imovelId ? DataManager.getImovelById(imovelId) : {};
        const isEdit = !!imovelId;

        const formHtml = `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Nome/Apelido</label>
                    <input type="text" name="nome" class="form-input" value="${imovel.nome || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Endereço Completo</label>
                    <input type="text" name="endereco" class="form-input" value="${imovel.endereco || ''}">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label required">Data de Aquisição</label>
                    <input type="date" name="dataAquisicao" class="form-input" value="${Utils.formatDateInput(imovel.dataAquisicao || new Date())}" required>
                </div>
                <div class="form-group">
                    <label class="form-label required">Valor de Compra</label>
                    <input type="number" name="valorCompra" class="form-input" value="${imovel.valorCompra || ''}" min="0" step="0.01" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Forma de Aquisição</label>
                    <select name="formaAquisicao" class="form-select">
                        <option value="a-vista" ${imovel.formaAquisicao === 'a-vista' ? 'selected' : ''}>À Vista</option>
                        <option value="financiamento" ${imovel.formaAquisicao === 'financiamento' ? 'selected' : ''}>Financiamento</option>
                        <option value="consorcio" ${imovel.formaAquisicao === 'consorcio' ? 'selected' : ''}>Consórcio</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Valor Investido em Reforma</label>
                    <input type="number" name="valorReforma" class="form-input" value="${imovel.valorReforma || 0}" min="0" step="0.01">
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Valor de Mercado Atual</label>
                    <input type="number" name="valorMercadoAtual" class="form-input" value="${imovel.valorMercadoAtual || ''}" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label class="form-label">Número de Quartos</label>
                    <input type="number" name="numQuartos" class="form-input" value="${imovel.numQuartos || ''}" min="0">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-select">
                    <option value="ativo" ${imovel.status === 'ativo' || !imovel.status ? 'selected' : ''}>Ativo</option>
                    <option value="em-reforma" ${imovel.status === 'em-reforma' ? 'selected' : ''}>Em Reforma</option>
                    <option value="inativo" ${imovel.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea name="observacoes" class="form-textarea">${imovel.observacoes || ''}</textarea>
            </div>
        `;

        Utils.showModal(
            isEdit ? 'Editar Imóvel' : 'Adicionar Imóvel',
            `<form id="imovel-form">${formHtml}</form>`,
            [
                { text: 'Cancelar', class: 'btn-secondary' },
                {
                    text: 'Salvar',
                    class: 'btn-primary',
                    onClick: () => this.saveImovel(imovelId)
                }
            ]
        );
    },

    /**
     * Save imovel
     */
    saveImovel(imovelId) {
        const formData = Forms.getFormData('imovel-form');

        const imovel = {
            ...formData,
            id: imovelId,
            valorCompra: parseFloat(formData.valorCompra) || 0,
            valorReforma: parseFloat(formData.valorReforma) || 0,
            valorMercadoAtual: parseFloat(formData.valorMercadoAtual) || 0,
            numQuartos: parseInt(formData.numQuartos) || 0
        };

        DataManager.saveImovel(imovel);
        Utils.showToast('Imóvel salvo com sucesso!', 'success');
        this.loadImoveisList();
    },

    /**
     * Edit imovel
     */
    editImovel(id) {
        this.showImovelForm(id);
    },

    /**
     * Delete imovel
     */
    deleteImovel(id) {
        const imovel = DataManager.getImovelById(id);
        Utils.showConfirm(
            'Excluir Imóvel',
            `Tem certeza que deseja excluir o imóvel "${imovel.nome}"? Esta ação não pode ser desfeita e também excluirá todos os dados relacionados (financiamentos, reformas, receitas e despesas).`,
            () => {
                DataManager.deleteImovel(id);
                Utils.showToast('Imóvel excluído com sucesso!', 'success');
                this.loadImoveisList();
            }
        );
    },

    /**
     * Filter imoveis
     */
    filterImoveis(searchTerm) {
        // Implement search filtering
        this.loadImoveisList();
    },

    /**
     * Initialize other pages (simplified implementations)
     */
    initFinanciamentos() {
        const container = document.getElementById('financiamentos-list');
        if (container) {
            container.innerHTML = '<p class="text-muted">Módulo de financiamentos em desenvolvimento...</p>';
        }
    },

    initConsorcios() {
        const container = document.getElementById('consorcios-list');
        if (container) {
            container.innerHTML = '<p class="text-muted">Módulo de consórcios em desenvolvimento...</p>';
        }
    },

    initReformas() {
        const tbody = document.getElementById('reformas-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhuma reforma cadastrada</td></tr>';
        }
    },

    initReceitas() {
        const tbody = document.getElementById('receitas-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted">Nenhuma receita cadastrada</td></tr>';
        }
    },

    initDespesas() {
        const tbody = document.getElementById('despesas-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Nenhuma despesa cadastrada</td></tr>';
        }
    },

    initDRE() {
        const result = document.getElementById('dre-result');
        if (result) {
            result.innerHTML = '<p class="text-muted">Selecione um período e clique em "Calcular" para visualizar a DRE.</p>';
        }
    },

    initBalanco() {
        const ativo = document.getElementById('balanco-ativo');
        const passivo = document.getElementById('balanco-passivo');
        if (ativo) ativo.innerHTML = '<p class="text-muted">Selecione uma data e clique em "Calcular".</p>';
        if (passivo) passivo.innerHTML = '<p class="text-muted">Selecione uma data e clique em "Calcular".</p>';
    },

    initFluxoCaixa() {
        const result = document.getElementById('fluxo-result');
        if (result) {
            result.innerHTML = '<p class="text-muted">Selecione um período e clique em "Calcular".</p>';
        }
    },

    initValorizacao() {
        const tbody = document.getElementById('valorizacao-tbody');
        if (tbody) {
            const imoveis = DataManager.getImoveis();
            if (imoveis.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Nenhum imóvel cadastrado</td></tr>';
            } else {
                tbody.innerHTML = imoveis.map(imovel => `
                    <tr>
                        <td>${imovel.nome}</td>
                        <td>${Utils.formatCurrency(imovel.valorCompra + (imovel.valorReforma || 0))}</td>
                        <td>${Utils.formatCurrency(imovel.valorMercadoAtual || imovel.valorCompra)}</td>
                        <td class="text-success">${Utils.formatCurrency((imovel.valorMercadoAtual || imovel.valorCompra) - imovel.valorCompra)}</td>
                        <td class="text-success">-</td>
                        <td class="text-success">-</td>
                        <td>${Utils.formatCurrency(0)}</td>
                        <td class="text-success">${Utils.formatCurrency(imovel.valorMercadoAtual || imovel.valorCompra)}</td>
                        <td>-</td>
                    </tr>
                `).join('');
            }
        }
    },

    initProjecao() {
        const tbody = document.getElementById('projecao-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Configure as premissas e visualize a projeção</td></tr>';
        }
    },

    initValuation() {
        const dcf = document.getElementById('valuation-dcf');
        if (dcf) {
            dcf.innerHTML = '<p class="text-muted">Clique em "Calcular Valuation" para ver os resultados.</p>';
        }
    },

    initCalendario() {
        const list = document.getElementById('calendario-list');
        if (list) {
            list.innerHTML = '<p class="text-muted">Nenhuma obrigação próxima</p>';
        }
    },

    initDocumentacao() {
        const checklist = document.getElementById('documentos-checklist');
        if (checklist) {
            checklist.innerHTML = '<p class="text-muted">Selecione um imóvel para visualizar o checklist</p>';
        }
    },

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Export all data
     */
    exportData() {
        const data = DataManager.exportAll();
        const filename = `financeiro-str-${new Date().toISOString().split('T')[0]}`;
        Utils.downloadJSON(data, filename);
        Utils.showToast('Dados exportados com sucesso!', 'success');
    },

    /**
     * Import data from file
     */
    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = DataManager.importAll(data);

                if (success) {
                    Utils.showToast('Dados importados com sucesso!', 'success');
                    this.navigateTo(this.currentPage); // Reload current page
                } else {
                    Utils.showToast('Erro ao importar dados. Verifique o arquivo.', 'error');
                }
            } catch (error) {
                Utils.showToast('Erro ao processar arquivo. Formato inválido.', 'error');
            }
        };
        reader.readAsText(file);
    },

    /**
     * Clear all data
     */
    clearAllData() {
        Utils.showConfirm(
            'Limpar Todos os Dados',
            'Tem certeza que deseja limpar TODOS os dados do sistema? Esta ação não pode ser desfeita. Recomendamos fazer uma exportação antes de continuar.',
            () => {
                DataManager.clearAll();
                Utils.showToast('Todos os dados foram removidos!', 'success');
                this.navigateTo('dashboard');
            }
        );
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
