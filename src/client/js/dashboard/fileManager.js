import * as crud from "./crud.js"


export default class fileManagerHandler {
    constructor(textAreaHandler) {
        this.fileTreeElement = document.getElementById('fileTree-List')
        this.tabBarElement = document.getElementById('tab-bar')

        this.newFileBtn = document.getElementById('create-file-btn')
        this.newFolderBtn = document.getElementById('create-folder-btn')

        this.contextMenu = document.getElementById('context-menu')

        this.tabs = new Map()
        this.tabClickHandlers =  new Map()

        this.dirtyNotes = new Set()
        this.filesList = {}
        this.currentFilePath = ''
        this.textArea = textAreaHandler

        this.initializeFiles()
        this.connectedCallback() 
    }

    handleEvent(event) {
        this[`on${event.type}`](event);
    }

    connectedCallback() {
        this.fileTreeElement.addEventListener('click', this)

        window.addEventListener('note-dirty', (e) => {
            const path = e.detail.path
            this.markDirty(path, true)
        })

        window.addEventListener('note-save', (e) => {
            const path = e.detail.path
            this.markDirty(path, false)
        })

        this.newFileBtn.addEventListener('click', () => {
            this.insertIntoCurrentFolder(this.currentFilePath, false)
        })

        this.newFolderBtn.addEventListener('click', () => {
            this.insertIntoCurrentFolder(this.currentFilePath, true)
        })

        document.addEventListener('click', () => this.contextMenu.style.display = 'none')
        this.fileTreeElement.addEventListener('contextmenu', this)
    }

    onclick(e) {
        const tab = e.target.closest('.tree-tab')
        if (!tab) return

        const isFolder = tab.classList.contains('folder')

        if(isFolder) {
            const parent_Li = tab.closest('li')
            const nestedList = parent_Li?.querySelector('.nested')

            if(nestedList) {
                nestedList.classList.toggle('collapsed')
                tab.classList.toggle('expanded')
            }

            const active = this.fileTreeElement.querySelector('.tree-tab.active')
            if(active) active.classList.remove('active')
            tab.classList.add('active')

            this.currentFilePath = tab.dataset.path || ''
        } else {
            const active = this.fileTreeElement.querySelector('.tree-tab.active')
            if(active) active.classList.remove('active')
            
            tab.classList.add('active')

            this.currentFilePath = ''
            const filePath = tab.dataset.path

            this.openTab(filePath)
        }
    }


    oncontextmenu(e) {
        e.preventDefault()
        const tab = e.target.closest('.tree-tab')
        if(!tab) return

        const isFolder = tab.classList.contains('folder')
        const path = tab.dataset.path

        this.contextMenu.innerHTML = ''

        const menuOptions = []

        menuOptions.push({ label: 'Rename', action: () => this.renameItem(path) })
        menuOptions.push({ label: 'Delete', action: () => this.deleteItem(path)})

        if(isFolder) {
            menuOptions.push({ label: 'Create Note', action: () => this.insertIntoCurrentFolder(path, false)})
            menuOptions.push({ label: 'Create Folder', action: () => this.insertIntoCurrentFolder(path, true)})
        }

        menuOptions.forEach(opt => {
            const li = document.createElement('li')
            li.textContent = opt.label

            li.addEventListener('click', () => {
                opt.action()
                this.contextMenu.style.display = 'none'
            })
            this.contextMenu.appendChild(li)
        })

        this.contextMenu.style.top = `${e.pageY}px`
        this.contextMenu.style.left = `${e.pageX}px`
        this.contextMenu.style.display = 'block'
    }

    
    async initializeFiles() {      
        let fileTree = JSON.parse(localStorage.getItem('root'))
        if(!fileTree) {
            const filesList = await crud.getAllFiles()
            fileTree  = this.buildFileTree(filesList)
            localStorage.setItem('root', JSON.stringify(fileTree))
        } 
     
        this.renderFileTree(fileTree)
    }


    buildFileTree(fileList) {
        const root = {}

        fileList.forEach(item => {
            const pathParts = item.Key.split('/')
            let current = root

            for(let i = 0; i < pathParts.length; i++) {
                const part = pathParts[i]
                const isLast = i === pathParts.length - 1

                if (part === '') continue;

                if(!current[part]) {
                    if(isLast) {
                        current[part] = {
                            name: part,
                            Key: pathParts.slice(0, i + 1).join('/'),
                            children: item.type === 'D' ? {} : null
                        }
                    } else {
                        current[part] = {
                            name: part,
                            Key: pathParts.slice(0, i + 1).join('/') + '/',
                            type: 'D',
                            children: {}
                        }
                    }
                }

                current = current[part].children || {}
            }
        })

        return root
    }


