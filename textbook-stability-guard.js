(()=>{
'use strict';
if(window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__)return;
window.__ALEVEL_TEXTBOOK_STABILITY_GUARD__=true;
const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
if(!descriptor?.get||!descriptor?.set)return;
const assigned=new WeakMap();
Object.defineProperty(Element.prototype,'innerHTML',{
  configurable:descriptor.configurable,
  enumerable:descriptor.enumerable,
  get:descriptor.get,
  set(value){
    const guarded=this?.classList?.contains('tbp5-adaptive');
    if(guarded){
      const next=String(value);
      if(assigned.get(this)===next)return;
      assigned.set(this,next);
    }
    return descriptor.set.call(this,value);
  }
});
})();