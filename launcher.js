// Pixel Standalone Launcher Module
// Handles client launching with AES-256 encryption and localStorage import

// Check auth before launching
async function requireAuth() {
    const isAuth = await AuthManager.init();
    if (!isAuth) {
        alert('Please sign in with Google to access this client');
        return false;
    }
    return true;
}

// Export localStorage data
function exportLocalStorage() {
    const data = {};
    LOCALSTORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) data[key] = value;
    });
    return JSON.stringify(data);
}

// Import localStorage data
function importLocalStorage(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
        });
        return true;
    } catch (error) {
        console.error('Import error:', error);
        return false;
    }
}

// Launch JS Client (Tuff Client) - no auth required
async function launchClient(type) {
    // Import any pending settings first
    const pendingImport = sessionStorage.getItem('pending_localstorage_import');
    if (pendingImport) {
        importLocalStorage(pendingImport);
        sessionStorage.removeItem('pending_localstorage_import');
    }

    if (type === 'js') {
        // Load Tuff Client JS directly
        const files = ['J','S','/','c','l','a','s','s','e','s','.','j','s'];
        const script = document.createElement('script');
        script.src = files.join('');
        document.body.innerHTML = '';
        document.body.appendChild(script);
    } else if (type === 'wasm') {
        // Load WASM client from local files
        window.location.href = 'WASM/index.html';
    }
}

// Launch AstraClient (1.12 or 1.8) - no auth required
function launchAstraClient(version) {
    // Import any pending settings first
    const pendingImport = sessionStorage.getItem('pending_localstorage_import');
    if (pendingImport) {
        importLocalStorage(pendingImport);
        sessionStorage.removeItem('pending_localstorage_import');
    }
    
    // Redirect to AstraClient version in ./astra folder
    if (version === '112') {
        window.location.href = 'astra/astra112.html';
    } else if (version === '18') {
        window.location.href = 'astra/astra18.html';
    }
}

// Global flag to track if xpclient launch is pending
let xpclientPending = false;

// Handle Google auth response
function handleCredentialResponse(response) {
    try {
        const jwt = response.credential;
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        
        const authorizedEmails = ['e42xec@gmail.com', 'xpknown@gmail.com'];
        if (!authorizedEmails.includes(payload.email)) {
            alert('unauthorized email: ' + payload.email);
            return;
        }
        
        // Store auth
        localStorage.setItem('pixel_auth', JSON.stringify({
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            token: jwt,
            timestamp: Date.now()
        }));
        
        // Hide auth section
        hideAuthSection();
        
        // If xpclient was pending, launch it now
        if (xpclientPending) {
            xpclientPending = false;
            doLaunchXPClient();
        }
        
    } catch (error) {
        console.error('auth error:', error);
    }
}

// Show auth section for sign in
function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
}

// Hide auth section
function hideAuthSection() {
    document.getElementById('authSection').classList.add('hidden');
    xpclientPending = false;
}

