import htmx from 'htmx.org';

/**
 * Finds which link's content should currently be loaded based on the hash route and performs an htmx ajax to load that content
 */
export function reinitContent(
  linkSelectorBase = '.secondary-nav',
  target = '#main-content',
) {
  const snRouteParam = location.href.match(/\?sn=[a-zA-Z\-]*/);
  console.log(snRouteParam);
  if (!snRouteParam) {
    return;
  }
  console.log(`${linkSelectorBase} a[hx-replace-url="${snRouteParam[0]}"]`);
  const link = document.querySelector<HTMLAnchorElement>(
    `${linkSelectorBase} a[hx-replace-url="${snRouteParam[0]}"]`,
  );
  console.log(link);
  if (!link) {
    return;
  }

  htmx.ajax('GET', link.href, { target });
}
