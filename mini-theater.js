/* Offline side stories: parsing, send-only filtering and isolated interactive rendering. */
(() => {
 'use strict';
 const prompt = `<随机互动小剧场>

【创作】
每轮正文结束后，生成一个与近期剧情、人物关系及角色性格紧密相关的HTML+CSS+JavaScript互动小剧场。

每次独立设计主题、视觉风格与玩法，不使用固定模板。可以是小游戏、虚拟应用、信件、档案、物品探索、互动故事，也可以创造全新形式。

小剧场应提供正文之外的新体验，不复述剧情，不让番外结果改变主线，不替{{user}}决定言行。

【交互】
必须是真正可玩的互动作品，而非静态页面或装饰性按钮。

根据玩法设计点击、拖动、输入、翻页、解锁、选择等操作。

用户操作必须改变页面状态、触发不同反馈或推进游戏。

复杂玩法需要完整的状态管理、判断逻辑与结果反馈。

简单玩法也必须有实际探索价值。

禁止点击一次就结束、假按钮、无效选项和所有操作得到相同结果。

所有交互由实际可执行的JavaScript实现。

【视觉】
每次独立设计布局、配色、字体、材质与交互效果。

追求精美、自然、具有真实设计逻辑的视觉表现。

避免通用AI网页风格：
大面积渐变、滥用毛玻璃、巨大圆角、厚重阴影、细碎装饰、重复卡片、千篇一律的深色面板。

不强制黑白灰，也不固定任何美术风格。

根据主题选择合理的视觉形式，注重比例、排版、留白、色彩与细节。

精美不等于复杂，所有装饰都应服务于内容。

避免将不同玩法统一制作成待办清单、进度条或三选一按钮。

【尺寸】
小剧场嵌入iris聊天页面，不是全屏网页。

html、body背景透明。

body高度由内容自然撑开，不使用100vh、固定整屏高度或垂直居中布局。

视觉背景仅设置在作品自身的内容区域。

使用响应式布局，宽度不超过父容器，适配窄屏手机。

避免横向溢出、文字裁切和大面积无内容的背景。

【技术】
输出完整HTML文档，内嵌CSS和JavaScript。

使用原生浏览器技术，不依赖外部脚本、样式、图片、字体或API。

允许CSS与内联SVG绘图。

所有操作必须绑定真实事件，并正确更新页面状态。

不得访问iris主页面、聊天数据或其他内部资源，不得向外发送信息。

【折叠】
iris前端负责默认折叠与展开。

折叠显示「▸ 小剧场」，展开显示「▾ 小剧场」。

AI只生成内部作品，不生成折叠按钮或额外折叠结构。

【输出】
先完整输出正式正文，再生成一个小剧场。

严格使用以下格式：

<mini_theater>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
/* 完整CSS */
</style>
</head>
<body>
<!-- 完整HTML -->
<script>
/* 完整JavaScript */
</script>
</body>
</html>
</mini_theater>

实际生成时必须填写完整代码，不保留占位内容。

不使用Markdown代码围栏，不输出额外解释。

</随机互动小剧场>`;
 const ruleId='offline-no-mini-theater';
 const rule=()=>({id:ruleId,name:'不发送小剧场',find:'/<mini_theater\\b[^>]*>[\\s\\S]*?<\\/mini_theater\\s*>/gi',replace:'',enabled:true,contextEnabled:true,displayEnabled:false,target:['ai']});
 const completePattern=()=>/<mini_theater\b[^>]*>[\s\S]*?<\/mini_theater\s*>/gi;
 function split(value,streaming=false){
  const source=String(value??''),theaters=[];let prose='',cursor=0;
  const opening=/<mini_theater\b[^>]*>/gi;let match;
  while((match=opening.exec(source))){
   prose+=source.slice(cursor,match.index);
   const close=/<\/mini_theater\s*>/gi;close.lastIndex=opening.lastIndex;const end=close.exec(source);
   if(end){theaters.push(source.slice(opening.lastIndex,end.index));cursor=close.lastIndex;opening.lastIndex=cursor;continue}
   const tail=source.slice(opening.lastIndex),htmlEnd=/<\/html\s*>/i.exec(tail);
   // For malformed historical labels, remove recognizable HTML only, retaining ordinary prose.
   if(!streaming){if(/^\s*(?:<!doctype\b|<(?:html|head|body|style|script|meta)\b)/i.test(tail)){if(htmlEnd)prose+=tail.slice(htmlEnd.index+htmlEnd[0].length)}else prose+=tail}
   cursor=source.length;break;
  }
  prose+=source.slice(cursor);
  prose=prose.replace(/<\/mini_theater\s*>/gi,'');
  const partial=/<(?:\/?mini_theater\b[^>]*|\/?m(?:i(?:n(?:i(?:_(?:t(?:h(?:e(?:a(?:t(?:e(?:r)?)?)?)?)?)?)?)?)?)?)?)$/i.exec(prose);
  if(partial&&(streaming||/^<\/?mini_theater\b/i.test(partial[0])))prose=prose.slice(0,partial.index);
  return{prose,theaters}
 }
 function filterHistory(value){return split(String(value??'').replace(completePattern(),''),false).prose}
 function hash(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return(n>>>0).toString(36)}
 const documents=new Map(),bound=new WeakSet(),frames=new Map();
 function markup(message,threadKey,escape){
  const html=String(message?.miniTheater||split(message?.text).theaters[0]||split(message?.rawResponse).theaters[0]||'');
  if(!html.trim())return'';
  const key=hash(`${threadKey}:${message?.miniTheaterId||message?.id||message?.createdAt||''}:${html}`);
  documents.set(key,html);
  return `<details class="offline-mini-theater" data-mini-theater-key="${escape(key)}"><summary>小剧场</summary></details>`
 }
 function documentFor(html,token){
  const doc=new DOMParser().parseFromString(String(html),'text/html');
  doc.querySelectorAll('base,meta[http-equiv],link,iframe,frame,object,embed,portal').forEach(node=>node.remove());
  doc.querySelectorAll('script').forEach(script=>{if(script.hasAttribute('src')||script.hasAttribute('href')||script.hasAttribute('xlink:href'))script.remove();else script.setAttribute('nonce',token)});
  doc.querySelectorAll('a,area').forEach(link=>{if(!String(link.getAttribute('href')||'').startsWith('#'))link.removeAttribute('href');link.removeAttribute('target');link.removeAttribute('ping');link.removeAttribute('download')});
  doc.querySelectorAll('form').forEach(form=>{form.removeAttribute('action');form.removeAttribute('target')});
  const policy=doc.createElement('meta');policy.httpEquiv='Content-Security-Policy';
  policy.content=`default-src 'none'; script-src 'nonce-${token}'; script-src-attr 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; object-src 'none'; media-src 'none'; form-action 'none'; base-uri 'none'`;
  const shim=doc.createElement('script');shim.setAttribute('nonce',token);
  shim.textContent=`(()=>{const token=${JSON.stringify(token)};for(const name of ['RTCPeerConnection','webkitRTCPeerConnection','WebSocket','Worker','SharedWorker']){try{Object.defineProperty(window,name,{value:undefined,writable:false,configurable:false})}catch{}}document.addEventListener('submit',event=>event.preventDefault(),true);let queued=false;const resizeObserver=window.ResizeObserver?new ResizeObserver(resize):null;function post(data){try{parent.postMessage(data,'*')}catch{}}function resize(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const body=document.body,root=document.documentElement;if(!body||!root)return;const height=Math.ceil(Math.max(body.scrollHeight,body.offsetHeight,body.getBoundingClientRect().height,root.scrollHeight,root.offsetHeight,root.getBoundingClientRect().height));post({type:'iris-mini-height',token,height})})}function reportError(){post({type:'iris-mini-error',token})}addEventListener('DOMContentLoaded',()=>{const body=document.body,root=document.documentElement;if(body){resizeObserver?.observe(body);new MutationObserver(resize).observe(body,{subtree:true,childList:true,attributes:true,characterData:true})}if(root)resizeObserver?.observe(root);resize()},{once:true});addEventListener('load',resize,{once:true});addEventListener('resize',resize);addEventListener('error',reportError);addEventListener('unhandledrejection',reportError)})();`;
  const css=doc.createElement('style');css.textContent='html,body{height:auto!important;min-height:0!important;max-height:none!important;background:transparent!important;pointer-events:auto!important}html{max-width:100%;overflow-x:hidden}body{min-width:0;max-width:100%;margin:0!important;overflow-wrap:anywhere}*,*::before,*::after{box-sizing:border-box}img,svg,canvas,video,table,input,textarea{max-width:100%}body button,body input,body textarea,body select,body summary,body label,body a,body [role="button"],body [tabindex]{pointer-events:auto!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent}';
  const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width,initial-scale=1';
  doc.head.prepend(policy,viewport,shim,css);
  return'<!DOCTYPE html>\n'+doc.documentElement.outerHTML
 }
 function mount(container){
  container?.querySelectorAll('[data-mini-theater-key]').forEach(details=>{
   if(bound.has(details))return;bound.add(details);
   details.addEventListener('toggle',()=>{
    if(!details.open||details.querySelector('iframe'))return;
    const html=documents.get(details.dataset.miniTheaterKey);if(!html)return;
    const token=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
    const frame=document.createElement('iframe');frame.title='互动小剧场';frame.className='offline-mini-theater-frame';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('credentialless','');
    frames.set(token,frame);frame.srcdoc=documentFor(html,token);details.append(frame);
   });
  });
  for(const [token,frame]of frames)if(!frame.isConnected)frames.delete(token);
  const active=new Set(Array.from(document.querySelectorAll('[data-mini-theater-key]'),node=>node.dataset.miniTheaterKey));
  for(const key of documents.keys())if(!active.has(key))documents.delete(key)
 }
 function patchEntry(previous,incoming){
  const live=previous.querySelector(':scope > [data-mini-theater-key]'),next=incoming.querySelector(':scope > [data-mini-theater-key]');
  if(!live||!next||live.dataset.miniTheaterKey!==next.dataset.miniTheaterKey)return false;
  // Keep the connected iframe node in place while surrounding message markup changes.
  for(const attr of Array.from(previous.attributes))previous.removeAttribute(attr.name);
  for(const attr of Array.from(incoming.attributes))previous.setAttribute(attr.name,attr.value);
  for(const child of Array.from(previous.childNodes))if(child!==live)child.remove();
  let after=false;for(const child of Array.from(incoming.childNodes)){if(child===next){after=true;continue}if(after)previous.append(child);else previous.insertBefore(child,live)}
  return true
 }
 window.addEventListener('message',event=>{
  const data=event.data;if(!data||typeof data!=='object'||Array.isArray(data)||typeof data.token!=='string')return;
  const frame=frames.get(data.token);if(!frame?.isConnected||event.source!==frame.contentWindow)return;
  if(data.type==='iris-mini-height'&&Object.keys(data).length===3&&typeof data.height==='number'&&Number.isFinite(data.height)){
   frame.style.height=`${Math.max(48,Math.min(6000,Math.ceil(data.height)))}px`;return
  }
  if(data.type==='iris-mini-error'&&Object.keys(data).length===2){
   let status=frame.nextElementSibling;if(!status||!status.classList.contains('offline-mini-theater-status')){status=document.createElement('div');status.className='offline-mini-theater-status';status.setAttribute('role','status');frame.after(status)}
   status.textContent='互动内容暂时无法运行，请继续阅读正文或稍后重试。'
  }
 });
 window.IrisMiniTheater={prompt,rule,ruleId,split,filterHistory,markup,mount,patchEntry,documentFor};
})();
