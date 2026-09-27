#!/usr/bin/env python3
from pathlib import Path

fixes = {
    Path('topics/01-measurements/index.html'): [
        ('<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/loaders/GLTFLoader.js"></script>', '<!-- Obsolete GLTFLoader dependency removed: current 3D lab uses procedural geometry. -->'),
    ],
    Path('topics/04-mechanics-materials/mechanics/app.js'): [
        ("$('[data-practice-check]',$('#lessonPanel')).forEach", "$$('[data-practice-check]',$('#lessonPanel')).forEach"),
        ("$('.mini-option',$('#lessonPanel')).forEach", "$$('.mini-option',$('#lessonPanel')).forEach"),
    ],
    Path('topics/04-mechanics-materials/materials/three-lab-v5.js'): [
        ("hanger.add?.();root.add(hanger);", "root.add(hanger);"),
    ],
    Path('topics/04-mechanics-materials/materials/three-performance-v10.js'): [
        ("""export class WebGLRenderer extends THREE_BASE.WebGLRenderer{\n  constructor(parameters={}){\n    const c=config();\n    super({...parameters,antialias:c.antialias});\n    this._materialsMode='';\n    super.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,c.pixelRatio));\n  }\n  setPixelRatio(value){const c=config();return super.setPixelRatio(Math.min(value||1,c.pixelRatio));}\n  render(scene,camera){\n    const m=mode(),c=config();\n    if(m!==this._materialsMode){\n      this._materialsMode=m;\n      super.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,c.pixelRatio));\n    }\n    if(this.shadowMap)this.shadowMap.enabled=c.shadows;\n    return super.render(scene,camera);\n  }\n}""",
         """export class WebGLRenderer extends THREE_BASE.WebGLRenderer{\n  constructor(parameters={}){\n    const c=config();\n    super({...parameters,antialias:c.antialias});\n    this._materialsMode='';\n\n    // Three.js WebGLRenderer exposes key renderer methods as instance methods,\n    // not superclass prototype methods. Capture those methods before wrapping\n    // them so performance limits work across current Three.js releases.\n    const baseSetPixelRatio=this.setPixelRatio.bind(this);\n    const baseRender=this.render.bind(this);\n\n    this.setPixelRatio=(value)=>{\n      const current=config();\n      return baseSetPixelRatio(Math.min(value||1,current.pixelRatio));\n    };\n    this.render=(scene,camera)=>{\n      const m=mode(),current=config();\n      if(m!==this._materialsMode){\n        this._materialsMode=m;\n        baseSetPixelRatio(Math.min(globalThis.devicePixelRatio||1,current.pixelRatio));\n      }\n      if(this.shadowMap)this.shadowMap.enabled=current.shadows;\n      return baseRender(scene,camera);\n    };\n\n    this.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,c.pixelRatio));\n  }\n}"""),
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
    Path('topics/07-fields/sim-runtime-v9.js'): [
        ("['#view-lab','#view-advanced','#view-practical'].map($).filter(Boolean)", "['#view-lab','#view-advanced','#view-practical'].map(s=>$(s)).filter(Boolean)"),
        ("['#view-lab','#view-advanced'].map($).filter(Boolean)", "['#view-lab','#view-advanced'].map(s=>$(s)).filter(Boolean)"),
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
            if new not in text:
                raise SystemExit(f'Expected integration pattern not found in {path}: {old}')
            continue
        text = text.replace(old, new)
        changed += count
        print(f'Patched {path}: {old[:55]}... ({count} occurrence(s))')
    if text != original:
        path.write_text(text, 'utf-8')

print(f'Applied {changed} integration compatibility replacement(s).')
