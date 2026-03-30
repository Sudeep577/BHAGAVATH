(function () {
    "use strict";

    var app = window.MyBhagavanthApp;
    var profile = app.requireProfile();

    var SAVED_KEY = "mybhagavanth-astro-saved";

    // ─── DOM References ───
    var mobileMenuButton = document.getElementById("mobileMenuButton");
    var mobileDrawerBackdrop = document.getElementById("mobileDrawerBackdrop");
    var mobileDrawerClose = document.getElementById("mobileDrawerClose");
    var mobileDrawerName = document.getElementById("mobileDrawerName");
    var mobileDrawerMeta = document.getElementById("mobileDrawerMeta");
    var mobileLogoutButton = document.getElementById("mobileLogoutButton");
    var mobileInstallButton = document.getElementById("mobileInstallButton");

    var astroName = document.getElementById("astroName");
    var astroDob = document.getElementById("astroDob");
    var astroTob = document.getElementById("astroTob");
    var astroPob = document.getElementById("astroPob");
    var astroRashi = document.getElementById("astroRashi");
    var astroAutoDetect = document.getElementById("astroAutoDetect");
    var astroCategoryChips = document.getElementById("astroCategoryChips");
    var astroQuestion = document.getElementById("astroQuestion");
    var astroCompatToggle = document.getElementById("astroCompatToggle");
    var astroCompatSection = document.getElementById("astroCompatSection");
    var astroCompatSign = document.getElementById("astroCompatSign");
    var astroAskBtn = document.getElementById("astroAskBtn");
    var astroAskBtnText = document.getElementById("astroAskBtnText");
    var astroResult = document.getElementById("astroResult");
    var astroResultText = document.getElementById("astroResultText");
    var astroReadingSign = document.getElementById("astroReadingSign");
    var astroLuckyNum = document.getElementById("astroLuckyNum");
    var astroLuckyColor = document.getElementById("astroLuckyColor");
    var astroLuckyTime = document.getElementById("astroLuckyTime");
    var astroRefreshBtn = document.getElementById("astroRefreshBtn");
    var astroShareBtn = document.getElementById("astroShareBtn");
    var astroSaveBtn = document.getElementById("astroSaveBtn");
    var astroSavedSection = document.getElementById("astroSavedSection");
    var astroSavedList = document.getElementById("astroSavedList");
    var astroClearSavedBtn = document.getElementById("astroClearSavedBtn");

    var selectedCategory = "all";
    var lastResult = null;

    // Pre-fill
    if (astroName && profile.fullName) astroName.value = profile.fullName;

    // ─── Zodiac data ───
    var ZODIAC_MAP = [
        { start: [1, 20], end: [2, 18], name: "Kumbha (Aquarius)", symbol: "♒" },
        { start: [2, 19], end: [3, 20], name: "Meena (Pisces)", symbol: "♓" },
        { start: [3, 21], end: [4, 19], name: "Mesha (Aries)", symbol: "♈" },
        { start: [4, 20], end: [5, 20], name: "Vrushabha (Taurus)", symbol: "♉" },
        { start: [5, 21], end: [6, 20], name: "Mithuna (Gemini)", symbol: "♊" },
        { start: [6, 21], end: [7, 22], name: "Karka (Cancer)", symbol: "♋" },
        { start: [7, 23], end: [8, 22], name: "Simha (Leo)", symbol: "♌" },
        { start: [8, 23], end: [9, 22], name: "Kanya (Virgo)", symbol: "♍" },
        { start: [9, 23], end: [10, 22], name: "Tula (Libra)", symbol: "♎" },
        { start: [10, 23], end: [11, 21], name: "Vrischika (Scorpio)", symbol: "♏" },
        { start: [11, 22], end: [12, 21], name: "Dhanu (Sagittarius)", symbol: "♐" },
        { start: [12, 22], end: [12, 31], name: "Makara (Capricorn)", symbol: "♑" },
        { start: [1, 1], end: [1, 19], name: "Makara (Capricorn)", symbol: "♑" }
    ];

    var LUCKY_COLORS = [
        "Royal Blue", "Emerald Green", "Golden Yellow", "Silver White",
        "Ruby Red", "Amethyst Purple", "Topaz Orange", "Pearl White",
        "Sapphire Blue", "Rose Pink", "Jade Green", "Ivory"
    ];

    var LUCKY_TIMES = [
        "6:00 AM – 8:00 AM", "8:00 AM – 10:00 AM", "10:00 AM – 12:00 PM",
        "12:00 PM – 2:00 PM", "2:00 PM – 4:00 PM", "4:00 PM – 6:00 PM",
        "6:00 PM – 8:00 PM", "8:00 PM – 10:00 PM"
    ];

    // ─── Header photo ───
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

    // ─── Auto-detect zodiac from DOB ───
    function detectZodiac(dateStr) {
        if (!dateStr) return null;
        var parts = dateStr.split("-");
        var month = parseInt(parts[1], 10);
        var day = parseInt(parts[2], 10);

        for (var i = 0; i < ZODIAC_MAP.length; i++) {
            var z = ZODIAC_MAP[i];
            var afterStart = (month > z.start[0]) || (month === z.start[0] && day >= z.start[1]);
            var beforeEnd = (month < z.end[0]) || (month === z.end[0] && day <= z.end[1]);
            if (afterStart && beforeEnd) return z;
        }
        return null;
    }

    astroDob.addEventListener("change", function () {
        var z = detectZodiac(astroDob.value);
        if (z) {
            astroAutoDetect.textContent = "Detected: " + z.symbol + " " + z.name;
            astroAutoDetect.style.display = "block";
            if (!astroRashi.value) {
                astroRashi.value = z.name;
            }
        } else {
            astroAutoDetect.textContent = "";
            astroAutoDetect.style.display = "none";
        }
    });

    // ─── Category chips ───
    astroCategoryChips.addEventListener("click", function (e) {
        var chip = e.target.closest(".feature-topic-btn");
        if (!chip) return;
        astroCategoryChips.querySelectorAll(".feature-topic-btn").forEach(function (c) {
            c.classList.remove("is-selected");
        });
        chip.classList.add("is-selected");
        selectedCategory = chip.dataset.cat;
    });

    // ─── Compatibility toggle ───
    astroCompatToggle.addEventListener("change", function () {
        astroCompatSection.hidden = !astroCompatToggle.checked;
    });

    // ─── Luck factor generation ───
    function generateLuckFactors(name, dob, rashi) {
        var seed = (name + dob + rashi + new Date().toDateString()).toLowerCase();
        var hash = 0;
        for (var i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
            hash = hash & hash;
        }
        hash = Math.abs(hash);

        return {
            number: (hash % 9) + 1,
            color: LUCKY_COLORS[hash % LUCKY_COLORS.length],
            time: LUCKY_TIMES[hash % LUCKY_TIMES.length]
        };
    }

    // ─── Get zodiac symbol for display ───
    function getZodiacSymbol(rashiValue) {
        for (var i = 0; i < ZODIAC_MAP.length; i++) {
            if (ZODIAC_MAP[i].name === rashiValue) return ZODIAC_MAP[i].symbol;
        }
        return "🔮";
    }

    // ─── Build AI prompt ───
    function buildPrompt(name, dob, tob, pob, rashi, category, question, compatSign) {
        var isHindu = (profile.religion || "").toLowerCase().indexOf("hindu") !== -1;
        var lang = profile.languagePreference || "English";

        var prompt = "Astrology reading request:\n"
            + "Name: " + name + "\n"
            + "Date of Birth: " + dob + "\n";

        if (tob) prompt += "Time of Birth: " + tob + "\n";
        if (pob) prompt += "Place of Birth: " + pob + "\n";
        prompt += "Rashi (Zodiac Sign): " + rashi + "\n";
        prompt += "Today's Date: " + new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + "\n\n";

        prompt += "Speak as a wise, calm, and insightful astrologer — like a spiritual guide and motivational mentor. "
            + "Be positive, non-fear-based, and never give negative or discouraging predictions. "
            + "Keep the tone calm, peaceful, and uplifting.\n\n";

        if (category === "all") {
            prompt += "Give a detailed personalized daily horoscope covering ALL of these categories:\n"
                + "1. ❤️ Love & Relationships\n"
                + "2. 💼 Career & Work\n"
                + "3. 🧘 Health & Wellness\n"
                + "4. 💰 Finance & Wealth\n\n"
                + "Also include:\n"
                + "- Personality traits based on their rashi\n"
                + "- Overall guidance for the day\n";
        } else {
            var catLabels = { love: "❤️ Love & Relationships", career: "💼 Career & Work", health: "🧘 Health & Wellness", finance: "💰 Finance & Wealth" };
            prompt += "Give a detailed personalized daily horoscope focused specifically on: " + (catLabels[category] || category) + "\n"
                + "Go deep into this category with insights, guidance, and advice.\n\n";
        }

        if (question) {
            prompt += "The user also has a specific question: \"" + question + "\"\nPlease address this in your reading.\n\n";
        }

        if (compatSign) {
            prompt += "COMPATIBILITY CHECK: The user also wants to know their compatibility with someone who is " + compatSign + ". "
                + "Include a compatibility analysis section covering love, communication, and overall harmony.\n\n";
        }

        if (isHindu) {
            prompt += "Add a subtle, light piece of wisdom inspired by the Bhagavad Gita related to their reading (keep it brief and not preachy).\n\n";
        }

        if (lang.toLowerCase().indexOf("kannada") !== -1) {
            prompt += "Respond in a mix of Kannada and English (Kanglish style) for a more personal touch.\n\n";
        }

        prompt += "Use emojis to make it engaging. Format with clear section headers and spacing. "
            + "End with an uplifting cosmic message or affirmation.\n"
            + "Remember: This is for entertainment and guidance only.";

        return prompt;
    }

    // ─── Main calculation ───
    async function getAstrology() {
        var name = astroName.value.trim();
        var dob = astroDob.value;
        var tob = astroTob.value;
        var pob = astroPob.value.trim();
        var rashi = astroRashi.value;
        var question = astroQuestion.value.trim();
        var compatSign = astroCompatToggle.checked ? astroCompatSign.value : "";

        if (!name) { astroName.focus(); return; }
        if (!dob) { astroDob.focus(); return; }

        // Auto-detect rashi if not selected
        if (!rashi) {
            var z = detectZodiac(dob);
            if (z) {
                rashi = z.name;
                astroRashi.value = rashi;
            } else {
                astroRashi.focus();
                return;
            }
        }

        // Show loading
        astroAskBtn.disabled = true;
        astroAskBtnText.textContent = "Reading the cosmos...";

        // Generate luck factors
        var luck = generateLuckFactors(name, dob, rashi);
        astroLuckyNum.textContent = luck.number;
        astroLuckyColor.textContent = luck.color;
        astroLuckyTime.textContent = luck.time;

        // Show sign in header
        astroReadingSign.textContent = getZodiacSymbol(rashi) + " " + rashi;

        // Show result
        astroResultText.innerHTML = '<div class="astro-typing-indicator"><span></span><span></span><span></span></div>';
        astroResult.hidden = false;
        astroResult.scrollIntoView({ behavior: "smooth", block: "start" });

        var message = buildPrompt(name, dob, tob, pob, rashi, selectedCategory, question, compatSign);

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
                astroResultText.textContent = "Error: " + data.error;
            } else {
                var reply = data.reply || "No response received.";
                astroResultText.textContent = reply;
                lastResult = {
                    name: name,
                    dob: dob,
                    rashi: rashi,
                    category: selectedCategory,
                    luck: luck,
                    reply: reply,
                    timestamp: Date.now()
                };
            }
        } catch (err) {
            astroResultText.textContent = "Failed to get your cosmic reading. Please try again.";
        }

        // Reset button
        astroAskBtn.disabled = false;
        astroAskBtnText.textContent = "✨ Reveal My Stars";
    }

    // ─── Daily Refresh ───
    astroRefreshBtn.addEventListener("click", function () {
        getAstrology();
    });

    // ─── Share ───
    astroShareBtn.addEventListener("click", function () {
        if (!lastResult) return;
        var appUrl = new URL("login.html", window.location.href).href;
        var shareText = "🔐 MyBhagavanth private astrology insight shared with you.\n"
            + "Login ಮಾಡಿ app ಒಳಗೆ ಮಾತ್ರ view ಮಾಡಬಹುದು.\n\n"
            + "Open app: " + appUrl;

        if (navigator.share) {
            navigator.share({
                title: "MyBhagavanth Private Insight",
                text: shareText,
                url: appUrl
            }).catch(function () {});
        } else {
            navigator.clipboard.writeText(shareText).then(function () {
                astroShareBtn.textContent = "✅ Copied!";
                setTimeout(function () { astroShareBtn.textContent = "📤 Share"; }, 2000);
            }).catch(function () {});
        }
    });

    // ─── Save ───
    astroSaveBtn.addEventListener("click", function () {
        if (!lastResult) return;
        var saved = loadSaved();
        saved.unshift(lastResult);
        if (saved.length > 20) saved = saved.slice(0, 20);
        localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
        astroSaveBtn.textContent = "✅ Saved!";
        setTimeout(function () { astroSaveBtn.textContent = "💾 Save"; }, 2000);
        renderSaved();
    });

    // ─── Saved readings ───
    function loadSaved() {
        try {
            var raw = localStorage.getItem(SAVED_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function renderSaved() {
        var saved = loadSaved();
        if (!saved.length) {
            astroSavedSection.hidden = true;
            return;
        }
        astroSavedSection.hidden = false;
        astroSavedList.innerHTML = "";
        saved.forEach(function (item) {
            var card = document.createElement("div");
            card.className = "astro-saved-card";
            var d = new Date(item.timestamp);
            var dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            card.innerHTML = '<div class="astro-saved-card__top">'
                + '<span class="astro-saved-card__sign">' + getZodiacSymbol(item.rashi) + '</span>'
                + '<span class="astro-saved-card__name">' + escapeHtml(item.name) + '</span>'
                + '<span class="astro-saved-card__date">' + dateStr + '</span>'
                + '</div>'
                + '<div class="astro-saved-card__rashi">' + escapeHtml(item.rashi) + '</div>';
            astroSavedList.appendChild(card);
        });
    }

    astroClearSavedBtn.addEventListener("click", function () {
        localStorage.removeItem(SAVED_KEY);
        renderSaved();
    });

    function escapeHtml(str) {
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ─── Events ───
    astroAskBtn.addEventListener("click", getAstrology);

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
