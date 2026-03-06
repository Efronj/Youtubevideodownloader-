document.addEventListener('DOMContentLoaded', () => {
    console.log("YouTube Downloader v3.0.0 Active - REAL-TIME API MODE");
    window.alert("YouTube Downloader v3.0 Active - Using Real Video Engine!");
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

    // Target Container for Download Buttons
    const downloadOptions = document.querySelector('.download-options');

    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be|youtube\.com|m\.youtube\.com|youtube\.com\/shorts\/)\/.+$/;
    const API_KEY = "AIzaSyD1QrvhlcjGT8PioVApW6Xq9vmLd3WY8Dk";

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text;
                if (youtubeRegex.test(text)) processUrl(text);
            }
        } catch (err) { }
    });

    fetchBtn.onclick = () => processUrl(urlInput.value.trim());
    urlInput.onkeypress = (e) => { if (e.key === 'Enter') processUrl(urlInput.value.trim()); };
    urlInput.oninput = () => {
        const url = urlInput.value.trim();
        if (youtubeRegex.test(url)) processUrl(url);
    };

    function extractVideoId(url) {
        let videoId = null;
        try {
            if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
            else if (url.includes('v=')) videoId = url.split('v=')[1].split(/[&#]/)[0];
            else if (url.includes('embed/')) videoId = url.split('embed/')[1].split(/[?#]/)[0];
            else if (url.includes('shorts/')) videoId = url.split('shorts/')[1].split(/[?#]/)[0];
            else if (url.includes('watch?v=')) videoId = url.split('v=')[1].split(/[&#]/)[0];
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
            const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`);
            const data = await res.json();
            loadingState.classList.add('hidden');

            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                videoTitle.textContent = video.snippet.title;
                videoDuration.textContent = parseDuration(video.contentDetails.duration);
                const thumbs = video.snippet.thumbnails;
                videoThumbnail.src = (thumbs.maxres || thumbs.standard || thumbs.high || thumbs.medium).url;

                // MULTI-ENGINE DOWNLOAD DASHBOARD
                // We use Loader.to as the primary engine because it's the fastest and highest quality
                downloadOptions.innerHTML = `
                    <div class="engine-tabs">
                        <button class="engine-tab active" data-engine="loader">High Speed</button>
                        <button class="engine-tab" data-engine="y2mate">Ultra HD</button>
                    </div>
                    <div class="iframe-container-wrapper">
                        <div id="iframe-fallback" class="iframe-fallback hidden">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p>Engine blocked by browser security.</p>
                            <a id="direct-btn" href="#" target="_blank" class="primary-btn glow-btn mini-btn">
                                <i class="fa-solid fa-up-right-from-square"></i> Open Fix Connection
                            </a>
                        </div>
                        <iframe id="dl-iframe" 
                                src="https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${videoId}&f=mp4"
                                style="width: 100%; height: 350px; border: none; background: transparent;"
                                scrolling="yes"></iframe>
                    </div>
                    <p class="engine-status"><i class="fa-solid fa-circle-info"></i> If screen is grey, click "Open Fix Connection".</p>
                `;

                const iframe = document.getElementById('dl-iframe');
                const fallback = document.getElementById('iframe-fallback');
                const directBtn = document.getElementById('direct-btn');

                // Add Tab Switching Logic
                const tabs = downloadOptions.querySelectorAll('.engine-tab');
                tabs.forEach(tab => {
                    tab.onclick = () => {
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        const engine = tab.getAttribute('data-engine');

                        if (engine === 'loader') {
                            const url = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${videoId}&f=mp4`;
                            iframe.src = url;
                            directBtn.href = url;
                        } else {
                            const url = `https://y2mate.is/iframe/#${videoId}`;
                            iframe.src = url;
                            directBtn.href = `https://y2mate.is/en/${videoId}`;
                        }
                    };
                });

                // Set initial direct link
                directBtn.href = `https://loader.to/api/button/?url=https://www.youtube.com/watch?v=${videoId}&f=mp4`;

                // Handle loading errors/refusal (Note: Most browsers block X-Frame-Options detection, so we show it as a helper)
                setTimeout(() => {
                    fallback.classList.remove('hidden');
                }, 3000);

                downloaderResult.classList.remove('hidden');
            } else {
                errorMsg.classList.remove('hidden');
                featuresSection.classList.remove('hidden');
            }
        } catch (err) {
            loadingState.classList.add('hidden');
            errorMsg.classList.remove('hidden');
        }
    }

    // Modal
    const efronTrigger = document.getElementById('efron-trigger');
    const efronModal = document.getElementById('efron-modal');
    const closeModal = document.querySelector('.close-modal');
    if (efronTrigger) {
        efronTrigger.onclick = () => {
            efronModal.classList.remove('hidden');
            setTimeout(() => efronModal.classList.add('active'), 10);
        };
        const closeFunc = () => {
            efronModal.classList.remove('active');
            setTimeout(() => efronModal.classList.add('hidden'), 300);
        };
        closeModal.onclick = closeFunc;
        efronModal.onclick = (e) => { if (e.target === efronModal) closeFunc(); };
    }
});
