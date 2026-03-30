(function () {
    const PROFILE_STORAGE_KEY = "mybhagavanth-user-profile";
    const HISTORY_STORAGE_KEY = "mybhagavanth-history";
    const TYPING_PREF_KEY = "mybhagavanth-typing-animation";
    const PHOTO_STORAGE_KEY = "mybhagavanth-profile-photo";

    const DEFAULT_THEME = {
        bodyTheme: "default",
        icon: "✦",
        chip: "Guidance Mode",
        pageLabel: "Life Wisdom",
        supportText: "Calm, thoughtful guidance for a better life",
        pageQuote: "Believe in yourself, stay positive, and keep moving forward — every step counts.",
        pageVerse: ""
    };

    function loadJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function loadProfile() {
        const profile = loadJson(PROFILE_STORAGE_KEY, null);
        return profile && typeof profile === "object" ? profile : null;
    }

    function saveProfile(profile) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }

    function loadProfilePhoto() {
        return localStorage.getItem(PHOTO_STORAGE_KEY) || null;
    }

    function saveProfilePhoto(base64) {
        localStorage.setItem(PHOTO_STORAGE_KEY, base64);
    }

    function removeProfilePhoto() {
        localStorage.removeItem(PHOTO_STORAGE_KEY);
    }

    function requireProfile() {
        const profile = loadProfile();

        if (!profile) {
            window.location.replace("login.html");
            throw new Error("Profile required");
        }

        return profile;
    }

    function loadHistory() {
        const history = loadJson(HISTORY_STORAGE_KEY, []);
        return Array.isArray(history) ? history : [];
    }

    function clearHistory() {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
    }

    function loadTypingPreference() {
        return localStorage.getItem(TYPING_PREF_KEY) !== "disabled";
    }

    function saveTypingPreference(enabled) {
        localStorage.setItem(TYPING_PREF_KEY, enabled ? "enabled" : "disabled");
    }

    function getTheme() {
        return DEFAULT_THEME;
    }

    function applyTheme() {
        return DEFAULT_THEME;
    }

    function formatTimestamp(value) {
        if (!value) {
            return "Just now";
        }

        try {
            return new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
            }).format(new Date(value));
        } catch (error) {
            return "Just now";
        }
    }

    function routeTo(target) {
        switch (target) {
            case "home":
                window.location.href = "index.html#homeSection";
                break;
            case "chat":
                window.location.href = "index.html#chatSection";
                break;
            case "history":
                window.location.href = "history.html";
                break;
            case "profile":
                window.location.href = "profile.html";
                break;
            case "about":
                window.location.href = "about.html";
                break;
            default:
                break;
        }
    }

    function bindRouteButtons(root = document) {
        root.querySelectorAll("[data-app-route]").forEach((node) => {
            node.addEventListener("click", () => {
                routeTo(node.dataset.appRoute);
            });
        });
    }

    function setupDrawer(options) {
        const { menuButton, closeButton, backdrop } = options;

        function openDrawer() {
            document.body.classList.add("mobile-drawer-open");
        }

        function closeDrawer() {
            document.body.classList.remove("mobile-drawer-open");
        }

        menuButton?.addEventListener("click", openDrawer);
        closeButton?.addEventListener("click", closeDrawer);
        backdrop?.addEventListener("click", closeDrawer);

        return { openDrawer, closeDrawer };
    }

    function setupInstallButtons(buttons, setStatus) {
        function updateVisibility() {
            const available = Boolean(window.MyBhagavanthPWA?.canInstall?.()) && !window.MyBhagavanthPWA.isInstalled();
            buttons.forEach((button) => {
                if (button) {
                    button.hidden = !available;
                }
            });
        }

        async function handleInstall() {
            if (!window.MyBhagavanthPWA) {
                return;
            }

            const result = await window.MyBhagavanthPWA.promptInstall();

            if (result.outcome === "accepted") {
                setStatus?.("MyBhagavanth app installation started.", "status-success");
            } else if (result.outcome !== "unavailable") {
                setStatus?.("Install prompt was dismissed.", "status-error");
            }
        }

        buttons.forEach((button) => {
            button?.addEventListener("click", handleInstall);
        });

        document.addEventListener("mybhagavanth:pwa-availability", updateVisibility);
        document.addEventListener("mybhagavanth:pwa-installed", () => {
            updateVisibility();
            setStatus?.("MyBhagavanth is now installed as an app.", "status-success");
        });

        updateVisibility();
    }

    function setupDesktopHeader(themeIcon) {
        const header = document.getElementById("desktopSiteHeader");
        const brandMark = document.getElementById("desktopBrandMark");

        if (brandMark && themeIcon) {
            brandMark.textContent = themeIcon;
        }

        if (!header) {
            return;
        }

        function updateHeader() {
            header.classList.toggle("is-scrolled", window.scrollY > 12);
        }

        window.addEventListener("scroll", updateHeader, { passive: true });
        updateHeader();
    }

    window.MyBhagavanthApp = {
        PROFILE_STORAGE_KEY,
        HISTORY_STORAGE_KEY,
        TYPING_PREF_KEY,
        PHOTO_STORAGE_KEY,
        DEFAULT_THEME,
        loadProfile,
        saveProfile,
        loadProfilePhoto,
        saveProfilePhoto,
        removeProfilePhoto,
        requireProfile,
        loadHistory,
        clearHistory,
        loadTypingPreference,
        saveTypingPreference,
        getTheme,
        applyTheme,
        formatTimestamp,
        routeTo,
        bindRouteButtons,
        setupDrawer,
        setupInstallButtons,
        setupDesktopHeader
    };
})();