import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{location:{search:''}},location:{search:''},URLSearchParams,document:{readyState:'loading',addEventListener(){},querySelector(){return null;}},console};
for(const f of ['course-config.js','subjects/biology-content.js','subjects/biology-answer-detail.js','subjects/science-answer-support.js','subjects/biology-lessons.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),box,{filename:f});
const w=box.window,content=w.ALEVEL_BIOLOGY_CONTENT,rows=w.ALEVEL_BIOLOGY_ANSWER_DETAIL.rows;
assert.equal(Object.keys(rows).length,39);assert.equal(content.count,39);
for(const ref of content.refs){
 const p=content.get(ref);assert.equal(p.exam.length,3);assert.equal(p.examAnswers.length,3);
 for(let i=0;i<3;i++){assert.equal(p.examAnswers[i].length,4,`${ref} question ${i+1}: missing answer steps`);assert.ok(p.examAnswers[i].join(' ').length>200,`${ref} question ${i+1}: incomplete explanation`);}
 const topic=w.ALEVEL_COURSE_REGISTRY.biology.topics.find(t=>t.modules.some(s=>s.ref===ref));
 const deck=w.ALEVEL_BIOLOGY_LESSONS.buildDeck({config:w.ALEVEL_COURSE_REGISTRY.biology,topic,section:topic.modules.find(s=>s.ref===ref)});
 assert.equal(deck.slides.length,15);assert.equal(deck.slides[8].bullets[0],p.exam[0]);assert.equal(deck.slides[8].solution[0],p.examAnswers[0][0]);
 const practice=deck.slides[12].practice;assert.equal(practice.length,3);
 for(let i=0;i<3;i++){assert.equal(practice[i].question,p.exam[i]);assert.deepEqual(practice[i].answer,p.examAnswers[i]);assert.ok(w.ALEVEL_SCIENCE_ANSWERS.presentationHtml(practice,i).includes(p.exam[i].replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')));}
 assert.ok(w.ALEVEL_SCIENCE_ANSWERS.practiceHtml(p).includes('Show detailed model answer'));
}
const result=(ref,i,text)=>assert.ok(content.get(ref).examAnswers[i].join(' ').includes(text),`${ref} question ${i+1}: missing checked result ${text}`);
result('3.2.1',1,'30.0 μm');result('3.2.2',2,'0.20');result('3.2.4',2,'75%');result('3.3.1',1,'2 cm⁻¹');result('3.4.2',1,'methionine–proline–glutamate');result('3.4.6',1,'2.79');result('3.5.2',2,'0.060');result('3.5.3',0,'15 000');result('3.7.1',2,'2.00');result('3.7.2',0,'0.42');result('3.7.4',1,'200 individuals');
assert.equal(45000/1500,30);assert.equal(40/200,0.2);assert.equal(1560/560,2.7857142857142856);assert.equal(40*50/10,200);assert.equal((110-100)**2/100+(90-100)**2/100,2);
assert.ok(content.get('3.6.2').examAnswers[0][3].includes('rather than the pump alone'));
assert.ok(content.get('3.2.1').core.join(' ').includes('some also contain plasmids'));
console.log('Biology lesson answers passed: all 39 lessons, 117 matched four-step solutions, data supplied for calculations, and question selection preserves answer pairing.');
