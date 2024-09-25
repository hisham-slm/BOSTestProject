const grabToken = (socket, name) => {
    console.log(`Searching for token: ${name}`);

    if (!socket.handshake.headers.cookie) {
        console.log('No cookies found in headers');
        return null;
    }

    // Get all cookies and split them by ';' to get individual cookies
    const cookies = socket.handshake.headers.cookie.split(';');

    // Iterate over each cookie
    for (let cookie of cookies) {
        // Check if the cookie contains '=' and properly split it
        const [cookieName, ...cookieValueParts] = cookie.split('=').map(part => part.trim());

        if (cookieName === name) {
            const cookieValue = cookieValueParts.join('='); // Handle case when '=' appears inside cookie value
            console.log(`Found token: ${name} = ${cookieValue}`);
            return cookieValue;
        }
    }

    console.log(`Token not found: ${name}`);
    return null;
}
module.exports = {grabToken}