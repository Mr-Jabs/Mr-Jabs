(() => {
  // Direct links and reduced motion take visitors straight to the content.
  if (location.hash && location.hash !== '#home') return;
  function startCanvas() {
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
    const layer = document.createElement('div');
    layer.className = 'live-canvas';
    layer.setAttribute('aria-hidden', 'true');
    const arrow = '<svg class="cursor-arrow" viewBox="0 0 22 27"><path d="M2 2 19 14 11 15 7 23Z" fill="currentColor" stroke="var(--aubergine)" stroke-width="1.4" stroke-linejoin="round"/></svg>';
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
    ].map((data, index) => {
      const element = document.createElement('div');
      element.className = 'build-cursor';
      if (index >= 3) element.classList.add('over-mobile');
      if (index >= 5) element.classList.add('over-tablet');
      element.style.setProperty('--cursor-color', data.color);
      element.style.setProperty('--cursor-label', data.color === 'var(--cursor-silver)' ? 'var(--silver)' : 'var(--aubergine)');
      const openHand = '<svg class="cursor-hand cursor-hand-open" viewBox="0 0 28 30" fill="currentColor" stroke="var(--aubergine)" stroke-width="1.3" stroke-linejoin="round"><path d="M7 15V7a2 2 0 0 1 4 0V3a2 2 0 0 1 4 0v4a2 2 0 0 1 4 0v3a2 2 0 0 1 4 0v9c0 5-3 8-8 8h-2c-3 0-5-2-7-5l-4-6a2 2 0 0 1 3-2l3 3"/></svg>';
      const closedHand = '<svg class="cursor-hand cursor-hand-closed" viewBox="0 0 28 30" fill="currentColor" stroke="var(--aubergine)" stroke-width="1.3" stroke-linejoin="round"><path d="M7 14V10a2 2 0 0 1 4 0V8a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v7c0 5-3 8-8 8h-2c-3 0-5-2-7-5l-3-5a2 2 0 0 1 3-2l3 3"/><path d="M11 11v4m4-4v4m4-2v3" fill="none"/></svg>';
      element.innerHTML = arrow + openHand + closedHand + '<span>' + data.name + '</span>';
      layer.append(element);
      const start = { x: innerWidth * data.x, y: innerHeight * data.y };
      const trails = Array.from({ length: 2 }, () => {
        const trail = document.createElement('i');
        trail.className = 'cursor-tail';
        trail.style.setProperty('--cursor-color', data.color);
        layer.append(trail);
        return trail;
      });
      return { ...data, element, ...start, trails, trailPositions: [start, start] };
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
    layer.dataset.mode = 'guided';
    const pieceSelectors = [
      '.hero-top, .hero-name, .hero-portrait, .hero-copy > *, .hero-stats > *, .hero-bottom > *',
      '.section-kicker, .section-heading > *, .filters, .project-card, .timeline',
      '.awards-intro > *, .awards-list > .list-label, .awards-list > .credentials-note, .credential-heading, .certificate-preview, .credential-proof > div, .credential-resume',
      '.pipeline-intro > *, .pipeline-flow > div',
      '.section-kicker, .section-heading > *, .column-title, .skill-line, .tool-list, .process-list > li, blockquote, .education-strip',
      '.journey > div:first-child > *, .journey-list > div',
      '.section-kicker, .contact-grid > div:first-child > *, .contact-links > *, .contact-reel'
    ];
    const targets = [...document.querySelectorAll('main > section')].flatMap((section, index) => [...section.querySelectorAll(pieceSelectors[index])]);
    const activityTargets = targets;
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
    const placementSettle = 420; // Match the source element's canvas-create animation.
    const scrollDuration = 650;
    let assemblyJobs = [];
    let assemblyPlanned = false;
    const cursorCount = () => innerWidth < 768 ? 3 : innerWidth < 1024 ? 5 : 9;

    function resetConstruction() {
      document.documentElement.classList.add('live-construction');
      targets.forEach(element => { element.dataset.buildState = 'pending'; element.classList.remove('canvas-placing'); });
      assemblyJobs = [];
      assemblyPlanned = false;
    }

    function revealEverything(soft = false) {
      document.documentElement.classList.remove('live-construction');
      targets.forEach(element => { element.dataset.buildState = 'built'; element.classList.remove('canvas-placing'); });
      assemblyJobs.forEach(job => removeCarry(job, soft));
      assemblyJobs = [];
      assemblyPlanned = false;
      cursors.forEach(cursor => { cursor.buildJob = null; });
    }

    function planAssembly() {
      assemblyJobs.forEach(job => removeCarry(job));
      cursors.forEach(cursor => { cursor.buildJob = null; });
      const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
      const pieces = targets.filter(element => {
        const box = element.getBoundingClientRect();
        return element.dataset.buildState === 'pending' && box.width > 0 && box.height > 0 && box.bottom > headerBottom + 10 && box.top < innerHeight - 70;
      });
      // A short empty-canvas beat, then each collaborator draws a real piece at their cursor.
      assemblyJobs = pieces.map((element, index) => ({ element, cursor: index % cursorCount(), start: phaseStarted + 350 + Math.floor(index / cursorCount()) * 1100 + (index % cursorCount()) * 70, duration: 650, revealed: false, assigned: false }));
      assemblyPlanned = true;
      layer.dataset.assembly = 'blank';
      layoutDirty = true;
    }

    function removeCarry(job, soft = false) {
      [job.ghost, job.slot].filter(Boolean).forEach(element => {
        if (soft) {
          const fade = element.animate([{ opacity: getComputedStyle(element).opacity }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
          fade.finished.then(() => element.remove(), () => element.remove());
        } else element.remove();
      });
      job.ghost = null;
      job.slot = null;
    }

    function prepareCarry(job, cursor) {
      const box = job.element.getBoundingClientRect();
      const dx = Math.min(55, Math.max(24, box.width * .08)) * (job.cursor % 2 ? 1 : -1);
      const dy = -26 - (job.cursor % 3) * 7;
      job.box = box;
      job.offset = { x: dx, y: dy };
      job.anchor = { x: Math.min(18, box.width / 2), y: Math.min(14, box.height / 2) };
      job.pointerStart = { x: cursor.x, y: cursor.y };
      const ghost = document.createElement('div');
      ghost.className = 'carried-element';
      ghost.dataset.owner = cursor.name;
      ghost.style.setProperty('--cursor-color', cursor.color);
      ghost.style.width = box.width + 'px';
      ghost.style.height = box.height + 'px';
      const copy = job.element.cloneNode(true);
      copy.removeAttribute('id');
      copy.removeAttribute('data-build-state');
      copy.classList.remove('build-piece', 'scroll-reveal', 'is-active');
      copy.classList.add('carried-copy');
      copy.inert = true;
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      copy.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      // Preserve typography that normally comes from a parent selector, e.g. `.hero h1`.
      const sourceNodes = [job.element, ...job.element.querySelectorAll('*')];
      const copyNodes = [copy, ...copy.querySelectorAll('*')];
      sourceNodes.forEach((source, index) => {
        const style = getComputedStyle(source);
        for (const property of ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform', 'text-decoration-line', 'text-decoration-color', 'text-decoration-thickness', 'color']) {
          copyNodes[index].style.setProperty(property, style.getPropertyValue(property));
        }
      });
      copy.style.setProperty('position', 'relative', 'important');
      for (const property of ['top', 'right', 'bottom', 'left']) copy.style.setProperty(property, 'auto', 'important');
      for (const [property, value] of Object.entries({ width: box.width + 'px', height: box.height + 'px', margin: '0', opacity: '1', visibility: 'visible', transform: 'none', translate: 'none', animation: 'none' })) copy.style.setProperty(property, value, 'important');
      ghost.append(copy);
      const slot = document.createElement('div');
      slot.className = 'element-slot';
      slot.style.setProperty('--cursor-color', cursor.color);
      slot.style.width = box.width + 'px';
      slot.style.height = box.height + 'px';
      slot.style.transform = `translate3d(${box.left}px,${box.top}px,0)`;
      const label = document.createElement('span');
      label.textContent = labelFor(job.element);
      slot.append(label);
      layer.prepend(slot, ghost);
      job.ghost = ghost;
      job.slot = slot;
      cursor.element.classList.remove('is-clicking', 'is-dropping');
    }

    function carryPose(job) {
      const age = elapsed - job.start;
      const dragging = Math.max(0, Math.min((age - 270) / 380, 1));
      const ease = 1 - (1 - dragging) ** 3;
      return { age, x: job.box.left + job.offset.x * (1 - ease), y: job.box.top + job.offset.y * (1 - ease), dragging };
    }

    function renderCarry(job) {
      if (!job.ghost) return;
      const pose = carryPose(job);
      const dropping = Math.max(0, Math.min((pose.age - job.duration) / 160, 1));
      job.ghost.style.transform = `translate3d(${pose.x}px,${pose.y}px,0) rotate(${Math.sin(pose.dragging * Math.PI) * .7}deg)`;
      job.ghost.style.opacity = String(Math.min(pose.age / 100, 1) * (1 - dropping) * .94);
      job.ghost.classList.toggle('is-carried', pose.age >= 180 && pose.age < job.duration);
      job.slot.style.opacity = pose.age < job.duration ? '.6' : String(Math.max(0, 1 - (pose.age - job.duration) / 320));
      if (pose.age > job.duration + 340) removeCarry(job);
    }

    function assembleView() {
      if (!tourEnabled || scrollTransition) return;
      if (!assemblyPlanned) planAssembly();
      assemblyJobs.forEach(job => {
        if (elapsed < job.start) return;
        const cursor = cursors[job.cursor];
        if (!job.assigned) {
          job.assigned = true;
          cursor.buildJob = job;
          prepareCarry(job, cursor);
        }
        renderCarry(job);
        if (!job.revealed && elapsed >= job.start + job.duration) {
          job.revealed = true;
          job.element.dataset.buildState = 'drawing';
          cursor.element.classList.add('is-dropping');
          job.element.addEventListener('animationend', event => {
            if (event.animationName === 'canvas-create' && job.element.dataset.buildState === 'drawing') job.element.dataset.buildState = 'built';
          }, { once: true, signal: lifecycle.signal });
        }
      });
      const remaining = assemblyJobs.filter(job => !job.revealed).length;
      layer.dataset.assembly = remaining === 0 ? 'complete' : elapsed - phaseStarted < 350 ? 'blank' : 'building';
    }

    // Short viewports get multiple stops; advanceTour skips stops with no unbuilt pieces.
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
      document.documentElement.classList.remove('build-finishing');
      targets.forEach(element => {
        delete element.dataset.handoff;
        ['--handoff-delay', '--handoff-opacity', '--handoff-offset'].forEach(property => element.style.removeProperty(property));
      });
      layer.remove();
      lifecycle.abort();
      dialogObserver.disconnect();
      headerObserver.disconnect();
    }

    function interruptTour() {
      if (motionPreference.matches) cleanUp();
      else finishBuild(true);
    }

    function finishBuild(handoff = false) {
      if (disposed || finaleStarted !== null) return;
      tourEnabled = false;
      scrollTransition = null;
      if (handoff) {
        document.documentElement.classList.add('build-finishing');
        let order = 0;
        targets.forEach(element => {
          const box = element.getBoundingClientRect();
          if (box.bottom <= 0 || box.top >= innerHeight || !box.width || !box.height) return;
          element.closest('.scroll-reveal')?.classList.add('is-revealed');
          if (element.dataset.buildState === 'built') return;
          element.style.setProperty('--handoff-opacity', getComputedStyle(element).opacity);
          element.style.setProperty('--handoff-offset', element.dataset.buildState === 'pending' ? '10px' : '0px');
          element.dataset.handoff = 'true';
          element.style.setProperty('--handoff-delay', `${Math.min(order++ * 30, 180)}ms`);
        });
      }
      document.documentElement.classList.add('build-finished');
      revealEverything(handoff);
      finaleStarted = elapsed;
      layer.dataset.state = 'bursting';
      selection.remove();
      cursors.forEach(cursor => cursor.trails.forEach(trail => trail.remove()));
      guides.forEach(guide => guide.remove());
      layer.querySelectorAll('.collaborator-selection').forEach(frame => frame.remove());
      cursors.slice(0, cursorCount()).forEach((cursor, index) => {
        cursor.exitOpacity = Number(getComputedStyle(cursor.element).opacity);
        cursor.softExit = handoff;
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
        cursor.element.style.opacity = String(age < 100 ? cursor.exitOpacity * (cursor.softExit ? 1 - pop : 1) : 0);
        cursor.element.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0) scale(${1 + pop * (cursor.softExit ? 0 : .25)})`;
        const progress = Math.max(0, Math.min((age - 100) / 650, 1));
        ring.style.opacity = age >= 100 ? String((1 - progress) * .65) : '0';
        ring.style.transform = `translate(-50%,-50%) scale(${.2 + progress * 3})`;
        particles.forEach((particle, particleIndex) => {
          const angle = particleIndex / particles.length * Math.PI * 2 + index * .45;
          const distance = (cursor.softExit ? 12 + particleIndex % 4 * 5 : 32 + particleIndex % 4 * 13) * (1 - (1 - progress) ** 2);
          particle.style.opacity = age >= 100 ? String(1 - progress) : '0';
          particle.style.transform = `translate3d(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance + progress ** 2 * 22}px,0) rotate(${progress * 220 + particleIndex * 36}deg) scale(${1 - progress * .7})`;
        });
      });
      if (elapsed - finaleStarted > (bursts.length - 1) * 45 + 800) cleanUp();
    }

    function advanceTour() {
      if (!tourEnabled) return;
      if (scrollTransition) {
        const progress = Math.min((elapsed - scrollTransition.started) / scrollDuration, 1);
        const ease = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
        window.scrollTo({ top: scrollTransition.from + (scrollTransition.to - scrollTransition.from) * ease, behavior: 'instant' });
        layoutDirty = true;
        if (progress === 1) { scrollTransition = null; phaseStarted = elapsed; cycleStart = elapsed - cycleDuration; assemblyPlanned = false; }
        return;
      }
      // Leave as soon as the final placement settles, rather than holding every view
      // for a fixed duration. Never advance before the current view has been planned.
      if (!assemblyPlanned || assemblyJobs.some(job => !job.revealed || elapsed < job.start + job.duration + placementSettle)) return;
      const headerHeight = document.querySelector('.header').offsetHeight;
      const pendingBounds = targets.filter(element => element.dataset.buildState === 'pending').map(element => {
        const box = element.getBoundingClientRect();
        return { top: box.top + scrollY, bottom: box.bottom + scrollY, visible: box.width > 0 && box.height > 0 };
      });
      const nextStop = tourStops().find(stop => stop.y > scrollY + 2 && pendingBounds.some(box =>
        box.visible && box.bottom > stop.y + headerHeight + 10 && box.top < stop.y + innerHeight - 70));
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
      visibleTargets = activityTargets.filter(element => {
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
      // Use active wall time so a slow frame cannot stretch every phase. Playback
      // resets lastTime when a tab is hidden or a dialog pauses the animation.
      elapsed += lastTime ? Math.max(0, time - lastTime) : 0;
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
        if (index >= cursorLimit) { cursor.trails.forEach(trail => { trail.style.opacity = '0'; }); if (cursor.selection) cursor.selection.style.opacity = '0'; return; }
        if (index > 0 && (elapsed - cursor.moveStarted > cursor.moveDuration || !visibleTargets.includes(cursor.target))) {
          cursor.target = visibleTargets[(sequence + index + Math.floor(elapsed / cursor.moveDuration)) % Math.max(visibleTargets.length, 1)];
          cursor.startX = cursor.x;
          cursor.startY = cursor.y;
          cursor.moveStarted = elapsed;
          cursor.element.classList.remove('is-clicking');
          cursor.clicked = false;
        }
        const buildJob = tourEnabled && !scrollTransition && cursor.buildJob && elapsed - cursor.buildJob.start < cursor.buildJob.duration + 360 ? cursor.buildJob : null;
        const otherRect = buildJob ? boundsByTarget.get(buildJob.element) : index === 0 ? rect : boundsByTarget.get(cursor.target);
        const ownProgress = buildJob ? Math.min(1, (elapsed - buildJob.start) / buildJob.duration) : index === 0 ? progress : Math.min((elapsed - cursor.moveStarted) / cursor.moveDuration, 1);
        const ownTravel = buildJob ? ownProgress : index === 0 ? traveling : Math.min(ownProgress / .6, 1);
        const ownEase = buildJob ? 1 - (1 - ownTravel) ** 3 : index === 0 ? ease : 1 - (1 - ownTravel) ** 3;
        const fractionX = buildJob ? Math.max(0, Math.min(1, (elapsed - buildJob.start - buildJob.duration) / 420)) : index === 0 ? .78 : .12 + ((index * .237) % .73);
        const fractionY = buildJob ? .6 : index === 0 ? .8 : .15 + ((index * .193) % .65);
        let goalX = otherRect ? otherRect.left + otherRect.width * fractionX : innerWidth * (.12 + (index * .137) % .7);
        let goalY = otherRect ? otherRect.top + otherRect.height * fractionY : innerHeight * (.3 + (index * .173) % .5);
        const driftX = Math.sin(ownProgress * Math.PI * 2 + index) * (index === 0 ? 9 : 18);
        const driftY = Math.cos(ownProgress * Math.PI * 2 + index) * (index === 0 ? 5 : 12);
        cursor.x = Math.max(12, Math.min(innerWidth - margin, cursor.startX + (goalX - cursor.startX) * ownEase + driftX * ownTravel));
        cursor.y = Math.max(110, Math.min(innerHeight - 100, cursor.startY + (goalY - cursor.startY) * ownEase + driftY * ownTravel));
        if (buildJob && buildJob.box) {
          const pose = carryPose(buildJob);
          const destination = { x: pose.x + buildJob.anchor.x, y: pose.y + buildJob.anchor.y };
          const approach = Math.min(pose.age / 180, 1);
          const easeIn = 1 - (1 - approach) ** 3;
          cursor.x = buildJob.pointerStart.x + (destination.x - buildJob.pointerStart.x) * easeIn;
          cursor.y = buildJob.pointerStart.y + (destination.y - buildJob.pointerStart.y) * easeIn;
          const action = pose.age < 180 ? 'approach' : pose.age < 270 ? 'grab' : pose.age < buildJob.duration ? 'carry' : 'release';
          cursor.element.dataset.action = action;
          cursor.element.dataset.actionLabel = { approach: 'PICK UP', grab: 'GRABBED', carry: 'PLACING', release: 'PLACED' }[action];
          cursor.element.style.opacity = '1';
        } else {
          cursor.element.dataset.action = 'idle';
          cursor.element.dataset.actionLabel = '';
          cursor.element.style.opacity = '.45';
          cursor.element.classList.remove('is-dropping');
        }
        cursor.element.style.transform = `translate3d(${cursor.x}px,${cursor.y}px,0)`;
        if (!buildJob && index > 0 && ownProgress > .6 && !cursor.clicked) { cursor.clicked = true; cursor.element.classList.add('is-clicking'); }
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
      const suspended = document.hidden || (finaleStarted === null && (document.querySelector('dialog[open]') || document.querySelector('.header.menu-open')));
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
    if (!motionPreference.matches) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      resetConstruction();
    }
    syncPlayback();
  }
  startCanvas();
})();
