const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM,VirtualConsole;try{({JSDOM,VirtualConsole}=require('./helpers/jsdom.cjs'))}catch{}
const root=path.join(__dirname,'..');
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve))};
function boot(saved,fetcher){
 const errors=[],snapshots=[],html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),console=new VirtualConsole();
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:console,beforeParse(w){
  w.IRIS_BOOT_STATE=saved;w.IRIS_STYLES_READY=Promise.resolve();w.Headers=global.Headers;w.Request=global.Request;w.Response=global.Response;w.fetch=fetcher||async function(){throw Error('no external network in local integration test')};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.confirm=()=>true;w.scrollTo=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.IrisStorage={mode:'test',save:async value=>snapshots.push(JSON.parse(JSON.stringify(value)))};
  w.addEventListener('error',event=>errors.push(event.error?.stack||event.message));
 }});
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'scripts/storage-bootstrap.js'),'utf8').match(/const scripts = (\[[^\n]+\]);/)[1].replace(/'/g,'"'));
 for(const file of scripts){const tag=dom.window.document.createElement('script');Object.defineProperty(tag,'src',{value:'http://localhost/'+file});tag.textContent=fs.readFileSync(path.join(root,file),'utf8');dom.window.document.body.append(tag)}
 return{dom,w:dom.window,errors,snapshots};
}

function conversationState(appearance){return{char:0,user:0,users:[{name:'用户'}],characters:[{name:'角色',chatSettings:{userIndex:0}}],messages:{'0-0-chat':Array.from({length:180},(_,i)=>({mine:i%2===0,text:'线上消息 '+i})),'0-0-offline':[{mine:false,text:'独立的线下故事'}]},settings:{settingsAppearance:appearance,beautifyCss:{online:'.bubble{color:purple}',offline:'.offline-prose-body{color:teal}',forum:'.forum-post{color:blue}'}}}}
test('switching modes reuses unchanged theme sheets, mounts the conversation once and updates chrome once',{skip:!JSDOM},async()=>{
 for(const appearance of ['apple','classic']){
  const f=boot(conversationState(appearance)),{w}=f,d=w.document;
  try{
   await flush();
   w.eval(`window.modeWork={scope:0,chrome:0,composer:0};for(const name of ['scopeBeautifyCss','syncPrivateChatChrome','updateComposerAction']){const original=window[name],key={scopeBeautifyCss:'scope',syncPrivateChatChrome:'chrome',updateComposerAction:'composer'}[name];window[name]=function(...args){window.modeWork[key]++;return original.apply(this,args)}}`);
   const before=w.eval('JSON.stringify(state.messages)'),styles=Array.from(d.head.querySelectorAll('style[id^="iris-beautify-"],#iris-if-prose-font'));
   const mutations=[],observer=new w.MutationObserver(records=>mutations.push(...records));styles.forEach(node=>observer.observe(node,{childList:true,subtree:true,characterData:true}));
   for(let index=0;index<4;index++){
    const rows=[],conversation=d.querySelector('#conversation'),rowsObserver=new w.MutationObserver(records=>rows.push(...records));rowsObserver.observe(conversation,{childList:true});
    d.querySelector('[data-nav="2"]').click();await flush();rowsObserver.disconnect();
    assert.equal(w.eval('state.offline'),index%2===0);assert.equal(w.eval('chars[state.char].offlineMode'),index%2===0);
    assert.match(conversation.textContent,index%2===0?/独立的线下故事/:/线上消息 179/);
    assert.equal(rows.length,1,appearance+': mount the switched conversation in a single DOM operation');
   }
   observer.disconnect();assert.equal(mutations.length,0,appearance+': no stylesheet replacement on a mode switch');
   assert.deepEqual(JSON.parse(JSON.stringify(w.modeWork)),{scope:0,chrome:4,composer:4});
   assert.equal(w.eval('JSON.stringify(state.messages)'),before);assert.deepEqual(f.errors,[]);
  }finally{await flush();w.close()}
 }
});
test('theme caching still applies edits, background removal, role changes and missing styles immediately',{skip:!JSDOM},async()=>{
 const f=boot(conversationState('apple')),{w}=f,d=w.document;
 try{
  const online=d.querySelector('#iris-beautify-online'),offline=d.querySelector('#iris-beautify-offline'),forum=d.querySelector('#iris-beautify-forum');
  w.eval("state.settings.beautifyCss.online='.bubble{color:orange}';state.settings.beautifyBackgrounds.online='https://images.test/new.jpg';applyBeautifyCss()");
  assert.match(online.textContent,/color:orange/);assert.match(online.textContent,/new\.jpg/);
  w.eval("state.settings.beautifyBackgrounds.online='';state.settings.beautifyCss.offline='.offline-prose-body{font-family:serif}';state.settings.beautifyCss.forum='.forum-post{color:red}';applyBeautifyCss()");
  assert.doesNotMatch(online.textContent,/new\.jpg/);assert.match(offline.textContent,/font-family:serif/);assert.match(d.querySelector('#iris-if-prose-font').textContent,/font-family:serif/);assert.match(forum.textContent,/color:red/);
  w.eval("state.settings.onlineBeautifyLibrary={active:'default',items:[{id:'role-theme',name:'角色专用',css:'.bubble{color:green}'}]};chars[0].chatSettings.onlineAppearanceId='role-theme';applyBeautifyCss()");assert.match(online.textContent,/color:green/);
  const expected=online.textContent;online.textContent='';w.applyBeautifyCss();assert.equal(online.textContent,expected);
  online.remove();d.querySelector('#iris-if-prose-font').remove();w.applyBeautifyCss();assert.equal(d.querySelector('#iris-beautify-online').textContent,expected);assert.match(d.querySelector('#iris-if-prose-font').textContent,/font-family:serif/);
  assert.deepEqual(f.errors,[]);
 }finally{await flush();w.close()}
});
