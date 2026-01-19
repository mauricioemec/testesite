/**
 * Authentication Module for Financial Control Application
 * Handles user authentication and authorization
 */

const Auth = {
    STORAGE_KEY: 'str_auth',
    USERS_KEY: 'str_users',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes

    /**
     * Initialize authentication
     */
    init() {
        // Create default admin user if no users exist
        const users = this.getUsers();
        if (users.length === 0) {
            this.createUser('admin', 'admin123', 'Administrador', 'admin');
        }

        // Check session timeout
        this.checkSession();
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
    createUser(username, password, name, role = 'user') {
        const users = this.getUsers();

        // Check if username exists
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Usuário já existe' };
        }

        const user = {
            id: Utils.generateId(),
            username: username,
            password: this.hashPassword(password),
            name: name,
            role: role,
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
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
