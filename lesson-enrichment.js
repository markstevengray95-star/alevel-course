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

  const TOPIC_TERMS={
    measurements:['uncertainty','accuracy','precision','systematic error','random error','resolution','gradient'],
    particles:['photon','work function','threshold frequency','quark','baryon','meson','lepton','de broglie wavelength'],
    waves:['amplitude','wavelength','frequency','phase difference','superposition','node','antinode','coherence','diffraction','refractive index'],
    'mechanics-materials':['displacement','velocity','acceleration','resultant force','momentum','impulse','work','power','stress','strain','young modulus'],
    electricity:['electric current','potential difference','emf','resistance','resistivity','internal resistance','kirchhoff first law','kirchhoff second law'],
    'further-mechanics':['centripetal acceleration','angular velocity','simple harmonic motion','resonance','internal energy','specific heat capacity'],
    fields:['field strength','gravitational potential','electric potential','capacitance','magnetic flux','flux linkage','electromagnetic induction'],
    nuclear:['activity','decay constant','half-life','mass defect','binding energy','fission','fusion']
  };

  function chapterSearchText(chapter){
    return [chapter?.title,chapter?.summary,...(chapter?.sections||[]).flat(),...(chapter?.equations||[]).flat(),chapter?.examTip,...(chapter?.checks||[])].filter(Boolean).join(' ');
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

  const svg=(title,caption,body)=>`<figure class="uc-lesson-visual"><div class="uc-visual-kicker">Visual model</div><svg viewBox="0 0 720 300" role="img" aria-label="${title.replace(/"/g,'&quot;')}">${body}</svg><figcaption><strong>${title}</strong><span>${caption}</span></figcaption></figure>`;
  const line=(x1,y1,x2,y2,cls='ucv-line',arrow=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"${arrow?' marker-end="url(#ucvArrow)"':''}></line>`;
  const txt=(x,y,t,cls='ucv-text',anchor='middle')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${String(t).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}</text>`;
  const circle=(x,y,r,cls='ucv-node')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"></circle>`;
  const path=(d,cls='ucv-line')=>`<path d="${d}" class="${cls}" fill="none"></path>`;
  const defs='<defs><marker id="ucvArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" class="ucv-arrow"></path></marker></defs>';

  function visualForLesson(topicId,chapter){
    const source=chapterSearchText(chapter).toLowerCase();
    if(topicId==='measurements'){
      if(/uncertainty|precision|accuracy|random|systematic/.test(source))return svg('Random and systematic measurement effects','Random error creates spread; systematic error shifts the whole set away from the accepted value.',`${defs}${line(90,235,630,235,'ucv-axis')}${line(360,55,360,250,'ucv-guide')}${txt(360,275,'accepted value')}${[300,330,355,382,410].map((x,i)=>circle(x,105+(i%2)*18,9)).join('')}${[465,490,515,540].map((x,i)=>circle(x,175+(i%2)*16,9,'ucv-warn')).join('')}${txt(350,70,'random spread')}${txt(510,145,'systematic shift')}`);
      return svg('Best-fit graph and gradient','Use a large gradient triangle on the best-fit line and interpret the gradient physically.',`${defs}${line(110,240,110,55,'ucv-axis',true)}${line(110,240,650,240,'ucv-axis',true)}${line(150,220,590,75,'ucv-accent')}${line(210,200,510,200,'ucv-guide')}${line(510,200,510,102,'ucv-guide')}${txt(535,158,'Δy')}${txt(360,222,'Δx')}${txt(335,55,'gradient = Δy / Δx')}`);
    }
    if(topicId==='particles'){
      if(/photoelectric|photon|work function|threshold/.test(source))return svg('Photoelectric effect','One photon transfers energy to one electron. Emission occurs only when hf is at least the work function.',`${defs}${path('M90 80 L220 150 L90 220','ucv-wave')}${txt(105,62,'photon hf','ucv-text','start')}${line(230,65,230,235,'ucv-surface')}${line(230,95,620,95,'ucv-surface')}${circle(300,95,10)}${line(310,92,520,55,'ucv-accent',true)}${txt(535,55,'electron Eₖ','ucv-text','start')}${txt(420,225,'metal surface')}`);
      return svg('Quark structure of nucleons','Two up quarks and one down quark form a proton; one up and two down form a neutron.',`${defs}${circle(230,150,86,'ucv-shell')}${circle(490,150,86,'ucv-shell')}${circle(205,125,25)}${circle(255,125,25)}${circle(230,175,25,'ucv-warn')}${txt(205,132,'u')}${txt(255,132,'u')}${txt(230,182,'d')}${circle(465,125,25)}${circle(515,125,25,'ucv-warn')}${circle(490,175,25,'ucv-warn')}${txt(465,132,'u')}${txt(515,132,'d')}${txt(490,182,'d')}${txt(230,270,'proton +e')}${txt(490,270,'neutron 0')}`);
    }
    if(topicId==='waves'){
      if(/stationary|node|antinode|resonance/.test(source))return svg('Stationary wave','Nodes have zero amplitude while antinodes have maximum amplitude; adjacent nodes are separated by λ/2.',`${defs}${line(80,150,640,150,'ucv-axis')}${path('M80 150 C130 60 180 60 230 150 C280 240 330 240 380 150 C430 60 480 60 530 150 C580 240 620 220 640 150','ucv-accent')}${[80,230,380,530,640].map(x=>circle(x,150,6)).join('')}${txt(355,282,'node spacing = λ/2')}`);
      return svg('Wave quantities','Amplitude is measured from equilibrium; wavelength is the distance between adjacent points in phase.',`${defs}${line(70,150,650,150,'ucv-axis')}${path('M70 150 C120 60 170 60 220 150 C270 240 320 240 370 150 C420 60 470 60 520 150 C570 240 620 240 650 150','ucv-accent')}${line(145,150,145,72,'ucv-guide')}${txt(158,105,'A','ucv-text','start')}${line(120,255,370,255,'ucv-guide')}${txt(245,280,'λ')}`);
    }
    if(topicId==='mechanics-materials'){
      if(/stress|strain|young|elastic/.test(source))return svg('Stress–strain behaviour','The initial gradient gives Young modulus. Beyond the elastic region, permanent deformation can remain.',`${defs}${line(100,240,100,55,'ucv-axis',true)}${line(100,240,650,240,'ucv-axis',true)}${path('M100 240 L300 95 Q360 70 420 115 Q500 175 590 190','ucv-accent')}${txt(65,68,'stress','ucv-text','start')}${txt(620,270,'strain')}${txt(235,125,'linear elastic')}${txt(465,145,'plastic region')}`);
      return svg('Forces and motion','Resolve the forces first; the vector resultant determines the acceleration through F = ma.',`${defs}${circle(360,150,42,'ucv-shell')}${line(360,108,360,45,'ucv-accent',true)}${line(360,192,360,255,'ucv-warn',true)}${line(318,150,230,150,'ucv-line',true)}${line(402,150,515,150,'ucv-line',true)}${txt(360,32,'normal')}${txt(360,282,'weight')}${txt(210,155,'resistance')}${txt(540,155,'driving force')}`);
    }
    if(topicId==='electricity'){
      if(/internal resistance|emf|terminal/.test(source))return svg('EMF and internal resistance','Terminal p.d. falls as current rises because energy is transferred in the source: ε = V + Ir.',`${defs}${line(100,230,100,55,'ucv-axis',true)}${line(100,230,640,230,'ucv-axis',true)}${line(130,85,590,205,'ucv-accent')}${txt(85,72,'V','ucv-text','start')}${txt(620,260,'I')}${txt(145,70,'intercept = ε','ucv-text','start')}${txt(430,145,'gradient = −r')}`);
      return svg('Current and potential difference in a circuit','Current is charge flow per second; potential difference is energy transferred per unit charge.',`${defs}${line(120,90,580,90,'ucv-line')}${line(580,90,580,220,'ucv-line')}${line(580,220,120,220,'ucv-line')}${line(120,220,120,90,'ucv-line')}${line(305,90,415,90,'ucv-accent')}${txt(360,76,'resistor')}${circle(195,90,23,'ucv-shell')}${txt(195,96,'A')}${circle(360,220,23,'ucv-shell')}${txt(360,226,'V')}${line(420,90,520,90,'ucv-accent',true)}${txt(470,65,'I')}`);
    }
    if(topicId==='further-mechanics'){
      if(/simple harmonic|resonance|oscillation/.test(source))return svg('Simple harmonic motion','Acceleration points toward equilibrium and is proportional to displacement: a = −ω²x.',`${defs}${line(90,150,630,150,'ucv-axis')}${line(360,55,360,245,'ucv-guide')}${path('M90 150 C150 65 210 65 270 150 C330 235 390 235 450 150 C510 65 570 65 630 150','ucv-accent')}${txt(360,280,'time')}${txt(105,70,'displacement','ucv-text','start')}`);
      return svg('Circular motion','Velocity is tangential while centripetal acceleration and resultant force point toward the centre.',`${defs}${circle(360,150,88,'ucv-shell')}${circle(448,150,10)}${line(448,150,360,150,'ucv-warn',true)}${line(448,150,448,65,'ucv-accent',true)}${txt(404,140,'a, F')}${txt(470,80,'v','ucv-text','start')}${txt(360,268,'centre-directed acceleration')}`);
    }
    if(topicId==='fields'){
      if(/magnetic|flux|induction/.test(source))return svg('Electromagnetic induction','A changing magnetic flux linkage produces an emf; the induced effect opposes the change that caused it.',`${defs}${[160,205,250,295,340,385,430,475,520].map(x=>line(x,65,x,225,'ucv-guide',true)).join('')}${path('M165 150 C220 85 300 85 355 150 C410 215 490 215 545 150','ucv-accent')}${txt(355,45,'changing magnetic field')}${txt(355,265,'coil / conductor')}`);
      return svg('Radial field','Field strength is the force per unit mass or charge. Field lines show direction; closer spacing represents stronger field.',`${defs}${circle(360,150,22,'ucv-node')}${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return line(360+35*Math.cos(r),150+35*Math.sin(r),360+125*Math.cos(r),150+125*Math.sin(r),'ucv-accent',true)}).join('')}${txt(360,285,'radial field decreases with distance')}`);
    }
    if(topicId==='nuclear'){
      if(/half-life|decay|activity/.test(source))return svg('Radioactive decay','Activity and number of undecayed nuclei fall exponentially; equal half-lives multiply the remaining amount by 1/2.',`${defs}${line(100,240,100,55,'ucv-axis',true)}${line(100,240,650,240,'ucv-axis',true)}${path('M110 70 C210 105 275 145 340 175 C430 210 520 228 620 236','ucv-accent')}${line(285,70,285,240,'ucv-guide')}${line(460,70,460,240,'ucv-guide')}${txt(285,270,'1 half-life')}${txt(460,270,'2 half-lives')}`);
      return svg('Nuclear binding energy','Energy is released when products are more tightly bound per nucleon than the starting nuclei.',`${defs}${line(95,235,95,55,'ucv-axis',true)}${line(95,235,650,235,'ucv-axis',true)}${path('M105 220 C150 90 210 70 285 82 C390 105 500 135 625 160','ucv-accent')}${txt(70,65,'BE/A','ucv-text','start')}${txt(620,268,'nucleon number')}${txt(280,58,'most tightly bound')}`);
    }
    return svg('Physics model','Use the diagram with the equation and verbal explanation to connect the variables in this lesson.',`${defs}${line(120,150,600,150,'ucv-axis',true)}${circle(220,150,30,'ucv-node')}${circle(500,150,30,'ucv-warn')}${line(250,150,465,150,'ucv-accent',true)}${txt(220,205,'starting state')}${txt(500,205,'result')}`);
  }

  function termsForChapter(topicId,chapter){
    const source=chapterSearchText(chapter).toLowerCase();
    const library=window.CourseTextbook?.terms||{};
    const preferred=TOPIC_TERMS[topicId]||[];
    const keys=[];
    for(const key of preferred){if(source.includes(key)||keys.length<3)keys.push(key);}
    for(const key of Object.keys(library)){if(keys.length>=6)break;if(!keys.includes(key)&&source.includes(key))keys.push(key);}
    return keys.slice(0,6).map(key=>({key,label:key.replace(/\b\w/g,m=>m.toUpperCase()),...(library[key]||{})}));
  }

  function enrichmentPayload(topicId,index,label,pageTitle){
    const match=chooseChapter(topicId,index,label,pageTitle);
    if(!match)return null;
    const {topic,chapter,chapterIndex}=match;
    const keyPoints=(chapter.sections||[]).slice(0,4).map(([heading,body])=>({heading:clean(heading),body:firstSentence(body)}));
    const equations=(chapter.equations||[]).slice(0,4).map(item=>({name:clean(item[0]),formula:clean(item[1]),unit:clean(item[2]||'')}));
    const example=chapter.example?{question:clean(chapter.example.q),steps:(chapter.example.steps||[]).map(clean),answer:clean(chapter.example.answer)}:null;
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
      example,
      visual:visualForLesson(topicId,chapter),
      terms:termsForChapter(topicId,chapter),
      examTip:clean(chapter.examTip||''),
      checks:(chapter.checks||[]).slice(0,3).map(clean)
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