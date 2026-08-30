import htmx from 'htmx.org';

/**
 * Finds which link's content should currently be loaded based on the hash route and performs an htmx ajax to load that content
 */
export function reinitContent(
  linkSelectorBase = '.secondary-nav',
  target = '#main-content',
) {
  const snRouteParam = location.href.match(/\?sn=[a-zA-Z\-]*/);
  if (!snRouteParam) {
    return;
  }

  const loadedOldLink = loadLink(
    target,
    `${linkSelectorBase} a[hx-replace-url="${snRouteParam[0]}"]`,
  );
  if (loadedOldLink) {
    return;
  }

  loadLink(target, `${linkSelectorBase} a:first-child`);
}

function loadLink(target: string, selector: string): boolean {
  const link = document.querySelector<HTMLAnchorElement>(selector);
  if (!link) {
    return false;
  }

  htmx.ajax('GET', link.href, { target });

  return true;
}
