const STORAGE_KEY = "mybhagavanth-history";
const PROFILE_STORAGE_KEY = "mybhagavanth-user-profile";
const MAX_HISTORY_ITEMS = 6;

const promptInput = document.getElementById("promptInput");
const askButton = document.getElementById("askButton");
const statusPanel = document.getElementById("statusPanel");
const responseCard = document.getElementById("responseCard");
const responseContent = document.getElementById("responseContent");
const historyList = document.getElementById("historyList");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyItemTemplate = document.getElementById("historyItemTemplate");
const supportText = document.getElementById("supportText");
const heroKicker = document.getElementById("heroKicker");
const heroQuote = document.getElementById("heroQuote");
const heroVerse = document.getElementById("heroVerse");
const responseAvatar = document.getElementById("responseAvatar");
const responseTitle = document.getElementById("responseTitle");
const responseSubtitle = document.getElementById("responseSubtitle");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileDrawer = document.getElementById("mobileDrawer");
const mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
const mobileDrawerClose = document.getElementById("mobileDrawerClose");
const mobileDrawerName = document.getElementById("mobileDrawerName");
const mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
const mobileHeaderAvatar = document.getElementById("mobileHeaderAvatar");
const mobileLanguageSelect = document.getElementById("mobileLanguageSelect");
const typingAnimationToggle = document.getElementById("typingAnimationToggle");
const mobileProfileButton = document.getElementById("mobileProfileButton");
const mobileLogoutButton = document.getElementById("mobileLogoutButton");
const mobileChangeProfileButton = document.getElementById("mobileChangeProfileButton");
const mobileAskNowButton = document.getElementById("mobileAskNowButton");
const mobileProfileName = document.getElementById("mobileProfileName");
const mobileProfileBadge = document.getElementById("mobileProfileBadge");
const mobileProfileReligion = document.getElementById("mobileProfileReligion");
const mobileProfileLanguage = document.getElementById("mobileProfileLanguage");
const mobileProfileGender = document.getElementById("mobileProfileGender");
const mobileInstallButton = document.getElementById("mobileInstallButton");
const desktopSiteHeader = document.getElementById("desktopSiteHeader");
const desktopBrandMark = document.getElementById("desktopBrandMark");

const TYPING_PREF_KEY = "mybhagavanth-typing-animation";

let typingTimer = null;
let activeMobileSection = "home";

const RELIGION_THEMES = {
    Hindu: {
        bodyTheme: "hindu",
        icon: "ॐ",
        chip: "Hindu Wisdom Mode",
        kicker: "Bhagavad Gita Wisdom",
        quote: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
        verse: "Bhagavad Gita 2.47",
        responseTitle: "Krishna's Guidance",
        responseSubtitle: "Gentle wisdom rooted in dharma",
        supportText: "Bhagavanth will respond with Bhagavad Gita inspired calm, dharmic guidance.",
        loadingText: "Receiving Krishna's guidance"
    },
    Muslim: {
        bodyTheme: "muslim",
        icon: "☪",
        chip: "Quranic Reflection Mode",
        kicker: "Quranic Reflection",
        quote: "Indeed, in the remembrance of Allah do hearts find rest.",
        verse: "Quran 13:28",
        responseTitle: "Peaceful Guidance",
        responseSubtitle: "Ethical direction shaped by Quranic values",
        supportText: "Bhagavanth will respond with respectful, peaceful guidance inspired by Quranic teachings.",
        loadingText: "Receiving peaceful guidance"
    },
    Christian: {
        bodyTheme: "christian",
        icon: "✝",
        chip: "Grace And Faith Mode",
        kicker: "Grace And Wisdom",
        quote: "Come to me, all who are weary and burdened, and I will give you rest.",
        verse: "Matthew 11:28",
        responseTitle: "Faithful Guidance",
        responseSubtitle: "Compassionate counsel shaped by biblical hope",
        supportText: "Bhagavanth will respond with compassionate, faith-centered guidance inspired by the Bible.",
        loadingText: "Receiving compassionate guidance"
    }
};

function loadProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
        return null;
    }
}

function saveProfile(profile) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function loadTypingPreference() {
    try {
        const value = localStorage.getItem(TYPING_PREF_KEY);
        return value !== "disabled";
    } catch (error) {
        return true;
    }
}

function saveTypingPreference(enabled) {
    localStorage.setItem(TYPING_PREF_KEY, enabled ? "enabled" : "disabled");
}

function requireProfile() {
    const profile = loadProfile();

    if (!profile) {
        window.location.replace("login.html");
        throw new Error("Profile required");
    }

    return profile;
}

const userProfile = requireProfile();

function getTheme(religion) {
    return RELIGION_THEMES[religion] || RELIGION_THEMES.Hindu;
}

