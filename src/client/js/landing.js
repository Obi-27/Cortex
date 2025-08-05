class LandingPage {
    constructor() {
        this.connectedCallback()
    }

    connectedCallback() {
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('loginModal')
            if (e.target === modal) {
                this.closeModal()
            }
        })

        
        document.querySelectorAll('.open-login').forEach(element => {
            element.addEventListener('click', () => {
                this.openModal()
            })
        })

        // Handle form submission
        document.querySelector('.login-form').addEventListener('submit', (e) => {
            e.preventDefault()
            const email = document.getElementById('email').value
            const password = document.getElementById('password').value
            
            // Here you would typically send the credentials to your backend
            console.log('Login attempt:', { email, password })
            alert('Login functionality would authenticate user and redirect to dashboard')
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
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe feature cards for animation
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.opacity = '0'
            card.style.transform = 'translateY(50px)'
            card.style.transition = `all 0.6s ease ${index * 0.1}s`
            observer.observe(card)
        })
    }


    openModal() {
        document.getElementById('loginModal').style.display = 'block'
        document.body.style.overflow = 'hidden'
    }


    closeModal() {
        document.getElementById('loginModal').style.display = 'none'
        document.body.style.overflow = 'auto'
    }

}



let handler = new LandingPage()