const PROFILE_STORAGE_KEY = "mybhagavanth-user-profile";

const RELIGION_THEMES = {
    Hindu: {
        bodyTheme: "hindu",
        icon: "ॐ",
        kicker: "Bhagavad Gita Wisdom",
        subtitle: "Speak your heart, receive divine guidance",
        quote: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
        verse: "Bhagavad Gita 2.47",
        heading: "Enter Divine Space",
        cardCopy: "Step into Krishna-inspired guidance shaped by dharma, reflection, and inner steadiness.",
        preview: "Krishna-inspired dark and gold design with Bhagavad Gita based wisdom, calm philosophical language, and dharmic guidance.",
        loadingText: "Preparing your sacred profile..."
    },
    Muslim: {
        bodyTheme: "muslim",
        icon: "☪",
        kicker: "Quranic Reflection",
        subtitle: "Speak your heart, receive peaceful guidance",
        quote: "Indeed, in the remembrance of Allah do hearts find rest.",
        verse: "Quran 13:28",
        heading: "Enter Peaceful Space",
        cardCopy: "Step into a serene Islamic-inspired space shaped by mercy, ethics, patience, and peaceful direction.",
        preview: "Elegant green spiritual design with Quran-inspired guidance, respectful tone, and peaceful ethical support.",
        loadingText: "Preparing your peaceful profile..."
    },
    Christian: {
        bodyTheme: "christian",
        icon: "✝",
        kicker: "Grace And Wisdom",
        subtitle: "Speak your heart, receive compassionate guidance",
        quote: "Come to me, all who are weary and burdened, and I will give you rest.",
        verse: "Matthew 11:28",
        heading: "Enter Graceful Space",
        cardCopy: "Step into a gentle and luminous space shaped by biblical compassion, moral clarity, and faith-filled encouragement.",
        preview: "Soft church-inspired design with Bible-based guidance, compassionate language, and faith-centered reassurance.",
        loadingText: "Preparing your grace-filled profile..."
    }
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
    religion: document.getElementById("religion"),
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

function getTheme(religion) {
    return RELIGION_THEMES[religion] || RELIGION_THEMES.Hindu;
}

function applyReligionPreview(religion) {
    const theme = getTheme(religion);
    document.body.dataset.religion = theme.bodyTheme;
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
        religion: fields.religion.value,
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

    if (!profile.religion) {
        setFieldError("religion", "Please choose your religion.");
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
        applyReligionPreview("Hindu");
        return;
    }

    fields.fullName.value = profile.fullName || "";
    fields.gender.value = profile.gender || "";
    fields.religion.value = profile.religion || "";
    fields.languagePreference.value = profile.languagePreference || "";
    applyReligionPreview(profile.religion || "Hindu");
    setStatus("Your saved profile is ready. You can update it anytime.", "status-success");
}

function showLoading(religion) {
    const theme = getTheme(religion);
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="auth-loading">Entering<span></span></span>';
    setStatus(theme.loadingText, "");
}

function resetButton() {
    submitButton.disabled = false;
    submitButton.textContent = "Enter Divine Space";
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

    showLoading(profile.religion);

    window.setTimeout(() => {
        saveProfile({
            ...profile,
            updatedAt: Date.now()
        });
        setStatus("Profile saved. Entering your divine space...", "status-success");
        window.location.href = "index.html";
    }, 900);
});

fields.religion.addEventListener("change", () => {
    applyReligionPreview(fields.religion.value || "Hindu");
});

authInstallButton.addEventListener("click", handleInstallClick);

document.addEventListener("mybhagavanth:pwa-availability", updateInstallButtonVisibility);
document.addEventListener("mybhagavanth:pwa-installed", () => {
    updateInstallButtonVisibility();
    setStatus("MyBhagavanth is now installed as an app.", "status-success");
});

populateForm(loadProfile());
updateInstallButtonVisibility();