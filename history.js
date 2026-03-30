const app = window.MyBhagavanthApp;
const profile = app.requireProfile();

const historyKicker = document.getElementById("historyKicker");
const historyCountBadge = document.getElementById("historyCountBadge");
const historyStatus = document.getElementById("historyStatus");
const historyThread = document.getElementById("historyThread");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const modalOverlay = document.getElementById("historyModal");
const modalBody = document.getElementById("hmodalBody");
const modalTime = document.getElementById("hmodalTime");
const modalCloseBtn = document.getElementById("hmodalClose");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
const mobileDrawerClose = document.getElementById("mobileDrawerClose");
const mobileDrawerName = document.getElementById("mobileDrawerName");
const mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
const mobileHeaderAvatar = document.getElementById("mobileHeaderAvatar");
const mobileLanguageSelect = document.getElementById("mobileLanguageSelect");
const typingAnimationToggle = document.getElementById("typingAnimationToggle");
const mobileLogoutButton = document.getElementById("mobileLogoutButton");
const mobileInstallButton = document.getElementById("mobileInstallButton");

function setStatus(message, type = "") {
    historyStatus.className = "page-status";
    historyStatus.textContent = message;

    if (type) {
        historyStatus.classList.add(type);
    }
}

function renderHeader(currentProfile) {
    const theme = app.applyTheme();
    historyKicker.textContent = `${theme.pageLabel} Archive`;
    mobileDrawerName.textContent = currentProfile.fullName;
    mobileDrawerMeta.textContent = currentProfile.languagePreference;
    if (mobileHeaderAvatar) {
        mobileHeaderAvatar.textContent = theme.icon;
    }
    mobileLanguageSelect.value = currentProfile.languagePreference;
    typingAnimationToggle.checked = app.loadTypingPreference();
    applyHeaderPhoto();
}

function applyHeaderPhoto() {
    var photo = localStorage.getItem("mybhagavanth-profile-photo");
    var menuBtn = document.getElementById("mobileMenuButton");
    if (!menuBtn) return;
    var existingImg = menuBtn.querySelector("img");
    var svg = menuBtn.querySelector("svg");
    if (photo) {
        if (existingImg) {
            existingImg.src = photo;
        } else {
            var img = document.createElement("img");
            img.src = photo;
            img.alt = "Profile";
            img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;";
            menuBtn.appendChild(img);
        }
        if (svg) svg.style.display = "none";
    } else {
        if (existingImg) existingImg.remove();
        if (svg) svg.style.display = "";
    }
}

function createMessageRow(role, text, icon, userInitial) {
    const row = document.createElement("article");
    row.className = `history-msg history-msg--${role}`;

    const avatar = document.createElement("div");
    avatar.className = "history-msg__avatar";
    avatar.textContent = role === "ai" ? icon : userInitial;

    const body = document.createElement("div");
    body.className = "history-msg__body";

    const label = document.createElement("p");
    label.className = "history-msg__label";
    label.textContent = role === "ai" ? "Bhagavanth" : "You";

    const bubble = document.createElement("p");
    bubble.className = "history-msg__text";
    bubble.textContent = text;

    body.appendChild(label);
    body.appendChild(bubble);
    row.appendChild(avatar);
    row.appendChild(body);

    return row;
}

function openModal(item, theme, userInitial) {
    modalTime.textContent = app.formatTimestamp(item.createdAt);
    modalBody.innerHTML = "";
    modalBody.appendChild(createMessageRow("user", item.question, theme.icon, userInitial));
    modalBody.appendChild(createMessageRow("ai", item.answer, theme.icon, userInitial));
    modalOverlay.classList.add("is-open");
    document.body.classList.add("hmodal-active");
    modalOverlay.setAttribute("aria-hidden", "false");
}

function closeModal() {
    modalOverlay.classList.remove("is-open");
    document.body.classList.remove("hmodal-active");
    modalOverlay.setAttribute("aria-hidden", "true");
}

modalCloseBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("is-open")) closeModal();
});

function renderHistory() {
    const history = app.loadHistory();
    const theme = app.getTheme();
    const userInitial = String(profile.fullName || "U").trim().charAt(0).toUpperCase();

    historyThread.innerHTML = "";
    historyCountBadge.textContent = history.length === 1
        ? "1 conversation"
        : `${history.length} conversations`;

    if (history.length === 0) {
        const empty = document.createElement("div");
        empty.className = "history-empty-state";
        empty.innerHTML = [
            '<span class="history-empty-state__icon">☸</span>',
            '<h3 class="history-empty-state__title">No reflections yet</h3>',
            '<p class="history-empty-state__copy">Ask Bhagavanth a question to begin building your conversation history.</p>'
        ].join("");
        historyThread.appendChild(empty);
        return;
    }

    history.forEach((item) => {
        const convo = document.createElement("section");
        convo.className = "history-convo";

        const preview = document.createElement("button");
        preview.type = "button";
        preview.className = "history-convo__preview";

        const previewIcon = document.createElement("span");
        previewIcon.className = "history-convo__preview-icon";
        previewIcon.textContent = userInitial;

        const previewBody = document.createElement("span");
        previewBody.className = "history-convo__preview-body";

        const previewText = document.createElement("span");
        previewText.className = "history-convo__preview-text";
        previewText.textContent = item.question;

        const previewTime = document.createElement("span");
        previewTime.className = "history-convo__preview-time";
        previewTime.textContent = app.formatTimestamp(item.createdAt);

        previewBody.appendChild(previewText);
        previewBody.appendChild(previewTime);

        const chevron = document.createElement("span");
        chevron.className = "history-convo__chevron";
        chevron.textContent = "›";

        preview.appendChild(previewIcon);
        preview.appendChild(previewBody);
        preview.appendChild(chevron);
        convo.appendChild(preview);

        preview.addEventListener("click", () => {
            openModal(item, theme, userInitial);
        });

        historyThread.appendChild(convo);
    });
}

function logout() {
    localStorage.removeItem(app.PROFILE_STORAGE_KEY);
    window.location.href = "login.html";
}

clearHistoryButton.addEventListener("click", () => {
    app.clearHistory();
    renderHistory();
    setStatus("History cleared successfully.", "status-success");
});

mobileLanguageSelect.addEventListener("change", () => {
    profile.languagePreference = mobileLanguageSelect.value;
    profile.updatedAt = Date.now();
    app.saveProfile(profile);
    renderHeader(profile);
    setStatus(`Language preference updated to ${mobileLanguageSelect.value}.`, "status-success");
});

typingAnimationToggle.addEventListener("change", () => {
    app.saveTypingPreference(typingAnimationToggle.checked);
    setStatus(`Typing animation ${typingAnimationToggle.checked ? "enabled" : "disabled"}.`, "status-success");
});

mobileLogoutButton.addEventListener("click", logout);

app.bindRouteButtons(document);
app.setupDrawer({
    menuButton: mobileMenuButton,
    closeButton: mobileDrawerClose,
    backdrop: mobileDrawerBackdrop
});
app.setupInstallButtons([mobileInstallButton], setStatus);
app.setupDesktopHeader(app.getTheme().icon);

renderHeader(profile);
renderHistory();