import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const box={window:{location:{search:''}},location:{search:''},document:{readyState:'loading',addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];}},URLSearchParams,URL,console};
const files=['subjects/chemistry-physical-detail.js','subjects/chemistry-inorganic-detail.js','subjects/chemistry-organic-detail.js','subjects/chemistry-detail.js','course-config.js','subjects/chemistry-content.js','subjects/science-answer-support.js','subjects/chemistry-lessons.js'];
for(const file of files)if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),box,{filename:file});
const {ALEVEL_CHEMISTRY_DETAIL:detail,ALEVEL_CHEMISTRY_CONTENT:content,ALEVEL_CHEMISTRY_LESSONS:lessons,ALEVEL_COURSE_REGISTRY:registry}=box.window;
const physical=['3.1.1.1','3.1.1.2','3.1.1.3','3.1.2.1','3.1.2.2','3.1.2.3','3.1.2.4','3.1.2.5','3.1.3.1','3.1.3.2','3.1.3.3','3.1.3.4','3.1.3.5','3.1.3.6','3.1.3.7','3.1.4.1','3.1.4.2','3.1.4.3','3.1.4.4','3.1.5.1','3.1.5.2','3.1.5.3','3.1.5.4','3.1.5.5','3.1.6.1','3.1.6.2','3.1.7','3.1.8.1','3.1.8.2','3.1.9.1','3.1.9.2','3.1.10','3.1.11.1','3.1.11.2','3.1.12.1','3.1.12.2','3.1.12.3','3.1.12.4','3.1.12.5','3.1.12.6'];
const inorganic=['3.2.1.1','3.2.1.2','3.2.2','3.2.3.1','3.2.3.2','3.2.4','3.2.5.1','3.2.5.2','3.2.5.3','3.2.5.4','3.2.5.5','3.2.5.6','3.2.6'];
const required=JSON.parse(fs.readFileSync('tests/chemistry-required-lessons.json','utf8'));
const expected=Object.values(required.areas).flatMap(area=>area.lessons.map(r=>r.ref));
assert.equal(expected.length,91,'Independent specification catalog must contain all 91 leaf topics');
assert.deepEqual([...detail.rows.map(r=>r.ref)].sort(),[...expected].sort(),'Missing or unexpected Chemistry specification topic');
for(const ref of [...physical,...inorganic])assert.ok(detail.lookup[ref],`Missing specification lesson ${ref}`);
assert.equal(new Set(detail.rows.map(r=>r.ref)).size,detail.rows.length,'duplicate detail reference');
for(const row of detail.rows){
 const p=content.get(row.ref);assert.ok(p,`Content cannot resolve ${row.ref}`);
 assert.equal(p.core.length,4,`${row.ref}: four substantial teaching chunks`);
 assert.ok(p.core.every(s=>s.length>55),`${row.ref}: thin teaching content`);
 assert.ok(p.worked.answer.length>=4&&p.worked.answer.every(s=>s.trim().length>0)&&p.worked.answer.join(' ').length>120,`${row.ref}: incomplete worked solution`);
 assert.equal(p.exam.length,p.examAnswers.length,`${row.ref}: question/answer mismatch`);
 const topic=registry.chemistry.topics.find(t=>t.modules.some(m=>m.ref===row.ref.split('.').slice(0,3).join('.')));
 const deck=lessons.buildDeck({config:registry.chemistry,topic,section:{ref:row.ref,title:row.title}});
 assert.equal(deck.slides.length,15);assert.ok(deck.slides[8].solution.join(' ').includes(row.answer[0]));
 assert.ok(box.window.ALEVEL_SCIENCE_ANSWERS.practiceHtml(p).includes('Show detailed model answer'));
 assert.ok(!p.exam.some(q=>q.startsWith('Apply ')&&q.includes('unfamiliar chemical context')),`${row.ref}: generic exam scaffold survived`);
}
for(const topic of registry.chemistry.topics)for(const section of topic.modules){
 const p=content.get(section.ref);assert.equal(p.examAnswers.length,3,`${section.ref}: parent answers missing`);
}
const examples=[['3.1.1.2','35.5'],['3.1.2.3','0.0101'],['3.1.2.5','0.160'],['3.1.4.2','−62.7'],['3.1.4.3','−283'],['3.1.4.4','−184'],['3.1.8.1','−787'],['3.1.8.2','500 K'],['3.1.10','1.48 × 10⁻⁵'],['3.1.11.1','+1.10'],['3.1.12.4','2.87'],['3.1.12.6','4.66']];
for(const [ref,result] of examples)assert.ok(detail.lookup[ref].answer.join(' ').includes(result),`${ref}: worked result changed; recalculate before accepting`);
assert.ok(content.get('3.1.12.3').core.join(' ').includes('changes with temperature'));
assert.ok(content.get('3.1.8.2').core.join(' ').includes('equilibrium boundary'));
console.log(`Science detail audit passed: ${detail.rows.length} distinct Chemistry lessons with authored teaching and matched worked answers.`);