    renderFileTree(treeData) {
        this.fileTreeElement.innerHTML = ''

        const createList = (nodes) => {
            const ul = document.createElement('ul');
            for (const key in nodes) {
                const node = nodes[key];
                const li = document.createElement('li');
                li.classList.add('tree-list-item')

                if (node.type === 'D') {
                    const folderLink = this.createObject('a', '', li, ['collapsed', 'tree-tab', 'folder'])
                    folderLink.dataset.path = node.Key
                    folderLink.draggable = true

                    const collapseIcon = this.createObject('img', '', folderLink, ['icon'])
                    collapseIcon.src = 'src/img/chevron_icon_white.png'

                    let folderName = this.createObject('span', '', folderLink, [])
                    folderName.textContent = node.name

                    this.attachDragEvents(folderLink, true) 


                    const childrenList = createList(node.children);
                    childrenList.classList.add('nested', 'collapsed');
                    li.appendChild(childrenList);

                } else {
                    let isDirty = false
                    const unsaved = localStorage.getItem(`unsaved:${node.Key}`)
                    if(unsaved !== null) {
                        isDirty = true
                    }

                    const fileLink = this.createObject('a', '', li, ['tree-tab', 'file'])
                    
                    const fileName = this.createObject('span', '', fileLink, [])
                    fileName.textContent = ((isDirty) ? '*' : '') + node.name

                    fileLink.dataset.path = node.Key
                    fileLink.draggable = true

                    this.attachDragEvents(fileLink, false)
                }

                ul.appendChild(li);
            }
            return ul;
        };

        const fullTree = createList(treeData);
        this.fileTreeElement.appendChild(fullTree);
    }


