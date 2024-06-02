import * as net from 'net'
import * as fs from 'fs'
import { saveDataToFile } from './helpers'
import { CRLF, HTTP_STATUS_CODE } from './constants'

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
        const requestInfoArray = requestString.split(CRLF)

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
        console.log("\r\ndataBody", dataBody)

        let response: string = `${httpVersion} ${HTTP_STATUS_CODE.NOT_FOUND}${CRLF}`

        function changeResponse(response: string): void {
            socket.write(response);
            socket.end();
        }

        function getInfoHeader(key: string) {
            return requestString.split(`${key}: `)[1].split(CRLF)[0]
        }

        switch (path) {
            case '': {
                response = `${httpVersion} ${HTTP_STATUS_CODE.OK}${CRLF}${CRLF}`
                break;
            }
            case 'files': {
                const params = pathRequest.slice('files'.length + 1)

                const fileDir = `${directory}${params}`

                console.log("params", params);

                if (method === "GET") {
                    try {
                        const data = fs.readFileSync(fileDir, 'utf-8');
                        response = `${httpVersion} ${HTTP_STATUS_CODE.OK}${CRLF}Content-Type: application/octet-stream${CRLF}Content-Length: ${data.length}${CRLF}${CRLF}${data}`;
                    } catch (err) {
                        response = `${httpVersion} ${HTTP_STATUS_CODE.NOT_FOUND}${CRLF}${CRLF}File not found`;
                    }
                } else {
                    const result = await saveDataToFile(fileDir, dataBody)

                    if (result) {
                        response = `${httpVersion} ${HTTP_STATUS_CODE.CREATED}${CRLF}Content-Type: application/octet-stream${CRLF}Content-Length: ${dataBody.length}${CRLF}${CRLF}${dataBody}`;
                    } else {
                        response = `${httpVersion} ${HTTP_STATUS_CODE.BAD_REQUEST}${CRLF}`;
                    }
                }

                break;
            }
            case 'echo': {
                const dataEcho = pathRequest.slice(PATH_ECHO.length + 1)
                response = `${httpVersion} ${HTTP_STATUS_CODE.OK}${CRLF}Content-Type: text/plain${CRLF}Content-Length: ${dataEcho.length}${CRLF}${CRLF}${dataEcho}`
                break;
            }
            case 'user-agent': {
                const userAgent = getInfoHeader('User-Agent')
                response = `${httpVersion} ${HTTP_STATUS_CODE.OK}${CRLF}Content-Type: text/plain${CRLF}Content-Length: ${userAgent.length}${CRLF}${CRLF}${userAgent}`
                break;
            }
            default: {
                response = `${httpVersion} ${HTTP_STATUS_CODE.NOT_FOUND}${CRLF}${CRLF}`
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