function hydrateProfileUI(profile) {
    const theme = getTheme(profile.religion);
    document.body.dataset.religion = theme.bodyTheme;
    heroKicker.textContent = theme.kicker;
    heroQuote.textContent = `“${theme.quote}”`;
    heroVerse.textContent = theme.verse;
    responseAvatar.textContent = theme.icon;
    mobileHeaderAvatar.textContent = theme.icon;
    if (desktopBrandMark) {
        desktopBrandMark.textContent = theme.icon;
    }
    responseTitle.textContent = theme.responseTitle;
    responseSubtitle.textContent = theme.responseSubtitle;
    supportText.textContent = `${theme.supportText} Preferred language: ${profile.languagePreference}.`;
    mobileDrawerName.textContent = profile.fullName;
    mobileDrawerMeta.textContent = `${profile.religion} • ${profile.languagePreference}`;
    mobileProfileName.textContent = profile.fullName;
    mobileProfileBadge.textContent = theme.chip;
    mobileProfileReligion.textContent = profile.religion;
    mobileProfileLanguage.textContent = profile.languagePreference;
    mobileProfileGender.textContent = profile.gender;
    mobileLanguageSelect.value = profile.languagePreference;
    typingAnimationToggle.checked = loadTypingPreference();
    promptInput.placeholder = profile.languagePreference === "Kannada"
        ? "ನಿಮ್ಮ ಹೃದಯದ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
        : "Share your question, concern, or life situation here...";
}

function setupDesktopHeader() {
    if (!desktopSiteHeader) {
        return;
    }

    function updateHeader() {
        desktopSiteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
}

function setStatus(message, type = "") {
    statusPanel.className = "status-panel";
    statusPanel.textContent = message;

    if (type) {
        statusPanel.classList.add(type);
    }
}

function showLoading() {
    const theme = getTheme(userProfile.religion);
    statusPanel.className = "status-panel";
    statusPanel.innerHTML = [
        '<div class="loading">',
        `<span>${theme.loadingText}</span>`,
        '<span class="loading-dots" aria-hidden="true"><span></span><span></span><span></span></span>',
        '</div>'
    ].join("");
}

function sanitizeText(value) {
    return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function loadHistory() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveHistory(history) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
}

function renderHistory() {
    if (!historyList || !historyItemTemplate) {
        return;
    }

    const history = loadHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
        const empty = document.createElement("p");
        empty.className = "history-empty";
        empty.textContent = "Your recent reflections will appear here.";
        historyList.appendChild(empty);
        return;
    }

    history.forEach((item) => {
        const fragment = historyItemTemplate.content.cloneNode(true);
        fragment.querySelector(".history-question").textContent = item.question;
        fragment.querySelector(".history-answer").textContent = item.answer;
        historyList.appendChild(fragment);
    });
}

function pushHistory(question, answer) {
    const history = loadHistory();
    history.unshift({ question, answer, createdAt: Date.now() });
    saveHistory(history);
    renderHistory();
}

function revealResponse() {
    responseCard.classList.remove("hidden");
    responseCard.classList.remove("reveal");
    void responseCard.offsetWidth;
    responseCard.classList.add("reveal");
}

function typeResponse(text) {
    const content = sanitizeText(text);
    responseContent.textContent = "";
    revealResponse();

    if (typingTimer) {
        clearInterval(typingTimer);
    }

    if (!content) {
        return;
    }

    if (!loadTypingPreference()) {
        responseContent.textContent = content;
        return;
    }

    let index = 0;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "|";
    responseContent.appendChild(cursor);

    typingTimer = window.setInterval(() => {
        index += 1;
        responseContent.textContent = content.slice(0, index);
        responseContent.appendChild(cursor);

        if (index >= content.length) {
            clearInterval(typingTimer);
            typingTimer = null;
            cursor.remove();
        }
    }, 18);
}

function closeMobileDrawer() {
    document.body.classList.remove("mobile-drawer-open");
}

function openMobileDrawer() {
    document.body.classList.add("mobile-drawer-open");
}

function setActiveMobileNav(sectionName) {
    activeMobileSection = sectionName;
    document.querySelectorAll(".mobile-nav-item").forEach((node) => {
        node.classList.toggle("is-active", node.dataset.appRoute === sectionName);
    });
}