// Launch XPClient (protected) - auth required
async function launchXPClient() {
    // Check if already authenticated
    const auth = JSON.parse(localStorage.getItem('pixel_auth') || '{}');
    const authorizedEmails = ['e42xec@gmail.com', 'xpknown@gmail.com'];
    
    if (!auth.email || !authorizedEmails.includes(auth.email)) {
        // Not authenticated or unauthorized - show sign in
        xpclientPending = true;
        showAuthSection();
        // Scroll to auth section
        document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // Already authenticated - launch directly
    doLaunchXPClient();
}

// Internal launch function after auth
function doLaunchXPClient() {
    const container = document.getElementById('clientContainer');
    container.classList.remove('hidden');

    // Import settings
    const pendingImport = sessionStorage.getItem('pending_localstorage_import');
    if (pendingImport) {
        importLocalStorage(pendingImport);
        sessionStorage.removeItem('pending_localstorage_import');
    }

    // Load pixelclient with protection
    loadProtectedPixelClient();
}

// Show Nexo Client Modal
function showNexoModal() {
    document.getElementById('nexoModal').classList.remove('hidden');
}

// Hide Nexo Client Modal
function hideNexoModal() {
    document.getElementById('nexoModal').classList.add('hidden');
}

// Launch Nexo Client (from nexolauncher) - no auth required
async function launchNexoClient(mode) {
    // Import any pending settings first
    const pendingImport = sessionStorage.getItem('pending_localstorage_import');
    if (pendingImport) {
        importLocalStorage(pendingImport);
        sessionStorage.removeItem('pending_localstorage_import');
    }

    // Hide modal
    hideNexoModal();

    if (mode === 'js') {
        // Redirect to copied JS client
        window.location.href = 'nexoclient/JS/Offline/index.html';
    } else if (mode === 'wasm') {
        // Use root WASM folder which has all required assets
        window.location.href = 'WASM/index.html';
    }
}

// Load WASM Launcher (from nexolauncher style)
function loadWASMLauncher() {
    const container = document.getElementById('clientContainer');
    container.innerHTML = '';

    // Create iframe for WASM
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;';

    // Build WASM launcher HTML
    const wasmHTML = `
<!DOCTYPE html>
<html style="width:100%;height:100%;background-color:black;">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WASM Launcher - Retroscope Edition</title>
    <style>
        body { margin: 0; overflow: hidden; background: #000; font-family: 'VT323', monospace; }
        #splash {
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #00ff41;
        }
        .loading-text {
            font-size: 2rem;
            margin-top: 20px;
            animation: blink 1s infinite;
        }
        @keyframes blink { 50% { opacity: 0.5; } }
    </style>
</head>
<body>
    <div id="splash">
        <div style="font-size: 3rem; text-shadow: 0 0 20px #00ff41;">LOADING WASM...</div>
        <div class="loading-text">:: RETROSCOPE EDITION ::</div>
    </div>
    <script>
        window.addEventListener("load", async function() {
            if(window.location.href.indexOf("file:") === 0) {
                alert("HTTP please, do not open this file locally");
                return;
            }
            if(typeof WebAssembly.Suspending === "undefined") {
                alert("JSPI is not enabled, please enable it in chrome://flags");
                return;
            }

            // Load assets
            try {
                const assetsResp = await fetch("WASM/assets.epw");
                const assetsEPK = new Uint8Array(await assetsResp.arrayBuffer());

                const relayId = Math.floor(Math.random() * 3);
                const eaglercraftXOpts = {
                    demoMode: false,
                    localesURI: "WASM/lang/",
                    worldsDB: "worlds",
                    servers: [
                        { addr: "ws://localhost:8081/", name: "Local test server" }
                    ],
                    relays: [
                        { addr: "wss://relay.deev.is/", comment: "lax1dude relay #1", primary: relayId === 0 },
                        { addr: "wss://relay.lax1dude.net/", comment: "lax1dude relay #2", primary: relayId === 1 },
                        { addr: "wss://relay.shhnowisnottheti.me/", comment: "ayunami relay #1", primary: relayId === 2 }
                    ]
                };

                window.__eaglercraftXLoaderContext = {
                    getEaglercraftXOpts: () => eaglercraftXOpts,
                    getEagRuntimeJSURL: () => "WASM/eagruntime.js",
                    getClassesWASMURL: () => "WASM/classes.wasm",
                    getClassesDeobfWASMURL: () => "WASM/classes.wasm-deobfuscator.wasm",
                    getClassesTEADBGURL: () => "WASM/classes.wasm.teadbg",
                    getEPKFiles: () => [{ name: "assets.epw", path: "", data: assetsEPK }],
                    getRootElement: () => document.body,
                    getMainArgs: () => [],
                    getImageURL: (idx) => {
                        const imgs = ["WASM/splash.png", "WASM/pressAnyKey.png", "WASM/crashLogo.png", "WASM/favicon.png"];
                        return imgs[idx] || null;
                    },
                    runMain: (fn) => setTimeout(fn, 10)
                };

                const script = document.createElement("script");
                script.src = "WASM/eagruntime.js";
                document.head.appendChild(script);
            } catch(ex) {
                alert("Could not load WASM assets!");
                console.error(ex);
            }
        });
    </script>
</body>
</html>`;

    container.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(wasmHTML);
    iframe.contentDocument.close();
}

// Show pixelclient import section
function showPixelclientImport() {
    document.getElementById('pixelclientImportSection').scrollIntoView({ behavior: 'smooth' });
}

// Export pixelclient from IndexedDB as HTML file
async function exportPixelclientFromDB() {
    const content = await getPixelclientFromDB();
    if (!content) {
        throw new Error('no pixelclient stored in indexeddb');
    }
    return content;
}

// ==================== ENCRYPTION/DECRYPTION ====================
// Encrypt data with password using AES-GCM
async function encryptData(data, password) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(data)
    );
    
    // Combine salt + iv + encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Return base64 encoded
    return btoa(String.fromCharCode(...result));
}

// Decrypt data with password
async function decryptData(encryptedBase64, password) {
    const encoder = new TextEncoder();
    
    // Decode base64
    const encryptedData = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extract salt, iv, and encrypted content
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const encrypted = encryptedData.slice(28);
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
    );
    
    return new TextDecoder().decode(decrypted);
}

