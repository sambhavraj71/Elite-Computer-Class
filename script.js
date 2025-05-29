console.log("Welcome to Code Vora Academy!");

// Menu Toggle Functionality
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('navbar')?.classList.toggle('active');
});

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navContainer = document.querySelector('.nav-bar-container');
  const topRight = document.querySelector('.top-right');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      navContainer.classList.toggle('active');
      this.classList.toggle('active');
      
      // Hide search bar when menu is open
      if (navContainer.classList.contains('active')) {
        topRight.classList.remove('active');
      }
    });
  }
  
  // Optional: Toggle search bar with a separate button if needed
  // You would need to add a search toggle button in your HTML
  const searchToggle = document.querySelector('.search-toggle');
  if (searchToggle) {
    searchToggle.addEventListener('click', function() {
      topRight.classList.toggle('active');
      
      // Hide menu when search is open
      if (topRight.classList.contains('active')) {
        navContainer.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }
  
  // Close menu when clicking on a link (optional)
  const navLinks = document.querySelectorAll('.navbar a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navContainer.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });
});

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