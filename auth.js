const PROFILE_STORAGE_KEY = "mybhagavanth-user-profile";

const DEFAULT_THEME = {
    bodyTheme: "default",
    icon: "✦",
    kicker: "Welcome",
    subtitle: "Speak your heart, receive thoughtful guidance",
    quote: "Believe in yourself, stay positive, and keep moving forward — every step counts.",
    verse: "",
    heading: "Get Started",
    cardCopy: "Tell Bhagavanth who you are, so the guidance can feel more personal and meaningful.",
    preview: "MyBhagavanth provides calm, thoughtful guidance to help you navigate life's challenges.",
    loadingText: "Preparing your profile..."
};

const authForm = document.getElementById("authForm");
const authStatus = document.getElementById("authStatus");
const submitButton = document.getElementById("submitButton");
const authKicker = document.getElementById("authKicker");
const authSubtitle = document.getElementById("authSubtitle");
const authQuote = document.getElementById("authQuote");
const authVerse = document.getElementById("authVerse");
const authIcon = document.getElementById("authIcon");
const authHeading = document.getElementById("authHeading");
const authCardCopy = document.getElementById("authCardCopy");
const themePreviewText = document.getElementById("themePreviewText");
const authInstallButton = document.getElementById("authInstallButton");

const fields = {
    fullName: document.getElementById("fullName"),
    gender: document.getElementById("gender"),
    languagePreference: document.getElementById("languagePreference")
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

function getTheme() {
    return DEFAULT_THEME;
}

function applyPreview() {
    const theme = getTheme();
    authKicker.textContent = theme.kicker;
    authSubtitle.textContent = theme.subtitle;
    authQuote.textContent = `“${theme.quote}”`;
    authVerse.textContent = theme.verse;
    authIcon.textContent = theme.icon;
    authHeading.textContent = theme.heading;
    authCardCopy.textContent = theme.cardCopy;
    themePreviewText.textContent = theme.preview;
}

function setStatus(message, type = "") {
    authStatus.className = "auth-status";
    authStatus.textContent = message;

    if (type) {
        authStatus.classList.add(type);
    }
}

function setFieldError(fieldName, message) {
    const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (errorNode) {
        errorNode.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll(".field-error").forEach((node) => {
        node.textContent = "";
    });
}

function validateForm() {
    clearErrors();

    const profile = {
        fullName: fields.fullName.value.trim(),
        gender: fields.gender.value,
        languagePreference: fields.languagePreference.value
    };

    let isValid = true;

    if (profile.fullName.length < 2) {
        setFieldError("fullName", "Please enter your full name.");
        isValid = false;
    }

    if (!profile.gender) {
        setFieldError("gender", "Please choose your gender.");
        isValid = false;
    }

    if (!profile.languagePreference) {
        setFieldError("languagePreference", "Please select your language preference.");
        isValid = false;
    }

    return isValid ? profile : null;
}

function populateForm(profile) {
    if (!profile) {
        applyPreview();
        return;
    }

    fields.fullName.value = profile.fullName || "";
    fields.gender.value = profile.gender || "";
    fields.languagePreference.value = profile.languagePreference || "";
    applyPreview();
    setStatus("Your saved profile is ready. You can update it anytime.", "status-success");
}

function showLoading() {
    const theme = getTheme();
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="auth-loading">Entering<span></span></span>';
    setStatus(theme.loadingText, "");
}

function resetButton() {
    submitButton.disabled = false;
    submitButton.textContent = "Get Started";
}

function updateInstallButtonVisibility() {
    const available = Boolean(window.MyBhagavanthPWA?.canInstall?.()) && !window.MyBhagavanthPWA.isInstalled();
    authInstallButton.hidden = !available;
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

authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const profile = validateForm();

    if (!profile) {
        setStatus("Please complete all required details.", "status-error");
        return;
    }

    showLoading();

    window.setTimeout(() => {
        saveProfile({
            ...profile,
            updatedAt: Date.now()
        });
        setStatus("Profile saved. Let's get started...", "status-success");
        window.location.href = "home.html";
    }, 900);
});

authInstallButton.addEventListener("click", handleInstallClick);

document.addEventListener("mybhagavanth:pwa-availability", updateInstallButtonVisibility);
document.addEventListener("mybhagavanth:pwa-installed", () => {
    updateInstallButtonVisibility();
    setStatus("MyBhagavanth is now installed as an app.", "status-success");
});

populateForm(loadProfile());
updateInstallButtonVisibility();