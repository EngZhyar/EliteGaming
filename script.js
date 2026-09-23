/* =========================================================
   EliteGaming — PS2 Game Collection Logic
   Central Kurdish labels, English digits
   ========================================================= */

const introScreen = document.getElementById('introScreen');
const introLeft   = document.getElementById('introLeft');
const introRight  = document.getElementById('introRight');
const introImage  = document.getElementById('introImage');
const mainApp     = document.getElementById('mainApp');

const gamesContainer = document.getElementById('gamesContainer');
const searchInput    = document.getElementById('searchInput');
const filterTabs     = document.querySelectorAll('.filter-tab');
const sortSelect     = document.getElementById('sortSelect');

const storageLabel  = document.getElementById('storage');
const barPercent    = document.getElementById('barPercent');
const progressBar   = document.getElementById('progressBar');
const dashBar       = document.getElementById('dashBar');

const driveBtn      = document.getElementById('driveBtn');
const requestBtn    = document.getElementById('sendGamesBtn');
const clearBtn      = document.getElementById('clearSelection');

const pricesModal   = document.getElementById('pricesModal');
const requestModal  = document.getElementById('requestModal');
const requestOptions = document.querySelectorAll('.request-option');
const closeBtns     = document.querySelectorAll('[data-close]');

const toast = document.getElementById('toast');

/* ---------------- STATE ---------------- */
let selectedGames = [];
let currentFilter = 'all';
let currentSort   = 'default';
let searchTerm    = '';

/* ---------------------------------------------
   STORAGE THRESHOLDS
   --------------------------------------------- */
const FLASH_THRESHOLD     = 54;
const HARD_320_THRESHOLD  = 297.5;
const HARD_500_THRESHOLD  = 464;
const MAX_THRESHOLD       = 464;

/* ---------------- INTRO ---------------- */
window.addEventListener('load', () => {
    const imgSrc = introImage.getAttribute('src');
    introLeft.style.backgroundImage  = `url('${imgSrc}')`;
    introRight.style.backgroundImage = `url('${imgSrc}')`;

    setTimeout(() => {
        introScreen.classList.add('split');

        setTimeout(() => {
            introScreen.style.opacity = '0';
            setTimeout(() => {
                introScreen.classList.add('hidden');
                mainApp.classList.remove('hidden');
                renderGames();
                updateSummary();
                adjustGamesTop();
            }, 400);
        }, 1400);
    }, 1600);
});

/* ---------------- ADJUST GAMES TOP UNDER FIXED HEADER ---------------- */
function adjustGamesTop() {
    const stickyTop = document.querySelector('.sticky-top');
    const gamesSection = document.querySelector('.games-container');
    if (stickyTop && gamesSection) {
        gamesSection.style.marginTop = (stickyTop.offsetHeight + 16) + 'px';
    }
}
window.addEventListener('resize', adjustGamesTop);

/* ---------------- HELPERS ---------------- */
function getGameName(path) {
    let name = path.split('/').pop();
    name = name.substring(0, name.lastIndexOf('.'));
    name = name.replace(/[_-]/g, ' ');
    return name.replace(/\b\w/g, l => l.toUpperCase());
}

function getTotalSize() {
    let total = 0;
    selectedGames.forEach(img => {
        const g = games.find(x => x.image === img);
        if (g) total += Number(g.size);
    });
    return total;
}

function showToast(text, type = 'success') {
    toast.textContent = text;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    toast.style.background = type === 'error'
        ? 'linear-gradient(135deg, #ff2d55, #cc0033)'
        : 'linear-gradient(135deg, #00b4ff, #6b3fff)';
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, 2200);
}

/* ---------------------------------------------
   GET CURRENT DRIVE INFO
   --------------------------------------------- */
function getCurrentDriveInfo() {
    const total = getTotalSize();

    if (total <= FLASH_THRESHOLD) {
        return {
            label: 'Flash 64GB',
            limit: FLASH_THRESHOLD,
            color: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
            price: 0,
            capacity: 64
        };
    } else if (total <= HARD_320_THRESHOLD) {
        return {
            label: 'Hard 320GB',
            limit: HARD_320_THRESHOLD,
            color: 'linear-gradient(90deg, #FFA500, #FF8C00)',
            price: 40000,
            capacity: 320
        };
    } else if (total <= HARD_500_THRESHOLD) {
        return {
            label: 'Hard 500GB',
            limit: HARD_500_THRESHOLD,
            color: 'linear-gradient(90deg, #ff6b6b, #ff4444)',
            price: 50000,
            capacity: 500
        };
    } else {
        return {
            label: 'پڕە',
            limit: HARD_500_THRESHOLD,
            color: 'linear-gradient(90deg, #ff0000, #cc0000)',
            price: 50000,
            capacity: 500
        };
    }
}

/* ---------------- FILTER + SORT ---------------- */
function getFilteredSortedGames() {
    let list = [...games];

    if (currentFilter === 'selected') {
        list = list.filter(g => selectedGames.includes(g.image));
    }

    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        list = list.filter(g => getGameName(g.image).toLowerCase().includes(term));
    }

    if (currentSort === 'name-asc') {
        list.sort((a, b) => getGameName(a.image).localeCompare(getGameName(b.image)));
    } else if (currentSort === 'name-desc') {
        list.sort((a, b) => getGameName(b.image).localeCompare(getGameName(a.image)));
    } else if (currentSort === 'size-asc') {
        list.sort((a, b) => a.size - b.size);
    } else if (currentSort === 'size-desc') {
        list.sort((a, b) => b.size - a.size);
    }

    return list;
}

