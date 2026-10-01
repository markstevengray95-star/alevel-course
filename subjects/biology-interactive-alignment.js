(()=>{
  'use strict';
  const base=window.ALEVEL_BIOLOGY_INTERACTIVES;if(!base)return;
  const overrides={
    '3.4.4':{source:'3.7.3',kind:'population',title:'Adaptation and selection model',goal:'Apply selection pressure and connect advantageous phenotypes to changing allele frequencies.'},
    '3.8.1':{source:'3.4.3',kind:'dna',title:'Mutation impact explorer',goal:'Alter a DNA base sequence and connect mutation to possible changes in protein structure.'},
    '3.8.2':{source:'3.8.1',kind:'process',title:'Gene-expression control switchboard',goal:'Explore how regulatory influences alter transcription and cell phenotype.'}
  };
  const definitions={...base.definitions};
  for(const [ref,item] of Object.entries(overrides))definitions[ref]=Object.freeze({kind:item.kind,title:item.title,goal:item.goal,detail:item.kind});
  function render(context){
    const ref=String(context?.section?.ref||'');const item=overrides[ref];
    if(!item)return base.render(context);
    const surrogate={...context,section:{...context.section,ref:item.source}};
    const ok=base.render(surrogate);if(!ok)return false;
    const host=document.querySelector('#biologyLessonContent [data-bio-interactive]');
    if(host){host.dataset.kind=item.kind;const title=host.querySelector('.bio-int-head h2');const goal=host.querySelector('.bio-int-head p');if(title)title.textContent=item.title;if(goal)goal.textContent=item.goal;}
    return true;
  }
  window.ALEVEL_BIOLOGY_INTERACTIVES=Object.freeze({...base,definitions:Object.freeze(definitions),render});
})();