/* global IntersectionObserver */
import * as auth from './auth.js'

class LandingPageHandler {
  constructor () {
    this.connectedCallback()
    this.loginModal = document.getElementById('loginModal')
    this.registerModal = document.getElementById('registerModal')
  }

  connectedCallback () {
    window.addEventListener('click', (e) => {
      if (e.target === this.loginModal || e.target === this.registerModal) {
        this.closeModal()
      }
    })

    document.querySelectorAll('.close').forEach(element => {
      element.addEventListener('click', () => {
        this.closeModal()
      })
    })

    document.querySelectorAll('.open-login').forEach(element => {
      element.addEventListener('click', () => {
        this.openLoginModal()
      })
    })

    document.querySelectorAll('.open-register').forEach(element => {
      element.addEventListener('click', () => {
        this.openRegisterModal()
      })
    })

    // Handle form submission
    document.querySelector('.login-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('login-email').value
      const password = document.getElementById('login-password').value

      auth.login(email, password)
      this.closeModal()
    })

    document.querySelector('.register-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const email = document.getElementById('register-email').value
      const password = document.getElementById('register-password').value
      const username = document.getElementById('register-username').value

      auth.register(email, password, username)
      this.closeModal()
    })

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    })

    // Add some interactive animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1'
          entry.target.style.transform = 'translateY(0)'
        }
      })
    }, observerOptions)

    // Observe feature cards for animation
    document.querySelectorAll('.feature-card').forEach((card, index) => {
      card.style.opacity = '0'
      card.style.transform = 'translateY(50px)'
      card.style.transition = `all 0.6s ease ${index * 0.1}s`
      observer.observe(card)
    })
  }

  openLoginModal () {
    // close registermodal if open
    this.closeModal()

    // open Login modal
    this.loginModal.style.display = 'block'
    document.body.style.overflow = 'hidden'
  }

  closeModal () {
    this.loginModal.style.display = 'none'
    this.registerModal.style.display = 'none'

    document.body.style.overflow = 'auto'
  }

  openRegisterModal () {
    // close login modal if open
    this.closeModal()

    // open register modal
    this.registerModal.style.display = 'block'
    document.body.style.overflow = 'hidden'
  }
}

function initializeHandler () {
  const landingPage = new LandingPageHandler()
  return landingPage
}

initializeHandler()
