import splitterHandler from "./pageSplitter.js"
import textAreaHandler from "./textArea.js"
import fileManagerHandler from "./fileManager.js"

class eventHandler {
    constructor () {
        this.pageSplitter = new splitterHandler()
        this.textArea = new textAreaHandler()
        this.fileManager = new fileManagerHandler(this.textArea)
        
    }
}

let handler = new eventHandler()