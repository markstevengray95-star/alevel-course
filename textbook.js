(()=>{
  'use strict';
  const data=window.PhysicsTextbookData||{};
  const topicOrder=(window.CourseApp?.topics||[]).map(t=>t.id).filter(id=>data[id]);
  const locationKey='alevel-physics-textbook-location-v1';
  const readKey='alevel-physics-textbook-read-v1';
  let savedLocation=safeJson(localStorage.getItem(locationKey),{});
  const readState=safeJson(localStorage.getItem(readKey),{});
  let activeTopic=savedLocation.topic&&data[savedLocation.topic]?savedLocation.topic:(topicOrder[0]||Object.keys(data)[0]);
  let activeChapter=Number(savedLocation.chapter)||0;
  let lastTrigger=null;
  let toastTimer=null;

  function safeJson(value,fallback){try{return JSON.parse(value)||fallback}catch{return fallback}}
  function esc(value){return String(value??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));}
  function currentCourseTopic(){const id=window.CourseApp?.getState?.().topicId;return id&&data[id]?id:null;}
  function persist(){savedLocation={topic:activeTopic,chapter:activeChapter};localStorage.setItem(locationKey,JSON.stringify(savedLocation));}
  function markRead(){const chapter=data[activeTopic]?.chapters?.[activeChapter];if(!chapter)return;readState[`${activeTopic}:${chapter.id}`]=true;localStorage.setItem(readKey,JSON.stringify(readState));}
  function injectCss(){if(document.querySelector('link[href="textbook.css"]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='textbook.css';document.head.appendChild(link);}
  function build(){
    if(document.getElementById('textbookWorkspace'))return;
    const wrap=document.createElement('section');
    wrap.id='textbookWorkspace';wrap.className='textbook-workspace';wrap.hidden=true;wrap.setAttribute('aria-label','AQA Physics textbook');
    wrap.innerHTML=`<div class="textbook-bar"><button class="textbook-back" id="textbookBack" type="button">← Back</button><div class="textbook-identity"><span>Full course textbook</span><strong id="textbookBarTitle">AQA Physics 7408</strong></div><select class="textbook-select topic-select" id="textbookTopicSelect" aria-label="Choose textbook topic"></select><select class="textbook-select textbook-mobile-chapter" id="textbookMobileChapter" aria-label="Choose textbook chapter"></select><div class="textbook-bar-spacer"></div><button class="textbook-action" data-kind="notes" id="textbookNotes" type="button">Notebook</button><button class="textbook-action" data-kind="ai" id="textbookAI" type="button">AI Coach</button><div class="textbook-progress"><div class="textbook-progress-fill" id="textbookProgressFill"></div></div></div><div class="textbook-layout"><aside class="textbook-sidebar"><div class="textbook-sidebar-head"><span id="textbookSideCode">AQA 3.1</span><strong id="textbookSideTitle">Measurements</strong></div><div class="textbook-chapter-list" id="textbookChapterList"></div></aside><main class="textbook-content-wrap" id="textbookContentWrap"><article class="textbook-article" id="textbookArticle"></article></main></div>`;
    document.body.appendChild(wrap);
    const toast=document.createElement('div');toast.className='textbook-toast';toast.id='textbookToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);
  }
  function injectEntryPoints(){
    const homeActions=document.querySelector('.home-actions');
    if(homeActions&&!document.getElementById('homeTextbookBtn')){const b=document.createElement('button');b.className='button quiet';b.id='homeTextbookBtn';b.type='button';b.textContent='▦ Textbook';homeActions.insertBefore(b,document.getElementById('homeNotebookBtn'));b.addEventListener('click',()=>open());}
    const jump=document.querySelector('.course-jump-inner');
    if(jump&&!document.getElementById('textbookToggle')){const b=document.createElement('button');b.className='button textbook-shell-button';b.id='textbookToggle';b.type='button';b.innerHTML='<span>▦</span> Textbook';jump.insertBefore(b,document.getElementById('notebookToggle'));b.addEventListener('click',()=>open(currentCourseTopic()));}
    const toolBar=document.querySelector('.tool-bar');
    if(toolBar&&!document.getElementById('toolTextbook')){const b=document.createElement('button');b.className='tool-action accent';b.id='toolTextbook';b.type='button';b.dataset.icon='▦';b.textContent='Textbook';toolBar.insertBefore(b,document.getElementById('toolNotebook'));b.addEventListener('click',()=>open());}
  }
  function topicLabel(id){const item=data[id];return item?`${item.code} · ${item.title}`:id;}
  function normaliseChapter(){const chapters=data[activeTopic]?.chapters||[];activeChapter=Math.min(Math.max(Number(activeChapter)||0,0),Math.max(0,chapters.length-1));return chapters;}
  function setTopic(id,{resetChapter=true}={}){if(!data[id])return;activeTopic=id;if(resetChapter)activeChapter=0;normaliseChapter();persist();render();}
  function setChapter(index){const chapters=data[activeTopic]?.chapters||[];activeChapter=Math.min(Math.max(Number(index)||0,0),Math.max(0,chapters.length-1));persist();render();document.getElementById('textbookContentWrap')?.scrollTo({top:0,behavior:'smooth'});}
  function chapterReadCount(topicId){return (data[topicId]?.chapters||[]).filter(c=>readState[`${topicId}:${c.id}`]).length;}
  function renderSelectors(){
    const topicSelect=document.getElementById('textbookTopicSelect');const mobile=document.getElementById('textbookMobileChapter');const chapters=data[activeTopic]?.chapters||[];
    if(!topicSelect||!mobile)return;
    topicSelect.innerHTML=topicOrder.map(id=>`<option value="${esc(id)}">${esc(topicLabel(id))}</option>`).join('');topicSelect.value=activeTopic;
    mobile.innerHTML=chapters.map((c,i)=>`<option value="${i}">${i+1}. ${esc(c.title.replace(/^\d+\.\s*/,''))}</option>`).join('');mobile.value=String(activeChapter);
  }
  function renderSidebar(){
    const topic=data[activeTopic];const list=document.getElementById('textbookChapterList');if(!topic||!list)return;
    const code=document.getElementById('textbookSideCode'),title=document.getElementById('textbookSideTitle');if(code)code.textContent=topic.code;if(title)title.textContent=topic.title;
    list.innerHTML=topic.chapters.map((c,i)=>`<button type="button" class="textbook-chapter-button ${i===activeChapter?'active':''}" data-chapter="${i}">${readState[`${activeTopic}:${c.id}`]?'✓ ':''}${esc(c.title)}</button>`).join('');
    list.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>setChapter(Number(b.dataset.chapter))));
  }
  function equationMarkup(e){return `<div class="textbook-equation"><strong>${esc(e[0])}</strong><code>${esc(e[1])}</code><span>${esc(e[2]||'')}</span></div>`;}
  function renderArticle(){
    const topic=data[activeTopic],chapter=topic?.chapters?.[activeChapter],article=document.getElementById('textbookArticle');if(!topic||!chapter||!article)return;
    const sections=chapter.sections.map(([heading,body])=>`<section class="textbook-section"><h2>${esc(heading)}</h2><p>${esc(body)}</p></section>`).join('');
    const equations=(chapter.equations||[]).length?`<div class="textbook-equations">${chapter.equations.map(equationMarkup).join('')}</div>`:'';
    const example=chapter.example?`<section class="textbook-example"><div class="textbook-callout-label">Worked example</div><h3>${esc(chapter.example.q)}</h3><ol>${(chapter.example.steps||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol><div class="textbook-answer">Answer: ${esc(chapter.example.answer)}</div></section>`:'';
    const tip=chapter.examTip?`<aside class="textbook-tip"><div class="textbook-callout-label">Exam tip</div><p>${esc(chapter.examTip)}</p></aside>`:'';
    const checks=(chapter.checks||[]).length?`<section class="textbook-check"><div class="textbook-callout-label">Check your understanding</div><h3>Retrieval questions</h3><ol>${chapter.checks.map(q=>`<li>${esc(q)}</li>`).join('')}</ol></section>`:'';
    article.innerHTML=`<div class="textbook-topic-kicker"><span>${esc(topic.code)}</span>${esc(topic.year)} · Chapter ${activeChapter+1} of ${topic.chapters.length}</div><h1>${esc(chapter.title)}</h1><p class="textbook-summary">${esc(chapter.summary)}</p>${sections}${equations}${example}${tip}${checks}<div class="textbook-chapter-actions"><button class="textbook-save" type="button" id="textbookSaveSummary">▤ Save chapter summary</button>${chapter.example?'<button class="textbook-save" type="button" id="textbookSaveExample">▤ Save worked example</button>':''}<button class="textbook-save" type="button" id="textbookMarkRead">✓ Mark chapter read</button></div>`;
    document.getElementById('textbookSaveSummary')?.addEventListener('click',()=>saveToNotebook(`${chapter.title}\n${chapter.summary}`,chapter));
    document.getElementById('textbookSaveExample')?.addEventListener('click',()=>saveToNotebook(`${chapter.example.q}\n${(chapter.example.steps||[]).join(' ')}\nAnswer: ${chapter.example.answer}`,chapter));
    document.getElementById('textbookMarkRead')?.addEventListener('click',()=>{markRead();showToast('Chapter marked as read');renderSidebar();updateProgress();});
    const barTitle=document.getElementById('textbookBarTitle');if(barTitle)barTitle.textContent=`${topic.code} · ${topic.title}`;
  }
  function updateProgress(){const topic=data[activeTopic];const done=chapterReadCount(activeTopic);const fill=document.getElementById('textbookProgressFill');if(fill&&topic)fill.style.width=`${topic.chapters.length?done/topic.chapters.length*100:0}%`;}
  function render(){if(!data[activeTopic])activeTopic=topicOrder[0]||Object.keys(data)[0];normaliseChapter();renderSelectors();renderSidebar();renderArticle();updateProgress();}
  function showToast(message){const toast=document.getElementById('textbookToast');if(!toast)return;toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1700);}
  function saveToNotebook(text,chapter){const topic=data[activeTopic];const ok=window.CourseNotebook?.save?.(text,{topicId:activeTopic,code:topic.code,title:topic.title,moduleLabel:'Textbook',sectionTitle:chapter.title,pageTitle:'AQA Physics Textbook',sourceType:'selection'});if(ok)showToast('Saved to notebook');}
  function open(topicId,chapterIndex){
    lastTrigger=document.activeElement;
    document.getElementById('coachClose')?.click();window.CourseNotebook?.close?.();
    const wanted=topicId&&data[topicId]?topicId:(currentCourseTopic()||activeTopic||topicOrder[0]);
    const topicChanged=wanted!==activeTopic;activeTopic=wanted;
    if(chapterIndex!==undefined&&Number.isInteger(Number(chapterIndex)))activeChapter=Number(chapterIndex);else if(topicChanged)activeChapter=0;
    normaliseChapter();persist();
    const workspace=document.getElementById('textbookWorkspace');if(!workspace)return;workspace.hidden=false;document.documentElement.classList.add('textbook-open');document.body.style.overflow='hidden';
    render();
    requestAnimationFrame(()=>{render();document.getElementById('textbookBack')?.focus({preventScroll:true});window.dispatchEvent(new CustomEvent('textbookchange',{detail:{open:true,topicId:activeTopic,chapterIndex:activeChapter}}));});
  }
  function close(){const workspace=document.getElementById('textbookWorkspace');if(!workspace||workspace.hidden)return;workspace.hidden=true;document.documentElement.classList.remove('textbook-open');document.body.style.overflow='';lastTrigger?.focus?.({preventScroll:true});window.dispatchEvent(new CustomEvent('textbookchange',{detail:{open:false}}));}
  function nextChapter(){const chapters=data[activeTopic]?.chapters||[];if(activeChapter<chapters.length-1)setChapter(activeChapter+1);}
  function previousChapter(){if(activeChapter>0)setChapter(activeChapter-1);}

  injectCss();build();injectEntryPoints();render();
  document.getElementById('textbookBack')?.addEventListener('click',close);
  document.getElementById('textbookTopicSelect')?.addEventListener('change',e=>setTopic(e.target.value));
  document.getElementById('textbookMobileChapter')?.addEventListener('change',e=>setChapter(Number(e.target.value)));
  document.getElementById('textbookNotes')?.addEventListener('click',()=>window.CourseNotebook?.open?.({topicId:activeTopic}));
  document.getElementById('textbookAI')?.addEventListener('click',()=>document.getElementById('coachToggle')?.click());
  window.addEventListener('message',event=>{const d=event.data||{};if(d.type==='alevel-textbook-open')open(d.topicId||currentCourseTopic());});
  document.addEventListener('keydown',event=>{const openNow=!document.getElementById('textbookWorkspace')?.hidden;if(!openNow)return;if(event.key==='Escape'){event.preventDefault();close();}if(event.altKey&&event.key==='ArrowRight'){event.preventDefault();nextChapter();}if(event.altKey&&event.key==='ArrowLeft'){event.preventDefault();previousChapter();}});
  window.CourseTextbook={open,close,setTopic,setChapter,getState:()=>({topicId:activeTopic,chapterIndex:activeChapter,read:{...readState}}),data};
})();