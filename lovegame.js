(function () {
    "use strict";

    var app = window.MyBhagavanthApp;
    var profile = app.requireProfile();

    var SAVED_KEY = "mybhagavanth-love-saved";

    // DOM references
    var mobileMenuButton = document.getElementById("mobileMenuButton");
    var mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
    var mobileDrawerClose = document.getElementById("mobileDrawerClose");
    var mobileDrawerName = document.getElementById("mobileDrawerName");
    var mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
    var mobileLogoutButton = document.getElementById("mobileLogoutButton");
    var mobileInstallButton = document.getElementById("mobileInstallButton");

    var loveName1 = document.getElementById("loveName1");
    var loveName2 = document.getElementById("loveName2");
    var loveCalcBtn = document.getElementById("loveCalcBtn");
    var loveResult = document.getElementById("loveResult");
    var loveResultText = document.getElementById("loveResultText");
    var loveScoreValue = document.getElementById("loveScoreValue");
    var loveScoreFill = document.getElementById("loveScoreFill");
    var loveResultTitle = document.getElementById("loveResultTitle");
    var loveResultLabel = document.getElementById("loveResultLabel");
    var loveTypeChips = document.getElementById("loveTypeChips");
    var loveTryAgainBtn = document.getElementById("loveTryAgainBtn");
    var loveShareBtn = document.getElementById("loveShareBtn");
    var loveSaveBtn = document.getElementById("loveSaveBtn");
    var loveSavedSection = document.getElementById("loveSavedSection");
    var loveSavedList = document.getElementById("loveSavedList");
    var loveClearSavedBtn = document.getElementById("loveClearSavedBtn");
    var loveBgParticles = document.getElementById("loveBgParticles");

    var selectedRelType = "crush";
    var lastResult = null;

    // Pre-fill user name
    if (loveName1 && profile.fullName) {
        loveName1.value = profile.fullName;
    }

    // ─── Floating hearts background ───
    function spawnFloatingHearts() {
        var hearts = ["❤️", "💕", "💖", "✨", "💗", "🌹"];
        for (var i = 0; i < 12; i++) {
            var span = document.createElement("span");
            span.className = "love-float-heart";
            span.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            span.style.left = Math.random() * 100 + "%";
            span.style.animationDuration = (8 + Math.random() * 12) + "s";
            span.style.animationDelay = (Math.random() * 10) + "s";
            span.style.fontSize = (0.8 + Math.random() * 1.2) + "rem";
            span.style.opacity = (0.15 + Math.random() * 0.25).toString();
            loveBgParticles.appendChild(span);
        }
    }
    spawnFloatingHearts();

    // ─── Profile photo in header ───
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

    // ─── Relationship type chips ───
    loveTypeChips.addEventListener("click", function (e) {
        var chip = e.target.closest(".love-type-chip");
        if (!chip) return;
        loveTypeChips.querySelectorAll(".love-type-chip").forEach(function (c) {
            c.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        selectedRelType = chip.dataset.type;
    });

    // ─── Score generation ───
    function generateLoveScore(name1, name2, relType) {
        var combined = (name1 + name2 + relType).toLowerCase().replace(/\s/g, "");
        var hash = 0;
        for (var i = 0; i < combined.length; i++) {
            hash = ((hash << 5) - hash) + combined.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash % 61) + 40; // 40–100
    }

    function getScoreLabel(score) {
        if (score >= 90) return "Soulmate Connection 🔥";
        if (score >= 80) return "Deep Love Bond 💞";
        if (score >= 70) return "Strong Chemistry 💫";
        if (score >= 60) return "Sweet Connection 🌸";
        if (score >= 50) return "Growing Spark ✨";
        return "Destiny Awaits 🌙";
    }

    // ─── Animate score ring + number ───
    function animateScore(target) {
        var circumference = 2 * Math.PI * 62; // r=62
        loveScoreFill.style.strokeDasharray = circumference;
        loveScoreFill.style.strokeDashoffset = circumference;

        var current = 0;
        var duration = 1600;
        var start = performance.now();

        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            current = Math.round(eased * target);
            loveScoreValue.textContent = current;

            var offset = circumference - (eased * target / 100) * circumference;
            loveScoreFill.style.strokeDashoffset = offset;

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);
    }

    // ─── Build AI prompt ───
    function buildPrompt(name1, name2, relType, score) {
        var relLabels = {
            crush: "Crush",
            love: "Love",
            friendship: "Friendship",
            breakup: "Breakup",
            marriage: "Marriage"
        };

        var isHindu = (profile.religion || "").toLowerCase().indexOf("hindu") !== -1;

        var prompt = "Love compatibility game request:\n"
            + "Person 1: " + name1 + "\n"
            + "Person 2: " + name2 + "\n"
            + "Relationship Type: " + (relLabels[relType] || "Love") + "\n"
            + "Love Score: " + score + "%\n\n"
            + "This is a fun love game. Based on the score of " + score + "% and the relationship type \"" + (relLabels[relType] || "Love") + "\", give a fun, entertaining, and positive love compatibility analysis.\n\n"
            + "Speak like a caring friend who is also a love advisor with a slightly spiritual touch. Be fun, emotional, and motivational — not too serious, not too childish.\n\n"
            + "Include:\n"
            + "1. A fun compatibility description based on the score and relationship type\n"
            + "2. What makes this pair special\n"
            + "3. Fun and reality-based love advice for them\n"
            + "4. Encouragement and a positive ending\n"
            + "5. A sweet love quote or message at the end\n";

        if (relType === "breakup") {
            prompt += "6. Since this is about a breakup, be extra caring, empathetic, and healing. Give hope and strength.\n";
        }

        if (isHindu) {
            prompt += "\nAlso add a subtle, light Bhagavad Gita-style love wisdom line (keep it brief and not preachy).\n";
        }

        prompt += "\nUse some emojis to make it engaging. Keep it lighthearted, fun, and positive. Never say anything negative or discouraging. This is just a fun entertainment game!\n"
            + "Format with clear sections and spacing.";

        return prompt;
    }

    // ─── Main calculation ───
    async function calculateLove() {
        var name1 = loveName1.value.trim();
        var name2 = loveName2.value.trim();

        if (!name1) { loveName1.focus(); return; }
        if (!name2) { loveName2.focus(); return; }

        // Show loading
        loveCalcBtn.disabled = true;
        loveCalcBtn.querySelector(".love-calc-btn__text").hidden = true;
        loveCalcBtn.querySelector(".love-calc-btn__loading").hidden = false;

        var score = generateLoveScore(name1, name2, selectedRelType);
        var message = buildPrompt(name1, name2, selectedRelType, score);

        // Show result section and animate
        loveScoreValue.textContent = "0";
        loveResultText.innerHTML = '<div class="love-typing-indicator"><span></span><span></span><span></span></div>';
        loveResult.hidden = false;
        loveResult.scrollIntoView({ behavior: "smooth", block: "start" });

        loveResultTitle.textContent = name1 + " & " + name2;
        loveResultLabel.textContent = getScoreLabel(score);

        // Set ring color based on score
        var hue = score >= 80 ? "340" : score >= 60 ? "330" : "310";
        loveScoreFill.style.stroke = "hsl(" + hue + ", 100%, 65%)";

        animateScore(score);

        // Fetch AI response
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
                loveResultText.textContent = "Error: " + data.error;
            } else {
                var reply = data.reply || "No response received.";
                loveResultText.textContent = reply;
                lastResult = {
                    name1: name1,
                    name2: name2,
                    relType: selectedRelType,
                    score: score,
                    label: getScoreLabel(score),
                    reply: reply,
                    timestamp: Date.now()
                };
            }
        } catch (err) {
            loveResultText.textContent = "Failed to get your love reading. Please try again.";
        }

        // Reset button
        loveCalcBtn.disabled = false;
        loveCalcBtn.querySelector(".love-calc-btn__text").hidden = false;
        loveCalcBtn.querySelector(".love-calc-btn__loading").hidden = true;
    }

    // ─── Try Again ───
    loveTryAgainBtn.addEventListener("click", function () {
        loveResult.hidden = true;
        loveName2.value = "";
        loveName2.focus();
        lastResult = null;
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ─── Share Result ───
    loveShareBtn.addEventListener("click", function () {
        if (!lastResult) return;
        var sharerName = (profile.fullName || "A devotee").trim();
        var prefersKannada = (profile.languagePreference || "").toLowerCase().indexOf("kannada") !== -1;
        var appUrl = new URL("login.html", window.location.href).href;
        var shareTitle = prefersKannada
            ? "MyBhagavanth - " + sharerName + " ಅವರಿಂದ ಆಹ್ವಾನ"
            : "MyBhagavanth - Invitation from " + sharerName;
        var shareText = prefersKannada
            ? "✨ " + sharerName + " ಅವರು MyBhagavanth ಗೆ ನಿಮ್ಮನ್ನು ಆಹ್ವಾನಿಸಿದ್ದಾರೆ ✨\n"
                + "MyBhagavanth ಒಂದು spiritual AI guidance app - astrology, daily learning, love insights ಮತ್ತು life support ಕೊಡುತ್ತದೆ.\n"
                + "Share ಮಾಡಿದ result private ಆಗಿದೆ; login ಮಾಡಿದ ಮೇಲೆ ಮಾತ್ರ app ಒಳಗೆ view ಮಾಡಬಹುದು.\n\n"
                + "MyBhagavanth ತೆರೆದುಕೊಳ್ಳಿ: " + appUrl
            : "✨ " + sharerName + " invited you to MyBhagavanth ✨\n"
                + "MyBhagavanth is a spiritual AI guidance app for astrology, daily learning, love insights, and life support.\n"
                + "Shared result is private and can be viewed only after logging in to the app.\n\n"
                + "Open MyBhagavanth: " + appUrl;

        if (navigator.share) {
            navigator.share({
                title: shareTitle,
                text: shareText,
                url: appUrl
            }).catch(function () {});
        } else {
            navigator.clipboard.writeText(shareText).then(function () {
                loveShareBtn.textContent = "✅ Copied!";
                setTimeout(function () {
                    loveShareBtn.textContent = "📤 Share Result";
                }, 2000);
            }).catch(function () {});
        }
    });

    // ─── Save Result ───
    loveSaveBtn.addEventListener("click", function () {
        if (!lastResult) return;
        var saved = loadSaved();
        saved.unshift(lastResult);
        if (saved.length > 20) saved = saved.slice(0, 20);
        localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
        loveSaveBtn.textContent = "✅ Saved!";
        setTimeout(function () {
            loveSaveBtn.textContent = "💾 Save Result";
        }, 2000);
        renderSaved();
    });

    // ─── Saved results ───
    function loadSaved() {
        try {
            var raw = localStorage.getItem(SAVED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function renderSaved() {
        var saved = loadSaved();
        if (!saved.length) {
            loveSavedSection.hidden = true;
            return;
        }
        loveSavedSection.hidden = false;
        loveSavedList.innerHTML = "";
        saved.forEach(function (item) {
            var card = document.createElement("div");
            card.className = "love-saved-card";
            var d = new Date(item.timestamp);
            var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            card.innerHTML = '<div class="love-saved-card__top">'
                + '<span class="love-saved-card__names">' + escapeHtml(item.name1) + ' & ' + escapeHtml(item.name2) + '</span>'
                + '<span class="love-saved-card__score">' + item.score + '%</span>'
                + '</div>'
                + '<div class="love-saved-card__meta">'
                + '<span>' + escapeHtml(item.relType) + '</span>'
                + '<span>' + dateStr + '</span>'
                + '</div>';
            loveSavedList.appendChild(card);
        });
    }

    loveClearSavedBtn.addEventListener("click", function () {
        localStorage.removeItem(SAVED_KEY);
        renderSaved();
    });

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ─── Events ───
    loveCalcBtn.addEventListener("click", calculateLove);

    // Enter key support
    loveName2.addEventListener("keydown", function (e) {
        if (e.key === "Enter") calculateLove();
    });

    // ─── App common setup ───
    mobileDrawerName.textContent = profile.fullName;
    mobileDrawerMeta.textContent = profile.languagePreference;
    app.bindRouteButtons(document);
    app.setupDrawer({ menuButton: mobileMenuButton, closeButton: mobileDrawerClose, backdrop: mobileDrawerBackdrop });
    app.setupInstallButtons([mobileInstallButton], function () {});
    app.setupDesktopHeader(app.getTheme().icon);
    mobileLogoutButton.addEventListener("click", logout);
    applyHeaderPhoto();
    renderSaved();
})();
