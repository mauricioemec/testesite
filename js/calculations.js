/**
 * Financial Calculations for Financial Control Application
 * Contains all financial formulas and calculations
 */

const Calculations = {

    // ========================================
    // Loan Amortization - SAC (Sistema de Amortização Constante)
    // ========================================

    /**
     * Generate SAC amortization table
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate (0.10 = 10%)
     * @param {number} months - Total months
     * @param {Date} startDate - Start date
     * @returns {Array} Amortization table
     */
    generateSACTable(principal, annualRate, months, startDate) {
        const table = [];
        const monthlyRate = annualRate / 12;
        const amortization = principal / months;
        let balance = principal;

        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const payment = amortization + interest;
            balance -= amortization;

            const paymentDate = Utils.addMonths(startDate, i - 1);

            table.push({
                number: i,
                date: paymentDate,
                payment: payment,
                interest: interest,
                amortization: amortization,
                balance: Math.max(0, balance)
            });
        }

        return table;
    },

    /**
     * Calculate remaining balance for SAC
     * @param {number} principal - Loan amount
     * @param {number} months - Total months
     * @param {number} paidMonths - Months already paid
     * @returns {number} Remaining balance
     */
    getSACRemainingBalance(principal, months, paidMonths) {
        const amortization = principal / months;
        return Math.max(0, principal - (amortization * paidMonths));
    },

    // ========================================
    // Loan Amortization - PRICE (Sistema Francês)
    // ========================================

    /**
     * Calculate PRICE fixed payment
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate (0.10 = 10%)
     * @param {number} months - Total months
     * @returns {number} Fixed monthly payment
     */
    calculatePRICEPayment(principal, annualRate, months) {
        const monthlyRate = annualRate / 12;

        if (monthlyRate === 0) {
            return principal / months;
        }

        const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                       (Math.pow(1 + monthlyRate, months) - 1);

        return payment;
    },

    /**
     * Generate PRICE amortization table
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate (0.10 = 10%)
     * @param {number} months - Total months
     * @param {Date} startDate - Start date
     * @returns {Array} Amortization table
     */
    generatePRICETable(principal, annualRate, months, startDate) {
        const table = [];
        const monthlyRate = annualRate / 12;
        const payment = this.calculatePRICEPayment(principal, annualRate, months);
        let balance = principal;

        for (let i = 1; i <= months; i++) {
            const interest = balance * monthlyRate;
            const amortization = payment - interest;
            balance -= amortization;

            const paymentDate = Utils.addMonths(startDate, i - 1);

            table.push({
                number: i,
                date: paymentDate,
                payment: payment,
                interest: interest,
                amortization: amortization,
                balance: Math.max(0, balance)
            });
        }

        return table;
    },

    /**
     * Calculate remaining balance for PRICE
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate
     * @param {number} months - Total months
     * @param {number} paidMonths - Months already paid
     * @returns {number} Remaining balance
     */
    getPRICERemainingBalance(principal, annualRate, months, paidMonths) {
        const monthlyRate = annualRate / 12;
        const payment = this.calculatePRICEPayment(principal, annualRate, months);

        if (paidMonths >= months) return 0;

        const remainingMonths = months - paidMonths;
        const balance = payment * ((Math.pow(1 + monthlyRate, remainingMonths) - 1) /
                       (monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)));

        return Math.max(0, balance);
    },

    // ========================================
    // Depreciation
    // ========================================

    /**
     * Calculate linear depreciation
     * @param {number} value - Asset value
     * @param {number} lifeYears - Useful life in years
     * @param {number} yearsUsed - Years already used
     * @returns {Object} Depreciation info
     */
    calculateDepreciation(value, lifeYears, yearsUsed = 0) {
        const annualDepreciation = value / lifeYears;
        const accumulatedDepreciation = annualDepreciation * yearsUsed;
        const bookValue = value - accumulatedDepreciation;
        const remainingLife = Math.max(0, lifeYears - yearsUsed);

        return {
            annualDepreciation,
            accumulatedDepreciation,
            bookValue,
            remainingLife
        };
    },

    /**
     * Calculate monthly depreciation
     * @param {number} value - Asset value
     * @param {number} lifeYears - Useful life in years
     * @returns {number} Monthly depreciation
     */
    calculateMonthlyDepreciation(value, lifeYears) {
        return (value / lifeYears) / 12;
    },

    // ========================================
    // Property Metrics
    // ========================================

    /**
     * Calculate NOI (Net Operating Income)
     * @param {number} grossRevenue - Gross revenue
     * @param {number} operatingExpenses - Operating expenses
     * @returns {number} NOI
     */
    calculateNOI(grossRevenue, operatingExpenses) {
        return grossRevenue - operatingExpenses;
    },

    /**
     * Calculate Cap Rate
     * @param {number} noi - Net Operating Income
     * @param {number} propertyValue - Property value
     * @returns {number} Cap Rate (0.08 = 8%)
     */
    calculateCapRate(noi, propertyValue) {
        if (propertyValue === 0) return 0;
        return noi / propertyValue;
    },

    /**
     * Calculate Cash on Cash Return
     * @param {number} annualCashFlow - Annual cash flow
     * @param {number} cashInvested - Total cash invested
     * @returns {number} Cash on cash return (0.15 = 15%)
     */
    calculateCashOnCash(annualCashFlow, cashInvested) {
        if (cashInvested === 0) return 0;
        return annualCashFlow / cashInvested;
    },

    /**
     * Calculate LTV (Loan to Value)
     * @param {number} loanAmount - Loan amount
     * @param {number} propertyValue - Property value
     * @returns {number} LTV (0.70 = 70%)
     */
    calculateLTV(loanAmount, propertyValue) {
        if (propertyValue === 0) return 0;
        return loanAmount / propertyValue;
    },

    /**
     * Calculate Equity
     * @param {number} propertyValue - Current property value
     * @param {number} debt - Outstanding debt
     * @returns {number} Equity
     */
    calculateEquity(propertyValue, debt) {
        return propertyValue - debt;
    },

    /**
     * Calculate property appreciation
     * @param {number} purchasePrice - Purchase price
     * @param {number} currentValue - Current value
     * @param {number} years - Years held
     * @returns {Object} Appreciation info
     */
    calculateAppreciation(purchasePrice, currentValue, years) {
        const totalAppreciation = currentValue - purchasePrice;
        const percentAppreciation = purchasePrice > 0 ? totalAppreciation / purchasePrice : 0;
        const annualizedReturn = years > 0 ? Math.pow(currentValue / purchasePrice, 1 / years) - 1 : 0;

        return {
            totalAppreciation,
            percentAppreciation,
            annualizedReturn
        };
    },

    // ========================================
    // DRE (Income Statement) Calculations
    // ========================================

    /**
     * Calculate complete DRE for a period
     * @param {Object} data - Revenue and expense data
     * @returns {Object} DRE structure
     */
    calculateDRE(data) {
        const {
            receitaBruta = 0,
            taxasPlataforma = 0,
            impostos = 0,
            custosVariaveis = 0,
            despesasFixas = 0,
            depreciacao = 0,
            despesasFinanceiras = 0,
            receitasFinanceiras = 0,
            ir = 0,
            csll = 0
        } = data;

        // Receita Líquida
        const deducoes = taxasPlataforma + impostos;
        const receitaLiquida = receitaBruta - deducoes;

        // Lucro Bruto
        const lucroBruto = receitaLiquida - custosVariaveis;

        // EBITDA
        const ebitda = lucroBruto - despesasFixas;

        // EBIT
        const ebit = ebitda - depreciacao;

        // LAIR (Lucro Antes do IR)
        const lair = ebit - despesasFinanceiras + receitasFinanceiras;

        // Lucro Líquido
        const lucroLiquido = lair - ir - csll;

        // Margens
        const margemBruta = receitaBruta > 0 ? lucroBruto / receitaBruta : 0;
        const margemEbitda = receitaBruta > 0 ? ebitda / receitaBruta : 0;
        const margemLiquida = receitaBruta > 0 ? lucroLiquido / receitaBruta : 0;

        return {
            receitaBruta,
            deducoes,
            receitaLiquida,
            custosVariaveis,
            lucroBruto,
            despesasFixas,
            ebitda,
            depreciacao,
            ebit,
            despesasFinanceiras,
            receitasFinanceiras,
            lair,
            ir,
            csll,
            lucroLiquido,
            margemBruta,
            margemEbitda,
            margemLiquida
        };
    },

    // ========================================
    // Balance Sheet Calculations
    // ========================================

    /**
     * Calculate balance sheet
     * @param {Object} data - Asset and liability data
     * @returns {Object} Balance sheet structure
     */
    calculateBalanceSheet(data) {
        const {
            caixaEquivalentes = 0,
            contasReceber = 0,
            outrosAtivosCirculantes = 0,
            imoveis = 0,
            depreciacaoAcumulada = 0,
            moveisEquipamentos = 0,
            depreciacaoMoveisAcumulada = 0,
            outrosAtivosNaoCirculantes = 0,
            fornecedores = 0,
            impostosPagar = 0,
            financiamentosCurtoPrazo = 0,
            outrosPassivosCirculantes = 0,
            financiamentosLongoPrazo = 0,
            outrosPassivosNaoCirculantes = 0,
            capitalSocial = 0,
            reservas = 0,
            lucrosAcumulados = 0
        } = data;

        // Ativo Circulante
        const ativoCirculante = caixaEquivalentes + contasReceber + outrosAtivosCirculantes;

        // Ativo Não Circulante
        const imoveisLiquidos = imoveis - depreciacaoAcumulada;
        const moveisLiquidos = moveisEquipamentos - depreciacaoMoveisAcumulada;
        const ativoNaoCirculante = imoveisLiquidos + moveisLiquidos + outrosAtivosNaoCirculantes;

        // Total Ativo
        const ativoTotal = ativoCirculante + ativoNaoCirculante;

        // Passivo Circulante
        const passivoCirculante = fornecedores + impostosPagar +
                                 financiamentosCurtoPrazo + outrosPassivosCirculantes;

        // Passivo Não Circulante
        const passivoNaoCirculante = financiamentosLongoPrazo + outrosPassivosNaoCirculantes;

        // Total Passivo
        const passivoTotal = passivoCirculante + passivoNaoCirculante;

        // Patrimônio Líquido
        const patrimonioLiquido = capitalSocial + reservas + lucrosAcumulados;

        // Total Passivo + PL
        const passivoMaisPL = passivoTotal + patrimonioLiquido;

        // Validação
        const balanced = Math.abs(ativoTotal - passivoMaisPL) < 0.01;

        return {
            ativo: {
                circulante: {
                    caixaEquivalentes,
                    contasReceber,
                    outrosAtivosCirculantes,
                    total: ativoCirculante
                },
                naoCirculante: {
                    imoveis,
                    depreciacaoAcumulada,
                    imoveisLiquidos,
                    moveisEquipamentos,
                    depreciacaoMoveisAcumulada,
                    moveisLiquidos,
                    outrosAtivosNaoCirculantes,
                    total: ativoNaoCirculante
                },
                total: ativoTotal
            },
            passivo: {
                circulante: {
                    fornecedores,
                    impostosPagar,
                    financiamentosCurtoPrazo,
                    outrosPassivosCirculantes,
                    total: passivoCirculante
                },
                naoCirculante: {
                    financiamentosLongoPrazo,
                    outrosPassivosNaoCirculantes,
                    total: passivoNaoCirculante
                },
                total: passivoTotal
            },
            patrimonioLiquido: {
                capitalSocial,
                reservas,
                lucrosAcumulados,
                total: patrimonioLiquido
            },
            passivoMaisPL,
            balanced
        };
    },

    // ========================================
    // Cash Flow Calculations
    // ========================================

    /**
     * Calculate cash flow statement
     * @param {Object} data - Cash flow data
     * @returns {Object} Cash flow structure
     */
    calculateCashFlow(data) {
        const {
            recebimentos = 0,
            pagamentosOperacionais = 0,
            pagamentosImpostos = 0,
            aquisicoesAtivos = 0,
            vendasAtivos = 0,
            aportesCapital = 0,
            pagamentosFinanciamentos = 0,
            distribuicaoLucros = 0,
            saldoInicial = 0
        } = data;

        // Atividades Operacionais
        const fluxoOperacional = recebimentos - pagamentosOperacionais - pagamentosImpostos;

        // Atividades de Investimento
        const fluxoInvestimento = vendasAtivos - aquisicoesAtivos;

        // Atividades de Financiamento
        const fluxoFinanciamento = aportesCapital - pagamentosFinanciamentos - distribuicaoLucros;

        // Fluxo Total
        const fluxoTotal = fluxoOperacional + fluxoInvestimento + fluxoFinanciamento;

        // Saldo Final
        const saldoFinal = saldoInicial + fluxoTotal;

        return {
            operacional: {
                recebimentos,
                pagamentosOperacionais,
                pagamentosImpostos,
                total: fluxoOperacional
            },
            investimento: {
                aquisicoesAtivos,
                vendasAtivos,
                total: fluxoInvestimento
            },
            financiamento: {
                aportesCapital,
                pagamentosFinanciamentos,
                distribuicaoLucros,
                total: fluxoFinanciamento
            },
            saldoInicial,
            fluxoTotal,
            saldoFinal
        };
    },

    // ========================================
    // Valuation - DCF (Discounted Cash Flow)
    // ========================================

    /**
     * Calculate DCF valuation
     * @param {Array} cashFlows - Projected cash flows
     * @param {number} discountRate - Discount rate (WACC)
     * @param {number} terminalGrowthRate - Terminal growth rate
     * @returns {Object} DCF valuation
     */
    calculateDCF(cashFlows, discountRate, terminalGrowthRate) {
        let presentValue = 0;

        // Calculate PV of projected cash flows
        cashFlows.forEach((cf, index) => {
            const year = index + 1;
            const pv = cf / Math.pow(1 + discountRate, year);
            presentValue += pv;
        });

        // Calculate terminal value
        const lastCashFlow = cashFlows[cashFlows.length - 1];
        const terminalValue = (lastCashFlow * (1 + terminalGrowthRate)) /
                             (discountRate - terminalGrowthRate);

        // PV of terminal value
        const pvTerminalValue = terminalValue / Math.pow(1 + discountRate, cashFlows.length);

        // Enterprise value
        const enterpriseValue = presentValue + pvTerminalValue;

        return {
            pvCashFlows: presentValue,
            terminalValue,
            pvTerminalValue,
            enterpriseValue
        };
    },

    /**
     * Calculate equity value from enterprise value
     * @param {number} enterpriseValue - Enterprise value
     * @param {number} debt - Total debt
     * @param {number} cash - Cash and equivalents
     * @returns {number} Equity value
     */
    calculateEquityValue(enterpriseValue, debt, cash) {
        return enterpriseValue - debt + cash;
    },

    // ========================================
    // Valuation - NAV (Net Asset Value)
    // ========================================

    /**
     * Calculate NAV
     * @param {number} totalAssets - Total assets at market value
     * @param {number} totalLiabilities - Total liabilities
     * @returns {number} NAV
     */
    calculateNAV(totalAssets, totalLiabilities) {
        return totalAssets - totalLiabilities;
    },

    // ========================================
    // Valuation - Multiples
    // ========================================

    /**
     * Calculate EV/EBITDA multiple
     * @param {number} enterpriseValue - Enterprise value
     * @param {number} ebitda - EBITDA
     * @returns {number} EV/EBITDA
     */
    calculateEVtoEBITDA(enterpriseValue, ebitda) {
        if (ebitda === 0) return 0;
        return enterpriseValue / ebitda;
    },

    /**
     * Calculate EV/Revenue multiple
     * @param {number} enterpriseValue - Enterprise value
     * @param {number} revenue - Revenue
     * @returns {number} EV/Revenue
     */
    calculateEVtoRevenue(enterpriseValue, revenue) {
        if (revenue === 0) return 0;
        return enterpriseValue / revenue;
    },

    // ========================================
    // Projection Calculations
    // ========================================

    /**
     * Project revenue for multiple years
     * @param {number} baseRevenue - Base year revenue
     * @param {Array} growthRates - Growth rates for each year
     * @returns {Array} Projected revenues
     */
    projectRevenue(baseRevenue, growthRates) {
        const projections = [baseRevenue];

        growthRates.forEach(rate => {
            const lastRevenue = projections[projections.length - 1];
            projections.push(lastRevenue * (1 + rate));
        });

        return projections.slice(1); // Remove base year
    },

    /**
     * Project expenses with inflation
     * @param {number} baseExpense - Base year expense
     * @param {Array} inflationRates - Inflation rates for each year
     * @returns {Array} Projected expenses
     */
    projectExpenses(baseExpense, inflationRates) {
        const projections = [baseExpense];

        inflationRates.forEach(rate => {
            const lastExpense = projections[projections.length - 1];
            projections.push(lastExpense * (1 + rate));
        });

        return projections.slice(1); // Remove base year
    },

    // ========================================
    // Consortium Calculations
    // ========================================

    /**
     * Calculate consortium total cost
     * @param {number} creditAmount - Credit amount
     * @param {number} adminFee - Administration fee (0.15 = 15%)
     * @param {number} reserveFund - Reserve fund (0.05 = 5%)
     * @param {number} insurance - Insurance (0.02 = 2%)
     * @param {number} months - Total months
     * @returns {Object} Consortium calculations
     */
    calculateConsortium(creditAmount, adminFee, reserveFund, insurance, months) {
        const totalFees = adminFee + reserveFund + insurance;
        const monthlyPayment = (creditAmount / months) * (1 + totalFees);
        const totalPaid = monthlyPayment * months;
        const totalCost = totalPaid - creditAmount;

        return {
            monthlyPayment,
            totalPaid,
            totalCost,
            effectiveRate: totalCost / creditAmount
        };
    },

    // ========================================
    // Tax Calculations
    // ========================================

    /**
     * Calculate ISS (Service Tax)
     * @param {number} revenue - Gross revenue
     * @param {number} rate - ISS rate (0.05 = 5%)
     * @returns {number} ISS amount
     */
    calculateISS(revenue, rate = 0.05) {
        return revenue * rate;
    },

    /**
     * Calculate IR and CSLL (Corporate Income Tax)
     * @param {number} profit - Taxable profit
     * @param {number} irRate - IR rate (0.15 = 15%)
     * @param {number} csllRate - CSLL rate (0.09 = 9%)
     * @returns {Object} Tax amounts
     */
    calculateCorporateTax(profit, irRate = 0.15, csllRate = 0.09) {
        const ir = profit > 0 ? profit * irRate : 0;
        const csll = profit > 0 ? profit * csllRate : 0;
        const total = ir + csll;

        return { ir, csll, total };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculations;
}
