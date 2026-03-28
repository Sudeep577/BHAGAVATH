(function () {
    const PROFILE_STORAGE_KEY = "mybhagavanth-user-profile";
    const HISTORY_STORAGE_KEY = "mybhagavanth-history";
    const TYPING_PREF_KEY = "mybhagavanth-typing-animation";

    const RELIGION_THEMES = {
        Hindu: {
            bodyTheme: "hindu",
            icon: "ॐ",
            chip: "Hindu Wisdom Mode",
            pageLabel: "Bhagavad Gita Wisdom",
            supportText: "Krishna-inspired dharmic guidance",
            pageQuote: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
            pageVerse: "Bhagavad Gita 2.47"
        },
        Muslim: {
            bodyTheme: "muslim",
            icon: "☪",
            chip: "Quranic Reflection Mode",
            pageLabel: "Quranic Reflection",
            supportText: "Peaceful guidance inspired by Quranic values",
            pageQuote: "Indeed, in the remembrance of Allah do hearts find rest.",
            pageVerse: "Quran 13:28"
        },
        Christian: {
            bodyTheme: "christian",
            icon: "✝",
            chip: "Grace And Faith Mode",
            pageLabel: "Grace And Wisdom",
            supportText: "Compassionate counsel inspired by the Bible",
            pageQuote: "Come to me, all who are weary and burdened, and I will give you rest.",
            pageVerse: "Matthew 11:28"
        }
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

    function getTheme(religion) {
        return RELIGION_THEMES[religion] || RELIGION_THEMES.Hindu;
    }

    function applyTheme(profile) {
        const theme = getTheme(profile.religion);
        document.body.dataset.religion = theme.bodyTheme;
        return theme;
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
        RELIGION_THEMES,
        loadProfile,
        saveProfile,
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