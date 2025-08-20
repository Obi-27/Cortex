export default class splitterHandler {
    constructor() {
        this.splitter = document.getElementById('page-splitter')
        this.sidebar = document.getElementById('sidebar')
        this.rowDiv = document.querySelector('.row-div')
        this.sidebarManager = document.getElementById('sidebar-manager')

        this.isDragging = false

        this.connectedCallback()
    }

    connectedCallback() {

        this.splitter.addEventListener('mousedown', () => {
            this.isDragging = true
            document.body.style.cursor = 'col-resize'
        })

        document.addEventListener('mouseup', () => {
            this.isDragging = false
            document.body.style.cursor = ''
        })

        document.addEventListener('mousemove', e => {
            if(!this.isDragging) return;

            const min = 127
            const max = this.rowDiv.clientWidth * 0.8;
            const newWidth = Math.min(Math.max(e.clientX, min), max);

            this.sidebar.style.width = `${newWidth}px`;
            this.sidebarManager.style.width = `${newWidth}px`
        })
    }
}