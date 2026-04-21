// ============================================================
// DISCOUNT DEN – Stretchable Percentage Line Engine
// One slider on fixed value line → percentage line stretches to match
// ============================================================
(function () {
    'use strict';

    /* ---------- helpers ---------- */
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    /* ---------- constants ---------- */
    const VAL_MAX = 50;
    const PROBLEMS_PER_LEVEL = 5;
    const ALLOWED_PERCENTS = [10, 20, 25, 50, 75];

    const PRODUCTS = [
        { emoji: '🧸', name: 'Teddy Bear' },
        { emoji: '🤖', name: 'Robot Toy' },
        { emoji: '🚀', name: 'Rocket Ship' },
        { emoji: '⚽', name: 'Soccer Ball' },
        { emoji: '🎸', name: 'Guitar' },
        { emoji: '🎮', name: 'Game Console' },
        { emoji: '👟', name: 'Sneakers' },
        { emoji: '🎧', name: 'Headphones' },
        { emoji: '🎨', name: 'Art Set' },
        { emoji: '🏀', name: 'Basketball' },
        { emoji: '🛹', name: 'Skateboard' },
        { emoji: '🎒', name: 'Backpack' },
        { emoji: '⌚', name: 'Watch' },
        { emoji: '🧩', name: 'Puzzle Set' },
    ];

    const SUCCESS_MESSAGES = [
        'Fantastic! 🎉', 'Awesome work! 🌟', "You're a pro! 💪",
        'Nailed it! 🎯', 'Brilliant! ✨', 'Super smart! 🧠',
        'Amazing! 🏆', 'You rock! 🤩', 'Perfect! 💯',
    ];
    const TRY_AGAIN_MSGS = [
        'Almost! Try again 💪', 'Not quite — you got this! 🌟',
        'Close! Check the number line 🔍', "Let's think again 🤝",
    ];
    const GREETINGS = [
        'I need help pricing this!', 'Can you solve this one?',
        'Help me with the discount!', 'Customers are waiting!',
        "Let's do some math magic! ✨",
    ];

    /* ---------- DOM refs ---------- */
    const splashScreen = $('#splash-screen');
    const gameScreen = $('#game-screen');
    const resultsScreen = $('#results-screen');
    const startBtn = $('#start-btn');
    const homeBtn = $('#home-btn');
    const levelBtns = $$('.btn-level');

    const currentLevelEl = $('#current-level');
    const currentProblemEl = $('#current-problem');
    const totalProblemsEl = $('#total-problems');
    const scoreEl = $('#score');
    const streakEl = $('#streak');

    const productName = $('#product-name');
    const productEmoji = $('#product-emoji');
    const priceValue = $('#price-value');
    const mrpBadge = $('#mrp-badge');
    const mrpText = $('#mrp-text');
    const discountBadge = $('#discount-badge');
    const discountText = $('#discount-text');
    const discountedPriceTag = $('#discounted-price-tag');
    const discountedPriceText = $('#discounted-price-text');
    const cardQuestionText = $('#card-question-text');
    const questionText = $('#question-text');

    const calcStepEls = [
        { el: $('#calc-step-1'), val: $('#calc-full-price') },
        { el: $('#calc-step-2'), val: $('#calc-discount') },
        { el: $('#calc-step-3'), val: $('#calc-final') },
    ];

    // Number lines
    const pctStretch = $('#pct-stretch');
    const pctTicks = $('#pct-ticks');
    const pctFillDiscount = $('#pct-fill-discount');
    const pctTrack = $('#pct-track');

    const pctMarker = $('#pct-marker');
    const pctMarkerLabel = $('#pct-marker-label');
    const pctMarkerFill = $('#pct-marker-fill');

    const pctMarkerLeft = $('#pct-marker-left');
    const pctMarkerLabelLeft = $('#pct-marker-label-left');
    const pctMarkerFillLeft = $('#pct-marker-fill-left');

    const valTrackArea = $('#val-track-area');
    const valTicks = $('#val-ticks');
    const valFillFull = $('#val-fill-full');
    const valFillDiscount = $('#val-fill-discount');

    const sliderEl = $('#nl-slider');
    const sliderValEl = $('#slider-val');

    const connectorArea = $('#nl-connector-area');
    const readoutText = null;
    const nlInstruction = null;

    const answerArea = $('#answer-area');
    const answerPrompt = $('#answer-prompt');
    const answerInput = $('#answer-input');
    const submitAnswerBtn = $('#submit-answer-btn');
    const answerFeedbackEl = $('#answer-feedback-inline');
    const questionCard = $('#question-card');

    const feedbackOverlay = $('#feedback-overlay');
    const feedbackCard = $('#feedback-card');
    const feedbackIcon = $('#feedback-icon');
    const feedbackTitle = $('#feedback-title');
    const feedbackMessage = $('#feedback-message');
    const feedbackDetail = $('#feedback-detail');
    const feedbackNextBtn = $('#feedback-next-btn');

    const solutionOverlay = $('#solution-overlay');
    const solutionSteps = $('#solution-steps');
    const solutionGotItBtn = $('#solution-got-it-btn');
    const solutionDisplay = $('#solution-display');

    const hintsContent = $('#hints-content');
    const showHintBtn = $('#show-hint-btn');
    const showAnswerBtn = $('#show-answer-btn');
    const hintBtnLabel = $('#hint-btn-label');
    const hintAttemptsText = $('#hint-attempts-text');

    const resultCorrect = $('#result-correct');
    const resultScore = $('#result-score');
    const resultStreak = $('#result-streak');
    const resultsTitle = $('#results-title');
    const resultsStars = $('#results-stars');
    const replayBtn = $('#replay-btn');
    const nextLevelBtn = $('#next-level-btn');
    const menuBtn = $('#menu-btn');

    // Audio elements
    const clickSound = $('#click-sound');
    const successSound = $('#success-sound');
    const errorSound = $('#error-sound');
    const slideSound = $('#slide-sound');

    /* ---------- state ---------- */
    const state = {
        level: 1,
        problemIndex: 0,
        problems: [],
        problem: null,
        score: 0,
        streak: 0,
        bestStreak: 0,
        correctCount: 0,
        sliderValue: 0,     // 0–50 integer on the fixed value line
        isDragging: false,
        markerPercent: 100,
        isDraggingMarker: false,
        markerLeftPercent: 0,
        isDraggingMarkerLeft: false,
        attempts: 0,
        hintsRevealed: 0,
        awaitingNext: false,
        unlockedLevels: [1, 2, 3, 4, 3, 4],
    };

    /* ============================================================
       BUILD TICKS
       ============================================================ */

    // Percentage ticks: 0% to 100% — placed as percentage positions inside the stretchable container
    function buildPctTicks() {
        pctTicks.innerHTML = '';
        for (let v = 0; v <= 100; v += 5) {
            const leftPct = (v / 100) * 100;  // percentage position within container
            const isMajor = v % 10 === 0;

            const tick = document.createElement('div');
            tick.className = 'nl-tick-pct' + (isMajor ? ' major' : '');
            tick.style.left = leftPct + '%';

            const line = document.createElement('div');
            line.className = 'tick-line';
            tick.appendChild(line);

            if (isMajor) {
                const label = document.createElement('div');
                label.className = 'tick-label';
                label.textContent = v + '%';
                tick.appendChild(label);
            }
            pctTicks.appendChild(tick);
        }
    }

    // Value ticks: 0 to 50 — fixed positions
    function buildValTicks() {
        valTicks.innerHTML = '';
        for (let v = 0; v <= VAL_MAX; v++) {
            const leftPct = (v / VAL_MAX) * 100;
            const isMajor = v % 5 === 0;

            const tick = document.createElement('div');
            tick.className = 'nl-tick-val' + (isMajor ? ' major' : '');
            tick.style.left = leftPct + '%';

            const line = document.createElement('div');
            line.className = 'tick-line';
            tick.appendChild(line);

            if (isMajor) {
                const label = document.createElement('div');
                label.className = 'tick-label';
                label.textContent = v;
                tick.appendChild(label);
            }
            valTicks.appendChild(tick);
        }
    }

    /* ============================================================
       SLIDER + STRETCHABLE PERCENTAGE LINE
       ============================================================
       When slider is at value V on the fixed line:
       - The pct line stretches so its right edge (100%) aligns with V
       - pctStretch width = (V / VAL_MAX) * 100 %
       - Any percentage P on the pct line corresponds to value: V * P / 100
       ============================================================ */

    function setSlider(value, animate) {
        value = Math.max(0, Math.min(VAL_MAX, Math.round(value)));
        state.sliderValue = value;

        const leftPct = (value / VAL_MAX) * 100;
        sliderEl.style.transition = animate ? 'left 0.3s ease' : 'left 0.05s linear';
        sliderEl.style.left = leftPct + '%';
        sliderValEl.textContent = value;
        sliderEl.setAttribute('aria-valuenow', value);

        // Stretch the percentage line to match
        pctStretch.style.width = leftPct + '%';

        // Show full-price fill on value line
        valFillFull.style.width = leftPct + '%';

        updateMarkerLabel();
        updateMarkerLeftLabel();

        // Update readout
        if (value > 0) {
            updateReadout(value);
        } else if (readoutText) {
            readoutText.textContent = 'Drag the slider to explore!';
        }
    }

    function updateReadout(value) {
        if (!readoutText) return;
        const p = state.problem;
        if (!p) {
            readoutText.textContent = `Slider at ${value} → 100% = ${value} coins`;
            return;
        }

        // Show the correspondence: what value does each key % map to
        if (value === p.price) {
            const discVal = Math.round(p.price * p.discountPct / 100);
            readoutText.innerHTML =
                `✅ 100% = <b>${value}</b> coins &nbsp;|&nbsp; ` +
                `${p.discountPct}% = <b>${discVal}</b> coins &nbsp;|&nbsp; ` +
                `${100 - p.discountPct}% = <b>${value - discVal}</b> coins`;
        } else {
            readoutText.innerHTML = `100% = <b>${value}</b> coins — ` +
                `Try to set it to the full price!`;
        }
    }

    /* ---------- Show discount highlight on both lines ---------- */
    function showDiscountOnLines(price, discountPct) {
        const discountAmt = price * discountPct / 100;
        const finalPrice = price - discountAmt;
        const isFindPercent = state.problem && state.problem.type === 'find_percent';

        // Keep the top line unhighlighted for all levels.
        pctFillDiscount.style.left = '0%';
        pctFillDiscount.style.width = '0%';

        if (isFindPercent) {
            // Highlight from 0 to the discount amount so it aligns with the answer marker.
            valFillDiscount.style.left = '0%';
            valFillDiscount.style.width = (discountAmt / VAL_MAX) * 100 + '%';
        } else {
            // Value line: show discount region
            const finalLeft = (finalPrice / VAL_MAX) * 100;
            const discWidth = (discountAmt / VAL_MAX) * 100;
            valFillDiscount.style.left = finalLeft + '%';
            valFillDiscount.style.width = discWidth + '%';
        }
    }

    function clearDiscountHighlights() {
        pctFillDiscount.style.width = '0%';
        valFillDiscount.style.width = '0%';
    }

    /* ---------- Connector lines between the two lines ---------- */
    function clearConnectors() { connectorArea.innerHTML = ''; }

    function addConnector(valuePos, className) {
        const connectorRect = connectorArea.getBoundingClientRect();
        const valueTrackRect = valTrackArea.getBoundingClientRect();
        const leftPx = (valuePos / VAL_MAX) * valueTrackRect.width + (valueTrackRect.left - connectorRect.left);
        const line = document.createElement('div');
        line.className = 'nl-connector-line active ' + (className || '');
        line.style.left = leftPx + 'px';
        connectorArea.appendChild(line);
    }

    /* ============================================================
       DRAGGING (single slider on value line & marker on percentage line)
       ============================================================ */
    function initDrag() {
        valTrackArea.addEventListener('pointerdown', onDown);
        sliderEl.addEventListener('pointerdown', onDown);
        pctMarker.addEventListener('pointerdown', onMarkerDown);
        pctMarkerLeft.addEventListener('pointerdown', onMarkerLeftDown);
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }

    function onDown(e) {
        if (valTrackArea.classList.contains('disabled')) return;
        e.preventDefault();
        state.isDragging = true;
        document.body.style.cursor = 'grabbing';
        slideSound?.play();
        applyPointer(e);
    }

    function onMarkerDown(e) {
        if (valTrackArea.classList.contains('disabled')) return;
        e.preventDefault();
        e.stopPropagation();
        state.isDraggingMarker = true;
        document.body.style.cursor = 'grabbing';
        slideSound?.play();
        applyMarkerPointer(e);
    }

    function onMarkerLeftDown(e) {
        if (valTrackArea.classList.contains('disabled')) return;
        e.preventDefault();
        e.stopPropagation();
        state.isDraggingMarkerLeft = true;
        document.body.style.cursor = 'grabbing';
        slideSound?.play();
        applyMarkerLeftPointer(e);
    }

    function onMove(e) {
        if (state.isDragging) {
            e.preventDefault();
            applyPointer(e);
        } else if (state.isDraggingMarker) {
            e.preventDefault();
            applyMarkerPointer(e);
        } else if (state.isDraggingMarkerLeft) {
            e.preventDefault();
            applyMarkerLeftPointer(e);
        }
    }

    function onUp() {
        if (state.isDragging) {
            state.isDragging = false;
        }
        if (state.isDraggingMarker) {
            state.isDraggingMarker = false;
        }
        if (state.isDraggingMarkerLeft) {
            state.isDraggingMarkerLeft = false;
        }
        document.body.style.cursor = '';
    }

    function applyPointer(e) {
        const rect = valTrackArea.getBoundingClientRect();
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        let val = Math.round((pct / 100) * VAL_MAX);
        setSlider(val, false);
    }

    function applyMarkerPointer(e) {
        const rect = pctStretch.getBoundingClientRect();
        if (rect.width === 0) return;
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        pct = Math.round(pct);
        setMarkerPercent(pct);
    }

    function setMarkerPercent(pct) {
        state.markerPercent = pct;
        pctMarker.style.left = pct + '%';

        pctMarkerFill.style.left = pct + '%';
        pctMarkerFill.style.width = (100 - pct) + '%';

        updateMarkerLabel();
    }

    function updateMarkerLabel() {
        const pct = state.markerPercent;
        const diffPct = 100 - pct;
        pctMarkerLabel.innerHTML = `${diffPct}%`;
    }

    function applyMarkerLeftPointer(e) {
        const rect = pctStretch.getBoundingClientRect();
        if (rect.width === 0) return;
        let pct = ((e.clientX - rect.left) / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        pct = Math.round(pct);
        setMarkerLeftPercent(pct);
    }

    function setMarkerLeftPercent(pct) {
        state.markerLeftPercent = pct;
        pctMarkerLeft.style.left = pct + '%';

        pctMarkerFillLeft.style.left = '0%';
        pctMarkerFillLeft.style.width = pct + '%';

        updateMarkerLeftLabel();
    }

    function updateMarkerLeftLabel() {
        const pct = state.markerLeftPercent;
        pctMarkerLabelLeft.innerHTML = `${pct}%`;
    }


    /* ============================================================
       PROBLEM GENERATION (values ≤ 50, integers)
       ============================================================ */
    function validPairs() {
        const pairs = [];
        // Price range 30–50 so percentage line stretches clearly
        for (let price = 30; price <= 50; price++) {
            for (const pct of ALLOWED_PERCENTS) {
                const disc = price * pct / 100;
                const fin = price - disc;
                // Ensure ALL values are clean integers
                if (Number.isInteger(disc) && Number.isInteger(fin)
                    && disc > 0 && disc < price
                    && fin >= 1 && fin <= 50) {
                    pairs.push({ price, pct, disc, final: fin });
                }
            }
        }
        return pairs;
    }
    const VALID_PAIRS = validPairs();
    function pickPair() { return { ...pick(VALID_PAIRS) }; }

    function generateProblem(level) {
        const product = pick(PRODUCTS);
        switch (level) {
            case 1: return genLevel1(product);
            case 2: return genLevel2(product);
            case 3: return genLevel3(product);
            case 4: return genLevel4(product);
            default: return genLevel1(product);
        }
    }

    /* ============================================================
       QUESTION GENERATION — Full, clear questions
       Each question explains what the student needs to find.
       ============================================================ */
    function genLevel1(product) {
        const p = pickPair();
        return {
            type: 'direct', product,
            price: p.price, discountPct: p.pct, discountAmt: p.disc, finalPrice: p.final,
            answer: p.final, answerUnit: 'coins',
            fullQuestion:
                `A ${product.name} ${product.emoji} costs ${p.price} coins.\n` +
                `The shop is giving a ${p.pct}% discount.\n\n` +
                `👉 Use the number line below:\n` +
                `1. Drag the slider to ${p.price} (the full price)\n` +
                `2. Look at where ${p.pct}% falls on the percentage line above\n` +
                `3. Read off the matching value — that's the discount amount\n` +
                `4. Subtract it from ${p.price} to find the final price\n\n` +
                `❓ What is the final price after the ${p.pct}% discount?`,
            answerPromptText: `The ${product.name} costs ${p.price} coins and is ${p.pct}% off. What is the final price?`,
            hints: [
                `💡 Hint 1: Drag the slider to ${p.price} on the bottom line. Now the top line shows 0%–100% stretched to ${p.price}.`,
                `💡 Hint 2: Look at ${p.pct}% on the top line — it lines up with ${p.disc} on the bottom line. So ${p.pct}% of ${p.price} = ${p.disc} coins.`,
                `💡 Hint 3: Subtract the discount: ${p.price} − ${p.disc} = ${p.final} coins. That's your answer!`,
            ],
            solutionSteps: [
                { text: `Set the slider to <span class="step-highlight">${p.price}</span> on the value line. Now 100% = ${p.price} coins.` },
                { text: `Look at ${p.pct}% on the percentage line — it aligns with <span class="step-highlight">${p.disc}</span> on the value line.` },
                { text: `So the discount amount is <span class="step-formula">${p.pct}% of ${p.price} = ${p.disc} coins</span>` },
                { text: `Final price = <span class="step-formula">${p.price} − ${p.disc} = <span class="step-highlight">${p.final} coins</span></span>` },
            ],
        };
    }

    function genLevel2(product) {
        const p = pickPair();
        const remPct = 100 - p.pct;
        return {
            type: 'remaining', product,
            price: p.price, discountPct: p.pct, discountAmt: p.disc, finalPrice: p.final,
            answer: p.final, answerUnit: 'coins',
            fullQuestion:
                `A ${product.name} ${product.emoji} costs ${p.price} coins with a ${p.pct}% discount.\n` +
                `That means you only pay ${remPct}% of the price.\n\n` +
                `👉 Use the number line:\n` +
                `1. Set the slider to ${p.price}\n` +
                `2. Find where ${remPct}% falls on the percentage line\n` +
                `3. Read the matching value below — that's how much you pay!\n\n` +
                `❓ How much do you pay (${remPct}% of ${p.price})?`,
            answerPromptText: `The sale says you pay ${remPct}% of ${p.price} coins. How many coins do you pay?`,
            hints: [
                `💡 Hint 1: If ${p.pct}% is removed, you pay the remaining ${remPct}%.`,
                `💡 Hint 2: Set slider to ${p.price}. Look at ${remPct}% on the percentage line — it aligns with ${p.final} on the value line.`,
                `💡 Hint 3: ${remPct}% of ${p.price} = ${p.final} coins. That's your answer!`,
            ],
            solutionSteps: [
                { text: `Full price = <span class="step-highlight">${p.price} coins</span> = 100%.` },
                { text: `A ${p.pct}% discount means you pay the remaining ${remPct}%.` },
                { text: `On the number line: ${remPct}% aligns with <span class="step-highlight">${p.final}</span>.` },
                { text: `Answer: <span class="step-formula">You pay <span class="step-highlight">${p.final} coins</span></span>` },
            ],
        };
    }

    function genLevel3(product) {
        const p = pick(VALID_PAIRS.filter(x => x.price <= 50 && x.final <= 50));
        const remPct = 100 - p.pct;
        return {
            type: 'reverse', product,
            price: p.price, discountPct: p.pct, discountAmt: p.disc, finalPrice: p.final,
            answer: p.price, answerUnit: 'coins',
            fullQuestion:
                `After a ${p.pct}% discount, a ${product.name} ${product.emoji} now costs ${p.final} coins.\n\n` +
                `👉 Think about it:\n` +
                `• ${p.final} coins is what's left after removing ${p.pct}%\n` +
                `• So ${p.final} coins = ${remPct}% of the original price\n` +
                `• Slide the slider until ${remPct}% lines up with ${p.final}\n\n` +
                `❓ What was the ORIGINAL price before the discount?`,
            answerPromptText: `The discounted price is ${p.final} coins after a ${p.pct}% discount. What was the original price?`,
            hints: [
                `💡 Hint 1: ${p.final} coins = ${remPct}% of the original. Drag the slider until ${remPct}% on the top line aligns with ${p.final} below.`,
                `💡 Hint 2: Try sliding to different values. When you hit the right one, ${remPct}% will line up perfectly with ${p.final}.`,
                `💡 Hint 3: The slider should be at ${p.price}. Then ${remPct}% = ${p.final} coins, so original = ${p.price} coins.`,
            ],
            solutionSteps: [
                { text: `Sale price = <span class="step-highlight">${p.final} coins</span> = ${remPct}% of the original.` },
                { text: `Set slider to various values until ${remPct}% aligns with ${p.final}.` },
                { text: `When slider = ${p.price}: <span class="step-formula">${remPct}% of ${p.price} = ${p.final}</span> ✓` },
                { text: `Answer: The original price was <span class="step-highlight">${p.price} coins</span>.` },
            ],
        };
    }

    function genLevel4(product) {
        const p = pickPair();
        return {
            type: 'find_percent', product,
            price: p.price, discountPct: p.pct, discountAmt: p.disc, finalPrice: p.final,
            answer: p.pct, answerUnit: '%',
            fullQuestion:
                `A ${product.name} ${product.emoji} costs ${p.price} coins.\n` +
                `The shopkeeper takes off ${p.disc} coins as discount.\n\n` +
                `👉 Use the number line:\n` +
                `1. Set the slider to ${p.price}\n` +
                `2. Look at where ${p.disc} falls on the value line\n` +
                `3. Read the matching percentage above it\n\n` +
                `❓ What percentage discount is ${p.disc} coins off ${p.price} coins?`,
            answerPromptText: `A discount of ${p.disc} coins is taken from ${p.price} coins. What is the discount percentage?`,
            hints: [
                `💡 Hint 1: Set the slider to ${p.price}. The percentage line now covers 0% to 100% = ${p.price} coins.`,
                `💡 Hint 2: Find ${p.disc} on the value line. Look up to the percentage line above it — what % is it?`,
                `💡 Hint 3: ${p.disc} aligns with ${p.pct}% on the percentage line. Answer: ${p.pct}%`,
            ],
            solutionSteps: [
                { text: `Full price = <span class="step-highlight">${p.price} coins</span>. Set slider to ${p.price}.` },
                { text: `The discount is ${p.disc} coins. Find ${p.disc} on the value line.` },
                { text: `Looking up: ${p.disc} on the value line aligns with <span class="step-formula">${p.pct}%</span> on the percentage line.` },
                { text: `Answer: The discount is <span class="step-highlight">${p.pct}%</span>!` },
            ],
        };
    }

    function generateProblems(level) {
        const out = [];
        const used = new Set();
        for (let i = 0; i < PROBLEMS_PER_LEVEL; i++) {
            let prob, key, tries = 0;
            do {
                prob = generateProblem(level);
                key = prob.price + '-' + prob.discountPct + '-' + prob.type;
                tries++;
            } while (used.has(key) && tries < 50);
            used.add(key);
            out.push(prob);
        }
        return out;
    }

    /* ============================================================
       PROBLEM SETUP — Let students try first
       ============================================================ */
    function setupProblem() {
        const p = state.problems[state.problemIndex];
        state.problem = p;
        state.attempts = 0;
        state.hintsRevealed = 0;
        state.awaitingNext = false;
        if (questionCard) {
            questionCard.classList.remove('has-error');
        }

        currentProblemEl.textContent = state.problemIndex + 1;
        productEmoji.textContent = p.product.emoji;
        productName.textContent = p.product.name;

        // Set MRP Badge (always show original price)
        mrpText.textContent = 'MRP: ' + p.price + ' 🪙';

        // Product card - Discount badge
        if (p.type === 'reverse') {
            discountText.textContent = p.discountPct + '% OFF';
        } else if (p.type === 'find_percent') {
            discountText.textContent = '−' + p.discountAmt + ' coins';
        } else {
            discountText.textContent = p.discountPct + '% OFF';
        }

        // Set Card Question Text based on problem type
        let cardQText = p.answerPromptText; // fallback to answer prompt
        if (p.type === 'reverse') {
            cardQText = 'What is the original price?';
        } else if (p.type === 'find_percent') {
            cardQText = 'What is the discount percentage?';
        } else {
            cardQText = 'What is the final price?';
        }
        cardQuestionText.textContent = cardQText;

        // Show discounted price tag only for level 3
        if (discountedPriceTag) {
            if (state.level === 3) {
                if (discountedPriceText) discountedPriceText.textContent = 'Discounted price';
                discountedPriceTag.style.display = 'block';
            } else {
                discountedPriceTag.style.display = 'none';
            }
        }

        // Keep the on-screen question concise (for backwards compatibility)
        if (questionText && questionText.parentElement) {
            questionText.innerHTML = buildQuestionMarkup(p);
        }

        // Answer prompt
        answerPrompt.textContent = p.answerPromptText;

        // Calc labels
        if (p.type === 'reverse') {
            calcStepEls[0].el.querySelector('.calc-label').textContent = 'Discounted Price:';
            calcStepEls[1].el.querySelector('.calc-label').textContent = 'Discount:';
            calcStepEls[2].el.querySelector('.calc-label').textContent = 'Original:';
        } else if (p.type === 'find_percent') {
            calcStepEls[0].el.querySelector('.calc-label').textContent = 'Full Price:';
            calcStepEls[1].el.querySelector('.calc-label').textContent = 'Discount Amt:';
            calcStepEls[2].el.querySelector('.calc-label').textContent = 'Percentage:';
        } else {
            calcStepEls[0].el.querySelector('.calc-label').textContent = 'Full Price:';
            calcStepEls[1].el.querySelector('.calc-label').textContent = 'Discount:';
            calcStepEls[2].el.querySelector('.calc-label').textContent = 'Final Price:';
        }

        // Reset visuals
        calcStepEls.forEach(s => {
            s.el.classList.remove('revealed', 'highlight');
            s.val.textContent = '?';
        });

        setSlider(0, false);
        setMarkerPercent(100);
        setMarkerLeftPercent(0);
        clearDiscountHighlights();
        clearConnectors();
        valTrackArea.classList.remove('disabled');

        // Answer area visible (let them try!)
        answerArea.style.display = 'block';
        moveFeedbackToAnswerArea();
        answerInput.value = '';
        answerInput.classList.remove('correct', 'wrong');
        answerFeedbackEl.textContent = '';
        answerFeedbackEl.className = 'answer-feedback-inline';
        answerFeedbackEl.style.color = '';
        submitAnswerBtn.textContent = 'Check';

        // Reset hints
        hintsContent.innerHTML = '';
        showHintBtn.disabled = true;
        hintBtnLabel.textContent = 'Answer first to unlock hints';
        showHintBtn.querySelector('.hint-lock-icon').textContent = '🔒';
        showAnswerBtn.style.display = 'none';
        hintAttemptsText.textContent = 'Try answering first!';

        // Instruction
        if (typeof nlInstruction !== 'undefined' && nlInstruction) nlInstruction.textContent = '👆 Drag the slider on the bottom line to set the price. The percentage line above will stretch to match!';

    }

    /* ============================================================
       ANSWER CHECKING — Progressive hints
       ============================================================ */
    function checkAnswer() {
        if (state.awaitingNext) {
            nextProblem();
            return;
        }

        const p = state.problem;
        const val = parseInt(answerInput.value, 10);
        if (isNaN(val)) {
            answerInput.classList.add('wrong');
            setTimeout(() => answerInput.classList.remove('wrong'), 400);
            return;
        }

        state.attempts++;

        if (val === p.answer) {
            onCorrect(p);
        } else {
            onWrong(p);
        }
    }

    function onCorrect(p) {
        successSound.play();
        moveFeedbackToAnswerArea();
        answerInput.classList.remove('wrong');
        answerInput.classList.add('correct');
        if (questionCard) {
            questionCard.classList.remove('has-error');
        }

        const pts = state.attempts === 1 ? 100 : state.attempts === 2 ? 60 : 30;
        state.score += pts;
        state.streak++;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        state.correctCount++;
        refreshScore();
        solutionDisplay.style.display = 'none';

        // Reset layout
        const shopScene = document.getElementById('shop-scene');
        shopScene.classList.remove('wrong-answer');
        document.getElementById('product-area').style.display = '';
        document.getElementById('info-panel').style.display = '';
        const qCard = document.querySelector('.question-card');
        if (qCard) qCard.style.display = '';

        // Show full visualization
        revealFullVisualization(p);
        revealAllCalcSteps(p);

        const card = $('#product-card');
        card.classList.add('celebrate');
        setTimeout(() => card.classList.remove('celebrate'), 1500);

        // Snap slider
        sliderEl.classList.add('snapped');
        setTimeout(() => sliderEl.classList.remove('snapped'), 1200);

        launchConfetti();

        answerFeedbackEl.textContent = '✅ Correct! +' + pts + ' points';
        state.awaitingNext = true;
        submitAnswerBtn.textContent = 'Next Question';
        answerFeedbackEl.className = 'answer-feedback-inline';
        answerFeedbackEl.textContent = 'Correct! Tap Next Question to continue.';
        answerFeedbackEl.style.color = '#4ade80';
    }

    function onWrong(p) {
        errorSound.play();
        moveFeedbackToAnswerArea();
        answerInput.classList.remove('correct');
        answerInput.classList.add('wrong');
        if (questionCard) {
            questionCard.classList.remove('has-error');
        }
        state.streak = 0;
        refreshScore();

        answerFeedbackEl.textContent = `❌ Not quite. Try again! (Attempt ${state.attempts})`;
        answerFeedbackEl.className = 'answer-feedback-inline wrong-msg';
        answerFeedbackEl.textContent = `Not quite. Try again. Attempt ${state.attempts}.`;
        answerFeedbackEl.style.color = '';

        // Show visual guidance on number lines
        showWrongAnswerGuidance(p);

        // Unlock hints progressively
        updateHintAccess(p);

        if (state.attempts >= 4) {
            showAnswerBtn.style.display = 'flex';
        }
    }

    function updateHintAccess(p) {
        if (state.attempts >= 1) {
            showHintBtn.disabled = false;
            showHintBtn.querySelector('.hint-lock-icon').textContent = '💡';

            if (state.hintsRevealed < p.hints.length) {
                hintBtnLabel.textContent = `Show Hint ${state.hintsRevealed + 1} of ${p.hints.length}`;
            } else {
                hintBtnLabel.textContent = 'All hints shown';
                showHintBtn.disabled = true;
            }
            hintAttemptsText.textContent = `Attempt ${state.attempts}`;
        }
    }

    function revealNextHint() {
        const p = state.problem;
        if (!p || state.hintsRevealed >= p.hints.length) return;

        const idx = state.hintsRevealed;
        const item = document.createElement('div');
        item.className = 'hint-reveal-item';
        item.innerHTML = `<span class="hint-number">Hint ${idx + 1}:</span> ${p.hints[idx]}`;
        hintsContent.appendChild(item);

        state.hintsRevealed++;

        // Progressive visualization on number line
        showHintVisualization(p, state.hintsRevealed);

        if (state.hintsRevealed < p.hints.length) {
            hintBtnLabel.textContent = `Show Hint ${state.hintsRevealed + 1} of ${p.hints.length}`;
        } else {
            hintBtnLabel.textContent = 'All hints shown';
            showHintBtn.disabled = true;
        }

    }

    function showHintVisualization(p, level) {
        if (level >= 1) {
            // Hint 1: slide to the price
            setSlider(p.price, true);
            calcStepEls[0].el.classList.add('revealed');
            calcStepEls[0].val.textContent = p.price + ' coins = 100%';
        }
        if (level >= 2) {
            // Hint 2: show discount region
            showDiscountOnLines(p.price, p.discountPct);
            addConnector(p.type === 'find_percent' ? p.discountAmt : p.finalPrice, 'connector-final');
            addConnector(p.price, '');
            calcStepEls[1].el.classList.add('revealed');
            if (p.type === 'find_percent') {
                calcStepEls[1].val.textContent = p.discountAmt + ' coins = ?%';
            } else {
                calcStepEls[1].val.textContent = p.discountPct + '% = ' + p.discountAmt + ' coins';
            }
        }
        if (level >= 3) {
            // Hint 3: full answer
            calcStepEls[2].el.classList.add('revealed');
            if (p.type === 'find_percent') {
                calcStepEls[2].val.textContent = p.discountPct + '%';
            } else if (p.type === 'reverse') {
                calcStepEls[2].val.textContent = p.price + ' coins';
            } else {
                calcStepEls[2].val.textContent = p.finalPrice + ' coins';
            }
        }
    }

    function buildQuestionMarkup(p) {
        const priceLabel = p.type === 'reverse' ? 'Discounted Price' : 'Price';
        const priceValue = p.type === 'reverse' ? p.finalPrice : p.price;
        const discountLabel = p.type === 'find_percent' ? 'Discount' : 'Sale';
        const discountValue = p.type === 'find_percent'
            ? `${p.discountAmt} coins OFF`
            : `${p.discountPct}% OFF`;

        const actionText = p.answerPromptText;

        return `
            <span class="question-line">
                <span class="question-prefix">${p.product.emoji} ${priceLabel}:</span>
                <span class="question-value question-value-coins">${priceValue} coins</span>
            </span>
            <span class="question-line">
                <span class="question-prefix">🔥 Discount:</span>
                <span class="question-value question-value-discount">${discountValue}</span>
            </span>
            <span class="question-line question-line-action">
                <span class="question-prefix">👉</span>
                <span class="question-action">${actionText}</span>
            </span>
        `;
    }

    function buildQuestionMarkup(p) {
        const priceLabel = p.type === 'reverse' ? 'Discounted Price' : 'Price';
        const priceValue = p.type === 'reverse' ? p.finalPrice : p.price;
        const discountLabel = p.type === 'find_percent' ? 'Discount' : 'Sale';
        const discountValue = p.type === 'find_percent'
            ? `${p.discountAmt} coins OFF`
            : `${p.discountPct}% OFF`;

        const actionText = p.answerPromptText;

        return `
            <span class="question-line">
                <span class="question-prefix">${p.product.emoji} ${p.product.name}</span>
            </span>
            <span class="question-line">
                <span class="question-prefix">${priceLabel}:</span>
                <span class="question-value question-value-coins">${priceValue} coins</span>
            </span>
            <span class="question-line">
                <span class="question-prefix">${discountLabel}:</span>
                <span class="question-value question-value-discount">${discountValue}</span>
            </span>
            <span class="question-line question-line-action">
                <span class="question-prefix">Goal:</span>
                <span class="question-action">${actionText}</span>
            </span>
        `;
    }

    function revealAllCalcSteps(p) {
        calcStepEls.forEach(s => s.el.classList.add('revealed'));
        if (p.type === 'find_percent') {
            calcStepEls[0].val.textContent = p.price + ' coins';
            calcStepEls[1].val.textContent = p.discountAmt + ' coins';
            calcStepEls[2].val.textContent = p.discountPct + '%';
        } else if (p.type === 'reverse') {
            calcStepEls[0].val.textContent = p.finalPrice + ' coins';
            calcStepEls[1].val.textContent = p.discountPct + '% = ' + p.discountAmt + ' coins';
            calcStepEls[2].val.textContent = p.price + ' coins';
        } else {
            calcStepEls[0].val.textContent = p.price + ' coins';
            calcStepEls[1].val.textContent = p.discountPct + '% = ' + p.discountAmt + ' coins';
            calcStepEls[2].val.textContent = p.finalPrice + ' coins';
        }
    }

    function revealFullVisualization(p) {
        setSlider(p.price, true);
        showDiscountOnLines(p.price, p.discountPct);
        clearConnectors();
        addConnector(p.price, '');
        addConnector(p.type === 'find_percent' ? p.discountAmt : p.finalPrice, 'connector-final');
    }

    function showWrongAnswerGuidance(p) {
        // Clear any existing highlights
        clearDiscountHighlights();
        clearConnectors();

        // Step 1: Animate slider to full price after a delay
        setTimeout(() => {
            setSlider(p.price, true);
            setTimeout(() => {
                // Step 2: Show discount visualization
                showDiscountOnLines(p.price, p.discountPct);
                addConnector(p.price, '');

                setTimeout(() => {
                    // Step 3: Show final price connection
                    addConnector(p.type === 'find_percent' ? p.discountAmt : p.finalPrice, 'connector-final');

                    // Update calculation breakdown with visual cues
                    setTimeout(() => {
                        calcStepEls[0].el.classList.add('revealed');
                        calcStepEls[0].val.textContent = p.price + ' coins = 100%';

                        setTimeout(() => {
                            calcStepEls[1].el.classList.add('revealed');
                            if (p.type === 'find_percent') {
                                calcStepEls[1].val.textContent = p.discountAmt + ' coins = ?%';
                            } else {
                                calcStepEls[1].val.textContent = p.discountPct + '% = ' + p.discountAmt + ' coins';
                            }

                            setTimeout(() => {
                                calcStepEls[2].el.classList.add('revealed');
                                if (p.type === 'find_percent') {
                                    calcStepEls[2].val.textContent = p.discountPct + '%';
                                } else if (p.type === 'reverse') {
                                    calcStepEls[2].val.textContent = p.price + ' coins';
                                } else {
                                    calcStepEls[2].val.textContent = p.finalPrice + ' coins';
                                }
                            }, 1500);
                        }, 1500);
                    }, 1000);
                }, 2000);
            }, 2000);
        }, 1000);
    }

    /* ============================================================
       STEP-BY-STEP SOLUTION OVERLAY
       ============================================================ */
    function showStepBySolution() {
        const p = state.problem;
        if (!p) return;

        solutionSteps.innerHTML = '';
        p.solutionSteps.forEach((step, i) => {
            const item = document.createElement('div');
            item.className = 'solution-step-item';
            item.innerHTML = `
                <div class="step-num">${i + 1}</div>
                <div class="step-body">${step.text}</div>
            `;
            solutionSteps.appendChild(item);
            setTimeout(() => item.classList.add('visible'), 300 * (i + 1));
        });

        revealFullVisualization(p);
        revealAllCalcSteps(p);
        solutionOverlay.classList.add('active');
    }

    function hideSolution() {
        solutionOverlay.classList.remove('active');
        const p = state.problem;
        if (p) {
            answerInput.value = p.answer;
            state.attempts = 4;
            state.streak = 0;
            refreshScore();
            setTimeout(() => showFeedback(false, p, 0), 400);
        }
    }

    function showInlineSolution(p) {
        solutionDisplay.innerHTML = '<h3>📖 Step-by-Step Solution</h3>';
        p.solutionSteps.forEach((step, i) => {
            const item = document.createElement('div');
            item.className = 'solution-step-item';
            item.innerHTML = `
                <div class="step-num">${i + 1}</div>
                <div class="step-body">${step.text}</div>
            `;
            solutionDisplay.appendChild(item);
            setTimeout(() => item.classList.add('visible'), 300 * (i + 1));
        });
        solutionDisplay.style.display = 'block';
        revealFullVisualization(p);
        revealAllCalcSteps(p);
    }

    /* ============================================================
       FEEDBACK
       ============================================================ */
    function showFeedback(correct, p, pts) {
        feedbackOverlay.classList.add('active');
        feedbackCard.className = 'feedback-card ' + (correct ? 'correct' : 'wrong');
        const nextLabel = state.problemIndex < PROBLEMS_PER_LEVEL - 1 ? 'Next Problem' : 'See Results';

        if (correct) {
            feedbackIcon.textContent = pick(['🎉', '🌟', '🏆', '💯', '🎊']);
            feedbackTitle.textContent = pick(SUCCESS_MESSAGES);
            feedbackMessage.textContent = '+' + pts + ' points!  Streak: ' + state.streak + ' 🔥';
            feedbackDetail.innerHTML = '';
            feedbackMessage.textContent = '+' + pts + ' points! Tap "' + nextLabel + '" to continue.';
        } else {
            feedbackIcon.textContent = '📘';
            feedbackTitle.textContent = "Let's Review!";
            feedbackMessage.textContent = "Here's how it works:";
            feedbackDetail.innerHTML = buildBreakdownHTML(p);
        }
        feedbackNextBtn.textContent = state.problemIndex < PROBLEMS_PER_LEVEL - 1
            ? 'Next Problem →' : 'See Results 🏆';
    }

    function moveFeedbackToQuestionCard() {
        if (answerFeedbackEl.parentElement !== questionCard) {
            questionCard.appendChild(answerFeedbackEl);
        }
    }

    function moveFeedbackToAnswerArea() {
        if (answerFeedbackEl.parentElement !== answerArea) {
            answerArea.appendChild(answerFeedbackEl);
        }
    }

    function buildBreakdownHTML(p) {
        if (p.type === 'reverse') {
            const remPct = 100 - p.discountPct;
            return `
                <div class="fd-step"><span class="fd-label">Sale price:</span><span class="fd-value">${p.finalPrice} coins = ${remPct}%</span></div>
                <div class="fd-step"><span class="fd-label">Original (100%):</span><span class="fd-value fd-highlight">${p.price} coins</span></div>`;
        }
        if (p.type === 'find_percent') {
            return `
                <div class="fd-step"><span class="fd-label">Price:</span><span class="fd-value">${p.price} coins</span></div>
                <div class="fd-step"><span class="fd-label">Discount:</span><span class="fd-value fd-discount">${p.discountAmt} coins</span></div>
                <div class="fd-step"><span class="fd-label">Percentage:</span><span class="fd-value fd-highlight">${p.discountAmt} ÷ ${p.price} × 100 = ${p.discountPct}%</span></div>`;
        }
        return `
            <div class="fd-step"><span class="fd-label">Full price:</span><span class="fd-value">${p.price} coins</span></div>
            <div class="fd-step"><span class="fd-label">Discount:</span><span class="fd-value fd-discount">${p.discountPct}% of ${p.price} = ${p.discountAmt} coins</span></div>
            <div class="fd-step"><span class="fd-label">Final price:</span><span class="fd-value fd-highlight">${p.price} − ${p.discountAmt} = ${p.finalPrice} coins</span></div>`;
    }

    function hideFeedback() { feedbackOverlay.classList.remove('active'); }

    function refreshScore() {
        scoreEl.textContent = state.score;
        streakEl.textContent = state.streak;
        scoreEl.style.animation = 'none'; scoreEl.offsetHeight;
        scoreEl.style.animation = 'popIn .3s ease-out';
    }

    /* ---------- confetti ---------- */
    function launchConfetti() {
        const cols = ['#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#ec4899'];
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'confetti-piece';
            p.style.left = randInt(15, 85) + 'vw';
            p.style.top = '-20px';
            p.style.background = pick(cols);
            p.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
            p.style.width = randInt(6, 12) + 'px';
            p.style.height = randInt(6, 12) + 'px';
            document.body.appendChild(p);
            const dist = randInt(200, 600);
            const dur = randInt(800, 1500);
            p.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${dist}px) translateX(${randInt(-40, 40)}px) rotate(${randInt(180, 720)}deg)`, opacity: 0 },
            ], { duration: dur, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => p.remove(), dur + 100);
        }
    }

    /* ============================================================
       GAME FLOW
       ============================================================ */
    function showScreen(s) {
        [splashScreen, gameScreen, resultsScreen].forEach(x => x.classList.remove('active'));
        s.classList.add('active');
    }

    function startGame(level) {
        state.level = level;
        state.problemIndex = 0;
        state.score = 0;
        state.streak = 0;
        state.bestStreak = 0;
        state.correctCount = 0;

        currentLevelEl.textContent = level;
        totalProblemsEl.textContent = PROBLEMS_PER_LEVEL;
        refreshScore();

        state.problems = generateProblems(level);
        setupProblem();
        showScreen(gameScreen);
    }

    function nextProblem() {
        hideFeedback();
        solutionDisplay.style.display = 'none';
        // Reset layout
        const shopScene = document.getElementById('shop-scene');
        shopScene.classList.remove('wrong-answer');
        document.getElementById('product-area').style.display = '';
        document.getElementById('info-panel').style.display = '';
        document.querySelector('.question-card').style.display = '';
        state.problemIndex++;
        if (state.problemIndex >= PROBLEMS_PER_LEVEL) { showResults(); return; }
        setupProblem();
    }

    function showResults() {
        showScreen(resultsScreen);
        resultCorrect.textContent = state.correctCount + '/' + PROBLEMS_PER_LEVEL;
        resultScore.textContent = state.score;
        resultStreak.textContent = state.bestStreak;

        const ratio = state.correctCount / PROBLEMS_PER_LEVEL;
        resultsStars.textContent = ratio >= .8 ? '⭐⭐⭐' : ratio >= .6 ? '⭐⭐' : ratio >= .3 ? '⭐' : '💪 Keep trying!';
        resultsTitle.textContent = ratio >= .8 ? 'Amazing Work! 🏆' : ratio >= .5 ? 'Good Job! 🌟' : 'Keep Practicing! 💪';

        if (ratio >= .6 && state.level < 4) {
            const nl = state.level + 1;
            if (!state.unlockedLevels.includes(nl)) state.unlockedLevels.push(nl);
            nextLevelBtn.style.display = '';
        } else {
            nextLevelBtn.style.display = 'none';
        }
        // Ensure levels 3 and 4 are always unlocked
        if (!state.unlockedLevels.includes(3)) state.unlockedLevels.push(3);
        if (!state.unlockedLevels.includes(4)) state.unlockedLevels.push(4);
        updateLevelBtns();
        if (ratio >= .6) setTimeout(launchConfetti, 300);
    }

    function updateLevelBtns() {
        levelBtns.forEach(b => {
            const l = parseInt(b.dataset.level);
            b.classList.toggle('locked', !state.unlockedLevels.includes(l));
        });
    }

    /* ============================================================
       EVENT LISTENERS
       ============================================================ */
    startBtn.addEventListener('click', () => {
        clickSound.play();
        const active = document.querySelector('.btn-level.active');
        startGame(parseInt(active.dataset.level));
    });

    levelBtns.forEach(b => b.addEventListener('click', () => {
        if (b.classList.contains('locked')) return;
        clickSound.play();
        levelBtns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
    }));

    homeBtn.addEventListener('click', () => {
        clickSound.play();
        updateLevelBtns();
        showScreen(splashScreen);
    });

    submitAnswerBtn.addEventListener('click', () => {
        checkAnswer();
    });
    answerInput.addEventListener('keydown', e => { if (e.key === 'Enter') { checkAnswer(); } });

    showHintBtn.addEventListener('click', () => {
        clickSound.play();
        revealNextHint();
    });
    showAnswerBtn.addEventListener('click', () => {
        clickSound.play();
        showStepBySolution();
    });
    solutionGotItBtn.addEventListener('click', () => {
        clickSound.play();
        hideSolution();
    });

    feedbackNextBtn.addEventListener('click', () => {
        clickSound.play();
        nextProblem();
    });
    replayBtn.addEventListener('click', () => {
        clickSound.play();
        startGame(state.level);
    });
    nextLevelBtn.addEventListener('click', () => {
        clickSound.play();
        if (state.level < 4) startGame(state.level + 1);
    });
    menuBtn.addEventListener('click', () => {
        clickSound.play();
        updateLevelBtns();
        showScreen(splashScreen);
    });

    // Keyboard arrows for slider
    document.addEventListener('keydown', e => {
        if (!gameScreen.classList.contains('active')) return;
        if (valTrackArea.classList.contains('disabled')) return;
        if (e.key === 'ArrowRight') setSlider(state.sliderValue + 1, false);
        if (e.key === 'ArrowLeft') setSlider(state.sliderValue - 1, false);
    });

    // Pupil tracking
    document.addEventListener('mousemove', e => {
        document.querySelectorAll('.pupil').forEach(pupil => {
            const eye = pupil.parentElement;
            const r = eye.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const a = Math.atan2(dy, dx);
            const d = Math.min(4, Math.hypot(dx, dy) / 30);
            pupil.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`;
        });
    });

    function initKeypad() {
        const keypadOverlay = document.getElementById('keypad-overlay');
        const answerInput = document.getElementById('answer-input');
        const keypadBtns = document.querySelectorAll('.keypad-btn');
        const doneBtn = document.getElementById('keypad-done-btn');

        if (!keypadOverlay || !answerInput) return;

        // Open keypad on input click or focus
        const openKeypad = (e) => {
            e.stopPropagation();
            keypadOverlay.classList.add('active');
        };

        answerInput.addEventListener('click', openKeypad);
        answerInput.addEventListener('focus', openKeypad);

        // Close on Done button
        doneBtn.addEventListener('click', () => {
            keypadOverlay.classList.remove('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!keypadOverlay.contains(e.target) && e.target !== answerInput) {
                keypadOverlay.classList.remove('active');
            }
        });

        // Handle button clicks
        keypadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                let currentVal = answerInput.value;

                if (val === 'clear') {
                    answerInput.value = '';
                } else if (val === 'backspace') {
                    answerInput.value = currentVal.slice(0, -1);
                } else {
                    // Prevent leading zero if value is already empty
                    if (currentVal === '' && val === '0') return;

                    // Append value
                    const newVal = currentVal + val;

                    // Only update if within range
                    if (parseInt(newVal) <= 500 || newVal === '') {
                        answerInput.value = newVal;
                    }
                }

                // Trigger input event for any other logic listening
                answerInput.dispatchEvent(new Event('input'));
            });
        });
    }

    /* ---------- INIT ---------- */
    buildPctTicks();
    buildValTicks();
    initDrag();
    updateLevelBtns();
    initKeypad();

})();
