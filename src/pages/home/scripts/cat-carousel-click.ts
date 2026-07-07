const ANIMATION_MS = 500;
const DELAY_MS = 10;
const pxStr = (v: unknown) => `${v}px`;

(() => {
  const html = document.querySelector('html');
  if (!html || !(html instanceof Element)) {
    return;
  }
  const catCarousel = document.getElementById('cat-carousel');
  if (!catCarousel || !(catCarousel instanceof HTMLElement)) {
    return;
  }

  catCarousel.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement)) {
      return;
    }
    const rect = t.getBoundingClientRect();
    const clone = t.cloneNode() as HTMLImageElement;
    clone.style.position = 'absolute';
    clone.style.top = pxStr(rect.top);
    clone.style.left = pxStr(rect.left);
    clone.style.height = pxStr(rect.height);
    clone.style.width = pxStr(rect.width);
    clone.style.transition = `all ease-in-out ${ANIMATION_MS}ms`;

    const backdrop = document.createElement('div');
    backdrop.classList.add('cat-img-backdrop');

    const cleanup = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      html.removeEventListener('keydown', cleanup);
      backdrop.removeEventListener('click', cleanup);
      backdrop.remove();
      clone.classList.remove('cat-img-clone');
      // wait for animation to finish
      setTimeout(() => {
        clone.remove();
        document.body.inert = false;
      }, ANIMATION_MS);
    };

    html.append(clone, backdrop);
    document.body.inert = true;

    // delay style changes to ensure transitions occur
    setTimeout(() => {
      clone.classList.add('cat-img-clone');
    }, DELAY_MS);

    // determine what the auto width was calculated to be and set it as a custom property so the transition out can animate the width shrinking
    setTimeout(() => {
      clone.style.setProperty('--_auto-width', pxStr(clone.clientWidth));
      backdrop.addEventListener('click', cleanup);
      html.addEventListener('keydown', cleanup);
    }, ANIMATION_MS + DELAY_MS);
  });
})();