// Generate random encryption key for website-only decryption
function generateWebsiteKey() {
    // Key derived from domain + user agent + screen size
    // Makes it very hard to decrypt on another site
    const data = location.origin + navigator.userAgent + screen.width + 'x' + screen.height;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'pxdns_' + Math.abs(hash).toString(36) + '_onced';
}

// Load protected pixelclient - indexeddb only (no file fallback)
async function loadProtectedPixelClient() {
    const container = document.getElementById('clientContainer');
    
    try {
        // Only try to get from IndexedDB - no file fallback
        const content = await getPixelclientFromDB();
        
        if (!content) {
            // Not in storage - show import prompt
            container.innerHTML = `
                <div style="color:#ff5555;text-align:center;padding:20px;font-family:instrument serif,serif;">
                    <h2>pixelclient not found in storage</h2>
                    <p>import pixelclient.html or dih.html to use on this device.</p>
                    <p>works on any device after import - no file needed afterwards.</p>
                    <button onclick="showPixelclientImport()" style="margin-top:20px;padding:12px 30px;background:#00ff41;color:#000;border:none;cursor:pointer;border-radius:4px;font-family:instrument serif,serif;">
                        import pixelclient
                    </button>
                    <p style="margin-top:20px;color:rgba(255,255,255,0.6);">or sign in on a device that already has it imported, then export from there</p>
                </div>
            `;
            return;
        }

        // Add protection scripts
        const protectionScript = `
<script>
(function() {
    document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
            e.key === 'F12') {
            e.preventDefault();
            return false;
        }
    }, true);
    document.addEventListener('dragstart', e => { e.preventDefault(); return false; });
})();
<\/script>`;

        content = content.replace('</head>', protectionScript + '</head>');
        container.innerHTML = content;
        
        console.log(`[Pixelclient] Loaded successfully from ${source}`);
        
    } catch (error) {
        console.error('[Pixelclient] Error loading:', error);
        container.innerHTML = '<h1 style="color:#ff0000;text-align:center;">Error loading client</h1>';
    }
}

// Import pixelclient HTML from file/textarea into IndexedDB
async function importPixelclientToDB(fileContent) {
    try {
        await storePixelclientInDB(fileContent);
        console.log('[Pixelclient] Imported to IndexedDB successfully');
        return true;
    } catch (error) {

const PIXELCLIENT_DB_NAME = 'PixelStandalone';
const PIXELCLIENT_STORE_NAME = 'clientData';
const PIXELCLIENT_DB_VERSION = 1;
const PIXELCLIENT_KEY = 'pixelclient_html';

// Open Pixelclient IndexedDB
function openPixelclientDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(PIXELCLIENT_DB_NAME, PIXELCLIENT_DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(PIXELCLIENT_STORE_NAME)) {
                db.createObjectStore(PIXELCLIENT_STORE_NAME);
            }
        };
    });
}

// Store pixelclient HTML in IndexedDB
async function storePixelclientInDB(htmlContent) {
    try {
        const db = await openPixelclientDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([PIXELCLIENT_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(PIXELCLIENT_STORE_NAME);
            
            const record = {
                data: htmlContent,
                storedAt: new Date().toISOString(),
                size: htmlContent.length
            };
            
            const request = store.put(record, PIXELCLIENT_KEY);
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => db.close();
        });
    } catch (error) {
        console.error('[Pixelclient] Store failed:', error);
        throw error;
    }
}

// Get pixelclient HTML from IndexedDB
async function getPixelclientFromDB() {
    try {
        const db = await openPixelclientDB();
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([PIXELCLIENT_STORE_NAME], 'readonly');
            const store = transaction.objectStore(PIXELCLIENT_STORE_NAME);
            const request = store.get(PIXELCLIENT_KEY);
            
            request.onsuccess = () => {
                const result = request.result;
                db.close();
                resolve(result ? result.data : null);
            };
            request.onerror = () => {
                db.close();
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('[pixelclient] get failed:', error);
        return null;
    }
}

// Texture pack DB functions for clients
const TEXTURE_PACK_DB_NAME = 'Eaglercraft';
const TEXTURE_PACK_STORE_NAME = 'resourcePacks';
const TEXTURE_PACK_DB_VERSION = 1;

function openTexturePackDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(TEXTURE_PACK_DB_NAME, TEXTURE_PACK_DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(TEXTURE_PACK_STORE_NAME)) {
                db.createObjectStore(TEXTURE_PACK_STORE_NAME, { keyPath: 'name' });
            }
        };
    });
}

// No DOM event listeners needed - just clients
document.addEventListener('DOMContentLoaded', () => {
    // clients only - no import/export ui
    console.log('[pixelstandalone] launcher ready');
});
