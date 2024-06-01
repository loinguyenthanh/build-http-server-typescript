import * as net from 'net';

const METHOD_INDEX = 0
const PATH_REQUEST_INDEX = 1
const HTTP_VERSION_INDEX = 2

const PATH_ECHO = '/echo'

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const dataString = data.toString()
        const dataArray = dataString.split('\r\n')

        const requestInfo = dataArray[0].split(' ')

        const method = requestInfo[METHOD_INDEX]
        const pathRequest = requestInfo[PATH_REQUEST_INDEX]
        const httpVersion = requestInfo[HTTP_VERSION_INDEX]

        console.log("data", dataArray,requestInfo, method, pathRequest)

        if (pathRequest === '/') {
            socket.write(`${httpVersion} 200 OK\r\n\r\n`)
        } if(pathRequest.startsWith(PATH_ECHO)) {
            const dataEcho = pathRequest.slice(PATH_ECHO.length + 1)

            socket.write(`${httpVersion} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${dataEcho.length}\r\n\r\n${dataEcho}`)
        } else {
            socket.write(`${httpVersion} 404 Not Found\r\n\r\n`)

        }
        socket.end();
    })

});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
