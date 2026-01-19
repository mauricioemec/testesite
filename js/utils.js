/**
 * Utility Functions for Financial Control Application
 * Provides helper functions for formatting, validation, and UI interactions
 */

const Utils = {
    /**
     * Format number as Brazilian currency (R$)
     * @param {number} value - The value to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(value) {
        if (value === null || value === undefined || isNaN(value)) {
            return 'R$ 0,00';
        }
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    /**
     * Parse currency string to number
     * @param {string} value - Currency string (e.g., "R$ 1.234,56")
     * @returns {number} Parsed number
     */
    parseCurrency(value) {
        if (!value) return 0;
        const cleaned = value.toString()
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        return parseFloat(cleaned) || 0;
    },

    /**
     * Format number as percentage
     * @param {number} value - The value to format (0.15 = 15%)
     * @param {number} decimals - Number of decimal places (default: 2)
     * @returns {string} Formatted percentage string
     */
    formatPercent(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0%';
        }
        return (value * 100).toFixed(decimals) + '%';
    },

    /**
     * Parse percentage string to decimal (15% = 0.15)
     * @param {string} value - Percentage string
     * @returns {number} Decimal value
     */
    parsePercent(value) {
        if (!value) return 0;
        const cleaned = value.toString().replace('%', '').replace(',', '.');
        return parseFloat(cleaned) / 100 || 0;
    },

    /**
     * Format number with thousand separators
     * @param {number} value - The value to format
     * @param {number} decimals - Number of decimal places (default: 2)
     * @returns {string} Formatted number string
     */
    formatNumber(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0';
        }
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },

    /**
     * Format date to Brazilian format (DD/MM/YYYY)
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;
    },

    /**
     * Parse date string (DD/MM/YYYY or YYYY-MM-DD) to Date object
     * @param {string} dateStr - Date string
     * @returns {Date} Date object
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        // Try DD/MM/YYYY format
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(year, month - 1, day);
        }

        // Try YYYY-MM-DD format (ISO)
        return new Date(dateStr);
    },

    /**
     * Format date for input[type="date"] (YYYY-MM-DD)
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDateInput(date) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    },

    /**
     * Get current date in YYYY-MM-DD format
     * @returns {string} Current date
     */
    getCurrentDate() {
        return this.formatDateInput(new Date());
    },

    /**
     * Calculate difference in days between two dates
     * @param {Date|string} date1 - First date
     * @param {Date|string} date2 - Second date
     * @returns {number} Number of days
     */
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    /**
     * Calculate difference in months between two dates
     * @param {Date|string} date1 - First date
     * @param {Date|string} date2 - Second date
     * @returns {number} Number of months
     */
    monthsBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    },

    /**
     * Add months to a date
     * @param {Date|string} date - Starting date
     * @param {number} months - Number of months to add
     * @returns {Date} New date
     */
    addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate required field
     * @param {*} value - Value to validate
     * @returns {boolean} True if not empty
     */
    validateRequired(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        return true;
    },

    /**
     * Validate number is positive
     * @param {number} value - Value to validate
     * @returns {boolean} True if positive
     */
    validatePositive(value) {
        return !isNaN(value) && parseFloat(value) > 0;
    },

    /**
     * Validate date is not in the future
     * @param {Date|string} date - Date to validate
     * @returns {boolean} True if not in future
     */
    validatePastDate(date) {
        const d = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return d <= today;
    },

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: success, error, warning, info (default: info)
     * @param {number} duration - Duration in ms (default: 3000)
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon"></i>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Show confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Modal message
     * @param {Function} onConfirm - Callback on confirm
     * @param {Function} onCancel - Callback on cancel (optional)
     */
    showConfirm(title, message, onConfirm, onCancel = null) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        container.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="btn-close" id="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
                    <button class="btn btn-danger" id="modal-confirm">Confirmar</button>
                </div>
            </div>
        `;

        container.classList.remove('hidden');

        const closeModal = () => {
            container.classList.add('hidden');
            container.innerHTML = '';
        };

        document.getElementById('modal-close').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });

        document.getElementById('modal-confirm').addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });

        // Close on backdrop click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                closeModal();
                if (onCancel) onCancel();
            }
        });
    },

    /**
     * Show custom modal with HTML content
     * @param {string} title - Modal title
     * @param {string} content - HTML content
     * @param {Array} buttons - Array of button objects {text, class, onClick}
     */
    showModal(title, content, buttons = []) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        const buttonsHtml = buttons.map((btn, index) => {
            return `<button class="btn ${btn.class || 'btn-secondary'}" id="modal-btn-${index}">${btn.text}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="btn-close" id="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `<div class="modal-footer">${buttonsHtml}</div>` : ''}
            </div>
        `;

        container.classList.remove('hidden');

        const closeModal = () => {
            container.classList.add('hidden');
            container.innerHTML = '';
        };

        document.getElementById('modal-close').addEventListener('click', closeModal);

        buttons.forEach((btn, index) => {
            const btnElement = document.getElementById(`modal-btn-${index}`);
            if (btnElement) {
                btnElement.addEventListener('click', () => {
                    if (btn.onClick) btn.onClick();
                    if (btn.closeOnClick !== false) closeModal();
                });
            }
        });

        // Close on backdrop click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                closeModal();
            }
        });

        return closeModal;
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Sort array of objects by property
     * @param {Array} array - Array to sort
     * @param {string} property - Property to sort by
     * @param {string} order - Order: 'asc' or 'desc' (default: 'asc')
     * @returns {Array} Sorted array
     */
    sortBy(array, property, order = 'asc') {
        return array.sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filter array of objects by search term
     * @param {Array} array - Array to filter
     * @param {string} searchTerm - Search term
     * @param {Array} properties - Properties to search in
     * @returns {Array} Filtered array
     */
    searchFilter(array, searchTerm, properties) {
        if (!searchTerm) return array;

        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return properties.some(prop => {
                const value = item[prop];
                if (value === null || value === undefined) return false;
                return value.toString().toLowerCase().includes(term);
            });
        });
    },

    /**
     * Calculate percentage change
     * @param {number} oldValue - Old value
     * @param {number} newValue - New value
     * @returns {number} Percentage change (0.15 = 15% increase)
     */
    percentageChange(oldValue, newValue) {
        if (oldValue === 0) return newValue > 0 ? 1 : 0;
        return (newValue - oldValue) / oldValue;
    },

    /**
     * Clamp number between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Download data as JSON file
     * @param {*} data - Data to download
     * @param {string} filename - File name (without extension)
     */
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Export table to CSV
     * @param {string} tableId - Table element ID
     * @param {string} filename - File name (without extension)
     */
    exportTableToCSV(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) return;

        let csv = [];
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const rowData = Array.from(cols).map(col => {
                let data = col.textContent.trim();
                // Escape quotes
                data = data.replace(/"/g, '""');
                // Wrap in quotes if contains comma
                if (data.includes(',')) {
                    data = `"${data}"`;
                }
                return data;
            });
            csv.push(rowData.join(','));
        });

        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Get month name in Portuguese
     * @param {number} monthIndex - Month index (0-11)
     * @returns {string} Month name
     */
    getMonthName(monthIndex) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[monthIndex];
    },

    /**
     * Get short month name in Portuguese
     * @param {number} monthIndex - Month index (0-11)
     * @returns {string} Short month name
     */
    getShortMonthName(monthIndex) {
        const months = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return months[monthIndex];
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
