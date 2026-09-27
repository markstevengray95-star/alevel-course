#!/usr/bin/env python3
from pathlib import Path

fixes = {
    Path('topics/04-mechanics-materials/mechanics/app.js'): [
        ("$('[data-practice-check]',$('#lessonPanel')).forEach", "$$('[data-practice-check]',$('#lessonPanel')).forEach"),
        ("$('.mini-option',$('#lessonPanel')).forEach", "$$('.mini-option',$('#lessonPanel')).forEach"),
    ],
    Path('topics/06-further-mechanics-thermal/sim-learning-v8.js'): [
        ("$('[data-live-hint]').forEach", "$$('[data-live-hint]').forEach"),
    ],
    Path('topics/06-further-mechanics-thermal/classroom-suite-v9.js'): [
        ("const fields=$('textarea,input[type=\"text\"],input[type=\"number\"],input[type=\"checkbox\"]',root);", "const fields=$$('textarea,input[type=\"text\"],input[type=\"number\"],input[type=\"checkbox\"]',root);"),
        ("$('textarea,input[type=\"text\"],input[type=\"number\"],input[type=\"checkbox\"]').forEach", "$$('textarea,input[type=\"text\"],input[type=\"number\"],input[type=\"checkbox\"]').forEach"),
    ],
    Path('topics/07-fields/app.js'): [
        ("$('[data-quiz-choice]').forEach", "$$('[data-quiz-choice]').forEach"),
    ],
}

changed = 0
for path, replacements in fixes.items():
    if not path.exists():
        raise SystemExit(f'Missing integration target: {path}')
    text = path.read_text('utf-8')
    original = text
    for old, new in replacements:
        count = text.count(old)
        if count == 0:
            # The source may already contain the upstream fix; accept that state.
            if new not in text:
                raise SystemExit(f'Expected integration pattern not found in {path}: {old}')
            continue
        text = text.replace(old, new)
        changed += count
        print(f'Patched {path}: {old[:55]}... ({count} occurrence(s))')
    if text != original:
        path.write_text(text, 'utf-8')

print(f'Applied {changed} integration compatibility replacement(s).')
