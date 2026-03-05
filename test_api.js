async function testCobalt() {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    try {
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                vQuality: '720'
            })
        });
        const data = await response.json();
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}
testCobalt();
