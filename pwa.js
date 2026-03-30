(function () {
    let deferredPrompt = null;
    let installAvailable = false;

    function dispatchAvailability() {
        document.dispatchEvent(new CustomEvent("mybhagavanth:pwa-availability", {
            detail: {
                available: installAvailable,
                installed: isInstalled()
            }
        }));
    }

    function isInstalled() {
        return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    }

    async function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register("./sw.js");

            // Check for updates every 60 seconds
            setInterval(function () {
                registration.update();
            }, 60 * 1000);

            // When a new SW is found and installed, activate it immediately
            registration.addEventListener("updatefound", function () {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener("statechange", function () {
                    if (newWorker.state === "activated" && navigator.serviceWorker.controller) {
                        // New version activated — reload to get fresh content
                        window.location.reload();
                    }
                });
            });
        } catch (error) {
            console.error("Service worker registration failed", error);
        }
    }

    window.MyBhagavanthPWA = {
        canInstall() {
            return installAvailable;
        },
        isInstalled,
        async promptInstall() {
            if (!deferredPrompt) {
                return { outcome: "unavailable" };
            }

            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            deferredPrompt = null;
            installAvailable = false;
            dispatchAvailability();
            return choice;
        }
    };

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        installAvailable = true;
        dispatchAvailability();
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        installAvailable = false;
        document.dispatchEvent(new CustomEvent("mybhagavanth:pwa-installed"));
        dispatchAvailability();
    });

    registerServiceWorker();
    window.addEventListener("load", dispatchAvailability);
})();