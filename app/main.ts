import * as net from 'net'
import * as fs from 'fs'
import { saveDataToFile } from './helpers'

const METHOD_INDEX = 0
const PATH_REQUEST_INDEX = 1
const HTTP_VERSION_INDEX = 2

const PATH_ECHO = '/echo'

let directory = ''

const args = process.argv.slice(2);

if (args[0] === '--directory') {
    directory = args[1]
}

console.log("args", args)

const server = net.createServer((socket) => {
    socket.on('data', async (data) => {
        const requestString = data.toString()
        const requestInfoArray = requestString.split('\r\n')

        const [requestInfoRaw] = requestInfoArray

        const requestInfo = requestInfoRaw.split(' ')

        const method = requestInfo[METHOD_INDEX]
        const pathRequest = requestInfo[PATH_REQUEST_INDEX]
        const path = pathRequest.split('/')[1]
        const httpVersion = requestInfo[HTTP_VERSION_INDEX]
        const dataBody = requestInfoArray[requestInfoArray.length - 1]

        console.log("\r\nrequestString", requestString)
        console.log("\r\nrequestInfoRaw", requestInfoRaw)
        console.log("\r\nrequestInfo", requestInfo)
        console.log("\r\nmethod", method)
        console.log("\r\npathRequest", pathRequest)
        console.log("\r\dataBody", dataBody)

        let response: string = `${httpVersion} 404 Not Found\r\n`

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
            case 'files': {
                const params = pathRequest.slice('files'.length + 1)

                const fileDir = `${directory}${params}`

                console.log("params", params);

                if (method === "GET") {
                    try {
                        const data = fs.readFileSync(fileDir, 'utf-8');
                        response = `${httpVersion} 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}`;
                    } catch (err) {
                        response = `${httpVersion} 404 Not Found\r\n\r\nFile not found`;
                    }
                } else {
                    const result = await saveDataToFile(fileDir, dataBody)

                    if (result) {
                        response = `${httpVersion} 201 Created\r\nContent-Type: application/octet-stream\r\nContent-Length: ${dataBody.length}\r\n\r\n${dataBody}`;
                    } else {
                        response = `${httpVersion} 400 Bad Request\r\n`;
                    }


                }

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
