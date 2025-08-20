import splitterHandler from "./pageSplitter.js"
import textAreaHandler from "./textArea.js"
import fileManagerHandler from "./fileManager.js"
import navbarHandler from "./navbar.js"
import { getAccessToken } from '../auth.js'


let serverAddress = "http://127.0.0.1"
let serverPort = "3000"

class eventHandler {
    constructor () {
        this.connectedCallback()
        this.pageSplitter = new splitterHandler()
        this.textArea = new textAreaHandler()
        this.fileManager = new fileManagerHandler(this.textArea)
        this.navbar = new navbarHandler()
    }

    async connectedCallback() {
        window.addEventListener('load', async () => {
            const token = await getAccessToken()
            if(token === null) {
                window.location.replace(`${serverAddress}:${serverPort}`)
            }
        })
    }
}

let handler = new eventHandler()