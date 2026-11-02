const preparePixelHeadings = () => {
  for (const heading of document.querySelectorAll<HTMLElement>('#main-content h1, #main-content h2, #main-content h3')) {
    if (heading.classList.contains('pixel-heading')) continue;

    const label = heading.textContent?.replace(/\s+/g, ' ').trim();
    if (!label) continue;

    const original = document.createElement('span');
    original.className = 'heading-base';
    while (heading.firstChild) original.append(heading.firstChild);

    const pixel = document.createElement('span');
    pixel.className = 'heading-pixel';
    pixel.textContent = label;
    pixel.setAttribute('aria-hidden', 'true');

    heading.append(original, pixel);
    heading.classList.add('pixel-heading');
  }
};

document.addEventListener('astro:page-load', preparePixelHeadings);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preparePixelHeadings, { once: true });
} else {
  preparePixelHeadings();
}
