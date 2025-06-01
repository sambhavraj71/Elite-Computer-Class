console.log("Welcome to Code Vora Academy!");

 document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.getElementById('menu-toggle');
            const navbar = document.getElementById('navbar');

            menuToggle.addEventListener('click', function() {
                navbar.classList.toggle('active');
                
                // Change icon between bars and times
                const icon = menuToggle.querySelector('i');
                if (navbar.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });

            // Close menu when clicking on a link (for mobile)
            const navLinks = document.querySelectorAll('.navbar a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        navbar.classList.remove('active');
                        const icon = menuToggle.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                });
            });

            // Close menu when clicking outside (for mobile)
            document.addEventListener('click', function(event) {
                if (window.innerWidth <= 768 && navbar.classList.contains('active')) {
                    if (!navbar.contains(event.target) && !menuToggle.contains(event.target)) {
                        navbar.classList.remove('active');
                        const icon = menuToggle.querySelector('i');
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });



//------------------Main Content of Student Zone -------------------------//

 // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('.popular-courses, .popular-categories, .gallery-section');
        sections.forEach(section => {
            observer.observe(section);
        });

        // Gallery click handler
        document.getElementById('galleryContainer').addEventListener('click', function() {
            window.location.href = 'gallery.html';
        });

        // Hover effect for course cards
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Hover effect for category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });

        // Add ripple effect to category cards
        categoryCards.forEach(card => {
            card.addEventListener('click', function(e) {
                let x = e.clientX - e.target.getBoundingClientRect().left;
                let y = e.clientY - e.target.getBoundingClientRect().top;

                let ripple = document.createElement('span');
                ripple.classList.add('ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 1000);
            });
        });

// Button Explore more //
// Add sparkle particles on hover
document.querySelectorAll('.Explore').forEach(button => {
    button.addEventListener('mouseenter', (e) => {
        // Create 8 sparkle particles
        for (let i = 0; i < 8; i++) {
            const sparkle = document.createElement('span');
            sparkle.classList.add('sparkle');
            
            // Random position and animation
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            sparkle.style.setProperty('--tx', `${x}px`);
            sparkle.style.setProperty('--ty', `${y}px`);
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animation = `sparkleAnimation ${0.5 + Math.random() * 0.5}s forwards`;
            
            button.appendChild(sparkle);
            
            // Remove after animation
            setTimeout(() => {
                sparkle.remove();
            }, 600);
        }
    });
});

// Button Explore more //



//------------------Main Content of Student Zone -------------------------//