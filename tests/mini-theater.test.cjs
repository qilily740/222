const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{addEventListener(){}},Map,WeakSet};vm.createContext(ctx);vm.runInContext(fs.readFileSync('mini-theater.js','utf8'),ctx);const mini=ctx.window.IrisMiniTheater;
const html='<!DOCTYPE html><html><head><style>.x{color:red}</style></head><body><button>打开信件</button><script>let count=0;</script></body></html>',raw=`正式剧情。\n<mini_theater>${html}</mini_theater>`;
assert.equal(mini.split(raw).prose,'正式剧情。\n');assert.equal(mini.split(raw).theaters[0],html);assert.equal(mini.filterHistory(raw),'正式剧情。\n');
const pattern=mini.rule().find;assert.equal(pattern,'/<mini_theater\\b[^>]*>[\\s\\S]*?<\\/mini_theater\\s*>/gi');assert.equal(mini.rule().displayEnabled,false);assert.equal(mini.rule().enabled,true);
for(let end=raw.indexOf('<mini_theater>')+1;end<=raw.length;end++){
 const piece=mini.split(raw.slice(0,end),true);assert(!piece.prose.includes('mini_theater')&&!piece.prose.includes('<html')&&!piece.prose.includes('count=0'),'partial tag/code leaked');if(piece.theaters.length)assert.equal(piece.theaters[0],html);
}
assert.equal(mini.filterHistory('前文。<mini_theater>普通文本，没有 HTML。'),'前文。普通文本，没有 HTML。');assert.equal(mini.filterHistory('前文。<mini_theater><html><body>代码</body></html>后文。'),'前文。后文。');assert.equal(mini.filterHistory('前文。<mini_theater><html><script>代码'),'前文。');assert.equal(mini.filterHistory('x'.repeat(16000)+`<mini_theater>${html}</mini_theater>`),'x'.repeat(16000));
console.log('PASS parser, every stream boundary, malformed labels, send-only rule and long history.');
