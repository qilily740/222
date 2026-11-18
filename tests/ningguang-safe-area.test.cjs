const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
let JSDOM;try{({JSDOM}=require('./helpers/jsdom.cjs'))}catch{}
const css=fs.readFileSync(path.join(__dirname,'../style.css'),'utf8');
function fixture(inset){
 // jsdom does not measure device safe areas; supply the measured app inset.
 const resolved=css.replaceAll('var(--app-safe-top,env(safe-area-inset-top,0px))',`${inset}px`);
 return new JSDOM(`<style>${resolved}</style><body data-iris-appearance="apple">
 <section id="featureScreen" class="feature-screen"><header class="feature-page-topbar"><button>返回</button></header><div class="sms-inbox"></div><div class="music-chat-fullscreen"><header class="music-chat-page-header"></header></div></section>
 <section id="sheet" class="ng-unified-sheet is-reflection-editor-fullscreen"><header class="reflection-editor-topbar"></header></section>
 <section class="video-call-screen apple-video-call"><header class="video-call-header"></header></section></body>`);
}
test('Ningguang feature navigation reserves the measured status bar space across all pages',{skip:!JSDOM},()=>{
 for(const inset of [0,24,44,59]){
  const dom=fixture(inset),d=dom.window.document,screen=d.querySelector('#featureScreen');
  try{
   for(const page of ['apple-worldbook','apple-beautify','apple-forum','apple-market','apple-novels','apple-sms','apple-experiences','apple-extras','apple-business','apple-reading','apple-music','ng-group-management','is-group-chat-conversation']){
    screen.className=`feature-screen ${page}`;
    const style=dom.window.getComputedStyle(screen.firstElementChild);
    assert.equal(parseFloat(style.paddingTop),inset+10,`${page}: top padding`);
    assert.equal(parseFloat(style.minHeight),inset+60,`${page}: total height`);
    assert.equal(style.flexShrink,'0',`${page}: cannot shrink into status bar`);
   }
   d.body.dataset.irisAppearance='classic';
   assert.notEqual(dom.window.getComputedStyle(screen.firstElementChild).minHeight,`${inset+60}px`);
  }finally{dom.window.close()}
 }
});
test('Ningguang standalone headers reserve space once and retain hidden music navigation',{skip:!JSDOM},()=>{
 const dom=fixture(44),d=dom.window.document,style=node=>dom.window.getComputedStyle(d.querySelector(node));
 try{
  d.querySelector('#featureScreen').classList.add('apple-music');
  assert.equal(style('.feature-page-topbar').display,'none');
  assert.equal(style('.music-chat-page-header').paddingTop,'54px');
  assert.equal(style('.music-chat-page-header').minHeight,'108px');
  assert.equal(style('.reflection-editor-topbar').paddingTop,'56px');
  assert.equal(style('.video-call-screen').paddingTop,'44px');
  assert.equal(style('.video-call-header').paddingTop,'12px');
 }finally{dom.window.close()}
});
