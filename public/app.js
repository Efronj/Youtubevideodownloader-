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

                // PREMIUM DOWNLOAD BOARD (V4.0)
                downloadOptions.innerHTML = `
                    <div id="download-board" class="download-board">
                        <div class="board-header">
                            <i class="fa-solid fa-cloud-arrow-down"></i>
                            <h3>Select Download Quality</h3>
                        </div>
                        <div id="board-loading" class="board-loading">
                            <div class="mini-spinner"></div>
                            <p>Generating direct links...</p>
                        </div>
                        <div id="links-grid" class="links-grid hidden">
                            <!-- Links will be injected here -->
                        </div>
                        <div id="board-error" class="board-error hidden">
                            <i class="fa-solid fa-circle-exclamation"></i>
                            <p>API Limit reached. <a href="#" onclick="location.reload()">Retry?</a></p>
                        </div>
                    </div>
                    <p class="engine-status"><i class="fa-solid fa-shield-check"></i> Direct Download Engine Active - No Iframes Used.</p>
                `;

                const linksGrid = document.getElementById('links-grid');
                const boardLoading = document.getElementById('board-loading');
                const boardError = document.getElementById('board-error');

                async function fetchDirectLinks(vid) {
                    try {
                        const apiUrl = `https://vkrdownloader.org/server/?api_key=vkrdownloader&vkr=https://www.youtube.com/watch?v=${vid}`;
                        const response = await fetch(apiUrl);
                        const data = await response.json();

                        if (data && data.data && data.data.downloads) {
                            const downloads = data.data.downloads;
                            linksGrid.innerHTML = '';

                            // Map of desired qualities
                            const formats = [
                                { label: 'Video 1080p', icon: 'fa-video', filter: (d) => d.format_id === '137' || d.ext === 'mp4' && d.quality === '1080p' },
                                { label: 'Video 720p', icon: 'fa-video', filter: (d) => d.format_id === '22' || d.ext === 'mp4' && d.quality === '720p' },
                                { label: 'Audio MP3', icon: 'fa-music', filter: (d) => d.ext === 'm4a' || d.ext === 'mp3' || d.format_id === '140' }
                            ];

                            formats.forEach(f => {
                                const match = downloads.find(f.filter);
                                if (match) {
                                    const btn = document.createElement('a');
                                    btn.href = match.url;
                                    btn.target = '_blank';
                                    btn.className = 'download-link-btn';
                                    btn.innerHTML = `
                                        <div class="btn-info">
                                            <i class="fa-solid ${f.icon}"></i>
                                            <span>${f.label}</span>
                                        </div>
                                        <i class="fa-solid fa-download"></i>
                                    `;
                                    linksGrid.appendChild(btn);
                                }
                            });

                            // Fallback if specific formats not found - just show first 3
                            if (linksGrid.children.length === 0) {
                                downloads.slice(0, 3).forEach(d => {
                                    const btn = document.createElement('a');
                                    btn.href = d.url;
                                    btn.target = '_blank';
                                    btn.className = 'download-link-btn';
                                    btn.innerHTML = `
                                        <div class="btn-info">
                                            <i class="fa-solid fa-file-arrow-down"></i>
                                            <span>${d.ext.toUpperCase()} ${d.quality || ''}</span>
                                        </div>
                                        <i class="fa-solid fa-download"></i>
                                    `;
                                    linksGrid.appendChild(btn);
                                });
                            }

                            boardLoading.classList.add('hidden');
                            linksGrid.classList.remove('hidden');
                        } else {
                            throw new Error('Invalid API Response');
                        }
                    } catch (err) {
                        boardLoading.classList.add('hidden');
                        boardError.classList.remove('hidden');
                    }
                }

                fetchDirectLinks(videoId);
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
