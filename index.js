(function(){
  const book = document.getElementById('book');
  const pages = Array.from(book.querySelectorAll('.page','.page3'));
  const dots = Array.from(book.querySelectorAll('.dot'));
  const LAST = pages.length - 1;
  const EASE = 'cubic-bezier(.22,.8,.24,1)';

  let current = 0;
  let animating = false;
  let tracking = false;
  let pointerId = null;
  let startX = 0, startY = 0;
  let lockedAxis = null; // 'h' or 'v' once determined
  let dragMode = null;   // 'forward' | 'backward' | 'resist-start' | 'resist-end'
  let activePage = null;

  function render(){
    pages.forEach((p, i) => {
      p.classList.remove('dragging');
      p.style.transition = '';
      p.style.zIndex = i === current ? 30 : (i < current ? i + 1 : (pages.length - i) + 10);
      if(i < current){
        p.classList.add('turned');
        p.style.transform = 'rotateY(-178deg)';
        p.style.setProperty('--shadow-op', 1);
      } else {
        p.classList.remove('turned');
        p.style.transform = 'rotateY(0deg)';
        p.style.setProperty('--shadow-op', 0);
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Programmatic navigation (dots / arrow keys): forward folds the CURRENT
  // page away to the left; backward un-folds the PREVIOUS page back from
  // the left — the correct mirror motion for "going back".
  function flipTo(target){
    if(animating || target === current || target < 0 || target > LAST) return;
    animating = true;
    const forward = target > current;

    if(forward){
      const page = pages[current];
      page.style.zIndex = 35;
      page.style.transition = `transform .44s ${EASE}`;
      page.style.transform = 'rotateY(-180deg)';
      page.style.setProperty('--shadow-op', '1');
      setTimeout(() => { current = target; animating = false; render(); }, 450);
    } else {
      const page = pages[target];
      page.style.zIndex = 35;
      page.style.transition = 'none';
      page.style.transform = 'rotateY(-180deg)';
      page.style.setProperty('--shadow-op', '1');
      void page.offsetWidth; // force reflow so the start angle sticks
      requestAnimationFrame(() => {
        page.style.transition = `transform .44s ${EASE}`;
        page.style.transform = 'rotateY(0deg)';
        page.style.setProperty('--shadow-op', '0');
      });
      setTimeout(() => { current = target; animating = false; render(); }, 460);
    }
  }

  dots.forEach(d => d.addEventListener('click', () => flipTo(Number(d.dataset.goto))));

  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') flipTo(current + 1);
    if(e.key === 'ArrowLeft') flipTo(current - 1);
  });

  function cleanupDrag(){
    tracking = false;
    pointerId = null;
    lockedAxis = null;
    dragMode = null;
    activePage = null;
  }

  // Decide, on the first meaningful horizontal move, which physical page
  // element to drag and how — mirrors flipTo()'s logic so a drag and a
  // programmatic flip always look identical.
  function beginDragMode(dx){
    if(dx < 0){
      if(current < LAST){ dragMode = 'forward'; activePage = pages[current]; }
      else { dragMode = 'resist-end'; activePage = pages[current]; }
      activePage.style.zIndex = 35;
    } else {
      if(current > 0){
        dragMode = 'backward';
        activePage = pages[current - 1];
        activePage.style.zIndex = 35;
        activePage.style.transition = 'none';
        activePage.style.transform = 'rotateY(-180deg)';
        activePage.style.setProperty('--shadow-op', '1');
      } else {
        dragMode = 'resist-start';
        activePage = pages[current];
        activePage.style.zIndex = 35;
      }
    }
    activePage.classList.add('dragging');
  }

  function onPointerDown(e){
    if(animating) return;
    if(e.target.closest('.no-flip')) return;
    if(e.pointerType === 'mouse' && e.button !== 0) return;

    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    lockedAxis = null;
    dragMode = null;
    activePage = null;
    try{ book.setPointerCapture(pointerId); }catch(err){}
    tracking = true;
  }

  function onPointerMove(e){
    if(!tracking || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if(lockedAxis === null){
      if(Math.abs(dx) > 6 || Math.abs(dy) > 6){
        lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        if(lockedAxis === 'h') beginDragMode(dx);
      } else {
        return;
      }
    }
    if(lockedAxis !== 'h' || !activePage) return;

    e.preventDefault();
    const maxDrag = Math.max(120, book.clientWidth * 0.85);

    if(dragMode === 'forward'){
      const ratio = Math.max(-1, Math.min(0, dx / maxDrag));
      activePage.style.transform = `rotateY(${ratio * 180}deg)`;
      activePage.style.setProperty('--shadow-op', Math.min(1, Math.abs(ratio) * 1.5));
    } else if(dragMode === 'backward'){
      const ratio = Math.max(0, Math.min(1, dx / maxDrag));
      activePage.style.transform = `rotateY(${-180 + ratio * 180}deg)`;
      activePage.style.setProperty('--shadow-op', Math.max(0, 1 - ratio * 1.3));
    } else if(dragMode === 'resist-end'){
      const ratio = Math.max(-1, Math.min(0, (dx / maxDrag) * 0.32));
      activePage.style.transform = `rotateY(${ratio * 180}deg)`;
    } else if(dragMode === 'resist-start'){
      const ratio = Math.max(0, Math.min(1, (dx / maxDrag) * 0.32));
      activePage.style.transform = `rotateY(${ratio * 180}deg)`;
    }
  }

  function finishAt(page, finalTransform, finalShadow, targetCurrent){
    animating = true;
    page.style.transition = `transform .38s ${EASE}`;
    page.style.transform = finalTransform;
    page.style.setProperty('--shadow-op', String(finalShadow));
    setTimeout(() => {
      if(targetCurrent !== null) current = targetCurrent;
      animating = false;
      render();
      cleanupDrag();
    }, 390);
  }

  function onPointerUp(e){
    if(!tracking || e.pointerId !== pointerId) return;
    tracking = false;
    if(lockedAxis !== 'h' || !activePage){ cleanupDrag(); return; }

    const dx = e.clientX - startX;
    const threshold = 55;
    const page = activePage;

    if(dragMode === 'forward'){
      if(Math.abs(dx) >= threshold) finishAt(page, 'rotateY(-180deg)', 1, current + 1);
      else finishAt(page, 'rotateY(0deg)', 0, null);
    } else if(dragMode === 'backward'){
      if(dx >= threshold) finishAt(page, 'rotateY(0deg)', 0, current - 1);
      else finishAt(page, 'rotateY(-180deg)', 1, null);
    } else {
      finishAt(page, 'rotateY(0deg)', 0, null);
    }
  }

  function onPointerCancel(){
    if(!activePage){ cleanupDrag(); return; }
    const page = activePage;
    if(dragMode === 'backward') finishAt(page, 'rotateY(-180deg)', 1, null);
    else finishAt(page, 'rotateY(0deg)', 0, null);
  }

  book.addEventListener('pointerdown', onPointerDown);
  book.addEventListener('pointermove', onPointerMove, { passive:false });
  book.addEventListener('pointerup', onPointerUp);
  book.addEventListener('pointercancel', onPointerCancel);

  // Interactive menu accordion (page 3)
  const menuItems = document.querySelectorAll('.menu-item');
  const panels = document.querySelectorAll('.panel');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const key = item.dataset.panel;
      const panel = document.getElementById('panel-' + key);
      const wasOpen = panel.classList.contains('open');
      panels.forEach(p => p.classList.remove('open'));
      menuItems.forEach(m => m.classList.remove('active'));
      if(!wasOpen){
        panel.classList.add('open');
        item.classList.add('active');
      }
    });
  });

  render();
})();