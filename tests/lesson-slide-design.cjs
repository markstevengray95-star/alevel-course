const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},setTimeout(){}};
vm.createContext(context);
for(const file of ['curriculum-map.js','lesson-content.js','lesson-phase3.js','lesson-slide-design.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const api=context.window;
assert.equal(api.ALEVEL_LESSONS.length,118);
for(const lesson of api.ALEVEL_LESSONS){
  const deck=api.ALEVEL_SLIDE_DESIGN.build(api.ALEVEL_PHASE3.profile(lesson.id));
  assert.equal(deck.id,lesson.id);
  assert.equal(deck.slides.length,15,`${lesson.id}: consistent teaching sequence`);
  const sections=new Set(deck.slides.map(s=>s.section));
  assert.deepEqual([...sections],['Start','Learn','Practise','Review']);
  for(const slide of deck.slides){
    assert.ok(slide.bullets.length<=3,`${lesson.id}: too many points on ${slide.title}`);
    const html=api.ALEVEL_SLIDE_DESIGN.html(slide);
    assert.ok(!/undefined|\[object Object\]/.test(html),`${lesson.id}: invalid rendered content`);
  }
  const visual=deck.slides.find(s=>s.layout==='diagram');
  assert.match(api.ALEVEL_SLIDE_DESIGN.html(visual),/<svg.*role="img"/);
  assert.ok(deck.slides.find(s=>s.layout==='worked').solution.length>0);
}
// Words like "power", "particles", "harmonic" and "random" occur across topics.
// These cases previously selected unrelated teaching material.
const expected={m06:'graph',mm12:'energy',fm04:'shm',fm12:'heating',f07:'electric',f14:'magnetic',f15:'magnetic',n04:'decay',n10:'radius',n13:'binding'};
for(const [id,diagram] of Object.entries(expected)){
  assert.equal(api.ALEVEL_SLIDE_DESIGN.modelFor(api.ALEVEL_PHASE3.profile(id)).diagram,diagram,id);
}
assert.equal(api.ALEVEL_PHASE3.profile('f07').concept.key,'electric fields');
assert.equal(api.ALEVEL_PHASE3.profile('f14').concept.key,'magnetic fields');
assert.equal(api.ALEVEL_PHASE3.profile('fm12').concept.key,'thermal physics');
assert.equal(api.ALEVEL_PHASE3.profile('e13').concept.key,'emf and internal resistance');
const cases={m01:'6.0 × 10⁻⁶ m²',w08:'19.5°',e11:'8.0 V',fm05:'−0.50 m s⁻²',n06:'100 Bq'};
for(const [id,result] of Object.entries(cases)){
  const model=api.ALEVEL_SLIDE_DESIGN.modelFor(api.ALEVEL_PHASE3.profile(id));
  assert.ok(model.steps.join(' ').includes(result),`${id}: worked solution missing expected result`);
}
const escaped=api.ALEVEL_SLIDE_DESIGN.html({type:'title',kicker:'Start',title:'<script>bad</script>',bullets:['A & B']});
assert.ok(!escaped.includes('<script>'));
assert.ok(escaped.includes('A &amp; B'));
const build=fs.readFileSync(path.join(root,'scripts/vercel-build.sh'),'utf8');
for(const file of ['lesson-slide-design.js','lesson-slide-design.css'])assert.ok(build.includes(file));
console.log('PASS: all 118 lesson decks render 15 slides with bounded content, labelled diagrams, solutions and subject-appropriate models.');
