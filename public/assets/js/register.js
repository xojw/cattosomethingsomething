document.addEventListener('DOMContentLoaded', function () {
    const SW = "/uv/sw.js";
    const defaultWispUrl = `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/w/`;
    const wispUrl = defaultWispUrl;
    const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

    async function registerSW() {
        try {
            if (!navigator.serviceWorker) {
                console.log("%c[⚠️]%c Service Workers are not supported by this browser.", "color: orange; font-weight: bold;", "color: black;");
                return;
            }

            await ensureWebSocketConnection(wispUrl);

            console.log("%c[⚙️]%c Registering Service Worker...", "color: #007bff; font-weight: bold;", "color: #007bff;");
            await navigator.serviceWorker.register("/sw.js", { scope: '/$/' });
            console.log("%c[✅]%c Service Worker registered successfully.", "color: green; font-weight: bold;", "color: green;");

            switchTransport("epoxy");

            console.log(`%c[🚀]%c Using epoxy transport.`, "color: #6f42c1; font-weight: bold;", "color: #6f42c1;");

        } catch (error) {
            console.error("%c[❌]%c An error occurred during Service Worker registration or WebSocket connection: " + error, "color: red; font-weight: bold;", "color: red;");
        }
    }

    async function ensureWebSocketConnection(url) {
        return new Promise((resolve, reject) => {
            console.log("%c[🌐]%c Establishing WebSocket connection...", "color: #007bff; font-weight: bold;", "color: #007bff;");

            const ws = new WebSocket(url);

            ws.onopen = function () {
                console.log("%c[✅]%c WebSocket connection established.", "color: green; font-weight: bold;", "color: green;");
                resolve(ws);
            };

            ws.onerror = function (error) {
                const errorMessage = error.message || "Unknown error";
                console.error(`%c[❌]%c WebSocket error: ${errorMessage}`, "color: red; font-weight: bold;", "color: red;");
                reject(new Error(`Failed to establish WebSocket connection: ${errorMessage}`));
            };

            ws.onclose = function (event) {
                if (event.code !== 1000) { 
                    const reason = event.reason || "No reason provided";
                    console.warn(`%c[⚠️]%c WebSocket connection closed. Reason: ${reason}`, "color: orange; font-weight: bold;", "color: orange;");
                } else {
                    console.warn("%c[⚠️]%c WebSocket connection closed normally.", "color: orange; font-weight: bold;", "color: orange;");
                }
            };
        });
    }

    function switchTransport(transport) {
        if (transport === "epoxy") {
            connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
        }
    }

    registerSW();
});
