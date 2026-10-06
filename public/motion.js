(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', event => {
      const box = hero.getBoundingClientRect();
      hero.style.setProperty('--pointer-x', ((event.clientX - box.left) / box.width * 100) + '%');
      hero.style.setProperty('--pointer-y', ((event.clientY - box.top) / box.height * 100) + '%');
      hero.style.setProperty('--hero-shift-x', ((event.clientX - box.left) / box.width - .5) * 12 + 'px');
      hero.style.setProperty('--hero-shift-y', ((event.clientY - box.top) / box.height - .5) * 12 + 'px');
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--pointer-x', '50%');
      hero.style.setProperty('--pointer-y', '50%');
      hero.style.setProperty('--hero-shift-x', '0px');
      hero.style.setProperty('--hero-shift-y', '0px');
    });
  }

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (finePointer) {
    document.querySelectorAll('.listing-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - .5;
        const y = (event.clientY - box.top) / box.height - .5;
        card.style.setProperty('--tilt-x', (x * 5) + 'deg');
        card.style.setProperty('--tilt-y', (y * -5) + 'deg');
        card.style.setProperty('--shine-x', (x + .5) * 100 + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });

    document.querySelectorAll('.button').forEach(button => {
      button.classList.add('magnetic');
      button.addEventListener('pointermove', event => {
        const box = button.getBoundingClientRect();
        button.style.setProperty('--mag-x', ((event.clientX - box.left - box.width / 2) / box.width * 7) + 'px');
        button.style.setProperty('--mag-y', ((event.clientY - box.top - box.height / 2) / box.height * 7) + 'px');
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });
  }

  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  let progressPending = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    progressPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!progressPending) {
      progressPending = true;
      window.requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  if (!('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll(
    '.section-heading, .listing-card, .booking-card, .form-card, .booking-box, .detail-image, .empty-state, .page-head'
  );
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
  targets.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    if (element.classList.contains('listing-card')) {
      element.style.setProperty('--reveal-delay', (index % 6) * 105 + 'ms');
    }
    observer.observe(element);
  });
})();
