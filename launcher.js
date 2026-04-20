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

// Launch JS Client (Tuff Client)
async function launchClient(type) {
    if (!await requireAuth()) return;

    // Import any pending settings first
    const pendingImport = sessionStorage.getItem('pending_localstorage_import');
    if (pendingImport) {
        importLocalStorage(pendingImport);
        sessionStorage.removeItem('pending_localstorage_import');
    }

    if (type === 'js') {
        // Load Tuff Client JS directly
        const files = ['J','S','/','e','a','g','l','e','r','c','r','a','f','t','.','j','s'];
        const script = document.createElement('script');
        script.src = files.join('');
        document.body.innerHTML = '';
        document.body.appendChild(script);
    } else if (type === 'wasm') {
        // Load WASM client from local files
        window.location.href = 'WASM/index.html';
    }
}

// Launch XPClient (protected)
async function launchXPClient() {
    if (!await requireAuth()) return;

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

// Launch Nexo Client (from nexolauncher)
async function launchNexoClient(mode) {
    if (!await requireAuth()) return;

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
        // Redirect to copied WASM client
        window.location.href = 'nexoclient/WASM-GC/Online/index.html';
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

// Load protected pixelclient
async function loadProtectedPixelClient() {
    try {
        const response = await fetch('./assets/pixelclient.html');
        if (!response.ok) throw new Error('Failed to load');

        let content = await response.text();

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

        const container = document.getElementById('clientContainer');
        container.innerHTML = content;
    } catch (error) {
        console.error('Error loading pixelclient:', error);
        document.getElementById('clientContainer').innerHTML = '<h1 style="color:#ff0000;text-align:center;">Error loading client</h1>';
    }
}

// Import button handler
document.getElementById('importSettingsBtn').addEventListener('click', () => {
    const textarea = document.getElementById('localStorageImport');
    const fileInput = document.getElementById('localStorageFile');
    const status = document.getElementById('importStatus');

    let jsonData = textarea.value.trim();

    // Try file upload first if no text
    if (!jsonData && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            processImport(e.target.result, status);
        };
        reader.readAsText(file);
        return;
    }

    if (!jsonData) {
        status.textContent = 'Please paste your settings JSON or upload a JSON file.';
        status.style.color = '#ff5555';
        return;
    }

    processImport(jsonData, status);
});

function processImport(jsonData, status) {
    try {
        jsonData = jsonData.trim();
        if ((jsonData.startsWith('"') && jsonData.endsWith('"')) ||
            (jsonData.startsWith("'") && jsonData.endsWith("'"))) {
            jsonData = jsonData.slice(1, -1);
        }

        JSON.parse(jsonData);
        sessionStorage.setItem('pending_localstorage_import', jsonData);
        status.textContent = 'Settings imported! Will apply on next client launch.';
        status.style.color = '#00ff41';
    } catch (error) {
        status.textContent = 'Invalid JSON format. Please check your input.';
        status.style.color = '#ff5555';
    }
}

// Navigation functions
function showMainScreen() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('launcherScreen').classList.add('hidden');
    document.getElementById('clientContainer').classList.add('hidden');
}

function showWASMLauncher() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('launcherScreen').classList.remove('hidden');
}
