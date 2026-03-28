const app = window.MyBhagavanthApp;
const profile = app.requireProfile();

const userGreeting = document.getElementById("userGreeting");
const userMeta = document.getElementById("userMeta");
const themeChip = document.getElementById("themeChip");
const profileKicker = document.getElementById("profileKicker");
const profileMeta = document.getElementById("profileMeta");
const profileAvatar = document.getElementById("profileAvatar");
const profileNameHeading = document.getElementById("profileNameHeading");
const profileSummaryText = document.getElementById("profileSummaryText");
const profileReligionText = document.getElementById("profileReligionText");
const profileLanguageText = document.getElementById("profileLanguageText");
const profileGenderText = document.getElementById("profileGenderText");
const profileStatus = document.getElementById("profileStatus");
const profileForm = document.getElementById("profileForm");
const fullNameInput = document.getElementById("profileFullName");
const genderInput = document.getElementById("profileGender");
const religionInput = document.getElementById("profileReligion");
const languageInput = document.getElementById("profileLanguage");
const saveProfileButton = document.getElementById("saveProfileButton");
const logoutButton = document.getElementById("logoutButton");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
const mobileDrawerClose = document.getElementById("mobileDrawerClose");
const mobileDrawerName = document.getElementById("mobileDrawerName");
const mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
const mobileHeaderAvatar = document.getElementById("mobileHeaderAvatar");
const mobileLanguageSelect = document.getElementById("mobileLanguageSelect");
const typingAnimationToggle = document.getElementById("typingAnimationToggle");
const mobileLogoutButton = document.getElementById("mobileLogoutButton");
const installAppButton = document.getElementById("installAppButton");
const mobileInstallButton = document.getElementById("mobileInstallButton");

function setStatus(message, type = "") {
    profileStatus.className = "page-status";
    profileStatus.textContent = message;

    if (type) {
        profileStatus.classList.add(type);
    }
}

function setFieldError(name, message) {
    const node = document.querySelector(`[data-error-for="${name}"]`);
    if (node) {
        node.textContent = message;
    }
}

function clearErrors() {
    document.querySelectorAll(".field-inline-error").forEach((node) => {
        node.textContent = "";
    });
}

function renderProfile(currentProfile) {
    const theme = app.applyTheme(currentProfile);
    const firstName = String(currentProfile.fullName || "Seeker").trim().split(/\s+/)[0];

    userGreeting.textContent = `Welcome, ${firstName}`;
    userMeta.textContent = `${currentProfile.gender} • ${currentProfile.religion} • Prefers ${currentProfile.languagePreference}`;
    themeChip.textContent = theme.chip;
    profileKicker.textContent = theme.pageLabel;
    profileMeta.textContent = `${theme.pageVerse} • ${theme.supportText}`;
    profileAvatar.textContent = theme.icon;
    mobileHeaderAvatar.textContent = theme.icon;
    profileNameHeading.textContent = currentProfile.fullName;
    profileSummaryText.textContent = `${theme.supportText}. Update your profile below to personalize every future response.`;
    profileReligionText.textContent = currentProfile.religion;
    profileLanguageText.textContent = currentProfile.languagePreference;
    profileGenderText.textContent = currentProfile.gender;
    mobileDrawerName.textContent = currentProfile.fullName;
    mobileDrawerMeta.textContent = `${currentProfile.religion} • ${currentProfile.languagePreference}`;

    fullNameInput.value = currentProfile.fullName;
    genderInput.value = currentProfile.gender;
    religionInput.value = currentProfile.religion;
    languageInput.value = currentProfile.languagePreference;
    mobileLanguageSelect.value = currentProfile.languagePreference;
    typingAnimationToggle.checked = app.loadTypingPreference();
}

function validateProfileForm() {
    clearErrors();

    const nextProfile = {
        ...profile,
        fullName: fullNameInput.value.trim(),
        gender: genderInput.value,
        religion: religionInput.value,
        languagePreference: languageInput.value,
        updatedAt: Date.now()
    };

    let valid = true;

    if (nextProfile.fullName.length < 2) {
        setFieldError("fullName", "Please enter your full name.");
        valid = false;
    }

    if (!nextProfile.gender) {
        setFieldError("gender", "Please choose your gender.");
        valid = false;
    }

    if (!nextProfile.religion) {
        setFieldError("religion", "Please select a religion.");
        valid = false;
    }

    if (!nextProfile.languagePreference) {
        setFieldError("languagePreference", "Please select a language.");
        valid = false;
    }

    return valid ? nextProfile : null;
}

function logout() {
    localStorage.removeItem(app.PROFILE_STORAGE_KEY);
    window.location.href = "login.html";
}

profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextProfile = validateProfileForm();

    if (!nextProfile) {
        setStatus("Please correct the highlighted fields.", "status-error");
        return;
    }

    saveProfileButton.disabled = true;
    app.saveProfile(nextProfile);
    Object.assign(profile, nextProfile);
    renderProfile(profile);
    setStatus("Profile updated successfully.", "status-success");
    saveProfileButton.disabled = false;
});

religionInput.addEventListener("change", () => {
    const preview = { ...profile, religion: religionInput.value || profile.religion };
    renderProfile(preview);
});

languageInput.addEventListener("change", () => {
    mobileLanguageSelect.value = languageInput.value;
});

mobileLanguageSelect.addEventListener("change", () => {
    languageInput.value = mobileLanguageSelect.value;
    const nextProfile = { ...profile, languagePreference: mobileLanguageSelect.value };
    app.saveProfile(nextProfile);
    Object.assign(profile, nextProfile);
    renderProfile(profile);
    setStatus(`Language preference updated to ${mobileLanguageSelect.value}.`, "status-success");
});

typingAnimationToggle.addEventListener("change", () => {
    app.saveTypingPreference(typingAnimationToggle.checked);
    setStatus(`Typing animation ${typingAnimationToggle.checked ? "enabled" : "disabled"}.`, "status-success");
});

logoutButton.addEventListener("click", logout);
mobileLogoutButton.addEventListener("click", logout);

app.bindRouteButtons(document);
app.setupDrawer({
    menuButton: mobileMenuButton,
    closeButton: mobileDrawerClose,
    backdrop: mobileDrawerBackdrop
});
app.setupInstallButtons([installAppButton, mobileInstallButton], setStatus);
app.setupDesktopHeader(app.getTheme(profile.religion).icon);

renderProfile(profile);