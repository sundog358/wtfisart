class DigitalGlobe {
  constructor() {
    this.canvas = document.getElementById("digitalGlobe");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.connections = [];
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.createParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;

    // Define vibrant colors array
    const colors = [
      "#FF3B3B", // red
      "#FF7F00", // orange
      "#FFDD00", // yellow
      "#00FF00", // green
      "#0088FF", // blue
    ];

    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius * 0.8 + Math.random() * radius * 0.4;

      this.particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.005 + 0.002,
        angle: angle,
        radius: distance,
        centerX: centerX,
        centerY: centerY,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          // Create gradient for connection
          const gradient = this.ctx.createLinearGradient(
            this.particles[i].x,
            this.particles[i].y,
            this.particles[j].x,
            this.particles[j].y
          );

          gradient.addColorStop(0, this.particles[i].color);
          gradient.addColorStop(1, this.particles[j].color);

          this.ctx.beginPath();
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = 0.5;
          this.ctx.globalAlpha = 1 - distance / 100;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;
        }
      }
    }
  }

  updateParticles() {
    this.particles.forEach((particle) => {
      particle.angle += particle.speed;
      particle.x =
        particle.centerX + Math.cos(particle.angle) * particle.radius;
      particle.y =
        particle.centerY + Math.sin(particle.angle) * particle.radius;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw particles
    this.particles.forEach((particle) => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    });

    this.drawConnections();
  }

  animate() {
    this.updateParticles();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}
