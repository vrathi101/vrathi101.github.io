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

  // Initialize theme slider
  initThemeSlider();
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
 * Initialize Theme Slider (Day/Night Mode)
 * Interpolates colors between night and day based on slider value
 */
function initThemeSlider() {
  const slider = document.getElementById('theme-slider');
  const particleCanvas = document.getElementById('particle-canvas');
  
  if (!slider) return;

  // Helper: Convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Helper: Interpolate between two RGB colors
  function interpolateColor(color1, color2, t) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Helper: Interpolate rgba colors
  function interpolateRgba(rgba1, rgba2, t) {
    const match1 = rgba1.match(/rgba?\(([^)]+)\)/);
    const match2 = rgba2.match(/rgba?\(([^)]+)\)/);
    
    if (!match1 || !match2) return rgba1;
    
    const vals1 = match1[1].split(',').map(v => parseFloat(v.trim()));
    const vals2 = match2[1].split(',').map(v => parseFloat(v.trim()));
    
    const r = Math.round(vals1[0] + (vals2[0] - vals1[0]) * t);
    const g = Math.round(vals1[1] + (vals2[1] - vals1[1]) * t);
    const b = Math.round(vals1[2] + (vals2[2] - vals1[2]) * t);
    const a = vals1[3] !== undefined ? vals1[3] + (vals2[3] - vals1[3]) * t : 1;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Update theme based on slider value (0 = night, 100 = day)
  function updateTheme(value) {
    const t = value / 100; // 0 to 1
    
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    
    // Get night and day color values
    const bgPrimaryNight = computed.getPropertyValue('--bg-primary-night').trim();
    const bgPrimaryDay = computed.getPropertyValue('--bg-primary-day').trim();
    const bgSecondaryNight = computed.getPropertyValue('--bg-secondary-night').trim();
    const bgSecondaryDay = computed.getPropertyValue('--bg-secondary-day').trim();
    const bgTertiaryNight = computed.getPropertyValue('--bg-tertiary-night').trim();
    const bgTertiaryDay = computed.getPropertyValue('--bg-tertiary-day').trim();
    
    const textPrimaryNight = computed.getPropertyValue('--text-primary-night').trim();
    const textPrimaryDay = computed.getPropertyValue('--text-primary-day').trim();
    const textSecondaryNight = computed.getPropertyValue('--text-secondary-night').trim();
    const textSecondaryDay = computed.getPropertyValue('--text-secondary-day').trim();
    const textMutedNight = computed.getPropertyValue('--text-muted-night').trim();
    const textMutedDay = computed.getPropertyValue('--text-muted-day').trim();
    
    const borderNight = computed.getPropertyValue('--border-night').trim();
    const borderDay = computed.getPropertyValue('--border-day').trim();
    
    // Interpolate background colors
    root.style.setProperty('--bg-primary', interpolateColor(bgPrimaryNight, bgPrimaryDay, t));
    root.style.setProperty('--bg-secondary', interpolateColor(bgSecondaryNight, bgSecondaryDay, t));
    root.style.setProperty('--bg-tertiary', interpolateColor(bgTertiaryNight, bgTertiaryDay, t));
    
    // Interpolate text colors
    root.style.setProperty('--text-primary', interpolateColor(textPrimaryNight, textPrimaryDay, t));
    root.style.setProperty('--text-secondary', interpolateColor(textSecondaryNight, textSecondaryDay, t));
    root.style.setProperty('--text-muted', interpolateColor(textMutedNight, textMutedDay, t));
    
    // Interpolate border colors
    root.style.setProperty('--border', interpolateRgba(borderNight, borderDay, t));
    
    // Update particle canvas opacity (1 at night, 0 at day)
    if (particleCanvas) {
      particleCanvas.style.opacity = (1 - t).toString();
    }
    
    // Update nav and theme slider backgrounds to match theme
    const nav = document.querySelector('.nav');
    const themeSlider = document.querySelector('.theme-slider-container');
    
    if (nav) {
      // Interpolate between dark and light nav backgrounds
      const navBgNight = 'rgba(10, 10, 15, 0.8)';
      const navBgDay = 'rgba(255, 255, 255, 0.8)';
      nav.style.background = interpolateRgba(navBgNight, navBgDay, t);
    }
    
    if (themeSlider) {
      const sliderBgNight = 'rgba(10, 10, 15, 0.8)';
      const sliderBgDay = 'rgba(255, 255, 255, 0.8)';
      themeSlider.style.background = interpolateRgba(sliderBgNight, sliderBgDay, t);
    }
  }

  // Handle slider input
  slider.addEventListener('input', (e) => {
    updateTheme(parseFloat(e.target.value));
  });

  // Initialize with default value (0 = night mode)
  updateTheme(0);
  
  // Save preference to localStorage
  const savedValue = localStorage.getItem('theme-slider-value');
  if (savedValue !== null) {
    slider.value = savedValue;
    updateTheme(parseFloat(savedValue));
  }
  
  // Save on change
  slider.addEventListener('change', (e) => {
    localStorage.setItem('theme-slider-value', e.target.value);
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
