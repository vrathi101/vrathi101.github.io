/**
 * Interactive Particle Physics Simulation
 * Click and drag to attract particles, creating fluid-like motion
 */

class ParticlePhysics {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 120;
    this.mouse = { x: null, y: null, isDown: false, radius: 150 };
    this.animationId = null;
    this.isRunning = false;

    // Physics constants
    this.friction = 0.98;
    this.attractionStrength = 0.8;
    this.returnStrength = 0.01;
    this.maxSpeed = 8;
    this.connectionDistance = 120;
  }

  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.canvas.style.display = 'none';
      return;
    }

    this.resize();
    this.createParticles();
    this.bindEvents();
    this.isRunning = true;
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.particles.push({
        x: x,
        y: y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        radius: Math.random() * 2 + 1,
        mass: Math.random() * 0.5 + 0.5,
        hue: Math.random() * 60 + 220, // Blue to purple range
        opacity: Math.random() * 0.6 + 0.3
      });
    }
  }

  bindEvents() {
    // Resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resize();
        this.createParticles();
      }, 200);
    });

    // Mouse/touch events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', () => this.handleMouseUp());

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });
  }

  handleMouseDown(e) {
    this.mouse.isDown = true;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  handleMouseUp() {
    this.mouse.isDown = false;
  }

  handleTouchStart(e) {
    e.preventDefault();
    this.mouse.isDown = true;
    this.mouse.x = e.touches[0].clientX;
    this.mouse.y = e.touches[0].clientY;
  }

  handleTouchMove(e) {
    e.preventDefault();
    this.mouse.x = e.touches[0].clientX;
    this.mouse.y = e.touches[0].clientY;
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    this.drawMouseEffect();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateParticles() {
    this.particles.forEach(p => {
      // Calculate distance to mouse
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Mouse interaction
        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);

          if (this.mouse.isDown) {
            // Attract particles when clicking
            p.vx += Math.cos(angle) * force * this.attractionStrength * p.mass;
            p.vy += Math.sin(angle) * force * this.attractionStrength * p.mass;
          } else {
            // Gentle repulsion on hover
            p.vx -= Math.cos(angle) * force * 0.15;
            p.vy -= Math.sin(angle) * force * 0.15;
          }
        }
      }

      // Return to origin (gentle spring force)
      const dxOrigin = p.originX - p.x;
      const dyOrigin = p.originY - p.y;
      p.vx += dxOrigin * this.returnStrength;
      p.vy += dyOrigin * this.returnStrength;

      // Apply friction
      p.vx *= this.friction;
      p.vy *= this.friction;

      // Limit speed
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > this.maxSpeed) {
        p.vx = (p.vx / speed) * this.maxSpeed;
        p.vy = (p.vy / speed) * this.maxSpeed;
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Boundary bounce
      if (p.x < 0 || p.x > this.canvas.width) {
        p.vx *= -0.5;
        p.x = Math.max(0, Math.min(this.canvas.width, p.x));
      }
      if (p.y < 0 || p.y > this.canvas.height) {
        p.vy *= -0.5;
        p.y = Math.max(0, Math.min(this.canvas.height, p.y));
      }
    });
  }

  drawParticles() {
    this.particles.forEach(p => {
      // Calculate glow based on velocity
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const glowIntensity = Math.min(speed / 3, 1);

      // Draw glow
      if (glowIntensity > 0.1) {
        const gradient = this.ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius * 4
        );
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${glowIntensity * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
      this.ctx.fill();
    });
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          const opacity = (1 - distance / this.connectionDistance) * 0.2;

          // Calculate average hue for connection color
          const avgHue = (this.particles[i].hue + this.particles[j].hue) / 2;

          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `hsla(${avgHue}, 60%, 55%, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }
  }

  drawMouseEffect() {
    if (this.mouse.x === null || this.mouse.y === null) return;

    if (this.mouse.isDown) {
      // Draw attraction field
      const gradient = this.ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, this.mouse.radius
      );
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)');
      gradient.addColorStop(1, 'transparent');

      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, this.mouse.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Draw center point
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
      this.ctx.fill();
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
  }
}

// Export for use in main.js
window.ParticleNetwork = ParticlePhysics;
