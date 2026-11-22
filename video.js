/* =========================================================
   EliteGaming — Game Videos Database (TikTok)
   ========================================================= */

const videos = [
    {
        image: "assets/crash titans.jpg",
        link: "https://www.tiktok.com/@elitegaming210/video/7710707480187145524?is_from_webapp=1&sender_device=pc"
    }
  
];

/* ---------------------------------------------------------
   Extract numeric TikTok video ID from a link
   --------------------------------------------------------- */
function extractTikTokId(value) {
    if (!value) return null;
    const str = String(value).trim();
    if (/^\d{15,25}$/.test(str)) return str;

    const m = str.match(/\/video\/(\d{15,25})/);
    if (m) return m[1];

    const m2 = str.match(/\/embed\/v2\/(\d{15,25})/);
    if (m2) return m2[1];

    const m3 = str.match(/(\d{15,25})/);
    if (m3) return m3[1];

    return null;
}

/* ---------------------------------------------------------
   Find video entry by game image path
   --------------------------------------------------------- */
function getVideoByImage(image) {
    return videos.find(v => v.image === image) || null;
}

/* ---------------------------------------------------------
   Does this game have a working video?
   --------------------------------------------------------- */
function hasVideo(image) {
    const v = getVideoByImage(image);
    if (!v) return false;
    return extractTikTokId(v.link) !== null;
}

/* ---------------------------------------------------------
   Open the video modal for a game
   --------------------------------------------------------- */
function openVideo(image) {
    const v      = getVideoByImage(image);
    const id     = v ? extractTikTokId(v.link) : null;
    const player = document.getElementById('videoPlayer');
    const title  = document.getElementById('videoTitle');
    const modal  = document.getElementById('videoModal');

    if (!player || !modal) {
        if (typeof showToast === 'function') {
            showToast('ڤیدیۆ پلەیەر بەردەست نییە', 'error');
        }
        return;
    }

    if (!id) {
        if (typeof showToast === 'function') {
            showToast('ڤیدیۆ بۆ ئەم یاریە بەردەست نییە', 'error');
        }
        return;
    }

    player.src = 'about:blank';

    if (title) {
        title.textContent = (typeof getGameName === 'function')
            ? getGameName(image)
            : image.split('/').pop().replace(/\.[^.]+$/, '');
    }

    modal.classList.remove('hidden');
    player.src = 'https://www.tiktok.com/embed/v2/' + id;
}

/* ---------------------------------------------------------
   Close the video modal
   --------------------------------------------------------- */
function closeVideo() {
    const player = document.getElementById('videoPlayer');
    const modal  = document.getElementById('videoModal');
    if (player) player.src = 'about:blank';
    if (modal)  modal.classList.add('hidden');
}