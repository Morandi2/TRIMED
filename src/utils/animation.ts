export const initAnimations = () => {
  // Animation kontè
  const animateCounters = (): void => {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach((counter) => {
      const target = +(counter.getAttribute('data-count') || '0');
      const increment = target / 200;
      
      const updateCount = (): void => {
        const currentCount = +(counter.textContent || '0');
        if (currentCount < target) {
          counter.textContent = Math.ceil(currentCount + increment).toString();
          setTimeout(updateCount, 1);
        } else {
          counter.textContent = target.toString();
        }
      };
      updateCount();
    });
  };

  // FAQ Accordion
  const initFAQ = (): void => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const question = item.querySelector('.faq-question');
      question?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach((i) => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  };

  // Smooth scrolling
  const initSmoothScroll = (): void => {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = targetId ? document.querySelector(targetId) : null;
        if (targetElement) {
          const offsetTop = (targetElement as HTMLElement).offsetTop - 80;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      });
    });
  };

  return { animateCounters, initFAQ, initSmoothScroll };
};