<h1 align=center>Swipefolio | <a href="https://hugo-swiper-example.netlify.app" rel="nofollow">Demo</a></h1>

<h4 align=center>☄️ Fast | ☁️ Fluent | 🌙 Smooth | 📱 Responsive</h4>
<br>

> Swipefolio — a Hugo theme for a minimal gallery for artists. Inspired from TouchFolio Wordpress Theme.

**ExampleSite** can be found here: [**exampleSite**](https://github.com/mmzeynalli/hugo-swipefolio/tree/main/exampleSite). Demo is built up with [exampleSite](https://github.com/mmzeynalli/hugo-swipefolio/tree/main/exampleSite) as source.

[![hugo-swipefolio](https://img.shields.io/badge/Hugo--Themes-@Swipefolio-blue)](https://themes.gohugo.io/themes/hugo-swipefolio/)
[![Minimum Hugo Version](https://img.shields.io/static/v1?label=min-HUGO-version&message=>=v0.116.0&color=blue&logo=hugo)](https://github.com/gohugoio/hugo/releases/tag/v0.116.0)
[![GitHub](https://img.shields.io/github/license/mmzeynalli/hugo-swipefolio)](https://github.com/mmzeynalli/hugo-swipefolio/blob/master/LICENSE)
![code-size](https://img.shields.io/github/languages/code-size/mmzeynalli/hugo-swipefolio)

> **Renamed:** this theme was previously published as `hugo-swiper`. Update your submodule URL and `theme:` setting when upgrading.

---

## How it works

- The **home page** is an "about" card: name, avatar, a short bio and social icons.
- Every other page is a full-screen **gallery**: projects are stacked vertically (scroll, swipe or ↑/↓ to switch project), the media of one project runs horizontally (scroll, swipe or ←/→). Scrolling past the last image of a project moves to the next project.
- The sidebar lists every project; clicking one jumps to it without reloading. The URL, page title and browser history stay in sync, so every project has a shareable link.
- Media is lazy-loaded (current slide ± 1) and videos are paused when you leave them.

## Installation

```bash
git submodule add https://github.com/mmzeynalli/hugo-swipefolio.git themes/hugo-swipefolio
```

and set `theme: "hugo-swipefolio"` in your `hugo.yaml`. Requires Hugo ≥ 0.116.0 (the extended build is *not* needed).

## Configuration

See [`exampleSite/hugo.yaml`](exampleSite/hugo.yaml) for a complete example.

```yaml
menus:
  main:
    - name: "About"
      weight: 1
      pageRef: "/"          # plain link
    - name: "Projects"
      weight: 2
      pageRef: "/posts/"    # a section: its pages are listed underneath

params:
  description: "…"          # <meta name="description">
  author:
    name: John Doe          # sidebar, home page, footer
    email: john@doe.com     # sidebar (optional)
  profile:
    avatarUrl: "/avatar.jpg"
    about: "Short bio shown on the home page"
    social:                 # keys from assets/data/social.yml, value = your handle
      github: "johndoe"
      linkedin: "john-doe"
      email: "john@doe.com"
  assets:                   # all optional
    favicon: "favicon.ico"
    favicon16x16: "favicon-16x16.png"
    favicon32x32: "favicon-32x32.png"
    apple_touch_icon: "apple-touch-icon.png"
    safari_pinned_tab: "safari-pinned-tab.svg"
    theme_color: "#2e2e33"
```

Menu entries that point at a **section** (e.g. `pageRef: "/posts/"`) get their pages listed in the sidebar and shown in the gallery, in weight order. Any other entry is rendered as a plain link.

## Adding a project

Each project is a page with a `slideshow` list in its front matter. Entries can be page-bundle resources, files under `static/`, or absolute URLs; anything ending in `.mp4/.webm/.ogg/.mov` is rendered as a video.

```toml
+++
title = 'Sunset series'
weight = 1
slideshow = ['cover.jpg', 'detail-1.jpg', '/videos/making-of.mp4', 'https://example.com/photo.jpg']
+++

Optional description, shown in the info panel at the bottom-right corner.
```

Pages without a `slideshow` are ignored by the gallery.

## Support 🫶

- Star 🌟 this repository.
- Help spread the word about Swipefolio by sharing it on social media and recommending it to your friends. 🗣️
- You can also sponsor 🏅 on [Github Sponsors](https://github.com/sponsors/mmzeynalli) / [Ko-Fi](https://ko-fi.com/mmzeynalli).

---

## Special Thanks 🌟

- [**Swiper.js**](https://github.com/nolimits4web/swiper)
- [**Font Awesome**](https://fontawesome.com/)
