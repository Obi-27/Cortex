import splitterHandler from "./js/pageSplitter"
import textAreaHandler from "./js/textArea"
import fileManagerHandler from "./js/fileManager"

class eventHandler {
    constructor () {
        this.pageSplitter = new splitterHandler()
        this.textArea = new textAreaHandler()
        this.fileManager = new fileManagerHandler(this.textArea)
        
    }

}

let handler = new eventHandler()