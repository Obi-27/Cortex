import splitterHandler from "./pageSplitter.js"
import textAreaHandler from "./textArea.js"
import fileManagerHandler from "./fileManager.js"
import { getAccessToken } from "./crud.js"


let serverAddress = "http://127.0.0.1"
let serverPort = "3000"

class eventHandler {
    constructor () {
        this.connectedCallback()
        this.pageSplitter = new splitterHandler()
        this.textArea = new textAreaHandler()
        this.fileManager = new fileManagerHandler(this.textArea)
    
           
    }

    async connectedCallback() {
        window.addEventListener('load', async () => {
            const token = await getAccessToken()
            console.log('dashboard token: ', token)  
            if(token === null) {
                window.location.replace(`${serverAddress}:${serverPort}`)
            }
        })
    }
}

let handler = new eventHandler()