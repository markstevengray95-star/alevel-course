(()=>{
  'use strict';

  if(!document.querySelector('link[data-lesson-enrichment]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='lesson-enrichment.css';
    link.dataset.lessonEnrichment='true';
    document.head.appendChild(link);
  }

  let selectionButton=null;
  let selectedText='';

  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const stopWords=new Set(['the','and','for','with','from','into','that','this','your','their','are','is','of','to','in','on','a','an','or','by','as','at','using','use','uses','how','what','why','when','through','physics','lesson','section','mode','course']);
  const words=value=>clean(value).toLowerCase().replace(/[^a-z0-9α-ωλφρσεμνπτθ]+/g,' ').split(/\s+/).filter(word=>word.length>2&&!stopWords.has(word));
  const firstSentence=value=>{
    const text=clean(value);
    const match=text.match(/^(.+?[.!?])(?:\s|$)/);
    return (match?.[1]||text).slice(0,260);
  };
  const getData=()=>window.CourseTextbook?.data||window.PhysicsTextbookData||{};

  function chapterSearchText(chapter){
    return [chapter?.title,chapter?.summary,...(chapter?.sections||[]).flat(),...(chapter?.equations||[]).flat()].filter(Boolean).join(' ');
  }

  function chooseChapter(topicId,index,label,pageTitle){
    const topic=getData()[topicId];
    const chapters=topic?.chapters||[];
    if(!chapters.length)return null;
    const queryWords=[...new Set(words(`${label||''} ${pageTitle||''}`))];
    let best={index:Math.min(Math.max(Number(index)||0,0),chapters.length-1),score:-1};
    chapters.forEach((chapter,chapterIndex)=>{
      const hay=new Set(words(chapterSearchText(chapter)));
      let score=queryWords.reduce((sum,word)=>sum+(hay.has(word)?4:0),0);
      const title=clean(chapter.title).toLowerCase();
      if(label&&title.includes(clean(label).toLowerCase()))score+=12;
      if(chapterIndex===Number(index))score+=2;
      if(score>best.score)best={index:chapterIndex,score};
    });
    return {topic,chapter:chapters[best.index],chapterIndex:best.index};
  }

  function enrichmentPayload(topicId,index,label,pageTitle){
    const match=chooseChapter(topicId,index,label,pageTitle);
    if(!match)return null;
    const {topic,chapter,chapterIndex}=match;
    const keyPoints=(chapter.sections||[]).slice(0,3).map(([heading,body])=>({heading:clean(heading),body:firstSentence(body)}));
    const equations=(chapter.equations||[]).slice(0,4).map(item=>({name:clean(item[0]),formula:clean(item[1]),unit:clean(item[2]||'')}));
    const example=chapter.example?{question:clean(chapter.example.q),answer:clean(chapter.example.answer)}:null;
    return {
      type:'alevel-lesson-enrichment',
      topicId,
      code:topic.code,
      topicTitle:topic.title,
      chapterIndex,
      chapterTitle:chapter.title,
      summary:chapter.summary,
      keyPoints,
      equations,
      example
    };
  }

  function respondToLesson(source,data,attempt=0){
    const state=window.CourseApp?.getState?.();
    const topicId=data.topicId||state?.topicId;
    const payload=topicId?enrichmentPayload(topicId,data.index,data.label,data.pageTitle):null;
    if(payload){
      try{source?.postMessage?.(payload,'*');}catch{}
      return;
    }
    if(attempt<24)window.setTimeout(()=>respondToLesson(source,data,attempt+1),125);
  }

  window.addEventListener('message',event=>{
    const data=event.data||{};
    if(data.type==='alevel-lesson-enrichment-request')respondToLesson(event.source,data);
    if(data.type==='alevel-lesson-enrichment-open-textbook'){
      const state=window.CourseApp?.getState?.();
      const topicId=data.topicId||state?.topicId;
      if(topicId)window.CourseTextbook?.open?.(topicId,Number.isInteger(Number(data.chapterIndex))?Number(data.chapterIndex):undefined);
    }
  });

  function ensureSelectionButton(){
    if(selectionButton)return selectionButton;
    selectionButton=document.createElement('button');
    selectionButton.id='textbookSelectionSave';
    selectionButton.type='button';
    selectionButton.className='textbook-selection-save';
    selectionButton.innerHTML='<span aria-hidden="true">▤</span> Save selection';
    selectionButton.hidden=true;
    selectionButton.addEventListener('mousedown',event=>event.preventDefault());
    selectionButton.addEventListener('click',()=>{
      if(!selectedText)return;
      const state=window.CourseTextbook?.getState?.()||{};
      const topic=window.CourseTextbook?.data?.[state.topicId];
      const chapter=topic?.chapters?.[state.chapterIndex];
      const saved=window.CourseNotebook?.save?.(selectedText,{
        topicId:state.topicId,
        code:topic?.code,
        title:topic?.title,
        moduleLabel:'Textbook',
        sectionTitle:chapter?.title||'Textbook selection',
        pageTitle:'AQA Physics Textbook',
        sourceType:'selection'
      });
      if(saved){
        selectionButton.textContent='Saved ✓';
        window.setTimeout(()=>{selectionButton.innerHTML='<span aria-hidden="true">▤</span> Save selection';},1000);
      }
      selectedText='';
      window.getSelection?.()?.removeAllRanges?.();
      window.setTimeout(()=>hideSelectionButton(),120);
    });
    document.body.appendChild(selectionButton);
    return selectionButton;
  }

  function hideSelectionButton(){if(selectionButton)selectionButton.hidden=true;}
  function selectionInsideTextbook(selection){
    const node=selection?.anchorNode;
    const element=node?.nodeType===1?node:node?.parentElement;
    return !!element?.closest?.('#textbookArticle');
  }
  function showTextbookSelection(){
    const workspace=document.getElementById('textbookWorkspace');
    if(!workspace||workspace.hidden)return hideSelectionButton();
    const selection=window.getSelection?.();
    const text=clean(selection?.toString()).slice(0,5000);
    if(text.length<3||!selectionInsideTextbook(selection)||!selection?.rangeCount)return hideSelectionButton();
    const range=selection.getRangeAt(0);
    const rect=range.getBoundingClientRect();
    if(!rect||(!rect.width&&!rect.height))return hideSelectionButton();
    if(rect.bottom<0||rect.top>window.innerHeight||rect.right<0||rect.left>window.innerWidth)return hideSelectionButton();
    selectedText=text;
    const button=ensureSelectionButton();
    const width=150;
    const height=40;
    const left=Math.min(Math.max(8,rect.left+rect.width/2-width/2),Math.max(8,window.innerWidth-width-8));
    const preferredTop=rect.top>=52?rect.top-44:rect.bottom+8;
    const top=Math.min(Math.max(8,preferredTop),Math.max(8,window.innerHeight-height-8));
    button.style.left=`${left}px`;
    button.style.top=`${top}px`;
    button.hidden=false;
  }

  document.addEventListener('mouseup',event=>{
    if(event.target.closest?.('#textbookSelectionSave'))return;
    window.setTimeout(showTextbookSelection,0);
  });
  document.addEventListener('keyup',event=>{
    if(event.key==='Shift'||event.key.startsWith('Arrow'))window.setTimeout(showTextbookSelection,0);
  });
  document.addEventListener('touchend',()=>window.setTimeout(showTextbookSelection,80),{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(event.target.closest?.('#textbookSelectionSave'))return;
    if(!event.target.closest?.('#textbookArticle'))hideSelectionButton();
  });
  document.addEventListener('scroll',hideSelectionButton,true);
  window.addEventListener('resize',hideSelectionButton);

  window.CourseLessonEnrichment={
    get:(topicId,index,label,pageTitle)=>enrichmentPayload(topicId,index,label,pageTitle)
  };
})();