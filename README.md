# A-Level Physics Core Course

Unified AQA A-level Physics 7408 **core** course app assembled from the existing topic repositories.

## AQA compulsory core order

1. Measurements and their errors
2. Particles and radiation
3. Waves
4. Mechanics and materials
5. Electricity
6. Further mechanics and thermal physics
7. Fields and their consequences
8. Nuclear physics

The course shell keeps the detailed lessons, textbook content, presentations, simulations, formula support, practical work, mastery assessment, teacher tools and A* material from the specialist apps while giving students one ordered course dashboard.

## Full A-level scope

Sections 3.1–3.8 are the compulsory core. For the full AQA A-level Physics qualification, students also study **one optional topic for Paper 3 Section B** from Sections 3.9–3.13: Astrophysics, Medical physics, Engineering physics, Turning points in physics, or Electronics. The app identifies this requirement explicitly rather than treating the compulsory core as the whole qualification.

## Quality control

Phase 10 adds automated specification, build and browser audits. The build now fails if the 118-lesson core map changes unexpectedly, compulsory sections are missing, lesson IDs duplicate, a Phase 1–10 runtime asset is omitted, or the assembled course fails its browser checks.

## Vercel deployment

The repository is configured for Vercel. The build runs `scripts/vercel-build.sh`, initialises all Git submodules, applies the shared topic UI, validates the AQA core architecture, verifies every Phase 1–10 asset and publishes the assembled static course from `dist/`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmarkstevengray95-star%2Falevel-course)

### Build locally

```bash
git clone --recurse-submodules https://github.com/markstevengray95-star/alevel-course.git
cd alevel-course
bash scripts/vercel-build.sh
```

The deployable output is written to `dist/`.
