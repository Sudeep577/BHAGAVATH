const app = window.MyBhagavanthApp;
const profile = app.requireProfile();

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
const mobileDrawerClose = document.getElementById("mobileDrawerClose");
const mobileDrawerName = document.getElementById("mobileDrawerName");
const mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
const mobileLogoutButton = document.getElementById("mobileLogoutButton");
const mobileInstallButton = document.getElementById("mobileInstallButton");
const homeUserName = document.getElementById("homeUserName");

if (homeUserName && profile.fullName) {
    homeUserName.textContent = profile.fullName.split(" ")[0];
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

function logout() {
    localStorage.removeItem("mybhagavanth-user-profile");
    window.location.href = "login.html";
}

mobileDrawerName.textContent = profile.fullName;
mobileDrawerMeta.textContent = profile.languagePreference;

app.bindRouteButtons(document);
app.setupDrawer({
    menuButton: mobileMenuButton,
    closeButton: mobileDrawerClose,
    backdrop: mobileDrawerBackdrop
});
app.setupInstallButtons([mobileInstallButton], function () {});
app.setupDesktopHeader(app.getTheme().icon);

mobileLogoutButton.addEventListener("click", logout);
applyHeaderPhoto();
