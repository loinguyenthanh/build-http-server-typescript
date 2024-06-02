import * as net from 'net';

const METHOD_INDEX = 0
const PATH_REQUEST_INDEX = 1
const HTTP_VERSION_INDEX = 2

const PATH_ECHO = '/echo'

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        const requestString = data.toString()
        const [requestInfoRaw] = requestString.split('\r\n')

        const requestInfo = requestInfoRaw.split(' ')

        const method = requestInfo[METHOD_INDEX]
        const pathRequest = requestInfo[PATH_REQUEST_INDEX]
        const path = pathRequest.split('/')[1]
        const httpVersion = requestInfo[HTTP_VERSION_INDEX]

        console.log("data",requestString, requestInfoRaw,requestInfo, method, pathRequest)

        let response: string;

        function changeResponse(response: string): void {
            socket.write(response);
            socket.end();
        }

        function getInfoHeader(key: string) {
            return requestString.split(`${key}: `)[1].split('\r\n')[0]
        }

        switch (path) {
            case '': {
                response = `${httpVersion} 200 OK\r\n\r\n`
                break;
            }
            case 'echo': {
            const dataEcho = pathRequest.slice(PATH_ECHO.length + 1)
                response = `${httpVersion} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${dataEcho.length}\r\n\r\n${dataEcho}`
                break;
            }
            case 'user-agent': {
                const userAgent = getInfoHeader('User-Agent')
                response = `${httpVersion} 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
                break;
            }
            default: {
                response = `${httpVersion} 404 Not Found\r\n\r\n`
                break;
            }
        }

        changeResponse(response)

    })

});

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
server.listen(4221, 'localhost', () => {
    console.log('Server is running on port 4221');
});
