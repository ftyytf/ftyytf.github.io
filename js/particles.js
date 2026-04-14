/* =============================================
   CryptoFlow by Muravsky Particle Background
   Красивые плавающие частицы на фоне
   ============================================= */
(function() {
  'use strict';

  // Создаём canvas
  var canvas = document.createElement('canvas');
  canvas.id = 'nxParticles';
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.6;';
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var particles = [];
  var connections = [];
  var mouse = { x: -1000, y: -1000 };
  var W, H;
  var PARTICLE_COUNT = 60;
  var MAX_DIST = 150;

  /* --- Цвета в стиле CryptoFlow by Muravsky --- */
  var COLORS = [
    'rgba(108, 92, 231, ',   // фиолетовый
    'rgba(168, 85, 247, ',   // пурпурный
    'rgba(6, 182, 212, ',    // голубой
    'rgba(59, 130, 246, ',   // синий
    'rgba(139, 92, 246, '    // индиго
  ];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r = Math.random() * 2.5 + 0.5;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.5 + 0.3;
    this.pulse = Math.random() * Math.PI * 2;
  }

  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += 0.02;
    this.alpha = 0.3 + Math.sin(this.pulse) * 0.2;

    /* Притяжение к курсору */
    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) {
      this.vx += dx * 0.00005;
      this.vy += dy * 0.00005;
    }

    /* Границы — wrap around */
    if (this.x < -10) this.x = W + 10;
    if (this.x > W + 10) this.x = -10;
    if (this.y < -10) this.y = H + 10;
    if (this.y > H + 10) this.y = -10;

    /* Трение */
    this.vx *= 0.999;
    this.vy *= 0.999;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  };

  function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          var alpha = (1 - dist / MAX_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(108, 92, 231, ' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    drawConnections();
    requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = [];
    /* Адаптивное количество частиц */
    var count = Math.min(PARTICLE_COUNT, Math.floor((W * H) / 15000));
    for (var i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    animate();
  }

  /* --- Events --- */
  window.addEventListener('resize', function() {
    resize();
    /* Пересоздаём если сильно изменился размер */
    if (Math.abs(particles.length - Math.floor((W * H) / 15000)) > 10) {
      init();
    }
  });

  document.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', function() {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  /* Не запускаем на мобильных с малым CPU */
  if (window.innerWidth > 768) {
    if (document.readyState === 'complete') { init(); }
    else { window.addEventListener('load', init); }
  }
})();

