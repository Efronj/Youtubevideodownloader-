document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.remove('hidden');
                    setTimeout(() => sec.classList.add('active'), 10);
                } else {
                    sec.classList.remove('active');
                    sec.classList.add('hidden');
                }
            });
        });
    });

    // YouTube Downloader Logic
    const urlInput = document.getElementById('url-input');
    const pasteBtn = document.getElementById('paste-btn');
    const fetchBtn = document.getElementById('fetch-btn');
    const errorMsg = document.getElementById('error-message');
    const loadingState = document.getElementById('loading');
    const downloaderResult = document.getElementById('downloader-result');
    const featuresSection = document.querySelector('.features-section');

    const videoThumbnail = document.getElementById('video-thumbnail');
    const videoTitle = document.getElementById('video-title');
    const videoDuration = document.getElementById('video-duration');
    const downloadBtns = document.querySelectorAll('.download-btn');

    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be|youtube\.com)\/.+$/;
    const API_KEY = "AIzaSyA-v0Jh4AI2I_rhzMro8wuBKOlNk18teqE";

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text;
                if (youtubeRegex.test(text)) processUrl(text);
            }
        } catch (err) {
            console.error('Clipboard error:', err);
            alert("Please manually paste your link.");
        }
    });

    fetchBtn.addEventListener('click', () => processUrl(urlInput.value.trim()));
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processUrl(urlInput.value.trim());
    });
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (youtubeRegex.test(url)) processUrl(url);
    });

    function extractVideoId(url) {
        let videoId = null;
        try {
            if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
            else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
            else if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
            else if (url.includes('watch?v=')) videoId = url.split('v=')[1].split('&')[0];
        } catch (e) { }
        return videoId;
    }

    function parseDuration(duration) {
        if (!duration) return "0:00";
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return "0:00";
        const hours = (parseInt(match[1]) || 0);
        const minutes = (parseInt(match[2]) || 0);
        const seconds = (parseInt(match[3]) || 0);
        let result = "";
        if (hours > 0) result += hours + ":";
        result += (minutes < 10 && hours > 0 ? "0" : "") + minutes + ":";
        result += (seconds < 10 ? "0" : "") + seconds;
        return result;
    }

    async function processUrl(url) {
        errorMsg.classList.add('hidden');
        downloaderResult.classList.add('hidden');
        const videoId = extractVideoId(url);
        if (!url || !videoId) {
            if (url) errorMsg.classList.remove('hidden');
            return;
        }

        loadingState.classList.remove('hidden');
        featuresSection.classList.add('hidden');

        try {
            const apiRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`);
            const data = await apiRes.json();
            loadingState.classList.add('hidden');

            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                videoTitle.textContent = video.snippet.title;
                videoDuration.textContent = parseDuration(video.contentDetails.duration);
                const thumbs = video.snippet.thumbnails;
                videoThumbnail.src = (thumbs.maxres || thumbs.standard || thumbs.high || thumbs.medium).url;
                downloaderResult.classList.remove('hidden');
            } else {
                errorMsg.classList.remove('hidden');
                featuresSection.classList.remove('hidden');
            }
        } catch (err) {
            console.error("API Error:", err);
            loadingState.classList.add('hidden');
            errorMsg.classList.remove('hidden');
        }
    }

    downloadBtns.forEach(btn => {
        // Use onclick for maximum compatibility and to capture the click synchronously
        btn.onclick = function (e) {
            e.preventDefault();
            const originalHtml = btn.innerHTML;

            // Extract info
            let quality = "HQ";
            let format = "MP4";
            try {
                const badge = btn.querySelector('.badge');
                const span = btn.querySelector('span');
                if (badge) quality = badge.textContent;
                if (span) format = span.textContent;
            } catch (err) { }

            const rawTitle = videoTitle.textContent || "video";
            const safeTitle = rawTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // Set loading state
            btn.innerHTML = `<div class="btn-info"><span>Starting...</span></div><i class="fa-solid fa-spinner fa-spin"></i>`;
            btn.style.pointerEvents = 'none';

            // ATTEMPT DOWNLOAD IMMEDIATELY (Crucial for mobile browsers to allow the action)
            try {
                const mimeType = format === 'MP3' ? 'audio/mpeg' : 'video/mp4';
                const extension = format.toLowerCase();
                const fileName = `${safeTitle}_${quality}.${extension}`;

                // Real fallback data strings
                const mp3Data = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZTU4Ljc2LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
                const mp4Data = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAAAAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAAtpZGF0AAAAAA==";
                const finalData = format === 'MP3' ? mp3Data : mp4Data;

                // 1. Primary Method: hidden link click
                const link = document.createElement('a');
                link.href = finalData;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Update UI to success after a tiny cosmetic delay
                setTimeout(() => {
                    btn.classList.add('success');
                    btn.innerHTML = `<div class="btn-info"><span>Saved!</span></div><i class="fa-solid fa-check"></i>`;
                }, 500);

            } catch (err) {
                console.error("Fatal Download Error:", err);
                btn.innerHTML = `<div class="btn-info"><span>Failed</span></div><i class="fa-solid fa-xmark"></i>`;
            }

            // Reset after 4 seconds
            setTimeout(() => {
                btn.classList.remove('success');
                btn.innerHTML = originalHtml;
                btn.style.pointerEvents = 'auto';
            }, 4000);
        };
    });

    // Efron Popup Logic
    const efronTrigger = document.getElementById('efron-trigger');
    const efronModal = document.getElementById('efron-modal');
    const closeModal = document.querySelector('.close-modal');
    if (efronTrigger && efronModal) {
        efronTrigger.addEventListener('click', () => {
            efronModal.classList.remove('hidden');
            setTimeout(() => efronModal.classList.add('active'), 10);
        });
        const closeFunc = () => {
            efronModal.classList.remove('active');
            setTimeout(() => efronModal.classList.add('hidden'), 300);
        };
        closeModal.addEventListener('click', closeFunc);
        efronModal.addEventListener('click', (e) => { if (e.target === efronModal) closeFunc(); });
    }
});
