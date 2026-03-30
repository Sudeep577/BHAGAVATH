const app = window.MyBhagavanthApp;
const profile = app.requireProfile();

const profileLanguageText = document.getElementById("profileLanguageText");
const profileGenderText = document.getElementById("profileGenderText");
const profileStatus = document.getElementById("profileStatus");
const profileForm = document.getElementById("profileForm");
const fullNameInput = document.getElementById("profileFullName");
const genderInput = document.getElementById("profileGender");
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
const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const removePhotoBtn = document.getElementById("removePhotoBtn");

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
    const theme = app.applyTheme();
    const firstName = String(currentProfile.fullName || "Seeker").trim().split(/\s+/)[0];

    if (mobileHeaderAvatar) {
        mobileHeaderAvatar.textContent = theme.icon;
    }
    profileLanguageText.textContent = currentProfile.languagePreference;
    profileGenderText.textContent = currentProfile.gender;
    mobileDrawerName.textContent = currentProfile.fullName;
    mobileDrawerMeta.textContent = currentProfile.languagePreference;

    fullNameInput.value = currentProfile.fullName;
    genderInput.value = currentProfile.gender;
    languageInput.value = currentProfile.languagePreference;
    mobileLanguageSelect.value = currentProfile.languagePreference;
    typingAnimationToggle.checked = app.loadTypingPreference();

    renderPhoto();
}

function renderPhoto() {
    const photo = app.loadProfilePhoto();
    const existingImg = photoPreview.querySelector("img");

    if (photo) {
        if (existingImg) {
            existingImg.src = photo;
        } else {
            const img = document.createElement("img");
            img.src = photo;
            img.alt = "Profile photo";
            photoPreview.appendChild(img);
        }
        photoPreview.classList.add("has-photo");
        removePhotoBtn.hidden = false;
        updateHeaderPhoto(photo);
    } else {
        if (existingImg) {
            existingImg.remove();
        }
        photoPreview.classList.remove("has-photo");
        removePhotoBtn.hidden = true;
        updateHeaderPhoto(null);
    }
}

function updateHeaderPhoto(photoSrc) {
    const menuBtn = document.getElementById("mobileMenuButton");
    if (!menuBtn) return;
    const existingImg = menuBtn.querySelector("img");
    const svg = menuBtn.querySelector("svg");

    if (photoSrc) {
        if (existingImg) {
            existingImg.src = photoSrc;
        } else {
            const img = document.createElement("img");
            img.src = photoSrc;
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

function processPhoto(file) {
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 2 * 1024 * 1024) {
        setStatus("Photo must be under 2 MB.", "status-error");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement("canvas");
            const size = 256;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            const min = Math.min(img.width, img.height);
            const sx = (img.width - min) / 2;
            const sy = (img.height - min) / 2;
            ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
            const base64 = canvas.toDataURL("image/jpeg", 0.8);
            app.saveProfilePhoto(base64);
            renderPhoto();
            setStatus("Profile photo updated.", "status-success");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function validateProfileForm() {
    clearErrors();

    const nextProfile = {
        ...profile,
        fullName: fullNameInput.value.trim(),
        gender: genderInput.value,
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
    if (nextProfile.storageConsent) {
        app.upsertProfileRecord(nextProfile, "profile-update");
    }
    Object.assign(profile, nextProfile);
    renderProfile(profile);
    setStatus("Profile updated successfully.", "status-success");
    saveProfileButton.disabled = false;
});

languageInput.addEventListener("change", () => {
    mobileLanguageSelect.value = languageInput.value;
});

mobileLanguageSelect.addEventListener("change", () => {
    languageInput.value = mobileLanguageSelect.value;
    const nextProfile = { ...profile, languagePreference: mobileLanguageSelect.value };
    app.saveProfile(nextProfile);
    if (nextProfile.storageConsent) {
        app.upsertProfileRecord(nextProfile, "language-update");
    }
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

photoInput.addEventListener("change", () => {
    if (photoInput.files && photoInput.files[0]) {
        processPhoto(photoInput.files[0]);
    }
    photoInput.value = "";
});

removePhotoBtn.addEventListener("click", () => {
    app.removeProfilePhoto();
    renderPhoto();
    setStatus("Profile photo removed.", "status-success");
});

app.bindRouteButtons(document);
app.setupDrawer({
    menuButton: mobileMenuButton,
    closeButton: mobileDrawerClose,
    backdrop: mobileDrawerBackdrop
});
app.setupInstallButtons([installAppButton, mobileInstallButton], setStatus);
app.setupDesktopHeader(app.getTheme().icon);

renderProfile(profile);