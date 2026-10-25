const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Import=require('../scripts/importers.js');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const card={data:{name:'测试角色',description:'保留原始设定',character_book:{entries:[{keys:['地点'],content:'测试地点'}]}}};
const file=(name,content)=>Object.assign(new Blob([content]),{name});
function storedDocx(xml){
 const name=Buffer.from('word/document.xml'),data=Buffer.from(xml),local=Buffer.alloc(30),central=Buffer.alloc(46),end=Buffer.alloc(22);
 local.writeUInt32LE(0x04034b50);local.writeUInt32LE(data.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(name.length,26);
 central.writeUInt32LE(0x02014b50);central.writeUInt32LE(data.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(name.length,28);
 const offset=local.length+name.length+data.length;end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([local,name,data,central,name,end]);
}
test('222 keeps its domain and PWA identity without tutorial or seeded assistant',()=>{
 assert.equal(read('CNAME').trim(),'iris.suri.us.ci');
 const manifest=JSON.parse(read('config/manifest.webmanifest'));
 for(const key of ['id','start_url','scope'])assert.equal(manifest[key],'/222/');
 assert.doesNotMatch(read('scripts/app.js'),/irisGuide|IrisGuide|irisWelcome|iris-assistant/);
 assert.doesNotMatch(read('scripts/storage-bootstrap.js'),/guide-content/);
 assert.match(read('scripts/characters.js'),/accept="\.json,\.png,\.txt,\.docx"/);
});
test('222 imports JSON character cards with their embedded worldbook',async()=>{
 const result=await Import.parse(file('角色.json',JSON.stringify(card)));
 assert.equal(result.character.name,'测试角色');
 assert.equal(result.character.worldBook[0].content,'测试地点');
});
test('222 reads embedded PNG character-card metadata and worldbook',async()=>{
 const data=Buffer.from('chara\0'+Buffer.from(JSON.stringify(card)).toString('base64'));
 const chunk=Buffer.alloc(8+data.length+4);chunk.writeUInt32BE(data.length);chunk.write('tEXt',4);data.copy(chunk,8);
 const result=await Import.pngData(new Uint8Array(Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk])));
 assert.equal(result.name,'测试角色');assert.equal(result.worldBook[0].content,'测试地点');
});
test('222 retains TXT and DOCX character imports',async()=>{
 const txt=await Import.parse(file('角色.txt','姓名：文本角色\n性别：男'));
 assert.equal(txt.character.name,'文本角色');
 const docx=storedDocx('<w:document><w:body><w:p><w:r><w:t>姓名：文档角色</w:t></w:r></w:p></w:body></w:document>');
 const result=await Import.parse(file('角色.docx',docx));assert.equal(result.character.name,'文档角色');
});

test('222 imports standalone JSON worldbooks in supported layouts and rejects invalid JSON',async()=>{
 const vm=require('node:vm'),source=read('scripts/app.js');
 const parser=source.slice(source.indexOf('async function parseGlobalWorldBookFile('),source.indexOf('function bindGlobalWorldBookPanel('));
 const context=vm.createContext({CharacterImport:Import,Uint8Array,TextDecoder});
 vm.runInContext(parser,context);
 const entries=[{keys:['目的地'],content:'世界书正文'}];
 for(const raw of [entries,{entries},{entries:{a:entries[0]}},{character_book:{entries}},card]){
  const result=await context.parseGlobalWorldBookFile(file('世界书.json',JSON.stringify(raw)));
  assert.equal(result.length,1);assert.ok(result[0].content);
 }
 await assert.rejects(context.parseGlobalWorldBookFile(file('损坏.json','{')),/JSON 格式无效/);
 assert.ok(source.includes('accept=".json,.txt,.docx,application/json'));
});
test('222 release metadata is consistent and startup notice entry points are absent',()=>{
 const version=JSON.parse(read('version.json'));
 assert.equal(version.release,'5.8.0-222-r10');
 assert.deepEqual(JSON.parse(read('config/version.json')),version);
 for(const name of ['scripts/app.js','scripts/storage-bootstrap.js','index.html'])assert.ok(read(name).includes(version.release),name);
 assert.doesNotMatch(read('scripts/app.js'),/function showAuthorNoticeOnFirstOpen|function showReleaseNoticeOnFirstOpen/);
 assert.doesNotMatch(read('index.html'),/id="authorNoticeDialog"/);
});
