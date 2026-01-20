/**
 * Authentication Module for Financial Control Application
 * Handles user authentication and authorization
 */

const Auth = {
    STORAGE_KEY: 'str_auth',
    USERS_KEY: 'str_users',
    PENDING_USERS_KEY: 'str_pending_users',
    VERIFICATION_CODES_KEY: 'str_verification_codes',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    CODE_EXPIRATION: 15 * 60 * 1000, // 15 minutes

    /**
     * Initialize authentication
     */
    init() {
        // Create default admin user if no users exist
        const users = this.getUsers();
        if (users.length === 0) {
            this.createUser('admin', 'admin123', 'Administrador', 'admin', 'admin@sistema.com.br', true);
        }

        // Check session timeout
        this.checkSession();

        // Clean expired verification codes
        this.cleanExpiredCodes();
    },

    /**
     * Get all users
     */
    getUsers() {
        try {
            const data = localStorage.getItem(this.USERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    },

    /**
     * Create new user
     */
    createUser(username, password, name, role = 'user', email = null, verified = false) {
        const users = this.getUsers();

        // Check if username exists
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Usuário já existe' };
        }

        // Check if email exists (if provided)
        if (email && users.find(u => u.email === email)) {
            return { success: false, message: 'E-mail já cadastrado' };
        }

        const user = {
            id: Utils.generateId(),
            username: username,
            password: this.hashPassword(password),
            name: name,
            role: role,
            email: email,
            emailVerified: verified,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { success: true, user: this.sanitizeUser(user) };
    },

    /**
     * Simple password hashing (in production, use proper encryption)
     */
    hashPassword(password) {
        // Simple hash for demo - in production use bcrypt or similar
        return btoa(password + 'salt_key_str');
    },

    /**
     * Verify password
     */
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    },

    /**
     * Login user
     */
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Senha incorreta' };
        }

        // Create session
        const session = {
            user: this.sanitizeUser(user),
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

        return { success: true, user: session.user };
    },

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    /**
     * Get current session
     */
    getSession() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        const session = this.getSession();
        return session ? session.user : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = this.getSession();
        if (!session) return false;

        // Check session timeout
        const lastActivity = new Date(session.lastActivity);
        const now = new Date();
        const timeDiff = now - lastActivity;

        if (timeDiff > this.SESSION_TIMEOUT) {
            this.logout();
            return false;
        }

        // Update last activity
        session.lastActivity = now.toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

        return true;
    },

    /**
     * Check session and redirect if needed
     */
    checkSession() {
        if (!this.isAuthenticated() && !window.location.hash.includes('login')) {
            this.redirectToLogin();
        }
    },

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        window.location.hash = '#login';
    },

    /**
     * Check user role
     */
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    /**
     * Remove sensitive data from user object
     */
    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    },

    /**
     * Change password
     */
    changePassword(username, oldPassword, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        const user = users[userIndex];

        if (!this.verifyPassword(oldPassword, user.password)) {
            return { success: false, message: 'Senha atual incorreta' };
        }

        users[userIndex].password = this.hashPassword(newPassword);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { success: true, message: 'Senha alterada com sucesso' };
    },

    /**
     * Delete user
     */
    deleteUser(userId) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== userId);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return true;
    },

    /**
     * Update user
     */
    updateUser(userId, updates) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        // Don't allow changing username or password through this method
        const { username, password, ...allowedUpdates } = updates;

        users[userIndex] = {
            ...users[userIndex],
            ...allowedUpdates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { success: true, user: this.sanitizeUser(users[userIndex]) };
    },

    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate password strength
     */
    validatePassword(password) {
        if (password.length < 6) {
            return { valid: false, message: 'Senha deve ter no mínimo 6 caracteres' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'Senha deve conter pelo menos um número' };
        }
        return { valid: true };
    },

    /**
     * Generate verification code
     */
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    /**
     * Register new user (with email verification)
     */
    registerUser(email, password, name) {
        // Validate email
        if (!this.validateEmail(email)) {
            return { success: false, message: 'E-mail inválido' };
        }

        // Validate password
        const passwordValidation = this.validatePassword(password);
        if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
        }

        // Check if email already exists
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'E-mail já cadastrado' };
        }

        // Check pending users
        const pendingUsers = this.getPendingUsers();
        if (pendingUsers.find(u => u.email === email)) {
            return { success: false, message: 'E-mail já possui registro pendente. Verifique seu e-mail.' };
        }

        // Create pending user
        const username = email.split('@')[0]; // Use email prefix as username
        const pendingUser = {
            id: Utils.generateId(),
            email: email,
            password: this.hashPassword(password),
            name: name,
            username: username,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        pendingUsers.push(pendingUser);
        localStorage.setItem(this.PENDING_USERS_KEY, JSON.stringify(pendingUsers));

        // Generate and send verification code
        const code = this.generateVerificationCode();
        const result = this.sendVerificationCode(email, code, name);

        if (result.success) {
            return { success: true, message: 'Código de verificação enviado para seu e-mail', userId: pendingUser.id };
        } else {
            return { success: false, message: 'Erro ao enviar código de verificação' };
        }
    },

    /**
     * Get pending users
     */
    getPendingUsers() {
        try {
            const data = localStorage.getItem(this.PENDING_USERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting pending users:', error);
            return [];
        }
    },

    /**
     * Send verification code
     */
    sendVerificationCode(email, code, name) {
        // Store code with expiration
        const codes = this.getVerificationCodes();
        const codeData = {
            email: email,
            code: code,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.CODE_EXPIRATION).toISOString()
        };

        codes.push(codeData);
        localStorage.setItem(this.VERIFICATION_CODES_KEY, JSON.stringify(codes));

        // Log code to console for development
        console.log('='.repeat(50));
        console.log('CÓDIGO DE VERIFICAÇÃO');
        console.log('='.repeat(50));
        console.log('E-mail:', email);
        console.log('Nome:', name);
        console.log('Código:', code);
        console.log('Válido por: 15 minutos');
        console.log('='.repeat(50));

        // In production, you would integrate with EmailJS or another email service
        // For now, we'll just show it in console
        // Example EmailJS integration:
        // emailjs.send('service_id', 'template_id', {
        //     to_email: email,
        //     to_name: name,
        //     verification_code: code
        // });

        return { success: true };
    },

    /**
     * Get verification codes
     */
    getVerificationCodes() {
        try {
            const data = localStorage.getItem(this.VERIFICATION_CODES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting verification codes:', error);
            return [];
        }
    },

    /**
     * Verify code and activate user
     */
    verifyCode(email, code) {
        const codes = this.getVerificationCodes();
        const codeData = codes.find(c => c.email === email && c.code === code);

        if (!codeData) {
            return { success: false, message: 'Código inválido' };
        }

        // Check if code expired
        const now = new Date();
        const expiresAt = new Date(codeData.expiresAt);

        if (now > expiresAt) {
            return { success: false, message: 'Código expirado. Solicite um novo código.' };
        }

        // Find pending user
        const pendingUsers = this.getPendingUsers();
        const pendingUser = pendingUsers.find(u => u.email === email);

        if (!pendingUser) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        // Create verified user
        const result = this.createUser(
            pendingUser.username,
            '', // Password already hashed
            pendingUser.name,
            pendingUser.role,
            pendingUser.email,
            true
        );

        if (!result.success) {
            return result;
        }

        // Update user with hashed password
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].password = pendingUser.password;
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        }

        // Remove from pending users
        const updatedPendingUsers = pendingUsers.filter(u => u.email !== email);
        localStorage.setItem(this.PENDING_USERS_KEY, JSON.stringify(updatedPendingUsers));

        // Remove used code
        const updatedCodes = codes.filter(c => !(c.email === email && c.code === code));
        localStorage.setItem(this.VERIFICATION_CODES_KEY, JSON.stringify(updatedCodes));

        return { success: true, message: 'E-mail verificado com sucesso!', user: result.user };
    },

    /**
     * Resend verification code
     */
    resendVerificationCode(email) {
        const pendingUsers = this.getPendingUsers();
        const pendingUser = pendingUsers.find(u => u.email === email);

        if (!pendingUser) {
            return { success: false, message: 'Nenhum registro pendente encontrado para este e-mail' };
        }

        // Generate new code
        const code = this.generateVerificationCode();
        const result = this.sendVerificationCode(email, code, pendingUser.name);

        if (result.success) {
            return { success: true, message: 'Novo código enviado para seu e-mail' };
        } else {
            return { success: false, message: 'Erro ao enviar código' };
        }
    },

    /**
     * Clean expired verification codes
     */
    cleanExpiredCodes() {
        const codes = this.getVerificationCodes();
        const now = new Date();

        const validCodes = codes.filter(c => {
            const expiresAt = new Date(c.expiresAt);
            return now <= expiresAt;
        });

        if (validCodes.length !== codes.length) {
            localStorage.setItem(this.VERIFICATION_CODES_KEY, JSON.stringify(validCodes));
        }
    },

    /**
     * Login with email support
     */
    loginWithEmail(emailOrUsername, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === emailOrUsername || u.username === emailOrUsername);

        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        if (!user.emailVerified && user.email) {
            return { success: false, message: 'E-mail não verificado. Verifique seu e-mail.' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Senha incorreta' };
        }

        // Create session
        const session = {
            user: this.sanitizeUser(user),
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));

        return { success: true, user: session.user };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
