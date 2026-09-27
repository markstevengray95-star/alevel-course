#!/usr/bin/env python3
from pathlib import Path

THEME_SOURCE = Path('shared/unified-topic-theme.css')
FOCUS_SOURCE = Path('shared/embedded-focus.css')
EMBEDDED_SCRIPT_SOURCE = Path('shared/unified-topic-embedded.js')
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
<link rel="stylesheet" href="unified-course-theme.css?v=12">
<link rel="stylesheet" href="unified-course-focus.css?v=12">
<script>if(window.self!==window.top)document.documentElement.classList.add('unified-course-embedded');</script>
<script src="unified-course-embedded.js?v=12" defer></script>'''

for source in (THEME_SOURCE, FOCUS_SOURCE, EMBEDDED_SCRIPT_SOURCE):
    if not source.exists():
        raise SystemExit(f'Missing shared topic asset: {source}')

assets = {
    'unified-course-theme.css': THEME_SOURCE.read_text('utf-8'),
    'unified-course-focus.css': FOCUS_SOURCE.read_text('utf-8'),
    'unified-course-embedded.js': EMBEDDED_SCRIPT_SOURCE.read_text('utf-8'),
}
if len(assets['unified-course-theme.css'].strip()) < 500:
    raise SystemExit('Shared topic theme looks unexpectedly small.')

for index in TARGETS:
    if not index.exists():
        raise SystemExit(f'Missing topic index for unified theme: {index}')

    for filename, content in assets.items():
        (index.parent / filename).write_text(content, 'utf-8')

    html = index.read_text('utf-8')
    if MARKER in html:
        start = html.index(MARKER)
        end = html.find('</head>', start)
        if end == -1:
            raise SystemExit(f'Could not refresh unified assets in {index}: missing </head>')
        prefix = html[:start]
        suffix = html[end:]
        html = prefix + '  ' + INJECTION + '\n' + suffix
    else:
        if '</head>' not in html:
            raise SystemExit(f'Could not inject unified theme into {index}: missing </head>')
        html = html.replace('</head>', f'  {INJECTION}\n</head>', 1)
    index.write_text(html, 'utf-8')

    print(f'Applied focused unified topic UI to {index.parent}')

print(f'Focused visual system applied to {len(TARGETS)} topic modules.')
