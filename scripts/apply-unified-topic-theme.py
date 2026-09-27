#!/usr/bin/env python3
from pathlib import Path

THEME_SOURCE = Path('shared/unified-topic-theme.css')
TARGETS = [
    Path('topics/01-measurements/index.html'),
    Path('topics/02-particles-radiation/index.html'),
    Path('topics/03-waves/index.html'),
    Path('topics/04-mechanics-materials/mechanics/index.html'),
    Path('topics/04-mechanics-materials/materials/index.html'),
    Path('topics/05-electricity/index.html'),
    Path('topics/06-further-mechanics-thermal/index.html'),
    Path('topics/07-fields/index.html'),
    Path('topics/08-nuclear/index.html'),
]

MARKER = '<!-- unified-course-topic-theme -->'
INJECTION = f'''{MARKER}
<link rel="stylesheet" href="unified-course-theme.css?v=1">
<script>if(window.self!==window.top)document.documentElement.classList.add('unified-course-embedded');</script>'''

if not THEME_SOURCE.exists():
    raise SystemExit(f'Missing shared topic theme: {THEME_SOURCE}')

theme = THEME_SOURCE.read_text('utf-8')
if len(theme.strip()) < 500:
    raise SystemExit('Shared topic theme looks unexpectedly small.')

for index in TARGETS:
    if not index.exists():
        raise SystemExit(f'Missing topic index for unified theme: {index}')

    theme_target = index.parent / 'unified-course-theme.css'
    theme_target.write_text(theme, 'utf-8')

    html = index.read_text('utf-8')
    if MARKER not in html:
        if '</head>' not in html:
            raise SystemExit(f'Could not inject unified theme into {index}: missing </head>')
        html = html.replace('</head>', f'  {INJECTION}\n</head>', 1)
        index.write_text(html, 'utf-8')

    print(f'Applied unified topic theme to {index.parent}')

print(f'Unified visual system applied to {len(TARGETS)} topic modules.')
