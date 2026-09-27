# A-Level Physics Course

Unified AQA A-level Physics 7408 course app assembled from the existing topic repositories.

## AQA core order

1. Measurements and their errors
2. Particles and radiation
3. Waves
4. Mechanics and materials
5. Electricity
6. Further mechanics and thermal physics
7. Fields and their consequences
8. Nuclear physics

The course shell keeps the detailed lessons, textbook content, simulations, formula support, practical work and assessment tools from the existing specialist apps while giving students one ordered course dashboard.

## Vercel deployment

The repository is configured for Vercel. The build runs `scripts/vercel-build.sh`, initialises all Git submodules, verifies that every topic app is present, then publishes the assembled static course from `dist/`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmarkstevengray95-star%2Falevel-course)

### Build locally

```bash
git clone --recurse-submodules https://github.com/markstevengray95-star/alevel-course.git
cd alevel-course
bash scripts/vercel-build.sh
```

The deployable output is written to `dist/`.
