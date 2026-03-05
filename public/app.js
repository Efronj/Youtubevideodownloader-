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
                    // Small delay to allow display flow to apply before opacity transitions
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

    // Result DOM Elements
    const videoThumbnail = document.getElementById('video-thumbnail');
    const videoTitle = document.getElementById('video-title');
    const videoDuration = document.getElementById('video-duration');
    const downloadBtns = document.querySelectorAll('.download-btn');

    // Simple Regex for YouTube URLs
    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;

    // Paste Button Functional
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                urlInput.value = text;
                // Auto-fetch if it looks like a YouTube URL
                if (youtubeRegex.test(text)) {
                    processUrl(text);
                }
            }
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            // Fallback for browsers stopping automatic clipboard read
            alert("Clipboard permission denied or unavailable. Please manually paste.");
        }
    });

    fetchBtn.addEventListener('click', () => {
        processUrl(urlInput.value.trim());
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processUrl(urlInput.value.trim());
        }
    });

    urlInput.addEventListener('input', () => {
        // Auto-detect valid links when user pastes them manually
        const url = urlInput.value.trim();
        if (youtubeRegex.test(url)) {
            processUrl(url);
        }
    });

    function extractVideoId(url) {
        let videoId = 'dQw4w9WgXcQ'; // Default Rickroll fallback
        try {
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            }
        } catch (e) {
            console.warn("Failed to extract ID, using fallback");
        }
        return videoId;
    }

    function processUrl(url) {
        // Reset visually
        errorMsg.classList.add('hidden');
        downloaderResult.classList.add('hidden');

        if (!url) return;

        if (!youtubeRegex.test(url)) {
            errorMsg.classList.remove('hidden');
            return;
        }

        // It's a valid matching URL. Show loading.
        loadingState.classList.remove('hidden');

        // Hide features to focus entirely on downloader
        featuresSection.classList.add('hidden');

        // MOCKED API FETCH FOR DEMONSTRATION
        // In a real application, you would pass the URL to your backend
        const videoId = extractVideoId(url);

        // Simulate network latency (1.5 seconds)
        setTimeout(() => {
            // Hide loading
            loadingState.classList.add('hidden');

            // Populate mock data with real-looking YouTube thumbnail
            videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            videoTitle.textContent = "How to Download Premium High Quality YouTube Videos (2026 Tutorial)";
            videoDuration.textContent = "10:24";

            // If the maxresdefault thumbnail fails to load, fallback to mqdefault
            videoThumbnail.onerror = function () {
                this.onerror = null;
                this.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            };

            // Show result
            downloaderResult.classList.remove('hidden');
        }, 1500);
    }

    // Download Buttons Interaction
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', async function () {
            const originalHtml = this.innerHTML;
            const quality = this.querySelector('.badge').textContent;
            const format = this.querySelector('span').textContent;
            const title = videoTitle.textContent || "video";

            // 1. Show processing state
            this.innerHTML = `<div class="btn-info"><span>Processing...</span></div><i class="fa-solid fa-spinner fa-spin"></i>`;
            this.style.pointerEvents = 'none';

            // 2. Mock delay to simulate backend processing
            setTimeout(async () => {
                try {
                    // 3. Trigger actual browser download
                    // We use a sample video/audio URL for demonstration so the user's gallery shows real media
                    let demoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Default stable sample video
                    if (format === 'MP3') {
                        demoUrl = 'https://www.w3schools.com/html/horse.mp3'; // Sample audio
                    }

                    // Create a temporary link to trigger the download
                    const response = await fetch(demoUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    // Setting correct extension ensures mobile gallery recognition
                    const extension = format === 'MP3' ? 'mp3' : 'mp4';
                    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${quality}.${extension}`;

                    document.body.appendChild(a);
                    a.click();

                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);

                    // 4. Show success notification
                    this.classList.add('success');
                    this.innerHTML = `<div class="btn-info"><span>Saved to Gallery!</span></div><i class="fa-solid fa-check"></i>`;
                } catch (error) {
                    console.error("Download failed:", error);
                    this.innerHTML = `<div class="btn-info"><span>Failed</span></div><i class="fa-solid fa-xmark"></i>`;
                }

                // 5. Reset button after 3 seconds
                setTimeout(() => {
                    this.classList.remove('success');
                    this.innerHTML = originalHtml;
                    this.style.pointerEvents = 'auto';
                }, 3000);

            }, 2000);
        });
    });

    // Efron Popup Logic
    const efronTrigger = document.getElementById('efron-trigger');
    const efronModal = document.getElementById('efron-modal');
    const closeModal = document.querySelector('.close-modal');

    if (efronTrigger && efronModal) {
        const openModal = () => {
            efronModal.classList.remove('hidden');
            setTimeout(() => efronModal.classList.add('active'), 10);
        };

        const closeFunc = () => {
            efronModal.classList.remove('active');
            setTimeout(() => efronModal.classList.add('hidden'), 300);
        };

        efronTrigger.addEventListener('click', openModal);
        closeModal.addEventListener('click', closeFunc);

        // Close on background click
        efronModal.addEventListener('click', (e) => {
            if (e.target === efronModal) {
                closeFunc();
            }
        });
    }
});
