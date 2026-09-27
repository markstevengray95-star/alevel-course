# Course audit coverage

The automated audit checks the assembled Vercel output rather than only the source shell.

It covers:

- all required AQA topic entry pages
- recursive Git submodule assembly
- missing local HTML/CSS/image/script/font resources
- JavaScript syntax across deployed modules
- JSON and web manifest parsing
- duplicate HTML IDs
- basic CSS structural integrity
- production-style local serving
- Chromium loading of the course shell and every topic module
- browser page errors, console errors and failed local network requests
- course topic-card navigation and iframe loading
- course progress interaction

This audit is intentionally stricter than the original build-only validation so integration bugs are caught before production deployment.
