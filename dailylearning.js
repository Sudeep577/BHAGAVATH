const app = window.MyBhagavanthApp;
const profile = app.requireProfile();

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
const mobileDrawerClose = document.getElementById("mobileDrawerClose");
const mobileDrawerName = document.getElementById("mobileDrawerName");
const mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
const mobileLogoutButton = document.getElementById("mobileLogoutButton");
const mobileInstallButton = document.getElementById("mobileInstallButton");

const learningCustomTopic = document.getElementById("learningCustomTopic");
const learningAskBtn = document.getElementById("learningAskBtn");
const learningResult = document.getElementById("learningResult");
const learningResultText = document.getElementById("learningResultText");

var selectedTopic = "";

function applyHeaderPhoto() {
    var photo = localStorage.getItem("mybhagavanth-profile-photo");
    var menuBtn = document.getElementById("mobileMenuButton");
    if (!menuBtn) return;
    var existingImg = menuBtn.querySelector("img");
    var svg = menuBtn.querySelector("svg");
    if (photo) {
        if (existingImg) { existingImg.src = photo; }
        else {
            var img = document.createElement("img");
            img.src = photo; img.alt = "Profile";
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

document.querySelectorAll(".feature-topic-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".feature-topic-btn").forEach(function (b) { b.classList.remove("is-selected"); });
        btn.classList.add("is-selected");
        selectedTopic = btn.dataset.topic;
        learningCustomTopic.value = "";
    });
});

async function getDailyLearning() {
    var topic = learningCustomTopic.value.trim() || selectedTopic;
    if (!topic) { alert("Please select or type a topic"); return; }

    learningAskBtn.disabled = true;
    learningAskBtn.querySelector("span").textContent = "📖 Loading...";

    var message = "Daily Learning request on topic: " + topic + "\n\n"
        + "Please teach me something valuable about this topic today. Include:\n"
        + "1. A key lesson or insight\n"
        + "2. A practical tip I can apply today\n"
        + "3. An inspiring thought or quote related to this topic\n"
        + "4. A small challenge or action step for the day\n"
        + "Make it engaging, easy to understand, and motivating.";

    try {
        var res = await fetch("api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: message,
                fullName: profile.fullName || "",
                gender: profile.gender || "",
                languagePreference: profile.languagePreference || "English"
            })
        });
        var data = await res.json();
        if (data.error) {
            learningResultText.textContent = "Error: " + data.error;
        } else {
            learningResultText.textContent = data.reply || "No response received.";
        }
        learningResult.hidden = false;
        learningResult.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
        learningResultText.textContent = "Failed to load. Please try again.";
        learningResult.hidden = false;
    }

    learningAskBtn.disabled = false;
    learningAskBtn.querySelector("span").textContent = "📖 Teach Me Today";
}

learningAskBtn.addEventListener("click", getDailyLearning);

mobileDrawerName.textContent = profile.fullName;
mobileDrawerMeta.textContent = profile.languagePreference;
app.bindRouteButtons(document);
app.setupDrawer({ menuButton: mobileMenuButton, closeButton: mobileDrawerClose, backdrop: mobileDrawerBackdrop });
app.setupInstallButtons([mobileInstallButton], function () {});
app.setupDesktopHeader(app.getTheme().icon);
mobileLogoutButton.addEventListener("click", logout);
applyHeaderPhoto();
