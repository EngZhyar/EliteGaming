const gamesContainer = document.getElementById("gamesContainer");

const selectedCount = document.getElementById("selectedCount");
const totalSize = document.getElementById("totalSize");
const storage = document.getElementById("storage");

const clearButton = document.getElementById("clearSelection");
const sendGamesBtn = document.getElementById("sendGamesBtn");

let selectedGames = [];
let showOnlySelected = false;
const WARNING_THRESHOLD = 464;

// Storage thresholds
const FLASH_THRESHOLD = 58;
const HARD_320_THRESHOLD = 297.5;
const HARD_500_THRESHOLD = 464;

function getGameName(path) {
    let name = path.split("/").pop();
    name = name.substring(0, name.lastIndexOf("."));
    name = name.replace(/[_-]/g, " ");
    return name.replace(/\b\w/g, function(letter) {
        return letter.toUpperCase();
    });
}

function getTotalSelectedSize() {
    let total = 0;
    selectedGames.forEach(function(image) {
        const game = games.find(function(g) {
            return g.image === image;
        });
        if (game) {
            total += Number(game.size);
        }
    });
    return total;
}

function renderGames() {
    gamesContainer.innerHTML = "";
    const totalSelectedSize = getTotalSelectedSize();

    let gamesToShow = games;
    if (showOnlySelected) {
        gamesToShow = games.filter(function(game) {
            return selectedGames.includes(game.image);
        });
    }

    gamesToShow.forEach(function(game) {
        const card = document.createElement("div");
        card.className = "game";

        const isSelected = selectedGames.includes(game.image);
        if (isSelected) card.classList.add("selected");

        // Check if adding this game would exceed the threshold
        const potentialTotal = totalSelectedSize + game.size;
        const canSelect = (potentialTotal <= WARNING_THRESHOLD) || isSelected;
        const isDisabled = !canSelect && !isSelected;

        const checked = isSelected ? "checked" : "";

        card.innerHTML = `
            <img src="${game.image}" loading="lazy">
            <div class="gameInfo">
                <div class="gameSize">
                    ${game.size.toFixed(2)} GB
                </div>
                <input
                    type="checkbox"
                    ${checked}
                    ${isDisabled ? 'disabled' : ''}
                >
                ${isDisabled ? '<div class="storage-full-tag">پڕە</div>' : ''}
            </div>
        `;

        const checkbox = card.querySelector("input");

        checkbox.addEventListener("click", function(e) {
            e.stopPropagation();
            if (!this.disabled) {
                toggleGame(game.image);
            }
        });

        card.addEventListener("click", function() {
            if (!isDisabled) {
                toggleGame(game.image);
            }
        });

        gamesContainer.appendChild(card);
    });

    if (showOnlySelected && selectedGames.length === 0) {
        gamesContainer.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:50px;font-size:18px;color:#9ca3af;">
                هیچ یاریەک دیاری نەکراوە. تکایە یاریەکان دابنێ بۆ کۆکردنەوە.
            </div>
        `;
    }
}

function toggleGame(image) {
    const totalSelectedSize = getTotalSelectedSize();
    const game = games.find(function(g) {
        return g.image === image;
    });

    if (!game) return;

    if (selectedGames.includes(image)) {
        selectedGames = selectedGames.filter(function(item) {
            return item !== image;
        });
    } else {
        const potentialTotal = totalSelectedSize + game.size;
        if (potentialTotal <= WARNING_THRESHOLD) {
            selectedGames.push(image);
        } else {
            alert(`ناتوانیت ئەم یاریە زیاد بکەیت! بۆشایی پڕە`);
            return;
        }
    }

    updateSummary();
    renderGames();
}

function updateSummary() {
    if (selectedCount) {
        selectedCount.innerText = selectedGames.length;
    }

    const total = getTotalSelectedSize();

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        let percentage = (total / WARNING_THRESHOLD) * 100;
        
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        progressBar.style.width = percentage + '%';
    }

    // Update storage text based on total size
    let storageText = "";
    if (total <= FLASH_THRESHOLD) {
        storageText = "Flash 64GB";
        progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
    } else if (total <= HARD_320_THRESHOLD) {
        storageText = "Hard 320GB";
        progressBar.style.background = 'linear-gradient(90deg, #FFA500, #FF8C00)';
    } else if (total <= HARD_500_THRESHOLD) {
        storageText = "Hard 500GB";
        progressBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4444)';
    } else {
        storageText = "شوێن نەماوە";
        progressBar.style.background = 'linear-gradient(90deg, #ff0000, #cc0000)';
    }
    
    storage.innerText = storageText;
}

clearButton.addEventListener("click", function() {
    selectedGames = [];

    if (showOnlySelected) {
        renderGames();
    }

    updateSummary();

    if (!showOnlySelected) {
        renderGames();
    }
});

// Send Games Button - Show message in a text box
sendGamesBtn.addEventListener("click", function() {
    if (selectedGames.length === 0) {
        alert("تکایە یاریەکان دیاری بکە پێش ناردن");
        return;
    }

    // Get game names from selected images
    const gameNames = selectedGames.map(function(image) {
        const game = games.find(function(g) {
            return g.image === image;
        });
        return game ? getGameName(game.image) : '';
    }).filter(name => name !== '');

    // Get total size and count
    const totalSize = getTotalSelectedSize();
    const count = selectedGames.length;

    // Create the message
    let message = gameNames.join('\n');
    message += `\n\nئەو یاریانەم دەوێ بە کۆدی ${totalSize.toFixed(2)}.${count}`;

    // Check if message box already exists
    let messageBox = document.getElementById('messageBox');
    
    if (!messageBox) {
        // Create message box container
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        messageBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1f2937;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            z-index: 1000;
            max-width: 500px;
            width: 90%;
            border: 2px solid #00d9ff;
        `;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = function() {
            messageBox.remove();
            document.getElementById('overlay').remove();
        };
        messageBox.appendChild(closeBtn);
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'یاریە دیاریکراوەکان';
        title.style.cssText = `
            color: #00d9ff;
            margin-bottom: 15px;
            text-align: center;
            font-size: 20px;
        `;
        messageBox.appendChild(title);
        
        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.id = 'messageText';
        textarea.style.cssText = `
            width: 100%;
            height: 200px;
            background: #111827;
            color: #fff;
            border: 1px solid #374151;
            border-radius: 8px;
            padding: 12px;
            font-size: 14px;
            resize: vertical;
            font-family: Arial, sans-serif;
        `;
        textarea.value = message;
        messageBox.appendChild(textarea);
        
        // Create copy button
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'کۆپیکردن';
        copyBtn.style.cssText = `
            margin-top: 12px;
            background: #00d9ff;
            color: #111;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            width: 100%;
            transition: 0.3s;
        `;
        copyBtn.onmouseover = function() {
            this.style.transform = 'scale(1.02)';
        };
        copyBtn.onmouseout = function() {
            this.style.transform = 'scale(1)';
        };
        copyBtn.onclick = function() {
            const textarea = document.getElementById('messageText');
            textarea.select();
            document.execCommand('copy');
            copyBtn.textContent = '✅ کۆپی کرا!';
            setTimeout(function() {
                copyBtn.textContent = 'کۆپیکردن';
            }, 2000);
        };
        messageBox.appendChild(copyBtn);
        
        // Create WhatsApp send button
        const whatsappBtn = document.createElement('button');
        whatsappBtn.textContent = '📱 ناردن بۆ واتساپ';
        whatsappBtn.style.cssText = `
            margin-top: 10px;
            background: #25D366;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            width: 100%;
            transition: 0.3s;
        `;
        whatsappBtn.onmouseover = function() {
            this.style.transform = 'scale(1.02)';
        };
        whatsappBtn.onmouseout = function() {
            this.style.transform = 'scale(1)';
        };
        whatsappBtn.onclick = function() {
            const text = document.getElementById('messageText').value;
            const encodedMessage = encodeURIComponent(text);
            const phoneNumber = '9647501238780';
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
        };
        messageBox.appendChild(whatsappBtn);
        
        document.body.appendChild(messageBox);
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 999;
        `;
        overlay.onclick = function() {
            messageBox.remove();
            overlay.remove();
        };
        document.body.appendChild(overlay);
    } else {
        // Update existing message box
        document.getElementById('messageText').value = message;
        messageBox.style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }
});

// Initial render
updateSummary();
renderGames();
