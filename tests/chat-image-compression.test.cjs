const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('scripts/app.js','utf8');let version='first',draws=0,closed=0,quality,width,height;const fills=[];
const ctx={Map,Set,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},AbortSignal,crypto:require('node:crypto').webcrypto,fetch:async()=>({ok:true,blob:async()=>new Blob([version])}),createImageBitmap:async()=>({width:3000,height:2000,close(){closed++}}),document:{createElement:()=>{const canvas={getContext:()=>({set fillStyle(v){fills.push(v)},fillRect(){},drawImage(){draws++}}),toDataURL:(type,q)=>{quality=q;width=canvas.width;height=canvas.height;return 'data:image/jpeg;base64,'+version}};return canvas}}};vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('const CHAT_IMAGE_LIMITS='),source.indexOf('async function attachChatImages(')),ctx);
(async()=>{
 const first=await ctx.compressedChatImage('same-url');assert.equal(width,1536);assert.equal(height,1024);assert.equal(quality,.8);assert.equal(fills[0],'#fff');assert.equal(closed,1);assert.equal(await ctx.compressedChatImage('same-url'),first);assert.equal(draws,1);
 version='changed';assert.notEqual(await ctx.compressedChatImage('same-url'),first);assert.equal(draws,2);
 for(let i=0;i<40;i++){version='content'+i;await ctx.compressedChatImage('url'+i)}assert(vm.runInContext('chatImageCache.size<=CHAT_IMAGE_LIMITS.cacheEntries && chatImageCacheBytes<=CHAT_IMAGE_LIMITS.cacheBytes',ctx));
 console.log('PASS request compression dimensions, JPEG quality, white background, bitmap release, content cache invalidation and cache limits (browser APIs mocked).');
})().catch(e=>{console.error(e);process.exitCode=1});
