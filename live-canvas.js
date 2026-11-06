(() => {
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'live-canvas';
  layer.setAttribute('aria-hidden', 'true');
  const arrow = '<svg viewBox="0 0 22 27"><path d="M2 2 19 14 11 15 7 23Z" fill="currentColor" stroke="var(--aubergine)" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const cursors = [
    { name: 'John · Layout', color: 'var(--cursor-silver)', x: .15, y: .6 },
    { name: 'Alex · Motion', color: 'var(--cursor-pink)', x: .78, y: .4 },
    { name: 'Mia · Color', color: 'var(--cursor-gold)', x: .48, y: .8 },
    { name: 'Kai · Type', color: 'var(--cursor-lilac)', x: .28, y: .3 },
    { name: 'Sofia · Frames', color: 'var(--cursor-champagne)', x: .65, y: .65 },
    { name: 'Noah · API', color: 'var(--cursor-rose)', x: .38, y: .5 },
    { name: 'Luna · Details', color: 'var(--cursor-silver)', x: .85, y: .75 },
    { name: 'Leo · SQL', color: 'var(--cursor-pink)', x: .55, y: .25 },
    { name: 'Zoe · Images', color: 'var(--cursor-gold)', x: .2, y: .8 },
    { name: 'Eli · Polish', color: 'var(--cursor-lilac)', x: .72, y: .5 },
    { name: 'Ivy · Grid', color: 'var(--cursor-champagne)', x: .34, y: .75 },
    { name: 'Finn · Data', color: 'var(--cursor-rose)', x: .58, y: .35 },
    { name: 'Aria · UX', color: 'var(--cursor-silver)', x: .12, y: .45 },
    { name: 'Max · Tests', color: 'var(--cursor-pink)', x: .83, y: .55 },
    { name: 'Isla · Schema', color: 'var(--cursor-gold)', x: .42, y: .25 },
    { name: 'Owen · Shape', color: 'var(--cursor-lilac)', x: .67, y: .8 },
    { name: 'Jade · ETL', color: 'var(--cursor-champagne)', x: .25, y: .65 },
    { name: 'Theo · Finish', color: 'var(--cursor-rose)', x: .9, y: .3 }
  ].map((data, index) => {
    const element = document.createElement('div');
    element.className = 'build-cursor';
    if (index >= 6) element.classList.add('over-mobile');
    if (index >= 10) element.classList.add('over-tablet');
    element.style.setProperty('--cursor-color', data.color);
    element.style.setProperty('--cursor-label', data.color === 'var(--cursor-silver)' ? 'var(--silver)' : 'var(--aubergine)');
    element.innerHTML = arrow + '<span>' + data.name + '</span>';
    layer.append(element);
    return { ...data, element, x: innerWidth * data.x, y: innerHeight * data.y };
  });
  const guides = ['horizontal', 'vertical'].map(direction => {
    const guide = document.createElement('div');
    guide.className = 'build-guide ' + direction;
    layer.append(guide);
    return guide;
  });
  const selection = document.createElement('div');
  selection.className = 'build-selection';
  selection.innerHTML = '<span class="build-label"></span><span class="build-size"></span>' + '<i class="build-handle"></i>'.repeat(4);
  layer.append(selection);
  document.body.append(layer);

  const lifecycle = new AbortController();
  let disposed = false;
  let finaleStarted = null;
  const bursts = [];
  layer.dataset.state = 'building';
  const pieceSelectors = [
    '.hero-top, .hero-name, .hero-portrait, .hero-copy > *, .hero-stats > *, .hero-bottom > *',
    '.section-kicker, .section-heading > *, .filters, .project-card, .timeline',
    '.awards-intro > *, .awards-list > *',
    '.pipeline-intro > *, .pipeline-flow > div',
    '.section-kicker, .section-heading > *, .column-title, .skill-line, .tool-list, .process-list > li, blockquote, .education-strip',
    '.journey > div:first-child > *, .journey-list > div',
    '.section-kicker, .contact-grid > div:first-child > *, .contact-links > *, .contact-reel'
  ];
  const targets = [...document.querySelectorAll('main > section')].flatMap((section, index) => [...section.querySelectorAll(pieceSelectors[index])]);
  targets.forEach(element => element.classList.add('build-piece'));
  let frameId = 0;
  let lastTime = 0;
  let elapsed = 0;
  let cycleStart = -5000;
  let target = null;
  let previousTarget = null;
  let rect = null;
  let visibleTargets = [];
  const boundsByTarget = new Map();
  let clicked = false;
  let layoutDirty = true;
  let lastMeasure = -1000;
  let sequence = 0;
  const cycleDuration = 1700;
  const sections = [...document.querySelectorAll('main > section')];
  let tourEnabled = true;
  let phaseStarted = 0;
  let scrollTransition = null;
  const phaseDuration = 4300;
  let assemblyJobs = [];
  let assemblyPlanned = false;
  const cursorCount = () => innerWidth < 768 ? 6 : innerWidth < 1024 ? 10 : 18;

  function resetConstruction() {
    document.documentElement.classList.add('live-construction');
    targets.forEach(element => { element.dataset.buildState = 'pending'; element.classList.remove('canvas-placing'); });
    assemblyJobs = [];
    assemblyPlanned = false;
  }

  function revealEverything() {
    document.documentElement.classList.remove('live-construction');
    targets.forEach(element => { element.dataset.buildState = 'built'; element.classList.remove('canvas-placing'); });
    assemblyJobs = [];
    assemblyPlanned = false;
    cursors.forEach(cursor => { cursor.buildJob = null; });
  }

  function planAssembly() {
    const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
    const pieces = targets.filter(element => {
      const box = element.getBoundingClientRect();
      return element.dataset.buildState === 'pending' && box.width > 0 && box.height > 0 && box.bottom > headerBottom + 10 && box.top < innerHeight - 70;
    });
    // A short empty-canvas beat, then each collaborator draws a real piece at their cursor.
    assemblyJobs = pieces.map((element, index) => ({ element, cursor: index % cursorCount(), start: phaseStarted + 450 + Math.floor(index / cursorCount()) * 760 + (index % cursorCount()) * 70, duration: 300, revealed: false, assigned: false }));
    assemblyPlanned = true;
    layer.dataset.assembly = 'blank';
    layoutDirty = true;
  }

  function assembleView() {
    if (!tourEnabled || scrollTransition) return;
    if (!assemblyPlanned) planAssembly();
    let remaining = 0;
    assemblyJobs.forEach(job => {
      if (job.revealed) return;
      remaining++;
      if (elapsed < job.start) return;
      const cursor = cursors[job.cursor];
      if (!job.assigned) {
        job.assigned = true;
        cursor.buildJob = job;
        cursor.startX = cursor.x;
        cursor.startY = cursor.y;
        cursor.element.classList.remove('is-clicking');
      }
      if (elapsed >= job.start + job.duration) {
        job.revealed = true;
        job.element.dataset.buildState = 'drawing';
        cursor.element.classList.add('is-clicking');
        job.element.addEventListener('animationend', event => {
          if (event.animationName === 'canvas-create' && job.element.dataset.buildState === 'drawing') job.element.dataset.buildState = 'built';
        }, { once: true, signal: lifecycle.signal });
      }
    });
    layer.dataset.assembly = remaining === 0 ? 'complete' : elapsed - phaseStarted < 450 ? 'blank' : 'building';
  }

  // Short viewports get multiple stops so the tour never skips the bottom of a section.
  function tourStops() {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const step = Math.max(200, innerHeight - headerHeight - 160);
    const stops = [];
    sections.forEach((section, index) => {
      const bounds = section.getBoundingClientRect();
      const start = index === 0 ? 0 : Math.max(0, bounds.top + scrollY - headerHeight - 15);
      const end = Math.min(maxScroll, Math.max(start, bounds.bottom + scrollY - innerHeight + 80));
      for (let position = start; position < end - 90; position += step) stops.push({ y: Math.min(position, maxScroll), index });
      stops.push({ y: Math.min(end, maxScroll), index });
    });
    return stops.filter((stop, index) => index === 0 || stop.y - stops[index - 1].y > 70);
  }

  function cleanUp() {
    if (disposed) return;
    disposed = true;
    tourEnabled = false;
    scrollTransition = null;
    cancelAnimationFrame(frameId);
    document.documentElement.classList.add('build-finished');
    revealEverything();
    document.documentElement.classList.remove('build-paused');
    layer.remove();
    lifecycle.abort();
    dialogObserver.disconnect();
    headerObserver.disconnect();
  }

  function interruptTour() {
    cleanUp();
  }

  function finishBuild() {
    if (disposed || finaleStarted !== null) return;
    tourEnabled = false;
    scrollTransition = null;
    document.documentElement.classList.add('build-finished');
    revealEverything();
    finaleStarted = elapsed;
    layer.dataset.state = 'bursting';
    selection.remove();
    guides.forEach(guide => guide.remove());
    layer.querySelectorAll('.collaborator-selection').forEach(frame => frame.remove());
    cursors.slice(0, cursorCount()).forEach((cursor, index) => {
      cursor.element.classList.remove('is-clicking');
      const burst = document.createElement('div');
      burst.className = 'cursor-burst';
      burst.style.transform = `translate3d(${cursor.x + 7}px,${cursor.y + 10}px,0)`;
      burst.style.color = cursor.color;
      const ring = document.createElement('span');
      ring.className = 'cursor-burst-ring';
      burst.append(ring);
      const particles = Array.from({ length: 10 }, (_, particleIndex) => {
        const particle = document.createElement('i');
        particle.className = 'cursor-fragment';
        particle.style.borderRadius = particleIndex % 3 === 0 ? '50%' : '1px';
        burst.append(particle);
        return particle;
      });
      layer.append(burst);
      bursts.push({ cursor, particles, ring, delay: index * 45 });
    });
  }

  function renderFinale() {
    bursts.forEach(({ cursor, particles, ring, delay }, index) => {
      const age = elapsed - finaleStarted - delay;
      const pop = Math.max(0, Math.min(age / 100, 1));
      cursor.element.style.opacity = age < 100 ? '1' : '0';
      cursor.element.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0) scale(${1 + pop * .25})`;
      const progress = Math.max(0, Math.min((age - 100) / 650, 1));
      ring.style.opacity = age >= 100 ? String((1 - progress) * .65) : '0';
      ring.style.transform = `translate(-50%,-50%) scale(${.2 + progress * 3})`;
      particles.forEach((particle, particleIndex) => {
        const angle = particleIndex / particles.length * Math.PI * 2 + index * .45;
        const distance = (32 + (particleIndex % 4) * 13) * (1 - (1 - progress) ** 2);
        particle.style.opacity = age >= 100 ? String(1 - progress) : '0';
        particle.style.transform = `translate3d(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance + progress ** 2 * 22}px,0) rotate(${progress * 220 + particleIndex * 36}deg) scale(${1 - progress * .7})`;
      });
    });
    if (elapsed - finaleStarted > (bursts.length - 1) * 45 + 800) cleanUp();
  }

  function advanceTour() {
    if (!tourEnabled) return;
    if (scrollTransition) {
      const progress = Math.min((elapsed - scrollTransition.started) / 800, 1);
      const ease = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: scrollTransition.from + (scrollTransition.to - scrollTransition.from) * ease, behavior: 'instant' });
      layoutDirty = true;
      if (progress === 1) { scrollTransition = null; phaseStarted = elapsed; cycleStart = elapsed - cycleDuration; assemblyPlanned = false; }
      return;
    }
    if (elapsed - phaseStarted < phaseDuration || assemblyJobs.some(job => !job.revealed || elapsed < job.start + job.duration + 420)) return;
    const nextStop = tourStops().find(stop => stop.y > scrollY + 90);
    if (nextStop) {
      scrollTransition = { from: scrollY, to: nextStop.y, started: elapsed };
    } else {
      finishBuild();
    }
  }

  // Secondary collaborators have their own timing, destinations, and selection frames.
  cursors.forEach((cursor, index) => {
    cursor.moveStarted = -10000;
    cursor.moveDuration = 950 + (index % 4) * 170;
    if ([1, 3, 6, 10, 14].includes(index)) {
      const frame = document.createElement('div');
      frame.className = 'collaborator-selection';
      frame.style.setProperty('--cursor-color', cursor.color);
      frame.innerHTML = '<span>' + cursor.name + '</span><i></i><i></i><i></i><i></i>';
      layer.prepend(frame);
      cursor.selection = frame;
    }
  });

  function labelFor(element) {
    if (element.matches('.hero-name')) return 'Brand / Wordmark';
    if (element.matches('.hero-portrait')) return 'Image / Portrait';
    if (element.matches('h1, h2')) return 'Type / ' + element.textContent.trim().replace(/\s+/g, ' ').slice(0, 30);
    if (element.matches('.project-image')) return 'Frame / Selected work';
    if (element.matches('.button')) return 'Component / Call to action';
    if (element.closest('.pipeline-flow')) return 'Frame / Data pipeline';
    return 'Frame / ' + (element.closest('section')?.id || 'Portfolio');
  }

  function measureVisible() {
    const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
    visibleTargets = targets.filter(element => {
      const bounds = element.getBoundingClientRect();
      boundsByTarget.set(element, bounds);
      return bounds.width > 30 && bounds.height > 12 && bounds.top >= headerBottom + 25 && bounds.bottom < innerHeight - 75 && bounds.right > 0 && bounds.left < innerWidth;
    });
    if (target) rect = boundsByTarget.get(target);
    if (rect) {
      selection.style.width = rect.width + 8 + 'px';
      selection.style.height = rect.height + 8 + 'px';
      selection.querySelector('.build-size').textContent = Math.round(rect.width) + ' × ' + Math.round(rect.height);
    }
    layoutDirty = false;
  }

  function beginCycle() {
    measureVisible();
    const candidates = visibleTargets.filter(element => element !== previousTarget);
    target = candidates[sequence % Math.max(candidates.length, 1)] || visibleTargets[0] || null;
    previousTarget = target;
    sequence++;
    cycleStart = elapsed;
    clicked = false;
    cursors[0].startX = cursors[0].x;
    cursors[0].startY = cursors[0].y;
    cursors[0].element.classList.remove('is-clicking');
    if (!target) { rect = null; return; }
    rect = boundsByTarget.get(target);
    selection.style.width = rect.width + 8 + 'px';
    selection.style.height = rect.height + 8 + 'px';
    selection.querySelector('.build-size').textContent = Math.round(rect.width) + ' × ' + Math.round(rect.height);
    selection.querySelector('.build-label').textContent = labelFor(target);
  }

  function tick(time) {
    if (disposed) return;
    frameId = 0;
    elapsed += lastTime ? Math.min(time - lastTime, 50) : 0;
    lastTime = time;
    advanceTour();
    if (finaleStarted !== null) {
      renderFinale();
      if (!disposed) frameId = requestAnimationFrame(tick);
      return;
    }
    assembleView();
    if (layoutDirty || elapsed - lastMeasure > 180) { measureVisible(); lastMeasure = elapsed; }
    if (elapsed - cycleStart >= cycleDuration || (target && !visibleTargets.includes(target))) beginCycle();
    const progress = Math.min((elapsed - cycleStart) / cycleDuration, 1);
    const traveling = Math.min(progress / .3, 1);
    const ease = 1 - Math.pow(1 - traveling, 3);
    const margin = innerWidth < 768 ? 65 : 95;
    cursors.forEach((cursor, index) => {
      const cursorLimit = cursorCount();
      if (index >= cursorLimit) { if (cursor.selection) cursor.selection.style.opacity = '0'; return; }
      if (index > 0 && (elapsed - cursor.moveStarted > cursor.moveDuration || !visibleTargets.includes(cursor.target))) {
        cursor.target = visibleTargets[(sequence + index + Math.floor(elapsed / cursor.moveDuration)) % Math.max(visibleTargets.length, 1)];
        cursor.startX = cursor.x;
        cursor.startY = cursor.y;
        cursor.moveStarted = elapsed;
        cursor.element.classList.remove('is-clicking');
        cursor.clicked = false;
      }
      const buildJob = tourEnabled && !scrollTransition && cursor.buildJob && elapsed - cursor.buildJob.start < cursor.buildJob.duration + 520 ? cursor.buildJob : null;
      const otherRect = buildJob ? boundsByTarget.get(buildJob.element) : index === 0 ? rect : boundsByTarget.get(cursor.target);
      const ownProgress = buildJob ? Math.min(1, (elapsed - buildJob.start) / buildJob.duration) : index === 0 ? progress : Math.min((elapsed - cursor.moveStarted) / cursor.moveDuration, 1);
      const ownTravel = buildJob ? ownProgress : index === 0 ? traveling : Math.min(ownProgress / .6, 1);
      const ownEase = buildJob ? 1 - (1 - ownTravel) ** 3 : index === 0 ? ease : 1 - (1 - ownTravel) ** 3;
      const fractionX = buildJob ? Math.max(0, Math.min(1, (elapsed - buildJob.start - buildJob.duration) / 420)) : index === 0 ? .78 : .12 + ((index * .237) % .73);
      const fractionY = buildJob ? .6 : index === 0 ? .8 : .15 + ((index * .193) % .65);
      const goalX = otherRect ? otherRect.left + otherRect.width * fractionX : innerWidth * (.12 + (index * .137) % .7);
      const goalY = otherRect ? otherRect.top + otherRect.height * fractionY : innerHeight * (.3 + (index * .173) % .5);
      const driftX = Math.sin(ownProgress * Math.PI * 2 + index) * (index === 0 ? 9 : 18);
      const driftY = Math.cos(ownProgress * Math.PI * 2 + index) * (index === 0 ? 5 : 12);
      cursor.x = Math.max(12, Math.min(innerWidth - margin, cursor.startX + (goalX - cursor.startX) * ownEase + driftX * ownTravel));
      cursor.y = Math.max(110, Math.min(innerHeight - 100, cursor.startY + (goalY - cursor.startY) * ownEase + driftY * ownTravel));
      cursor.element.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0)`;
      if (index > 0 && ownProgress > .6 && !cursor.clicked) { cursor.clicked = true; cursor.element.classList.add('is-clicking'); }
      if (cursor.selection) {
        cursor.selection.style.opacity = otherRect && ownProgress > .6 && ownProgress < .94 && !scrollTransition ? '.65' : '0';
        if (otherRect) {
          cursor.selection.style.width = otherRect.width + 4 + 'px';
          cursor.selection.style.height = otherRect.height + 4 + 'px';
          cursor.selection.style.transform = `translate3d(${otherRect.left - 2}px,${otherRect.top - 2}px,0)`;
        }
      }
    });
    const selected = rect && progress > .24 && progress < .89;
    selection.style.opacity = selected ? '1' : '0';
    guides.forEach(guide => { guide.style.opacity = selected && progress < .59 ? '.8' : '0'; });
    if (selected) {
      const settling = Math.max(0, 1 - (progress - .24) / .16);
      const offset = settling * 10;
      selection.style.transform = `translate3d(${rect.left - 4 - offset}px,${rect.top - 4 + offset}px,0)`;
      guides[0].style.transform = `translateY(${rect.top - 4}px)`;
      guides[1].style.transform = `translateX(${rect.left - 4}px)`;
      if (!clicked) {
        clicked = true;
        cursors[0].element.classList.add('is-clicking');
      }
    }
    frameId = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    if (disposed) return;
    if (motionPreference.matches) { cleanUp(); return; }
    const suspended = document.hidden || document.querySelector('dialog[open]') || document.querySelector('.header.menu-open');
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
    layer.classList.toggle('is-hidden', Boolean(suspended));
    document.documentElement.classList.toggle('build-paused', Boolean(suspended));
    if (!suspended) frameId = requestAnimationFrame(tick);
  }

  const options = { signal: lifecycle.signal };
  const passiveOptions = { passive: true, signal: lifecycle.signal };
  addEventListener('scroll', () => { layoutDirty = true; }, passiveOptions);
  addEventListener('resize', () => { layoutDirty = true; scrollTransition = null; phaseStarted = elapsed; assemblyPlanned = false; }, options);
  addEventListener('wheel', interruptTour, passiveOptions);
  addEventListener('touchstart', interruptTour, passiveOptions);
  addEventListener('pointerdown', interruptTour, passiveOptions);
  addEventListener('keydown', event => {
    if (['Escape', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Tab'].includes(event.key)) interruptTour();
  }, options);
  document.addEventListener('visibilitychange', syncPlayback, options);
  // Browsers may restore a completed page from their back/forward cache; never replay it.
  addEventListener('pagehide', cleanUp, options);
  motionPreference.addEventListener('change', syncPlayback, options);
  const dialogObserver = new MutationObserver(syncPlayback);
  dialogObserver.observe(document.querySelector('dialog'), { attributes: true, attributeFilter: ['open'] });
  const headerObserver = new MutationObserver(syncPlayback);
  headerObserver.observe(document.querySelector('.header'), { attributes: true, attributeFilter: ['class'] });
  if (!motionPreference.matches) resetConstruction();
  syncPlayback();
})();
