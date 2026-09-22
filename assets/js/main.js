/* hugo-swipefolio – single entry point: sidebar menu + nested gallery */

const SITE_TITLE = document.body.dataset.siteTitle || document.title;
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggle = document.getElementById('menuToggle');
const menuLinks = Array.from(document.querySelectorAll('.menu a'));

/* ------------------------------------------------------------------ */
/* Sidebar                                                            */
/* ------------------------------------------------------------------ */

function setMenuOpen(open) {
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
}

menuToggle.addEventListener('click', () => setMenuOpen(!sidebar.classList.contains('open')));
overlay.addEventListener('click', () => setMenuOpen(false));
window.matchMedia('(min-width: 993px)').addEventListener('change', (e) => {
  if (e.matches) setMenuOpen(false);
});

function setActiveLink(path) {
  menuLinks.forEach((a) => {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
  const link = menuLinks.find((a) => a.getAttribute('href') === path);
  if (!link) return;
  link.classList.add('active');
  link.setAttribute('aria-current', 'page');
  // A project link also highlights its section link.
  const sectionLink = link.closest('.menu > li')?.querySelector(':scope > a');
  if (sectionLink && sectionLink !== link) sectionLink.classList.add('active');
}

setActiveLink(window.location.pathname);

/* ------------------------------------------------------------------ */
/* Media loading                                                       */
/* ------------------------------------------------------------------ */

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:[?#].*)?$/i;
const LOAD_TIMEOUT = 15000;

function createMediaElement(src, alt) {
  if (VIDEO_EXT.test(src)) {
    const video = document.createElement('video');
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    // Fragment forces iOS Safari to render the first frame instead of a blank box.
    video.src = src.includes('#') ? src : `${src}#t=0.001`;
    return video;
  }
  const img = document.createElement('img');
  img.alt = alt || '';
  img.decoding = 'async';
  img.src = src;
  return img;
}

function loadSlide(slide) {
  const state = slide.dataset.state;
  if (state === 'loaded' || state === 'loading') return;
  const src = slide.dataset.src;
  const placeholder = slide.querySelector('.media-placeholder');
  if (!src || !placeholder) return;

  slide.dataset.state = 'loading';
  placeholder.textContent = 'Loading…';
  placeholder.classList.remove('error');

  const media = createMediaElement(src, slide.dataset.alt);
  const readyEvent = media.tagName === 'VIDEO' ? 'loadedmetadata' : 'load';
  let timer;

  const onReady = () => {
    clearTimeout(timer);
    placeholder.replaceWith(media);
    slide.dataset.state = 'loaded';
  };
  const onError = () => {
    clearTimeout(timer);
    media.removeAttribute('src');
    placeholder.textContent = 'Failed to load media';
    placeholder.classList.add('error');
    slide.dataset.state = 'error'; // retried next time the slide becomes active
  };

  media.addEventListener(readyEvent, onReady, { once: true });
  media.addEventListener('error', onError, { once: true });
  timer = setTimeout(onError, LOAD_TIMEOUT);
}

/** Load the active slide and its direct neighbours (no wrap-around: loop mode is off). */
function preloadAround(swiper, index) {
  const slides = swiper.slides;
  [index, index + 1, index - 1]
    .filter((i) => i >= 0 && i < slides.length)
    .forEach((i) => loadSlide(slides[i]));
}

function pauseVideos(root) {
  root.querySelectorAll('video').forEach((v) => v.pause());
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

function initGallery(outerEl) {
  const outerSlides = Array.from(outerEl.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide'));
  const hrefs = outerSlides.map((s) => s.dataset.href);
  const infos = Array.from(document.querySelectorAll('.project-info'));
  // Description panel starts open on desktop, collapsed on phones where it would cover the image.
  let infoOpen = !window.matchMedia('(max-width: 992px)').matches;
  let lastOuterMove = 0;
  let lastInnerChange = 0;

  const inners = outerSlides.map(
    (slideEl) =>
      new Swiper(slideEl.querySelector('.innerSwiper'), {
        nested: true,
        spaceBetween: 50,
        mousewheel: true,
        keyboard: { enabled: true },
        pagination: {
          el: slideEl.querySelector('.innerSwiper > .swiper-pagination'),
          clickable: true,
        },
        observer: true,
        observeParents: true,
      })
  );

  const outer = new Swiper(outerEl, {
    direction: 'vertical',
    spaceBetween: 50,
    keyboard: { enabled: true },
    pagination: {
      el: outerEl.querySelector(':scope > .swiper-pagination'),
      clickable: true,
    },
    observer: true,
    observeParents: true,
  });

  /* Project info panel: one node per project, only the current one is shown. */
  function showInfo(index) {
    infos.forEach((info, i) => {
      info.hidden = i !== index;
      info.classList.toggle('open', i === index && infoOpen);
      info.querySelector('.project-title').setAttribute('aria-expanded', String(i === index && infoOpen));
    });
  }
  function toggleInfo(open) {
    infoOpen = open;
    showInfo(outer.activeIndex);
  }
  infos.forEach((info) => {
    info.querySelector('.project-title').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInfo(!infoOpen);
    });
    info.querySelector('.close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleInfo(false);
    });
    info.querySelector('.project-details').addEventListener('click', (e) => e.stopPropagation());
  });
  document.addEventListener('click', (e) => {
    if (infoOpen && !e.target.closest('.sidebar, .hamburger, .swiper-pagination')) toggleInfo(false);
  });

  /* Keep URL, title and menu in sync with the active project. */
  function syncLocation(index, { push } = { push: true }) {
    const href = hrefs[index];
    const title = outerSlides[index].dataset.title;
    document.title = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
    setActiveLink(href);
    if (href && href !== window.location.pathname) {
      history[push ? 'pushState' : 'replaceState'](null, '', href);
    }
  }

  function activate(index, { push } = { push: true }) {
    inners.forEach((s, i) => (i === index ? s.enable() : s.disable()));
    pauseVideos(outerEl);
    showInfo(index);
    syncLocation(index, { push });
    preloadAround(inners[index], inners[index].activeIndex);
    // Warm the first frame of the neighbouring projects.
    [index - 1, index + 1].forEach((i) => {
      if (inners[i]) loadSlide(inners[i].slides[inners[i].activeIndex]);
    });
  }

  outer.on('slideChange', () => {
    lastOuterMove = Date.now();
    activate(outer.activeIndex);
  });

  inners.forEach((inner) => {
    inner.on('slideChange', () => {
      lastInnerChange = Date.now();
      pauseVideos(inner.el);
      preloadAround(inner, inner.activeIndex);
    });
  });

  /* Wheel hand-off: inner swipers stop propagation unless they are at an edge
     (Swiper `nested`), so a wheel event reaching the outer container means the
     current project has no more slides in that direction. */
  outerEl.addEventListener(
    'wheel',
    (e) => {
      const now = Date.now();
      if (now - lastOuterMove < 800 || now - lastInnerChange < 600) return;
      if (e.deltaY > 0 && !outer.isEnd) {
        outer.slideNext();
      } else if (e.deltaY < 0 && !outer.isBeginning) {
        outer.slidePrev();
      } else {
        return;
      }
      lastOuterMove = now;
    },
    { passive: true }
  );

  /* Navigation from the sidebar and from the address bar. */
  function indexForPath(path) {
    let i = hrefs.indexOf(path);
    if (i >= 0) return i;
    // Section URL (e.g. /posts/): jump to its first project.
    const sectionLink = menuLinks.find((a) => a.getAttribute('href') === path && a.classList.contains('section-link'));
    const first = sectionLink?.parentElement.querySelector('.project-link');
    if (first) i = hrefs.indexOf(first.getAttribute('href'));
    return i;
  }

  function goTo(index, { push } = { push: true }) {
    if (index < 0 || index >= inners.length) return;
    inners[index].slideTo(0, 0);
    if (index === outer.activeIndex) {
      activate(index, { push });
    } else {
      syncLocation(index, { push }); // slideChange will run activate()
      outer.slideTo(index);
    }
  }

  menuLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const index = indexForPath(link.getAttribute('href'));
      if (index < 0) return; // not a gallery page (e.g. About) – normal navigation
      e.preventDefault();
      goTo(index);
      setMenuOpen(false);
    });
  });

  window.addEventListener('popstate', () => {
    const index = indexForPath(window.location.pathname);
    if (index >= 0) goTo(index, { push: false });
  });

  const start = Math.max(0, indexForPath(window.location.pathname));
  outer.slideTo(start, 0, false);
  activate(start, { push: false });
}

const outerEl = document.querySelector('.outerSwiper');
if (outerEl && typeof Swiper !== 'undefined') initGallery(outerEl);
