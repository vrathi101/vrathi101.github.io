/**
 * Scroll Animations
 * Uses Intersection Observer to trigger animations on scroll
 */

class ScrollAnimator {
  constructor() {
    this.observer = null;
    this.timelineObserver = null;
  }

  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Show everything immediately without animation
      document.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.add('visible');
      });
      document.querySelectorAll('.timeline').forEach(el => {
        el.classList.add('visible');
      });
      return;
    }

    this.setupObserver();
    this.setupTimelineObserver();
    this.observeElements();
  }

  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add visible class to trigger animation
            entry.target.classList.add('visible');
            // Optionally unobserve after animation
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px 0px'
      }
    );
  }

  setupTimelineObserver() {
    this.timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.timelineObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px'
      }
    );
  }

  observeElements() {
    // Observe all elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
      this.observer.observe(el);
    });

    // Observe timeline separately for special animation
    document.querySelectorAll('.timeline').forEach(el => {
      this.timelineObserver.observe(el);
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.timelineObserver) {
      this.timelineObserver.disconnect();
    }
  }
}

// Export for use in main.js
window.ScrollAnimator = ScrollAnimator;
