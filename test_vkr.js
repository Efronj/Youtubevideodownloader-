async function testVkr() {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    try {
        const response = await fetch(`https://api.vkrdownloader.com/server?v=${url}`);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}
testVkr();
