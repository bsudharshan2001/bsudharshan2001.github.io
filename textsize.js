// Text size controls, toast system, and quirky prompts
(function() {
    var SCALES = [0.8, 0.85, 0.9, 1, 1.1, 1.2, 1.35];
    var DEFAULT_INDEX = 3;
    var toastTimeout = null;
    var maxHitCount = 0;
    var minHitCount = 0;
    var nearMaxShown = false;
    var nearMinShown = false;
    var konamiBuffer = [];
    var KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';

    var maxMessages = [
        'this is a website, not a billboard',
        'sir this is a portfolio not a LensCrafters ad',
        'at this point just use a magnifying glass',
        "I'm running out of pixels here",
        'okay grandma, I get it'
    ];

    var minMessages = [
        'you must have 20/20 vision or something',
        'ant-sized text? bold choice for an academic site',
        "this isn't a terms of service page",
        'are you trying to hide my research from yourself?',
        'fine. I hope your optometrist is proud'
    ];

    function getScaleIndex() {
        var stored = localStorage.getItem('textScale');
        if (stored !== null) {
            var idx = parseInt(stored, 10);
            if (idx >= 0 && idx < SCALES.length) return idx;
        }
        return DEFAULT_INDEX;
    }

    function applyScale(index) {
        document.documentElement.style.setProperty('--font-scale', SCALES[index]);
        localStorage.setItem('textScale', index);
    }

    function updateButtons(index) {
        var downBtn = document.getElementById('text-size-down');
        var upBtn = document.getElementById('text-size-up');
        if (!downBtn || !upBtn) return;

        if (index <= 0) {
            downBtn.classList.add('disabled');
        } else {
            downBtn.classList.remove('disabled');
        }

        if (index >= SCALES.length - 1) {
            upBtn.classList.add('disabled');
        } else {
            upBtn.classList.remove('disabled');
        }
    }

    // Toast system
    function showToast(message, duration) {
        duration = duration || 3500;
        var existing = document.getElementById('site-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'site-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger reflow then show
        toast.offsetHeight;
        toast.classList.add('visible');

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function() {
            toast.classList.remove('visible');
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);
    }

    function injectControls() {
        if (document.getElementById('text-size-down')) return;

        var footerRight = document.querySelector('.footer-right');
        if (!footerRight) return;

        var control = document.createElement('div');
        control.className = 'text-size-control';
        control.innerHTML =
            '<button class="text-size-btn" id="text-size-down" aria-label="Decrease text size">A\u2212</button>' +
            '<button class="text-size-btn" id="text-size-up" aria-label="Increase text size">A+</button>';

        // Insert before theme toggle
        var themeToggle = footerRight.querySelector('.theme-toggle');
        if (themeToggle) {
            footerRight.insertBefore(control, themeToggle);
        } else {
            footerRight.appendChild(control);
        }
    }

    function init() {
        injectControls();

        var currentIndex = getScaleIndex();
        applyScale(currentIndex);
        updateButtons(currentIndex);

        var downBtn = document.getElementById('text-size-down');
        var upBtn = document.getElementById('text-size-up');
        if (!downBtn || !upBtn) return;

        var lastClickDown = 0;
        var lastClickUp = 0;

        downBtn.addEventListener('click', function() {
            var now = Date.now();
            // Double-click reset
            if (now - lastClickDown < 400) {
                currentIndex = DEFAULT_INDEX;
                applyScale(currentIndex);
                updateButtons(currentIndex);
                showToast('back to factory settings. boring but respectable.');
                lastClickDown = 0;
                maxHitCount = 0;
                minHitCount = 0;
                return;
            }
            lastClickDown = now;

            if (currentIndex <= 0) {
                minHitCount++;
                var msgIdx = Math.min(minHitCount - 1, minMessages.length - 1);
                showToast(minMessages[msgIdx]);
                return;
            }
            currentIndex--;
            applyScale(currentIndex);
            updateButtons(currentIndex);

            // Near min warning
            if (currentIndex === 1 && !nearMinShown) {
                nearMinShown = true;
                showToast('squinting yet?');
            }

            // Check dark mode + max text combo
            checkCombo(currentIndex);
        });

        upBtn.addEventListener('click', function() {
            var now = Date.now();
            // Double-click reset
            if (now - lastClickUp < 400) {
                currentIndex = DEFAULT_INDEX;
                applyScale(currentIndex);
                updateButtons(currentIndex);
                showToast('back to factory settings. boring but respectable.');
                lastClickUp = 0;
                maxHitCount = 0;
                minHitCount = 0;
                return;
            }
            lastClickUp = now;

            if (currentIndex >= SCALES.length - 1) {
                maxHitCount++;
                var msgIdx = Math.min(maxHitCount - 1, maxMessages.length - 1);
                showToast(maxMessages[msgIdx]);
                return;
            }
            currentIndex++;
            applyScale(currentIndex);
            updateButtons(currentIndex);

            // Near max warning
            if (currentIndex === SCALES.length - 2 && !nearMaxShown) {
                nearMaxShown = true;
                showToast('getting kinda large there, just saying');
            }

            // Check dark mode + max text combo
            checkCombo(currentIndex);
        });

        // Dark mode + max text combo
        function checkCombo(idx) {
            if (idx === SCALES.length - 1 && document.documentElement.getAttribute('data-theme') === 'dark') {
                if (!localStorage.getItem('comboShown')) {
                    localStorage.setItem('comboShown', '1');
                    setTimeout(function() {
                        showToast("dark mode AND giant text? you're either coding at 3am or over 60. respect either way.", 4500);
                    }, 500);
                }
            }
        }

        // First-visit welcome toast
        if (!localStorage.getItem('visited')) {
            localStorage.setItem('visited', '1');
            setTimeout(function() {
                showToast("oh hey, you found my website. if you can't read this, that's a you problem. (but there's an A+ button down there just in case)", 6000);
            }, 2000);
        }

        // Konami code
        document.addEventListener('keydown', function(e) {
            konamiBuffer.push(e.key);
            if (konamiBuffer.length > 10) konamiBuffer.shift();
            if (konamiBuffer.join(',') === KONAMI) {
                konamiBuffer = [];
                var savedScale = SCALES[currentIndex];
                document.documentElement.style.setProperty('--font-scale', 2.5);
                showToast('you found it. now pretend this didn\'t happen.', 2500);
                setTimeout(function() {
                    document.documentElement.style.setProperty('--font-scale', savedScale);
                }, 2500);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
