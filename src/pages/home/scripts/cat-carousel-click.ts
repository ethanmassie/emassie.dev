const ANIMATION_MS = 500;
const DELAY_MS = 50;

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
    const pxStr = (v: unknown) => `${v}px`;
    clone.style.position = 'absolute';
    clone.style.top = pxStr(rect.top);
    clone.style.left = pxStr(rect.left);
    clone.style.height = pxStr(rect.height);
    clone.style.width = pxStr(rect.width);
    clone.style.transition = `all ease-in-out ${ANIMATION_MS}ms`;

    const backdrop = document.createElement('div');
    backdrop.classList.add('cat-img-backdrop');

    const cleanup = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      html.removeEventListener('keydown', cleanupOnEsc);
      backdrop.remove();
      clone.classList.remove('cat-img-clone');
      // wait for animation to finish
      setTimeout(() => {
        clone.remove();
        document.body.inert = false;
      }, ANIMATION_MS);
    };
    backdrop.addEventListener('click', cleanup);

    const cleanupOnEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return;
      }

      cleanup(e);
    };

    html.append(clone, backdrop);
    html.addEventListener('keydown', cleanupOnEsc);
    document.body.inert = true;

    // delay style changes to ensure transitions occur
    setTimeout(() => {
      clone.classList.add('cat-img-clone');
    }, DELAY_MS);

    // determine what the auto width was calculated and set it as a custom property so the transition out can animate the width shrinking
    setTimeout(
      () => {
        clone.style.setProperty('--_auto-width', pxStr(clone.clientWidth));
      },
      ANIMATION_MS + DELAY_MS + DELAY_MS,
    );
  });
})();
