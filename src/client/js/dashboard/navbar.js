import * as auth from '../auth.js'

export default class navbarHandler {
    constructor() {
        this.userButton = document.getElementById('user-button')
        this.userDropdown = document.getElementById('user-dropdown')

        this.profileButton = document.getElementById('user-profile-button')
        this.settingsButton = document.getElementById('user-settings-button')
        this.logoutButton = document.getElementById('user-logout-button')

        this.connectedCallback()
    }

    connectedCallback() {
        this.userButton.addEventListener('click', () => {
            this.userDropdown.classList.toggle('show')
        })

        window.addEventListener('click', (e) => {
            if(!e.target.closest('#user-menu')) {
                this.userDropdown.classList.remove('show')
            }
        })

        this.logoutButton.addEventListener('click', this.logoutUser)
    }

    logoutUser() {
        auth.logout()
        window.location.reload()
    }
}