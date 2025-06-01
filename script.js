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


// ----------------------------------------------------------------------------------------------------------------------//
//---------------------------Admission Model----------------------------------------------------------------------------//
// Open modal on click
  document.getElementById("openAdmissionBtn").addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default link behavior
    document.getElementById("admissionModal").style.display = "block";
  });

  // Close modal
  document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("admissionModal").style.display = "none";
  });

  // Close on outside click
  window.addEventListener("click", function (event) {
    const modal = document.getElementById("admissionModal");
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
//---------------------------Admission Model----------------------------------------------------------------------------//
// ----------------------------------------------------------------------------------------------------------------------//


// Slideshow Functionality
function initSlideshow() {
  let currentSlide = 0;
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      slide.style.display = 'none';
      if (i === index) {
        slide.classList.add('active');
        slide.style.display = 'block';
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }

  if (slides.length > 0) {
    showSlide(currentSlide);
    setInterval(nextSlide, 2000);
  }
}

// Gallery Modal Functionality
function initGallery() {
  const galleryImages = document.querySelectorAll('.gallery-item img');
  let currentImageIndex = 0;
  let modal;

  function openModal(index) {
    currentImageIndex = index;

    modal = document.createElement('div');
    modal.classList.add('image-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <img src="${galleryImages[currentImageIndex].src}" alt="${galleryImages[currentImageIndex].alt}" />
      </div>
    `;

    document.body.appendChild(modal);

    // Close button
    modal.querySelector('.close-btn').onclick = () => modal.remove();

    // Click outside modal-content closes modal
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    // Click left or right side for prev/next image
    modal.querySelector('.modal-content').onclick = (e) => {
      e.stopPropagation();

      const width = modal.querySelector('.modal-content').clientWidth;
      const clickX = e.offsetX;

      if (clickX < width / 2) {
        // Previous image
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
      } else {
        // Next image
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
      }

      const img = modal.querySelector('img');
      img.src = galleryImages[currentImageIndex].src;
      img.alt = galleryImages[currentImageIndex].alt;
    };
  }

  galleryImages.forEach((img, i) => {
    img.addEventListener('click', () => openModal(i));
  });

  // View More Photos button
  const viewMoreBtn = document.querySelector('.view-more .btn');
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const lastItem = document.querySelector('.gallery-container .gallery-item:last-child');
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Feature Cards Animation
function initFeatureCards() {
  const featureCards = document.querySelectorAll('.feature-card');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.3 });

  featureCards.forEach(card => observer.observe(card));
}

// Smooth Scrolling for Navigation
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initSlideshow();
  initGallery();
  initFeatureCards();
  initSmoothScrolling();
});