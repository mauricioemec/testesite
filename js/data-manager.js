/**
 * Data Manager for Financial Control Application
 * Handles all data persistence using localStorage
 */

const DataManager = {
    // Storage keys
    STORAGE_KEYS: {
        IMOVEIS: 'str_imoveis',
        FINANCIAMENTOS: 'str_financiamentos',
        CONSORCIOS: 'str_consorcios',
        REFORMAS: 'str_reformas',
        RECEITAS: 'str_receitas',
        DESPESAS: 'str_despesas',
        CONFIGURACOES: 'str_configuracoes',
        PATRIMONIO: 'str_patrimonio',
        DOCUMENTOS: 'str_documentos'
    },

    /**
     * Initialize data manager
     */
    init() {
        // Initialize empty data structures if not exist
        Object.values(this.STORAGE_KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                if (key === this.STORAGE_KEYS.CONFIGURACOES) {
                    this.saveConfiguracoes(this.getDefaultConfiguracoes());
                } else {
                    localStorage.setItem(key, JSON.stringify([]));
                }
            }
        });
    },

    /**
     * Get default configurations
     */
    getDefaultConfiguracoes() {
        return {
            empresa: {
                nome: 'Minha Empresa STR',
                cnpj: '',
                endereco: '',
                telefone: '',
                email: ''
            },
            projecao: {
                taxaOcupacao: [0.75, 0.78, 0.80, 0.82, 0.85],
                crescimentoDiaria: [0.08, 0.08, 0.07, 0.07, 0.06],
                inflacaoCustos: [0.05, 0.05, 0.05, 0.04, 0.04],
                valorizacaoImobiliaria: [0.06, 0.06, 0.05, 0.05, 0.05],
                novosImoveis: [0, 1, 1, 2, 2],
                investimentoPorImovel: 500000
            },
            valuation: {
                wacc: 0.12,
                crescimentoPerpetuo: 0.03,
                multiploEbitda: 12
            },
            impostos: {
                iss: 0.05,
                irpj: 0.15,
                csll: 0.09
            },
            theme: 'light'
        };
    },

    // ========================================
    // Generic CRUD Operations
    // ========================================

    /**
     * Get all items from a collection
     */
    getAll(storageKey) {
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting data:', error);
            return [];
        }
    },

    /**
     * Get item by ID
     */
    getById(storageKey, id) {
        const items = this.getAll(storageKey);
        return items.find(item => item.id === id);
    },

    /**
     * Save item (create or update)
     */
    save(storageKey, item) {
        const items = this.getAll(storageKey);

        if (!item.id) {
            // Create new
            item.id = Utils.generateId();
            item.createdAt = new Date().toISOString();
            items.push(item);
        } else {
            // Update existing
            const index = items.findIndex(i => i.id === item.id);
            if (index !== -1) {
                item.updatedAt = new Date().toISOString();
                items[index] = item;
            } else {
                // ID exists but not found, create new
                item.createdAt = new Date().toISOString();
                items.push(item);
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(items));
        return item;
    },

    /**
     * Delete item by ID
     */
    delete(storageKey, id) {
        let items = this.getAll(storageKey);
        items = items.filter(item => item.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(items));
        return true;
    },

    // ========================================
    // Imóveis
    // ========================================

    getImoveis() {
        return this.getAll(this.STORAGE_KEYS.IMOVEIS);
    },

    getImovelById(id) {
        return this.getById(this.STORAGE_KEYS.IMOVEIS, id);
    },

    saveImovel(imovel) {
        return this.save(this.STORAGE_KEYS.IMOVEIS, imovel);
    },

    deleteImovel(id) {
        // Also delete related data
        this.deleteFinanciamentosByImovel(id);
        this.deleteReformasByImovel(id);
        this.deleteReceitasByImovel(id);
        this.deleteDespesasByImovel(id);
        return this.delete(this.STORAGE_KEYS.IMOVEIS, id);
    },

    getImoveisAtivos() {
        return this.getImoveis().filter(i => i.status === 'ativo');
    },

    // ========================================
    // Financiamentos
    // ========================================

    getFinanciamentos() {
        return this.getAll(this.STORAGE_KEYS.FINANCIAMENTOS);
    },

    getFinanciamentoById(id) {
        return this.getById(this.STORAGE_KEYS.FINANCIAMENTOS, id);
    },

    saveFinanciamento(financiamento) {
        return this.save(this.STORAGE_KEYS.FINANCIAMENTOS, financiamento);
    },

    deleteFinanciamento(id) {
        return this.delete(this.STORAGE_KEYS.FINANCIAMENTOS, id);
    },

    getFinanciamentosByImovel(imovelId) {
        return this.getFinanciamentos().filter(f => f.imovelId === imovelId);
    },

    deleteFinanciamentosByImovel(imovelId) {
        const financiamentos = this.getFinanciamentosByImovel(imovelId);
        financiamentos.forEach(f => this.deleteFinanciamento(f.id));
    },

    // ========================================
    // Consórcios
    // ========================================

    getConsorcios() {
        return this.getAll(this.STORAGE_KEYS.CONSORCIOS);
    },

    getConsorcioById(id) {
        return this.getById(this.STORAGE_KEYS.CONSORCIOS, id);
    },

    saveConsorcio(consorcio) {
        return this.save(this.STORAGE_KEYS.CONSORCIOS, consorcio);
    },

    deleteConsorcio(id) {
        return this.delete(this.STORAGE_KEYS.CONSORCIOS, id);
    },

    getConsorciosAtivos() {
        return this.getConsorcios().filter(c => c.status !== 'encerrado');
    },

    // ========================================
    // Reformas
    // ========================================

    getReformas() {
        return this.getAll(this.STORAGE_KEYS.REFORMAS);
    },

    getReformaById(id) {
        return this.getById(this.STORAGE_KEYS.REFORMAS, id);
    },

    saveReforma(reforma) {
        return this.save(this.STORAGE_KEYS.REFORMAS, reforma);
    },

    deleteReforma(id) {
        return this.delete(this.STORAGE_KEYS.REFORMAS, id);
    },

    getReformasByImovel(imovelId) {
        return this.getReformas().filter(r => r.imovelId === imovelId);
    },

    deleteReformasByImovel(imovelId) {
        const reformas = this.getReformasByImovel(imovelId);
        reformas.forEach(r => this.deleteReforma(r.id));
    },

    // ========================================
    // Receitas
    // ========================================

    getReceitas() {
        return this.getAll(this.STORAGE_KEYS.RECEITAS);
    },

    getReceitaById(id) {
        return this.getById(this.STORAGE_KEYS.RECEITAS, id);
    },

    saveReceita(receita) {
        return this.save(this.STORAGE_KEYS.RECEITAS, receita);
    },

    deleteReceita(id) {
        return this.delete(this.STORAGE_KEYS.RECEITAS, id);
    },

    getReceitasByImovel(imovelId) {
        return this.getReceitas().filter(r => r.imovelId === imovelId);
    },

    getReceitasByPeriodo(startDate, endDate) {
        return this.getReceitas().filter(r => {
            const receitaDate = new Date(r.dataCheckIn);
            return receitaDate >= new Date(startDate) && receitaDate <= new Date(endDate);
        });
    },

    deleteReceitasByImovel(imovelId) {
        const receitas = this.getReceitasByImovel(imovelId);
        receitas.forEach(r => this.deleteReceita(r.id));
    },

    // ========================================
    // Despesas
    // ========================================

    getDespesas() {
        return this.getAll(this.STORAGE_KEYS.DESPESAS);
    },

    getDespesaById(id) {
        return this.getById(this.STORAGE_KEYS.DESPESAS, id);
    },

    saveDespesa(despesa) {
        return this.save(this.STORAGE_KEYS.DESPESAS, despesa);
    },

    deleteDespesa(id) {
        return this.delete(this.STORAGE_KEYS.DESPESAS, id);
    },

    getDespesasByImovel(imovelId) {
        return this.getDespesas().filter(d => d.imovelId === imovelId);
    },

    getDespesasByPeriodo(startDate, endDate) {
        return this.getDespesas().filter(d => {
            const despesaDate = new Date(d.data);
            return despesaDate >= new Date(startDate) && despesaDate <= new Date(endDate);
        });
    },

    deleteDespesasByImovel(imovelId) {
        const despesas = this.getDespesasByImovel(imovelId);
        despesas.forEach(d => this.deleteDespesa(d.id));
    },

    // ========================================
    // Configurações
    // ========================================

    getConfiguracoes() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.CONFIGURACOES);
            return data ? JSON.parse(data) : this.getDefaultConfiguracoes();
        } catch (error) {
            console.error('Error getting configurations:', error);
            return this.getDefaultConfiguracoes();
        }
    },

    saveConfiguracoes(config) {
        localStorage.setItem(this.STORAGE_KEYS.CONFIGURACOES, JSON.stringify(config));
        return config;
    },

    // ========================================
    // Patrimônio (Valorização)
    // ========================================

    getPatrimonio() {
        return this.getAll(this.STORAGE_KEYS.PATRIMONIO);
    },

    savePatrimonio(patrimonio) {
        return this.save(this.STORAGE_KEYS.PATRIMONIO, patrimonio);
    },

    getPatrimonioByImovel(imovelId) {
        return this.getPatrimonio().filter(p => p.imovelId === imovelId);
    },

    // ========================================
    // Documentos
    // ========================================

    getDocumentos() {
        return this.getAll(this.STORAGE_KEYS.DOCUMENTOS);
    },

    saveDocumento(documento) {
        return this.save(this.STORAGE_KEYS.DOCUMENTOS, documento);
    },

    deleteDocumento(id) {
        return this.delete(this.STORAGE_KEYS.DOCUMENTOS, id);
    },

    getDocumentosByImovel(imovelId) {
        return this.getDocumentos().filter(d => d.imovelId === imovelId);
    },

    // ========================================
    // Statistics & Aggregations
    // ========================================

    /**
     * Get monthly revenue statistics
     */
    getMonthlyRevenue(year, month) {
        const receitas = this.getReceitas();
        return receitas
            .filter(r => {
                const d = new Date(r.dataCheckIn);
                return d.getFullYear() === year && d.getMonth() === month;
            })
            .reduce((sum, r) => sum + (r.valorLiquido || 0), 0);
    },

    /**
     * Get monthly expenses
     */
    getMonthlyExpenses(year, month) {
        const despesas = this.getDespesas();
        return despesas
            .filter(d => {
                const date = new Date(d.data);
                return date.getFullYear() === year && date.getMonth() === month;
            })
            .reduce((sum, d) => sum + (d.valor || 0), 0);
    },

    /**
     * Get total debt (financiamentos + consórcios)
     */
    getTotalDebt() {
        const financiamentos = this.getFinanciamentos();
        const consorcios = this.getConsorcios();

        const debtFinanciamentos = financiamentos.reduce((sum, f) => {
            return sum + (f.saldoDevedor || 0);
        }, 0);

        const debtConsorcios = consorcios
            .filter(c => c.status !== 'encerrado')
            .reduce((sum, c) => {
                const parcelasPagas = c.parcelasPagas || 0;
                const valorParcela = c.valorParcela || 0;
                const prazoTotal = c.prazoTotal || 0;
                return sum + (valorParcela * (prazoTotal - parcelasPagas));
            }, 0);

        return debtFinanciamentos + debtConsorcios;
    },

    /**
     * Get total property value
     */
    getTotalPropertyValue() {
        const imoveis = this.getImoveisAtivos();
        return imoveis.reduce((sum, i) => {
            return sum + (i.valorMercadoAtual || i.valorCompra || 0);
        }, 0);
    },

    /**
     * Get total equity
     */
    getTotalEquity() {
        return this.getTotalPropertyValue() - this.getTotalDebt();
    },

    /**
     * Get portfolio occupancy rate
     */
    getOccupancyRate(year, month) {
        const imoveis = this.getImoveisAtivos();
        const receitas = this.getReceitas();

        if (imoveis.length === 0) return 0;

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalAvailableDays = imoveis.length * daysInMonth;

        const occupiedDays = receitas
            .filter(r => {
                const checkIn = new Date(r.dataCheckIn);
                const checkOut = new Date(r.dataCheckOut);
                return (checkIn.getFullYear() === year && checkIn.getMonth() === month) ||
                       (checkOut.getFullYear() === year && checkOut.getMonth() === month);
            })
            .reduce((sum, r) => sum + (r.numeroDiarias || 0), 0);

        return totalAvailableDays > 0 ? occupiedDays / totalAvailableDays : 0;
    },

    /**
     * Get Average Daily Rate (ADR)
     */
    getADR(year, month) {
        const receitas = this.getReceitas().filter(r => {
            const d = new Date(r.dataCheckIn);
            return d.getFullYear() === year && d.getMonth() === month;
        });

        if (receitas.length === 0) return 0;

        const totalRevenue = receitas.reduce((sum, r) => sum + (r.valorBruto || 0), 0);
        const totalDays = receitas.reduce((sum, r) => sum + (r.numeroDiarias || 0), 0);

        return totalDays > 0 ? totalRevenue / totalDays : 0;
    },

    /**
     * Get Revenue per Available Room (RevPAR)
     */
    getRevPAR(year, month) {
        const occupancy = this.getOccupancyRate(year, month);
        const adr = this.getADR(year, month);
        return occupancy * adr;
    },

    // ========================================
    // Import/Export
    // ========================================

    /**
     * Export all data
     */
    exportAll() {
        const data = {};
        Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
            const value = localStorage.getItem(storageKey);
            data[key] = value ? JSON.parse(value) : null;
        });

        data.exportDate = new Date().toISOString();
        data.version = '1.0.0';

        return data;
    },

    /**
     * Import data
     */
    importAll(data) {
        try {
            // Validate data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }

            // Import each collection
            Object.entries(this.STORAGE_KEYS).forEach(([key, storageKey]) => {
                if (data[key]) {
                    localStorage.setItem(storageKey, JSON.stringify(data[key]));
                }
            });

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },

    /**
     * Clear all data
     */
    clearAll() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    },

    /**
     * Get storage size in bytes
     */
    getStorageSize() {
        let total = 0;
        Object.values(this.STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                total += item.length;
            }
        });
        return total;
    },

    /**
     * Get storage size in human readable format
     */
    getStorageSizeFormatted() {
        const bytes = this.getStorageSize();
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
};

// Initialize data manager on load
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
