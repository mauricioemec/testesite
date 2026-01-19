/**
 * Form Validation and Handling for Financial Control Application
 * Provides form validation, submission handling, and dynamic form generation
 */

const Forms = {
    /**
     * Validate form data
     * @param {Object} data - Form data to validate
     * @param {Object} rules - Validation rules
     * @returns {Object} Validation result {valid: boolean, errors: Object}
     */
    validate(data, rules) {
        const errors = {};
        let valid = true;

        Object.keys(rules).forEach(field => {
            const value = data[field];
            const fieldRules = rules[field];

            // Required validation
            if (fieldRules.required && !Utils.validateRequired(value)) {
                errors[field] = 'Este campo é obrigatório';
                valid = false;
                return;
            }

            // Skip other validations if field is empty and not required
            if (!value && !fieldRules.required) {
                return;
            }

            // Type validations
            if (fieldRules.type === 'email' && !Utils.validateEmail(value)) {
                errors[field] = 'Email inválido';
                valid = false;
            }

            if (fieldRules.type === 'number') {
                const num = parseFloat(value);
                if (isNaN(num)) {
                    errors[field] = 'Valor numérico inválido';
                    valid = false;
                    return;
                }

                if (fieldRules.min !== undefined && num < fieldRules.min) {
                    errors[field] = `Valor mínimo: ${fieldRules.min}`;
                    valid = false;
                }

                if (fieldRules.max !== undefined && num > fieldRules.max) {
                    errors[field] = `Valor máximo: ${fieldRules.max}`;
                    valid = false;
                }

                if (fieldRules.positive && !Utils.validatePositive(num)) {
                    errors[field] = 'Valor deve ser positivo';
                    valid = false;
                }
            }

            if (fieldRules.type === 'date') {
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    errors[field] = 'Data inválida';
                    valid = false;
                    return;
                }

                if (fieldRules.pastOnly && !Utils.validatePastDate(value)) {
                    errors[field] = 'Data não pode ser futura';
                    valid = false;
                }
            }

            // Custom validation
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customResult = fieldRules.custom(value, data);
                if (customResult !== true) {
                    errors[field] = customResult || 'Validação falhou';
                    valid = false;
                }
            }
        });

        return { valid, errors };
    },

    /**
     * Show validation errors on form
     * @param {string} formId - Form element ID
     * @param {Object} errors - Errors object
     */
    showErrors(formId, errors) {
        // Clear previous errors
        this.clearErrors(formId);

        Object.keys(errors).forEach(field => {
            const input = document.querySelector(`#${formId} [name="${field}"]`);
            if (!input) return;

            // Add error class
            input.classList.add('error');

            // Create error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.textContent = errors[field];

            // Insert after input
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        });
    },

    /**
     * Clear validation errors from form
     * @param {string} formId - Form element ID
     */
    clearErrors(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        // Remove error classes
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });

        // Remove error messages
        form.querySelectorAll('.form-error').forEach(el => {
            el.remove();
        });
    },

    /**
     * Get form data as object
     * @param {string} formId - Form element ID
     * @returns {Object} Form data
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            // Handle checkboxes
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.type === 'checkbox') {
                if (!data[key]) {
                    data[key] = [];
                }
                if (input.checked) {
                    data[key].push(value);
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    },

    /**
     * Populate form with data
     * @param {string} formId - Form element ID
     * @param {Object} data - Data to populate
     */
    populateForm(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (!input) return;

            if (input.type === 'checkbox') {
                input.checked = data[key] === true || data[key] === 'true';
            } else if (input.type === 'radio') {
                const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else if (input.tagName === 'SELECT' && Array.isArray(data[key])) {
                Array.from(input.options).forEach(option => {
                    option.selected = data[key].includes(option.value);
                });
            } else {
                input.value = data[key] || '';
            }
        });
    },

    /**
     * Reset form
     * @param {string} formId - Form element ID
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.reset();
        this.clearErrors(formId);
    },

    /**
     * Create input element
     * @param {Object} config - Input configuration
     * @returns {HTMLElement} Input element
     */
    createInput(config) {
        const {
            type = 'text',
            name,
            label,
            placeholder = '',
            required = false,
            value = '',
            options = [],
            multiple = false,
            disabled = false,
            min,
            max,
            step
        } = config;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';

        // Create label
        if (label) {
            const labelEl = document.createElement('label');
            labelEl.className = 'form-label' + (required ? ' required' : '');
            labelEl.textContent = label;
            labelEl.setAttribute('for', name);
            wrapper.appendChild(labelEl);
        }

        // Create input
        let input;

        if (type === 'select') {
            input = document.createElement('select');
            input.className = 'form-select';
            input.name = name;
            input.id = name;
            input.multiple = multiple;

            // Add placeholder option
            if (placeholder) {
                const placeholderOption = document.createElement('option');
                placeholderOption.value = '';
                placeholderOption.textContent = placeholder;
                placeholderOption.disabled = true;
                placeholderOption.selected = !value;
                input.appendChild(placeholderOption);
            }

            // Add options
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (value === opt.value) {
                    option.selected = true;
                }
                input.appendChild(option);
            });

        } else if (type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-textarea';
            input.name = name;
            input.id = name;
            input.placeholder = placeholder;
            input.value = value;

        } else if (type === 'checkbox' || type === 'radio') {
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'form-checkbox';

            input = document.createElement('input');
            input.type = type;
            input.name = name;
            input.id = name;
            input.value = value || 'true';

            const checkLabel = document.createElement('label');
            checkLabel.setAttribute('for', name);
            checkLabel.textContent = placeholder || label;

            checkboxWrapper.appendChild(input);
            checkboxWrapper.appendChild(checkLabel);
            wrapper.appendChild(checkboxWrapper);

            return wrapper;

        } else {
            input = document.createElement('input');
            input.type = type;
            input.className = 'form-input';
            input.name = name;
            input.id = name;
            input.placeholder = placeholder;
            input.value = value;

            if (min !== undefined) input.min = min;
            if (max !== undefined) input.max = max;
            if (step !== undefined) input.step = step;
        }

        input.disabled = disabled;
        if (required) input.required = true;

        wrapper.appendChild(input);
        return wrapper;
    },

    /**
     * Create form dynamically
     * @param {Object} config - Form configuration
     * @returns {HTMLElement} Form element
     */
    createForm(config) {
        const {
            id,
            fields = [],
            submitLabel = 'Salvar',
            cancelLabel = 'Cancelar',
            onSubmit,
            onCancel
        } = config;

        const form = document.createElement('form');
        form.id = id;
        form.className = 'dynamic-form';

        // Create fields
        fields.forEach(fieldConfig => {
            const field = this.createInput(fieldConfig);
            form.appendChild(field);
        });

        // Create buttons
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'form-group flex gap-2';

        if (onCancel) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = cancelLabel;
            cancelBtn.addEventListener('click', onCancel);
            buttonGroup.appendChild(cancelBtn);
        }

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = submitLabel;
        buttonGroup.appendChild(submitBtn);

        form.appendChild(buttonGroup);

        // Handle submit
        if (onSubmit) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const data = this.getFormData(id);
                onSubmit(data);
            });
        }

        return form;
    },

    /**
     * Auto-format currency input
     * @param {HTMLInputElement} input - Input element
     */
    autoFormatCurrency(input) {
        input.addEventListener('blur', (e) => {
            const value = Utils.parseCurrency(e.target.value);
            e.target.value = Utils.formatNumber(value, 2);
        });

        input.addEventListener('focus', (e) => {
            // Remove formatting on focus for easier editing
            const value = Utils.parseCurrency(e.target.value);
            e.target.value = value;
        });
    },

    /**
     * Auto-format percentage input
     * @param {HTMLInputElement} input - Input element
     */
    autoFormatPercent(input) {
        input.addEventListener('blur', (e) => {
            let value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                e.target.value = value.toFixed(2) + '%';
            }
        });

        input.addEventListener('focus', (e) => {
            const value = e.target.value.replace('%', '');
            e.target.value = value;
        });
    },

    /**
     * Auto-format date input
     * @param {HTMLInputElement} input - Input element
     */
    autoFormatDate(input) {
        input.addEventListener('blur', (e) => {
            const value = e.target.value;
            if (value && !value.includes('-')) {
                // Try to parse DD/MM/YYYY format
                const date = Utils.parseDate(value);
                if (date) {
                    e.target.value = Utils.formatDateInput(date);
                }
            }
        });
    },

    /**
     * Setup conditional fields (show/hide based on other field values)
     * @param {string} triggerField - Field name that triggers visibility
     * @param {string} targetField - Field name to show/hide
     * @param {*} showValue - Value that triggers showing
     */
    setupConditionalField(triggerField, targetField, showValue) {
        const trigger = document.querySelector(`[name="${triggerField}"]`);
        const target = document.querySelector(`[name="${targetField}"]`).closest('.form-group');

        if (!trigger || !target) return;

        const updateVisibility = () => {
            if (trigger.value === showValue ||
                (trigger.type === 'checkbox' && trigger.checked === showValue)) {
                target.style.display = 'block';
            } else {
                target.style.display = 'none';
            }
        };

        trigger.addEventListener('change', updateVisibility);
        updateVisibility(); // Initial check
    },

    /**
     * Setup dependent dropdown (options change based on another field)
     * @param {string} parentField - Parent field name
     * @param {string} childField - Child field name
     * @param {Object} optionsMap - Map of parent values to child options
     */
    setupDependentDropdown(parentField, childField, optionsMap) {
        const parent = document.querySelector(`[name="${parentField}"]`);
        const child = document.querySelector(`[name="${childField}"]`);

        if (!parent || !child) return;

        const updateOptions = () => {
            const parentValue = parent.value;
            const options = optionsMap[parentValue] || [];

            // Clear existing options
            child.innerHTML = '';

            // Add placeholder
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Selecione...';
            placeholder.disabled = true;
            placeholder.selected = true;
            child.appendChild(placeholder);

            // Add new options
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                child.appendChild(option);
            });
        };

        parent.addEventListener('change', updateOptions);
        updateOptions(); // Initial setup
    },

    /**
     * Setup auto-calculation (calculate field based on other fields)
     * @param {Array} sourceFields - Array of source field names
     * @param {string} targetField - Target field name
     * @param {Function} calculateFn - Function to calculate value
     */
    setupAutoCalculation(sourceFields, targetField, calculateFn) {
        const target = document.querySelector(`[name="${targetField}"]`);
        if (!target) return;

        const sources = sourceFields.map(name =>
            document.querySelector(`[name="${name}"]`)
        ).filter(el => el);

        const calculate = () => {
            const values = sources.map(input => {
                if (input.type === 'number') {
                    return parseFloat(input.value) || 0;
                }
                return input.value;
            });

            const result = calculateFn(...values);
            target.value = result;
        };

        sources.forEach(source => {
            source.addEventListener('input', calculate);
            source.addEventListener('change', calculate);
        });

        calculate(); // Initial calculation
    },

    /**
     * Setup form auto-save
     * @param {string} formId - Form element ID
     * @param {string} storageKey - LocalStorage key
     * @param {number} debounceMs - Debounce time in ms
     */
    setupAutoSave(formId, storageKey, debounceMs = 1000) {
        const form = document.getElementById(formId);
        if (!form) return;

        const save = Utils.debounce(() => {
            const data = this.getFormData(formId);
            localStorage.setItem(storageKey, JSON.stringify(data));
        }, debounceMs);

        form.addEventListener('input', save);
        form.addEventListener('change', save);

        // Load saved data
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.populateForm(formId, data);
            } catch (error) {
                console.error('Error loading saved form data:', error);
            }
        }
    },

    /**
     * Clear auto-saved data
     * @param {string} storageKey - LocalStorage key
     */
    clearAutoSave(storageKey) {
        localStorage.removeItem(storageKey);
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Forms;
}
