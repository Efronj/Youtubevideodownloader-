async function testNewKey() {
    const API_KEY = "AIzaSyD1QrvhlcjGT8PioVApW6Xq9vmLd3WY8Dk";
    const videoId = "dQw4w9WgXcQ"; // Rickroll for testing
    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
testNewKey();
