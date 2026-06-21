const themeToggle = document.getElementById('themeToggle');
const rootElement = document.documentElement;

const savedTheme = localStorage.getItem('portfolioTheme');
if (savedTheme === 'dark') {
  rootElement.classList.add('dark-theme');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isDark = rootElement.classList.toggle('dark-theme');
  localStorage.setItem('portfolioTheme', isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// Animate skill bars when About section becomes visible
document.addEventListener('DOMContentLoaded', () => {
  const skillFills = document.querySelectorAll('.skill-fill');
  if ('IntersectionObserver' in window && skillFills.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillFills.forEach(el => {
            const v = el.getAttribute('data-fill') || '0';
            el.style.width = v + '%';
            el.classList.add('active');
          });
          obs.disconnect();
        }
      });
    }, {threshold: 0.15});

    const about = document.getElementById('about');
    if (about) io.observe(about);
  } else {
    // Fallback: set widths immediately
    skillFills.forEach(el => {
      el.style.width = el.getAttribute('data-fill') + '%';
    });
  }

  const revealItems = document.querySelectorAll('.animate-on-scroll');
  if ('IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('active'));
  }
});

// Syllabus toggles for course cards
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('.syllabus-toggle');
  if (!toggle) return;
  const card = toggle.closest('.course-card');
  if (!card) return;
  const syllabus = card.querySelector('.syllabus');
  const isOpen = syllabus.classList.toggle('open');
  toggle.textContent = isOpen ? 'Hide Syllabus' : 'View Syllabus';
});
