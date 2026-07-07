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
    // delay style changes to ensure transitions occur
    setTimeout(() => {
      clone.classList.add('cat-img-clone');
    }, 50);

    const backdrop = document.createElement('div');
    backdrop.classList.add('cat-img-backdrop');
    backdrop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      clone.remove();
      backdrop.remove();
      document.body.inert = false;
    });

    document.querySelector('html')?.append(clone, backdrop);
    document.body.inert = true;
  });
})();
