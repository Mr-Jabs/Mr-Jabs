const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

$('#year').textContent = new Date().getFullYear();

$('.menu-toggle').addEventListener('click', () => {
  const expanded = $('.header').classList.toggle('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', expanded);
  $('.menu-toggle').setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  $('.menu-toggle span').textContent = expanded ? '−' : '+';
});
$$('.header nav a').forEach(link => link.addEventListener('click', () => {
  $('.header').classList.remove('menu-open');
  $('.menu-toggle').setAttribute('aria-expanded', 'false');
  $('.menu-toggle').setAttribute('aria-label', 'Open navigation');
  $('.menu-toggle span').textContent = '+';
}));

let activeCategory = 'all';
let activeTechnology = 'all';

function applyProjectFilters() {
  let count = 0;
  $$('.project-card').forEach(card => {
    const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
    const matchesTechnology = activeTechnology === 'all' || card.dataset.technologies.split(' ').includes(activeTechnology);
    card.hidden = !(matchesCategory && matchesTechnology);
    if (!card.hidden) count++;
  });
  $$('[data-filter]').forEach(button => {
    const active = button.dataset.filter === activeCategory;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $$('[data-tech-filter]').forEach(button => {
    const active = button.dataset.techFilter === activeTechnology;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const label = document.querySelector('.technology-filters [data-tech-filter="' + activeTechnology + '"]').textContent;
  $('#project-filter-count').textContent = count + (count === 1 ? ' project' : ' projects') + (activeTechnology === 'all' ? '' : ' · ' + label);
  $('.project-empty').hidden = count > 0;
  $('.project-filter-status [data-clear-filters]').hidden = activeCategory === 'all' && activeTechnology === 'all';
  window.dispatchEvent(new Event('portfolio:layout'));
}
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  activeCategory = button.dataset.filter;
  applyProjectFilters();
}));
$$('[data-tech-filter]').forEach(button => button.addEventListener('click', () => {
  activeTechnology = button.dataset.techFilter === activeTechnology ? 'all' : button.dataset.techFilter;
  applyProjectFilters();
}));
$$('[data-clear-filters]').forEach(button => button.addEventListener('click', () => {
  activeCategory = 'all';
  activeTechnology = 'all';
  applyProjectFilters();
}));
applyProjectFilters();

const projectContent = {
  "weather": {
    "title": "Philippine Weather Analytics",
    "category": "DATA ENGINEERING / PIPELINE & DASHBOARD",
    "image": "assets/weatherph.png",
    "alt": "Philippine weather dashboard with city conditions, rainfall, humidity, and weekly trends",
    "description": "Weather readings become more useful when they are clean, organized, and easy to interpret. I built an automated pipeline that collects Philippine weather data, cleans it, and stores it in a database, then created a dashboard for exploring current conditions and weather trends.",
    "meta": "PORTFOLIO PROJECT / PYTHON · SQL · POSTGRESQL · ETL",
    "sections": [
      [
        "The use case",
        "Bring weather information into one analytical workflow, so someone can explore conditions and trends without having to work through the raw readings themselves."
      ],
      [
        "What I built",
        "An automated data collection and cleaning pipeline, a database-backed dataset ready for analysis, and a dashboard that translates weather measurements into readable views."
      ],
      [
        "What the interface shows",
        "The dashboard brings together a city overview, humidity, heat index, rainfall, and a weekly temperature chart, with comparison views for Philippine cities. These views make the prepared data easier to explore without working directly with database queries or raw readings."
      ]
    ]
  },
  "charge": {
    "title": "ChargePH",
    "category": "GEOSPATIAL DATA / ONGOING PROJECT",
    "image": "assets/chargeph.png",
    "alt": "ChargePH charging station map with Philippine station locations and infrastructure statistics",
    "description": "ChargePH is an interactive map project designed to help people find EV charging stations across the Philippines. I am building the data preparation behind the experience: Python scripts collect, clean, and standardize location data so stations can be placed accurately on the map.",
    "meta": "OCT 2026 — PRESENT / PYTHON · ETL · GEOSPATIAL DATA",
    "sections": [
      [
        "The use case",
        "Make charging-station locations easier to explore through a geographic view, supported by consistent station and location information."
      ],
      [
        "My contribution",
        "Building the interactive map and writing Python scripts for collecting, cleaning, and standardizing location data. The project connects data preparation with a practical location-based interface."
      ],
      [
        "What the interface shows",
        "The map presents station markers alongside search, connector categories, and operator summaries. The project snapshot shows 250 stations in the current dataset, with coverage clearly distinguished from a complete national total."
      ]
    ]
  },
  "docuflow": {
    "title": "DocuFlow",
    "category": "UNDERGRADUATE THESIS / TEAM OF FOUR",
    "image": "assets/docuflow.png",
    "alt": "DocuFlow admin analytics showing document request volumes, completion rate, and request statuses",
    "description": "DocuFlow is a school document request system that I co-built with three teammates for a K–12 school. It lets students request documents and track their progress in real time, with priority given to urgent requests. My contributions include designing and building student and admin screens and helping develop the backend.",
    "meta": "2026 / FLASK · MYSQL · DOCKER · GOOGLE CLOUD",
    "sections": [
      [
        "The use case",
        "Support school document requests through an online workflow that helps students see progress and helps staff manage requests, including urgent ones."
      ],
      [
        "My contribution",
        "Designed and built student-facing and administrator-facing screens and contributed to backend development. My admin analytics work brings request volumes, completion rates, and request statuses into a single view, helping staff understand the document request queue."
      ],
      [
        "Evaluation results",
        "In the thesis evaluation, 62 students, staff, and IT experts gave the system an ease-of-use rating of 4.24 out of 5. A load test with 50 simultaneous users recorded a response time of approximately 0.12 seconds. This evaluation brought user feedback and performance testing into the project alongside development."
      ]
    ]
  }
};
const dialog = $('#project-dialog');
let previousOverflow = '';
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projectContent[button.dataset.project];
  $('#dialog-title').textContent = project.title;
  $('#dialog-category').textContent = project.category;
  $('#dialog-description').textContent = project.description;
  $('#dialog-art').className = 'dialog-art case-study-art';
  const artwork = document.createElement('img');
  artwork.src = project.image;
  artwork.alt = project.alt;
  $('#dialog-art').replaceChildren(artwork);
  $('#dialog-project-meta').textContent = project.meta;
  $('#dialog-details').replaceChildren(...project.sections.map(([title, description]) => {
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = title;
    const paragraph = document.createElement('p');
    paragraph.textContent = description;
    section.append(heading, paragraph);
    return section;
  }));
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  dialog.showModal();
  dialog.scrollTop = 0;
}));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = previousOverflow; $('#dialog-art').innerHTML = ''; });


