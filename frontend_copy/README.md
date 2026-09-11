# SPADE

Smart Platform for Autonomous Disaster Emergency Response.

## Setup

```bash
npm install
npm run dev
```

Routes:
- `/` — Landing page
- `/dashboard` — Command dashboard

## Project structure

```
src/
  main.jsx                 App entry point, mounts <App /> and imports global CSS
  App.jsx                  Router — defines "/" and "/dashboard"
  index.css                Design system: CSS variables + all component styles

  data/
    mock.js                Drone, survivor, disaster-zone mock data (single source of truth)

  components/
    Wordmark.jsx            Shared SPADE logo mark, used in both navbars
    Reveal.jsx               Scroll-triggered fade-in wrapper (landing page)

    LandingNav.jsx           Landing page navbar
    Hero.jsx                 Hero section (headline + 3D drone)
    DroneCanvas.jsx          Floating 3D drone, raw three.js
    HowItWorks.jsx           "How SPADE Works" 3-step section
    PlatformPreview.jsx      Static dashboard preview + CTA

    DashboardNavbar.jsx      Dashboard navbar (Simulate detection, system status)
    DroneInfo.jsx            Drone info bar (battery / altitude / speed)
    MissionMap.jsx           Live response map (react-leaflet)
    SurvivorList.jsx         Scrollable survivor list + priority filters
    SurvivorCard.jsx         Single survivor card

  pages/
    LandingPage.jsx          Composes: LandingNav, Hero, HowItWorks, PlatformPreview
    DashboardPage.jsx        Composes: DashboardNavbar, DroneInfo, MissionMap, SurvivorList
                              Owns all dashboard state (survivors, filter, selection, toast)
```

## Notes

- All design tokens (colors, radii) live as CSS variables at the top of `src/index.css`.
  Change a color once there and it updates both pages.
- `data/mock.js` is the only place with mock drone/survivor data — swap it for a real
  API call later without touching any component.
- `MissionMap` uses `react-leaflet`; `DroneCanvas` uses raw `three.js` (no React Three
  Fiber dependency needed).
- Page-level state (survivors, selected survivor, filters, toast) lives in
  `DashboardPage.jsx` and is passed down as props — components underneath are
  presentational only.
