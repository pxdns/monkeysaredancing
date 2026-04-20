// Pixel Standalone Auth Module
// AES-256 Encryption + Google OAuth

const CONFIG = {
    SESSION_KEY: 'pixelstandalone_session',
    MAX_LOADS: 1000000,
    TOKEN_EXPIRY: 300000,
    AUTHORIZED_EMAILS: ['e42xec@gmail.com', 'xpknown@gmail.com'],
    ENCRYPTION_KEY_SIZE: 256,
    GOOGLE_CLIENT_ID: '439714968719-ko13oc35j978s6oc47rvihutl2omrc98.apps.googleusercontent.com'
};

const LOCALSTORAGE_KEYS = [
    'eaglercraftXOpts',
    'eaglercraftXOpts_server',
    'eaglercraftXOpts_relay',
    'eaglercraftXOpts_username',
    'eaglercraftXOpts_skin',
    'eaglercraftXOpts_cape'
];

// Crypto Utilities
const CryptoUtils = {
    async generateKey() {
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: CONFIG.ENCRYPTION_KEY_SIZE },
            true,
            ['encrypt', 'decrypt']
        );
    },

    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: CONFIG.ENCRYPTION_KEY_SIZE },
            true,
            ['encrypt', 'decrypt']
        );
    },

    async encrypt(data, key) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(data)
        );

        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return combined;
    },

    async decrypt(encryptedData, key) {
        const iv = encryptedData.slice(0, 12);
        const data = encryptedData.slice(12);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        return new TextDecoder().decode(decrypted);
    }
};

// Auth Manager
const AuthManager = {
    isAuthenticated: false,
    currentUser: null,

    async init() {
        const savedSession = sessionStorage.getItem('pixelstandalone_auth');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (Date.now() < session.expiresAt &&
                    CONFIG.AUTHORIZED_EMAILS.includes(session.email)) {
                    this.isAuthenticated = true;
                    this.currentUser = session.email;
                    return true;
                }
            } catch (e) {
                sessionStorage.removeItem('pixelstandalone_auth');
            }
        }
        return false;
    },

    async handleCredentialResponse(response) {
        try {
            const payload = this.decodeJwt(response.credential);

            if (!CONFIG.AUTHORIZED_EMAILS.includes(payload.email)) {
                alert('Unauthorized email address');
                return false;
            }

            const session = {
                email: payload.email,
                token: response.credential,
                expiresAt: Date.now() + (60 * 60 * 1000)
            };

            sessionStorage.setItem('pixelstandalone_auth', JSON.stringify(session));
            this.isAuthenticated = true;
            this.currentUser = payload.email;

            showMainScreen();
            return true;
        } catch (error) {
            console.error('Auth error:', error);
            return false;
        }
    },

    decodeJwt(token) {
        const parts = token.split('.');
        return JSON.parse(atob(parts[1]));
    },

    signOut() {
        sessionStorage.removeItem('pixelstandalone_auth');
        this.isAuthenticated = false;
        this.currentUser = null;
        if (window.google && window.google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
    }
};

// Screen Navigation
function showMainScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('launcherScreen').classList.add('hidden');
}

function showLauncherScreen() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('launcherScreen').classList.remove('hidden');
}

// Global callback for Google
window.handleCredentialResponse = async (response) => {
    await AuthManager.handleCredentialResponse(response);
};

// Initialize
(async () => {
    await AuthManager.init();
})();