/* ---------------- RENDER GAMES ---------------- */
function renderGames() {
    gamesContainer.innerHTML = '';
    const list = getFilteredSortedGames();
    const totalSelected = getTotalSize();

    if (list.length === 0) {
        gamesContainer.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#7a9cc4;font-family:'Noto Kufi Arabic',sans-serif;font-size:14px;">
                هیچ یاریەک نەدۆزرایەوە
            </div>`;
        return;
    }

    list.forEach(game => {
        const isSelected = selectedGames.includes(game.image);
        const potentialTotal = totalSelected + game.size;

        const canSelect = isSelected || (potentialTotal <= MAX_THRESHOLD);
        const isDisabled = !canSelect;

        const card = document.createElement('div');
        card.className = 'game-card';
        if (isSelected) card.classList.add('selected');
        if (isDisabled) card.classList.add('disabled');

        card.innerHTML = `
            ${isDisabled ? '<div class="full-tag">پڕە</div>' : ''}
            <div class="game-img-wrap">
                <img src="${game.image}" loading="lazy" alt="${getGameName(game.image)}">
            </div>
            <div class="game-info">
                <div class="game-name" title="${getGameName(game.image)}">${getGameName(game.image)}</div>
                <div class="game-size">${Number(game.size).toFixed(2)}GB</div>
            </div>
        `;

        card.addEventListener('click', () => {
            if (isDisabled) {
                showToast('بۆشایی تەواو بووە', 'error');
                return;
            }
            toggleGame(game.image);
        });

        gamesContainer.appendChild(card);
    });
}

/* ---------------- TOGGLE GAME ---------------- */
function toggleGame(image) {
    const game = games.find(g => g.image === image);
    if (!game) return;

    if (selectedGames.includes(image)) {
        selectedGames = selectedGames.filter(i => i !== image);
    } else {
        const total = getTotalSize();
        if (total + game.size > MAX_THRESHOLD) {
            showToast('بۆشایی هارد دیسکی 500GB پڕە', 'error');
            return;
        }
        selectedGames.push(image);
    }

    updateSummary();
    renderGames();
}

/* ---------------- UPDATE SUMMARY ---------------- */
function updateSummary() {
    const total = getTotalSize();
    const drive = getCurrentDriveInfo();

    storageLabel.textContent = drive.label;

    let pct = drive.limit > 0 ? (total / drive.limit) * 100 : 0;
    if (pct > 100) pct = 100;
    if (pct < 0) pct = 0;

    progressBar.style.width = pct + '%';
    progressBar.style.background = drive.color;

    barPercent.textContent = pct.toFixed(1) + '% USED';

    dashBar.classList.remove('warn', 'danger');
    if (pct >= 95) dashBar.classList.add('danger');
    else if (pct >= 75) dashBar.classList.add('warn');

    requestBtn.disabled = selectedGames.length === 0;
}

/* ---------------- PRICES MODAL ---------------- */
driveBtn.addEventListener('click', () => {
    pricesModal.classList.remove('hidden');
});

/* ---------------- REQUEST MODAL ---------------- */
requestBtn.addEventListener('click', () => {
    if (selectedGames.length === 0) {
        showToast('تکایە یاریەکان دیاری بکە', 'error');
        return;
    }
    requestModal.classList.remove('hidden');
});

/* ---------------------------------------------
   BUILD REQUEST MESSAGE (OLD FORMAT)
   ---------------------------------------------
   Format:
       Game1
       Game2
       Game3

       ئەو یاریانەم دەوێ بە کۆدی {size}.{count}
   --------------------------------------------- */
function buildRequestMessage() {
    const names = selectedGames.map(img => {
        const g = games.find(x => x.image === img);
        return g ? getGameName(g.image) : '';
    }).filter(Boolean);

    const total = getTotalSize();
    const count = selectedGames.length;

    let message = names.join('\n');
    message += `\n\nئەو یاریانەم دەوێ بە کۆدی ${total.toFixed(2)}.${count}`;

    return message;
}

requestOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        const action = opt.dataset.action;
        const message = buildRequestMessage();

        if (action === 'copy') {
            navigator.clipboard.writeText(message).then(() => {
                showToast('داواکاری کۆپی کرا!');
                requestModal.classList.add('hidden');
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = message;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showToast('داواکاری کۆپی کرا!');
                requestModal.classList.add('hidden');
            });
        } else if (action === 'wa1' || action === 'wa2') {
            const phone = action === 'wa1' ? '9647501238780' : '9647518979796';
            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
            requestModal.classList.add('hidden');
        }
    });
});

/* ---------------- CLEAR ---------------- */
clearBtn.addEventListener('click', () => {
    if (selectedGames.length === 0) return;
    if (!confirm('هەموو یاریە دیاریکراوەکان بسڕدرێنەوە؟')) return;
    selectedGames = [];
    updateSummary();
    renderGames();
    showToast('هەڵبژاردن سڕدرایەوە');
});

/* ---------------- SEARCH / FILTER / SORT ---------------- */
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderGames();
});

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderGames();
    });
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderGames();
});

/* ---------------- MODAL CLOSE ---------------- */
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal-overlay').classList.add('hidden');
    });
});

[pricesModal, requestModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        pricesModal.classList.add('hidden');
        requestModal.classList.add('hidden');
    }
});

/* ---------------- INIT ---------------- */
updateSummary();