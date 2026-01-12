/**
 * Main JavaScript Entry Point
 * Initializes all interactive features
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize particle background
  initParticles();

  // Initialize scroll animations
  initScrollAnimations();

  // Initialize navigation
  initNavigation();

  // Initialize card hover effects
  initCardEffects();
});

/**
 * Initialize Particle Network Background
 */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (canvas && window.ParticleNetwork) {
    const particles = new ParticleNetwork(canvas);
    particles.init();
  }
}

/**
 * Initialize Scroll Animations
 */
function initScrollAnimations() {
  if (window.ScrollAnimator) {
    const animator = new ScrollAnimator();
    animator.init();
  }
}

/**
 * Initialize Navigation
 * - Highlights active section in nav
 * - Smooth scroll behavior
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Update active nav link on scroll
  const updateActiveNav = () => {
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  // Throttle scroll event
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Handle nav link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });

        // Update active state immediately
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });

  // Initial check
  updateActiveNav();
}

/**
 * Initialize Card Hover Effects
 * - Mouse-following glow effect on cards
 */
function initCardEffects() {
  const cards = document.querySelectorAll('.card, .project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