function navigateToMobileSection(sectionName) {
    if (sectionName === "history") {
        window.location.href = "history.html";
        return;
    }

    if (sectionName === "profile") {
        window.location.href = "profile.html";
        return;
    }

    const target = document.querySelector(`[data-mobile-section="${sectionName}"]`);

    if (!target) {
        return;
    }

    closeMobileDrawer();
    setActiveMobileNav(sectionName);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateMobileSectionOnScroll() {
    if (window.innerWidth > 768) {
        return;
    }

    const sections = Array.from(document.querySelectorAll("[data-mobile-section]"));
    const scrollMarker = window.scrollY + (window.innerHeight * 0.35);

    let current = activeMobileSection;

    sections.forEach((section) => {
        if (scrollMarker >= section.offsetTop) {
            current = section.dataset.mobileSection;
        }
    });

    setActiveMobileNav(current);
}

function setInitialSectionFromHash() {
    if (window.location.hash === "#chatSection") {
        setActiveMobileNav("chat");
    } else {
        setActiveMobileNav("home");
    }
}

function applyUpdatedLanguage(languagePreference) {
    userProfile.languagePreference = languagePreference;
    userProfile.updatedAt = Date.now();
    saveProfile(userProfile);
    hydrateProfileUI(userProfile);
    setStatus(`Language preference updated to ${languagePreference}.`, "status-success");
}

function updateInstallButtons() {
    const available = Boolean(window.MyBhagavanthPWA?.canInstall?.()) && !window.MyBhagavanthPWA.isInstalled();
    mobileInstallButton.hidden = !available;
}

async function handleInstallClick() {
    if (!window.MyBhagavanthPWA) {
        return;
    }

    const result = await window.MyBhagavanthPWA.promptInstall();

    if (result.outcome === "accepted") {
        setStatus("MyBhagavanth app installation started.", "status-success");
    } else if (result.outcome !== "unavailable") {
        setStatus("Install prompt was dismissed.", "status-error");
    }
}

async function askBhagavanth() {
    const message = sanitizeText(promptInput.value);

    if (!message) {
        setStatus("Please enter your question before asking Bhagavanth.", "status-error");
        promptInput.focus();
        return;
    }

    askButton.disabled = true;
    showLoading();

    try {
        const response = await fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                fullName: userProfile.fullName,
                gender: userProfile.gender,
                religion: userProfile.religion,
                languagePreference: userProfile.languagePreference
            })
        });

        const raw = await response.text();
        let data = {};

        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (error) {
            data = {};
        }

        if (!response.ok || !data.reply) {
            throw new Error(data.error || "Bhagavanth could not respond right now.");
        }

        typeResponse(data.reply);
        pushHistory(message, data.reply);
        setStatus("Guidance received.", "status-success");
    } catch (error) {
        setStatus(error.message || "Something went wrong while contacting Bhagavanth.", "status-error");
    } finally {
        askButton.disabled = false;
    }
}

askButton.addEventListener("click", askBhagavanth);

promptInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        askBhagavanth();
    }
});

if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEY);
        renderHistory();
        setStatus("History cleared.", "status-success");
    });
}

mobileMenuButton.addEventListener("click", openMobileDrawer);
mobileDrawerBackdrop.addEventListener("click", closeMobileDrawer);
mobileDrawerClose.addEventListener("click", closeMobileDrawer);

document.querySelectorAll("[data-mobile-target]").forEach((node) => {
    node.addEventListener("click", () => {
        navigateToMobileSection(node.dataset.mobileTarget);
    });
});

document.querySelectorAll("[data-app-route]").forEach((node) => {
    node.addEventListener("click", () => {
        navigateToMobileSection(node.dataset.appRoute);
    });
});

mobileProfileButton.addEventListener("click", () => {
    window.location.href = "profile.html";
});

mobileAskNowButton.addEventListener("click", () => {
    navigateToMobileSection("chat");
    window.setTimeout(() => promptInput.focus(), 250);
});

mobileChangeProfileButton.addEventListener("click", () => {
    window.location.href = "profile.html";
});

mobileLogoutButton.addEventListener("click", () => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    window.location.href = "login.html";
});

mobileInstallButton.addEventListener("click", handleInstallClick);

mobileLanguageSelect.addEventListener("change", () => {
    applyUpdatedLanguage(mobileLanguageSelect.value);
});

typingAnimationToggle.addEventListener("change", () => {
    saveTypingPreference(typingAnimationToggle.checked);
    setStatus(`Typing animation ${typingAnimationToggle.checked ? "enabled" : "disabled"}.`, "status-success");
});

window.addEventListener("scroll", updateMobileSectionOnScroll, { passive: true });
document.addEventListener("mybhagavanth:pwa-availability", updateInstallButtons);
document.addEventListener("mybhagavanth:pwa-installed", () => {
    updateInstallButtons();
    setStatus("MyBhagavanth is now installed as an app.", "status-success");
});

hydrateProfileUI(userProfile);
renderHistory();
setInitialSectionFromHash();
updateInstallButtons();
setupDesktopHeader();