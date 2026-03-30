const STORAGE_KEY = "mybhagavanth-history";
const PROFILE_STORAGE_KEY = "mybhagavanth-user-profile";
const MAX_HISTORY_ITEMS = 6;

const promptInput = document.getElementById("promptInput");
const askButton = document.getElementById("askButton");
const statusPanel = document.getElementById("statusPanel");
const chatMessages = document.getElementById("chatMessages");
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
const mobileProfileLanguage = document.getElementById("mobileProfileLanguage");
const mobileProfileGender = document.getElementById("mobileProfileGender");
const mobileInstallButton = document.getElementById("mobileInstallButton");
const desktopSiteHeader = document.getElementById("desktopSiteHeader");
const desktopBrandMark = document.getElementById("desktopBrandMark");

const TYPING_PREF_KEY = "mybhagavanth-typing-animation";

let typingTimer = null;
let activeMobileSection = "home";

const DEFAULT_THEME = {
    bodyTheme: "default",
    icon: "✦",
    chip: "Guidance Mode",
    kicker: "Life Wisdom",
    quote: "Believe in yourself, stay positive, and keep moving forward — every step counts.",
    verse: "",
    responseTitle: "Bhagavanth's Guidance",
    responseSubtitle: "Gentle wisdom for a better life",
    supportText: "Bhagavanth will respond with calm, thoughtful guidance to help you in life.",
    loadingText: "Receiving guidance"
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

function getTheme() {
    return DEFAULT_THEME;
}

function applyHeaderPhoto() {
    var photo = localStorage.getItem("mybhagavanth-profile-photo");
    if (!mobileMenuButton) return;
    var existingImg = mobileMenuButton.querySelector("img");
    var svg = mobileMenuButton.querySelector("svg");
    if (photo) {
        if (existingImg) {
            existingImg.src = photo;
        } else {
            var img = document.createElement("img");
            img.src = photo;
            img.alt = "Profile";
            img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;";
            mobileMenuButton.appendChild(img);
        }
        if (svg) svg.style.display = "none";
    } else {
        if (existingImg) existingImg.remove();
        if (svg) svg.style.display = "";
    }
}

function hydrateProfileUI(profile) {
    const theme = getTheme();
    heroKicker.textContent = theme.kicker;
    heroQuote.textContent = `“${theme.quote}”`;
    heroVerse.textContent = theme.verse;
    responseAvatar.textContent = theme.icon;
    if (mobileHeaderAvatar) {
        mobileHeaderAvatar.textContent = theme.icon;
    }
    if (desktopBrandMark) {
        desktopBrandMark.textContent = theme.icon;
    }
    responseTitle.textContent = theme.responseTitle;
    responseSubtitle.textContent = theme.responseSubtitle;
    supportText.textContent = `${theme.supportText} Preferred language: ${profile.languagePreference}.`;
    mobileDrawerName.textContent = profile.fullName;
    mobileDrawerMeta.textContent = profile.languagePreference;
    mobileProfileName.textContent = profile.fullName;
    mobileProfileBadge.textContent = theme.chip;
    mobileProfileLanguage.textContent = profile.languagePreference;
    mobileProfileGender.textContent = profile.gender;
    mobileLanguageSelect.value = profile.languagePreference;
    typingAnimationToggle.checked = loadTypingPreference();
    promptInput.placeholder = profile.languagePreference === "Kannada"
        ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ..."
        : "Type your message...";

    document.querySelectorAll(".chat-bubble--welcome .chat-bubble__avatar").forEach(function(el) {
        el.textContent = theme.icon;
    });

    applyHeaderPhoto();
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
    statusPanel.className = "chat-status";
    statusPanel.textContent = message;

    if (type) {
        statusPanel.classList.add(type);
    }
}

function showLoading() {
    statusPanel.className = "chat-status";
    statusPanel.textContent = "";
    showTypingIndicator();
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

function formatChatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function scrollChatToBottom() {
    if (chatMessages) {
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
    }
}

function appendUserMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble chat-bubble--user";

    const body = document.createElement("div");
    body.className = "chat-bubble__body";

    const p = document.createElement("p");
    p.className = "chat-bubble__text";
    p.textContent = text;

    const time = document.createElement("span");
    time.className = "chat-bubble__time";
    time.textContent = formatChatTime();

    body.appendChild(p);
    body.appendChild(time);
    bubble.appendChild(body);
    chatMessages.appendChild(bubble);
    scrollChatToBottom();
}

function appendAIMessage() {
    const theme = getTheme();
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble chat-bubble--ai";

    const avatarCol = document.createElement("div");
    avatarCol.className = "chat-bubble__avatar-col";
    const avatar = document.createElement("div");
    avatar.className = "chat-bubble__avatar";
    avatar.textContent = theme.icon;
    avatarCol.appendChild(avatar);

    const body = document.createElement("div");
    body.className = "chat-bubble__body";

    const p = document.createElement("p");
    p.className = "chat-bubble__text";

    const time = document.createElement("span");
    time.className = "chat-bubble__time";
    time.textContent = formatChatTime();

    body.appendChild(p);
    body.appendChild(time);
    bubble.appendChild(avatarCol);
    bubble.appendChild(body);
    chatMessages.appendChild(bubble);
    scrollChatToBottom();
    return p;
}

function showTypingIndicator() {
    removeTypingIndicator();
    const theme = getTheme();
    const indicator = document.createElement("div");
    indicator.className = "chat-bubble chat-bubble--ai chat-typing-indicator";
    indicator.id = "typingIndicator";

    const avatarCol = document.createElement("div");
    avatarCol.className = "chat-bubble__avatar-col";
    const avatar = document.createElement("div");
    avatar.className = "chat-bubble__avatar";
    avatar.textContent = theme.icon;
    avatarCol.appendChild(avatar);

    const body = document.createElement("div");
    body.className = "chat-bubble__body";
    body.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    indicator.appendChild(avatarCol);
    indicator.appendChild(body);
    chatMessages.appendChild(indicator);
    scrollChatToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

function typeResponseInBubble(textElement, text) {
    const content = sanitizeText(text);

    if (typingTimer) {
        clearInterval(typingTimer);
    }

    if (!content) {
        return;
    }

    if (!loadTypingPreference()) {
        textElement.textContent = content;
        scrollChatToBottom();
        return;
    }

    let index = 0;
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "|";
    textElement.appendChild(cursor);

    typingTimer = window.setInterval(() => {
        index += 1;
        textElement.textContent = content.slice(0, index);
        textElement.appendChild(cursor);
        scrollChatToBottom();

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

    appendUserMessage(message);
    promptInput.value = "";
    promptInput.style.height = "auto";
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

        removeTypingIndicator();
        const textEl = appendAIMessage();
        typeResponseInBubble(textEl, data.reply);
        pushHistory(message, data.reply);
        setStatus("");
    } catch (error) {
        removeTypingIndicator();
        setStatus(error.message || "Something went wrong while contacting Bhagavanth.", "status-error");
    } finally {
        askButton.disabled = false;
    }
}

askButton.addEventListener("click", askBhagavanth);

promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        askBhagavanth();
    }
});

promptInput.addEventListener("input", () => {
    promptInput.style.height = "auto";
    promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + "px";
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

(function setupMobileKeyboardHandler() {
    const chatApp = document.querySelector(".chat-app");
    if (!chatApp || !window.visualViewport) return;

    let resizeRaf = 0;

    function onViewportResize() {
        if (window.innerWidth > 768) {
            chatApp.style.height = "";
            return;
        }
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(function () {
            const vvh = window.visualViewport.height;
            chatApp.style.height = Math.max(vvh - 160, 200) + "px";
            scrollChatToBottom();
        });
    }

    window.visualViewport.addEventListener("resize", onViewportResize);
    window.visualViewport.addEventListener("scroll", onViewportResize);
})();