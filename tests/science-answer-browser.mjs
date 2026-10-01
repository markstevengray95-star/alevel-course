import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.AUDIT_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const cases=[
 {query:'subject=biology&topic=bio-cells&section=3.2.1',question:'A cell image is 45 mm long',index:2,answer:'30.0 μm'},
 {query:'subject=chemistry&topic=chem-physical&section=3.1.12&lesson=3.1.12.6',question:'A buffer contains 0.100 mol HA',index:1,answer:'pH ≈ 4.66'}
];
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const item of cases){
   await page.goto(`${base}/subjects/topic-shell.html?${item.query}`,{waitUntil:'domcontentloaded'});
   await page.getByRole('button',{name:'Present lesson',exact:true}).click();
   const dialog=page.getByRole('dialog');await dialog.getByRole('combobox',{name:'Jump to slide'}).selectOption('12');
   await dialog.getByRole('button',{name:`Question ${item.index}`,exact:true}).click();
   assert.ok((await dialog.locator('.science-practice-question').innerText()).startsWith(item.question));
   await dialog.getByRole('button',{name:'Show solution',exact:true}).click();
   assert.ok((await dialog.locator('.ls-solution').innerText()).includes(item.answer));
   const next=item.index===3?1:item.index+1;await dialog.getByRole('button',{name:`Question ${next}`,exact:true}).click();
   assert.equal(await dialog.locator('.ls-solution').isVisible(),false,'Switching question must hide previous solution');
   await dialog.getByRole('button',{name:'Show solution',exact:true}).click();
   assert.ok(!(await dialog.locator('.ls-solution').innerText()).includes(item.answer),'Answer must change with question');
   const widths=await page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:window.innerWidth}));assert.ok(widths.body<=widths.viewport+2,'Phone lesson must not overflow horizontally');
   await dialog.getByRole('button',{name:'Lesson notes',exact:true}).click();
   await page.getByText('Show detailed model answer',{exact:true}).first().click();
   assert.ok(await page.locator('.science-question details[open] li').count()>=4);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('Science answers browser check passed at desktop and phone widths: selected questions reveal their own solutions and clear the previous answer.');
}finally{await browser.close();}