    attachDragEvents(element, isFolder) {
        element.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', element.dataset.path)
            e.dataTransfer.effectAllowed = 'move'
        })

        element.addEventListener('dragover', (e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'move'
            element.classList.add('drag-over')
        })

        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over')
        })

        element.addEventListener('drop', async (e) => {
            e.preventDefault()
            element.classList.remove('drag-over')

            const sourcePath = e.dataTransfer.getData('text/plain')
            const targetPath = element.dataset.path

            if(!sourcePath || sourcePath === targetPath || targetPath.startsWith(sourcePath)) return

            const isSourceFolder = sourcePath.endsWith('/')
            const name = sourcePath.split('/').filter(Boolean).pop()
            
            console.log(`SourcePath: ${sourcePath}, name: ${name}`)
            try{
                if(isSourceFolder) {
                    console.log('isSourceFolder True')
                } else {
                    console.log('isSourceFolder False')
                }
                    
            } catch (e) {
                console.error(`Drag and drop rename failed: `, e)
            }
 
            
        })
    }


    openTab(filePath) {
        if(this.tabs.has(filePath)) {
            this.setActiveTab(filePath)
            return
        }

        const tab = document.createElement('div')
        tab.className = 'tab'
        tab.textContent = filePath.split('/').pop()
        tab.dataset.path = filePath

        const handler = () => this.setActiveTab(filePath)
        this.tabClickHandlers.set(filePath, handler)
        tab.addEventListener('click', handler)

        const closeBtn = document.createElement('div')
        closeBtn.className = 'close-btn'
        closeBtn.textContent = 'x'

        const closeHandler = (e) => {
            e.stopPropagation()
            this.closeTab(filePath)
        }
        closeBtn.addEventListener('click', closeHandler)

        tab.appendChild(closeBtn)
        this.tabBarElement.appendChild(tab)
        this.tabs.set(filePath, tab)

        this.setActiveTab(filePath)
    }


    closeTab(filePath) {
        const tab = this.tabs.get(filePath)
        if(!tab) return

        tab.remove()
        this.tabs.delete(filePath)

        if(this.currentFilePath === filePath) {
            const next = [...this.tabs.keys()][0]
            if(next) this.setActiveTab(next)
                
            else {
                this.textArea.clearContent()
            }
        }
    }


    setActiveTab(filePath) {
        for(const [path, tab] of this.tabs.entries()) {
            tab.classList.toggle('active', path === filePath)
        }

        this.currentFilePath = filePath
        
        const fileContent = localStorage.getItem(`unsaved:${filePath}`)
        if(fileContent != null) {
            this.textArea.setContent(fileContent, this.currentFilePath)
            this.markDirty(filePath, true)
        } else {
            crud.getNote(filePath).then(content => {
                this.textArea.setContent(content, this.currentFilePath)
            })
        }
    }


    markDirty(path, isDirty) {
        const fileName = path.split('/').pop()

        //mark tab title
        const tab = this.tabs.get(path)
        if(tab) {
            const [nameNode] = tab.childNodes
            if(isDirty) {
                nameNode.textContent = `*${fileName}`
                this.dirtyNotes.add(path)
            } else {
                nameNode.textContent = fileName
                this.dirtyNotes.delete(path)
            }
        }

        //mark File tree item
        const treeItem = this.fileTreeElement.querySelector(`[data-path="${path}"]`)
        if(treeItem) {
            const nameNode = treeItem.querySelector('span')
            if(nameNode) {
                nameNode.textContent = isDirty ? `*${fileName}`: fileName
            }
        }
    }


    insertIntoCurrentFolder(path, isFolder) {
        console.log('creating')
        let targetPath = this.currentFilePath || ''
        let targetUl = this.fileTreeElement.querySelector('ul')
        console.log(targetPath)
        
        if(path) {
            const folderTab = this.fileTreeElement.querySelector(`.tree-tab[data-path="${path}"]`)
            console.log(folderTab)
            let parentLi = folderTab?.closest('li')

            if(!path.endsWith('/')) {
                parentLi = parentLi.parentElement?.closest('li')
            }

            console.log(parentLi)
            const nested = parentLi?.querySelector(`ul.nested`)
            if(nested) {
                console.log(nested)
                targetUl = nested

                nested.classList.remove('collapsed')
                folderTab.classList.add('expanded')
            }
        }

        this.showInlineInput(targetUl, isFolder, path)
    }


    showInlineInput(parentUl, isFolder, parentPath) {
        console.log('inout')
        if (this.fileTreeElement.querySelector('.inline-input')) return

        const li = document.createElement('li');
        li.classList.add('tree-list-item');

        const input = document.createElement('input');
        input.type = 'text';
        input.classList.add('inline-input');
        input.placeholder = `New ${(isFolder)? 'Folder': 'Note' } name...`
        li.appendChild(input)
        parentUl.prepend(li)
        input.focus()

        input.addEventListener('keydown', async (e) => {
            if(e.key === 'Enter') {
                console.log('rename')
                const name = input.value.trim()
                if(!name) return

                const fullPath = parentPath + name + (isFolder ? '/' : '')

                try {
                    if(isFolder) {
                        await crud.createFolder(fullPath)
                        localStorage.removeItem('root')
                    } else {
                        await crud.createNote(fullPath)
                        localStorage.removeItem('root')
                    }

                    await this.initializeFiles()
                } catch (err) {
                    console.error(err)
                }
            }

            if(e.key === 'Escape') {
                li.remove()
            }
        })
    }


    //TODO: rename folder
    renameItem(path) {
        localStorage.removeItem(`unsaved:${path}`)
        const isFolder = path.endsWith('/')

        const tab = this.fileTreeElement.querySelector(`[data-path="${path}"]`)
        if(!tab) return

        console.log(tab)
        const li = tab.closest('li')
        if(!li) return

        const oldName = tab.textContent.trim()
        
        tab.style.display = 'none'

        const input = document.createElement('input')
        input.type = 'text'
        input.value = oldName
        input.className = 'inline-input'
        input.style.marginLeft = '8px'

        const submit = async() => {
            const newName = input.value.trim()
            
            if(!newName) {
                console.log('none')
                cleanup()
                return
            }

            const parts = path.split('/')
            parts.pop()
            const newPath = parts.join('/') + '/' + newName + (isFolder? '/' : '')

            if(isFolder) {
                localStorage.removeItem('root')
            } else {
                localStorage.removeItem('root')
                await crud.renameNote(path, newName).then(() => this.initializeFiles())
                
                const tabContent = this.tabs.get(path)
                tabContent.textContent = newName
                tabContent.dataset.path = newPath

                const oldHandler = this.tabClickHandlers.get(path)
                if(oldHandler) {
                    tabContent.removeEventListener('click', oldHandler)
                    this.tabClickHandlers.delete(path)
                }
                
                const newHandler = () => this.setActiveTab(newPath)
                this.tabClickHandlers.set(newPath, newHandler)
                tabContent.addEventListener('click', newHandler)
                
                const closeBtn = document.createElement('div')
                closeBtn.className = 'close-btn'
                closeBtn.textContent = 'x'

                const closeHandler = (e) => {
                    e.stopPropagation()
                    this.closeTab(newPath)
                }
                closeBtn.addEventListener('click', closeHandler)
                tabContent.appendChild(closeBtn)

                this.tabs.delete(path)
                this.tabs.set(newPath, tabContent)
            }
        }

        const cleanup = () => {
            input.remove() 
            tab.style.display = ''
        }

        input.addEventListener('blur', () => {
            console.log(input)
            cleanup()
        })

        input.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') submit()
            else if (e.key === 'Escape') cleanup()
        })

        li.insertBefore(input, tab.nextSibling)
        input.focus()
        input.select()
    }


    async deleteItem(path) {
        const isFolder = path.endsWith('/')

         if(!confirm(`Are you sure you want to delete this ${isFolder? 'Folder': 'Note'}?`)) return
        console.log(isFolder)
        if(isFolder){
            localStorage.removeItem('root')
            await crud.deleteFolder(path).then(() => this.initializeFiles())
        } else {
            localStorage.removeItem('root')
            await crud.deleteNote(path).then(() => this.initializeFiles())
            this.closeTab(path)
        }
    }


    createObject(tag, id, parent, class_names) {
        let obj = document.createElement(tag);
        class_names.forEach(class_name => obj.classList.add(class_name));
        (id) ? obj.setAttribute("id", id) : null;
        parent.appendChild(obj);
        return obj;
    }
}