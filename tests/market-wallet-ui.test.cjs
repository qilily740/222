const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { window: {}, Date, Math, Intl, Error, JSON, Number, String, Array, Object, setTimeout };
vm.runInNewContext(fs.readFileSync(require.resolve('../market-core.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(require.resolve('../market.js'), 'utf8'), context);
const C = context.window.IrisMarketCore;
const state = {
  users: [{ name: '面具甲' }, { name: '面具乙' }],
  characters: [{ name: '同名角色', chatSettings: { userIndex: 0 } }, { name: '同名角色', chatSettings: { userIndex: 0 } }],
  char: 0,
  user: 0
};
C.normalize(state);
C.addCart(state, 'p-home-mug');
C.persona(state, 0).addresses.push({ id: 'addr', name: '玩家', label: '虚拟住处', isDefault: true });
let selectedRoleIndex = 0;
let saves = 0;
let apiCalls = 0;
let fxCalls = 0;
const prompts=[];
let apiFailure = false;
const subtitle = { textContent: '' };
const horizontalNodes={'.market-category-pills':{scrollLeft:0},'.market-categories':{scrollLeft:0},'.market-role-picker':{scrollLeft:0}};
const content = {
  scrollTop: 0,
  innerHTML: '',
  querySelector(selector) {
    if (selector === '#marketPayRole') return { value: selectedRoleIndex };
    if (horizontalNodes[selector]) return horizontalNodes[selector];
    return null;
  }
};
let markup='';
Object.defineProperty(content,'innerHTML',{get:()=>markup,set:value=>{markup=value;content.scrollTop=0;Object.values(horizontalNodes).forEach(node=>node.scrollLeft=0);}});
context.window.IrisMarket.render({
  state,
  characters: state.characters,
  content,
  title: { querySelector: selector => selector === '.market-page-subtitle' ? subtitle : null },
  esc: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])),
  save: () => { saves += 1; },
  exchangeRateToCny: async code => {fxCalls+=1;assert.equal(code,'USD');return {rate:7.2,date:'2026-10-14'};},
  request: async prompt => { prompts.push(prompt);apiCalls += 1; if(apiFailure)throw Error('钱包 API 失败');if(prompt.includes('仅返回本次检查区间'))return JSON.stringify({transactions:[]}); return JSON.stringify({balance:8520,currency:'CNY',bankName:'虚拟城市银行',accountStyle:'numeric',transactions:[{kind:'expense',amount:22,description:'奶茶',daysAgo:0},{kind:'expense',amount:168,description:'工作用品',daysAgo:1},{kind:'income',amount:4000,description:'工作收入',daysAgo:5}]}); }
});
assert.match(content.innerHTML, /market-product-art/);
assert.match(content.innerHTML, /<svg viewBox="0 0 24 24" aria-hidden="true">/);
assert.doesNotMatch(content.innerHTML, /把喜欢的|寄进生活里|CURATED FOR YOU/);
assert.match(content.innerHTML, /class="market-nav"/);
assert.match(content.innerHTML, /class="market-nav-capsule"/);
assert.match(content.innerHTML, /class="market-dock-my/);
assert.equal(subtitle.textContent, '首页');

async function click(dataset) {
  content.onclick({ target: { closest: () => ({ dataset }) } });
  await new Promise(resolve => setImmediate(resolve));
}

(async () => {
  await click({ mPage: 'category' });
  assert.match(content.innerHTML, /class="market-nav"/);
  assert.match(content.innerHTML, /class="market-nav-capsule"/);
  assert.equal(subtitle.textContent, '分类');
  content.scrollTop=240;horizontalNodes['.market-category-pills'].scrollLeft=90;
  await click({mCategory:'服装'});
  assert.equal(content.scrollTop,240,'category updates must preserve page scroll');
  assert.equal(horizontalNodes['.market-category-pills'].scrollLeft,90,'category updates must preserve horizontal scroll');
  assert.doesNotMatch(content.innerHTML,/>‹<\/button>/);
  await click({ mPage: 'orders' });
  assert.match(content.innerHTML, /class="market-dock-my/);
  assert.equal(subtitle.textContent, '订单');
  await click({ mPage: 'mine' });
  assert.match(content.innerHTML, /class="market-nav"/);
  assert.equal(subtitle.textContent, '我的');
  await click({mPage:'category'});
  assert.equal(content.scrollTop,240,'returning to a page must restore its position');
  await click({ mPage: 'cart' });
  await click({ mCheckout: '' });
  assert.match(content.innerHTML, /找角色代付/);
  assert.equal(subtitle.textContent, '确认订单');
  assert.match(content.innerHTML, /class="market-nav-capsule"/);
  assert.match(content.innerHTML, /aria-expanded="false"/);
  assert.match(content.innerHTML, /aria-hidden="true"/);
  assert.match(content.innerHTML, /余额未设定/);
  const p = C.persona(state, 0);
  const overdueOrder = { id: 'local-order', items: [], totalCents: 0, status: '待发货', shippingEvents: [{ status: '运输途中', at: Date.now() - 1000 }] };
  p.orders.push(overdueOrder);
  const savesBeforePeek = saves;
  content.scrollTop=400;horizontalNodes['.market-role-picker'].scrollLeft=64;
  await click({ mWalletToggle: '' });
  assert.match(content.innerHTML, /aria-expanded="true"/);
  assert.match(content.innerHTML, /market-role-wallet is-open/);
  assert.equal(content.scrollTop,400,'opening and loading a wallet must preserve scroll');
  assert.equal(horizontalNodes['.market-role-picker'].scrollLeft,64);
  assert.match(content.innerHTML,/experience-content-label/);
  assert.doesNotMatch(content.innerHTML,/>‹<\/button>/);
  assert.equal(overdueOrder.status, '待发货', 'opening the wallet must not advance logistics');
  assert.equal(saves, savesBeforePeek + 1, 'first generation must save once');
  assert.equal(C.roleWallet(state,state.characters[0].irisMarketId,0).balanceCents,852000);
  assert.equal(C.roleWallet(state,state.characters[0].irisMarketId,0).ledger.length,4);
  assert.equal(apiCalls,1);
  const generated=C.roleWallet(state,state.characters[0].irisMarketId,0);
  assert.equal(generated.ledger.reduce((sum,row)=>sum+row.amountCents,0),generated.balanceCents);
  assert.ok(generated.ledger.some(row=>row.amountCents<0));
  assert.match(content.innerHTML,/工作用品/);
  await click({ mWalletToggle: '' });
  assert.match(content.innerHTML, /aria-expanded="false"/);
  await click({ mWalletToggle: '' });
  selectedRoleIndex = 1;
  await click({mPickRole:'1'});
  assert.match(content.innerHTML, /同名角色的私人钱包/);
  assert.match(content.innerHTML, /aria-expanded="false"/);
  assert.equal(apiCalls, 2);
  assert.equal(C.roleWallet(state,state.characters[1].irisMarketId,0).balanceCents,null);
  assert.equal(C.roleWallet(state,state.characters[0].irisMarketId,1).balanceCents,null);
  apiFailure = true;
  await click({mWalletToggle:''});
  assert.equal(C.roleWallet(state,state.characters[1].irisMarketId,0).balanceCents,null);
  assert.equal(C.roleWallet(state,state.characters[1].irisMarketId,0).ledger.length,0);
  assert.equal(apiCalls,3);
  await click({mWalletToggle:''});
  apiFailure = false;
  await click({mWalletToggle:''});
  assert.equal(apiCalls,4);
  const wallet = C.roleWallet(state,state.characters[1].irisMarketId,0);
  const number = wallet.accountNumber;
  C.initializeRoleWallet(state,0,state.characters[1].irisMarketId,{balance:1,currency:'CNY',bankName:'另一个银行',accountStyle:'numeric'});
  assert.equal(wallet.balanceCents,852000);
  assert.equal(wallet.ledger.length,4);
  assert.equal(wallet.accountNumber,number);
  assert.equal(state.messages,undefined,'wallet API must not create chat messages');
  const restored=JSON.parse(JSON.stringify(state));
  assert.equal(C.roleWallet(restored,restored.characters[1].irisMarketId,0).accountNumber,number);
  await click({mWalletToggle:''});
  wallet.currency='USD';
  state.messages={'1-0-chat':[{text:'当前角色线上行动',mine:false}],'1-0-offline':[{text:'当前角色线下行动',mine:false}],'0-0-chat':[{text:'其他角色私人信息'}],'1-1-chat':[{text:'其他面具私人信息'}]};
  const savedMessages=JSON.stringify(state.messages);
  await click({mWalletToggle:''});
  assert.equal(fxCalls,1);
  assert.match(prompts.at(-1),/当前角色线上行动/);
  assert.match(prompts.at(-1),/当前角色线下行动/);
  assert.doesNotMatch(prompts.at(-1),/其他角色私人信息|其他面具私人信息/);
  assert.equal(JSON.stringify(state.messages),savedMessages);
  assert.equal(apiCalls,5,'each reopening requests one incremental wallet update');
  assert.match(content.innerHTML,/≈ ¥61,344.00 人民币/);
  assert.equal(wallet.balanceCents,852000,'currency reference must not change funds');
  assert.equal(context.window.IrisMarket.back(),true);
  assert.equal(subtitle.textContent,'购物车');
  assert.equal(context.window.IrisMarket.back(),false,'a root page exits the market');
  await click({mPage:'category'});
  assert.equal(content.scrollTop,240);
  await click({mProduct:'p-home-mug'});
  content.onchange({target:{name:'spec',value:'large',dataset:{}}});
  await click({mFavorite:'p-home-mug'});
  assert.match(content.innerHTML,/value="large" checked/,'favoriting must preserve the selected specification');
  assert.doesNotMatch(content.innerHTML,/<header class="market-subhead">/);
  assert.match(content.innerHTML,/>购买<\/button>/);
  assert.equal(context.window.IrisMarket.back(),true);
  assert.equal(content.scrollTop,240,'wordmark return must restore the preceding page');
  assert.equal(context.window.IrisMarket.back(),false,'category wordmark must exit even with route history');
  for(const page of ['home','cart','orders','mine']){await click({mPage:page});assert.equal(context.window.IrisMarket.back(),false);}
  console.log('market-wallet-ui: all assertions passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