let toastTimer;
function toast(message) { $('.toast').textContent = message; $('.toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('.toast').classList.remove('show'), 3000); }
$('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText('jabsmacatangay6@gmail.com'); toast('Email address copied'); }
  catch { toast('Email: jabsmacatangay6@gmail.com'); }
});

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = $$('.section-heading, .project-card, .awards-intro, .awards-list, .about-grid, .journey-list, .contact-grid, .pipeline-flow > div');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('is-revealed');
    revealObserver.unobserve(entry.target);
  }
}), { threshold: .08 });
revealElements.forEach(element => {
  element.classList.add('scroll-reveal');
  if (element.getBoundingClientRect().top < innerHeight) element.classList.add('is-revealed');
  revealObserver.observe(element);
});
function syncMotionPreference() {
  document.documentElement.classList.toggle('motion-ready', !motionPreference.matches);
  if (motionPreference.matches) revealElements.forEach(element => element.classList.add('is-revealed'));
}
syncMotionPreference();
motionPreference.addEventListener('change', syncMotionPreference);
document.addEventListener('focusin', event => event.target.closest('.scroll-reveal')?.classList.add('is-revealed'));

let scrollFrame = 0;
const pipelineNodes = $$('.pipeline-flow > div');
function updateScrollDetails() {
  scrollFrame = 0;
  const distance = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--reading-progress', distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0);
  const positions = pipelineNodes.map(node => node.getBoundingClientRect().top + 34);
  const span = positions.at(-1) - positions[0];
  const progress = Math.max(0, Math.min(1, (innerHeight * .62 - positions[0]) / Math.max(span, 1)));
  $('.pipeline-flow').style.setProperty('--pipeline-progress', progress);
  $('.pipeline-flow').style.setProperty('--pipeline-span', span + 'px');
  pipelineNodes.forEach((node, index) => node.classList.toggle('is-active', positions[index] <= innerHeight * .62));
}
function queueScrollDetails() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollDetails);
}
addEventListener('scroll', queueScrollDetails, { passive: true });
addEventListener('resize', queueScrollDetails);
addEventListener('portfolio:layout', queueScrollDetails);
document.querySelectorAll('#credentials details').forEach(details => details.addEventListener('toggle', queueScrollDetails));
new ResizeObserver(queueScrollDetails).observe(document.querySelector('main'));
queueScrollDetails();

// Tilt the preview surface only; project text stays level and readable.
$$('.project-image').forEach(preview => {
  let frame = 0;
  let position = null;
  function resetTilt() {
    cancelAnimationFrame(frame);
    frame = 0;
    preview.style.setProperty('--tilt-x', '0deg');
    preview.style.setProperty('--tilt-y', '0deg');
  }
  preview.addEventListener('pointermove', event => {
    if (motionPreference.matches || event.pointerType !== 'mouse') return;
    position = { x: event.clientX, y: event.clientY };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = preview.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (position.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (position.y - bounds.top) / bounds.height * 2 - 1));
      preview.style.setProperty('--tilt-x', -y * 3 + 'deg');
      preview.style.setProperty('--tilt-y', x * 3 + 'deg');
    });
  });
  preview.addEventListener('pointerleave', resetTilt);
  motionPreference.addEventListener('change', resetTilt);
});

const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) $$('.header nav a').forEach(link => link.classList.toggle('current', link.hash === '#' + entry.target.id));
}), { rootMargin: '-20% 0px -55% 0px' });
$$('main section[id]').forEach(section => sectionObserver.observe(section));
