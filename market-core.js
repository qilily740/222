/* Iris virtual market domain model. Money is stored as integer minor units. */
(() => {
  const categories = ['服装','鞋包','饰品','珠宝','美妆','香水','鲜花','礼盒','玩偶','数码','家居','家具','食品','饮料','书籍','唱片','乐器','运动用品','宠物用品'];
  const shops = [
    ['shop-flower','晚风花房','鲜花','把当季花材整理成适合日常和纪念日的小束。'],['shop-dessert','小满甜室','食品','每日少量制作的甜点与礼盒。'],['shop-style','白昼衣橱','服装','耐穿、克制的日常衣物。'],['shop-digital','拾光数码','数码','面向日常记录与工作的小型数码用品。'],['shop-book','纸间书店','书籍','文学、艺术与生活类书籍。'],['shop-home','木屿生活','家居','实用而温和的家居用品。'],['shop-gift','一封礼物','礼盒','适合表达心意的包装与小物。'],['shop-pet','爪印杂货','宠物用品','面向陪伴动物的日常用品。']
  ].map(([id,name,category,description])=>({id,name,category,description}));
  const seed = [
    ['p-flower-rose','晨雾玫瑰小束','鲜花','shop-flower',128,'白玫瑰与尤加利叶以牛皮纸包扎，花束轻巧，适合探望与日常表达。','花材','浅白','默认','自然花材'],
    ['p-flower-sun','窗边向日葵','鲜花','shop-flower',88,'三枝向日葵搭配季节绿叶，明亮但不张扬。','花材','金黄','默认','自然花材'],
    ['p-dessert-cake','栗子奶油小蛋糕','食品','shop-dessert',168,'四寸栗子奶油蛋糕，甜度适中，附简洁纸盒。','尺寸','四寸','默认','栗子、奶油'],
    ['p-dessert-tea','桂花乌龙茶点盒','礼盒','shop-dessert',96,'乌龙茶饼与桂花酥的组合，适合两三人分享。','规格','双人份','默认','茶叶、糕点'],
    ['p-coat-knit','雾灰羊毛针织衫','服装','shop-style',568,'羊毛混纺圆领针织衫，版型宽松，适合换季穿着。','尺码','M','雾灰','羊毛混纺'],
    ['p-bag-canvas','日常帆布托特包','鞋包','shop-style',128,'加厚棉帆布，可放入书本和随身物品，内有小口袋。','尺寸','中号','米白','棉帆布'],
    ['p-earring-silver','细链银耳饰','饰品','shop-style',238,'简洁细链耳饰，适合日常佩戴。','材质','银色','银色','925银'],
    ['p-fragrance-cedar','雨后雪松香氛','香水','shop-gift',328,'木质调淡香，气息清爽，适合日常使用。','容量','30ml','默认','香精、酒精'],
    ['p-toy-bear','软绒小熊','玩偶','shop-gift',78,'手掌大小的短绒玩偶，附棉布收纳袋。','尺寸','18cm','焦糖棕','聚酯纤维'],
    ['p-digital-camera','轻便数码相机腕带','数码','shop-digital',89,'可调节腕带，适配常见相机挂环。','长度','可调节','黑色','尼龙'],
    ['p-digital-headphone','轻音无线耳机','数码','shop-digital',499,'轻量入耳式耳机，适合通勤与居家聆听。','颜色','石墨黑','石墨黑','塑料、金属'],
    ['p-book-poetry','海边的房间','书籍','shop-book',52,'一册关于迁徙与日常生活的短篇小说集。','版本','平装','默认','纸张'],
    ['p-record-jazz','午夜小号唱片','唱片','shop-book',188,'虚构乐团录制的爵士黑胶，附歌词与制作手记。','规格','黑胶','黑胶','PVC'],
    ['p-home-mug','手作粗陶杯','家居','shop-home',76,'手工拉坯粗陶杯，釉色与纹理略有差异。','容量','320ml','暖白','陶土'],
    ['p-home-lamp','木脚阅读灯','家具','shop-home',368,'可调角度的桌面阅读灯，暖光，适合床边或书桌。','高度','42cm','原木色','榉木、金属'],
    ['p-food-coffee','手冲咖啡豆','食品','shop-dessert',78,'中浅烘焙拼配豆，带柑橘与坚果香气。','重量','200g','默认','咖啡豆'],
    ['p-drink-milk-tea','桂花奶茶双杯','饮料','shop-dessert',42,'同城现制，默认少糖，可选冷热。','规格','中杯','默认','茶、奶'],
    ['p-pet-toy','猫咪布球玩具','宠物用品','shop-pet',26,'棉布缝制的小球，适合室内互动。','规格','单只','蓝灰','棉布'],
    ['p-sport-bottle','轻量运动水壶','运动用品','shop-digital',69,'耐用轻量水壶，适合日常运动携带。','容量','600ml','雾蓝','Tritan'],
    ['p-gift-box','手写卡片礼盒','礼盒','shop-gift',38,'可选素色礼盒与空白卡片，商品包装服务。','规格','标准','米白','纸材']
  ];
  const id = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const accountNumber=()=>{const digits='9900'+Array.from({length:11},()=>Math.floor(Math.random()*10)).join('');let sum=0;for(let i=0;i<digits.length;i++){let n=Number(digits[i])*(i%2===0?2:1);sum+=n>9?n-9:n}return digits+((10-sum%10)%10)};
  const accountExpiry=()=>`${String(1+Math.floor(Math.random()*12)).padStart(2,'0')}/${String(new Date().getFullYear()+4).slice(-2)}`;
  const initializeRoleWallet=(state,userIndex,roleId,data)=>{
    const wallet=roleWallet(state,roleId,userIndex,true);
    // Upgrade a previously generated opening balance without replacing saved shopping facts.
    if((wallet.historyGeneratedAt&&Number.isSafeInteger(wallet.balanceCents))||wallet.ledger.some(row=>row.kind!=='opening')||(Number.isSafeInteger(wallet.balanceCents)&&!wallet.generatedAt))return wallet;
    if(!data||typeof data.bankName!=='string'||!data.bankName.trim()||!['numeric','token'].includes(data.accountStyle))throw Error('钱包资料格式无效');
    const currency=String(data.currency||'').trim().toUpperCase();if(!/^[A-Z0-9_]{2,12}$/.test(currency))throw Error('钱包币种格式无效');
    if(data.balance!==null&&(typeof data.balance!=='number'||!Number.isFinite(data.balance)))throw Error('钱包余额格式无效');
    const amount=Number.isSafeInteger(wallet.balanceCents)?wallet.balanceCents:data.balance===null?null:cents(data.balance);if(amount!==null&&amount>100000000000)throw Error('钱包金额超出范围');
    if(!Array.isArray(data.transactions)||data.transactions.length>6)throw Error('近期交易格式无效');
    if(amount===null&&data.transactions.length)throw Error('未知余额不能生成确定的交易账本');
    const now=Date.now(),history=data.transactions.map(row=>{if(!row||!['expense','income'].includes(row.kind)||typeof row.amount!=='number'||!Number.isFinite(row.amount)||row.amount<=0||typeof row.description!=='string'||!row.description.trim()||!Number.isInteger(row.daysAgo)||row.daysAgo<0||row.daysAgo>30)throw Error('近期交易内容无效');const value=cents(row.amount);if(!Number.isSafeInteger(value)||value<1||value>100000000000)throw Error('近期交易金额无效');return {id:id('role-tx'),kind:row.kind==='expense'?'personal-expense':'personal-income',amountCents:row.kind==='expense'?-value:value,description:row.description.trim().slice(0,80),createdAt:now-row.daysAgo*86400000,source:'ai-wallet-history'};}).sort((a,b)=>a.createdAt-b.createdAt);
    const opening=amount===null?null:amount-history.reduce((sum,row)=>sum+row.amountCents,0);let running=opening;
    if(opening!==null&&(!Number.isSafeInteger(opening)||opening<0))throw Error('近期交易与余额不一致');
    for(const row of history){running+=row.amountCents;if(!Number.isSafeInteger(running)||running<0)throw Error('近期交易导致负余额');}
    wallet.currency=Number.isSafeInteger(wallet.balanceCents)?wallet.currency:currency;wallet.balanceCents=amount;wallet.bankName=wallet.bankName||data.bankName.trim().slice(0,40);wallet.accountNumber ||= data.accountStyle==='token'?'IR-'+accountNumber().slice(0,12):accountNumber();wallet.accountExpiry ||= accountExpiry();wallet.generatedAt ||= now;wallet.historyGeneratedAt=now;
    wallet.ledger=[...history].reverse();if(opening!==null)wallet.ledger.push({id:id('role-tx'),kind:'opening',amountCents:opening,createdAt:(history[0]?.createdAt||now)-1,description:'角色钱包期初余额'});
    return wallet;
  };
  const updateRoleWallet=(state,userIndex,roleId,data,{requestId,since,now=Date.now()}={})=>{
    const wallet=roleWallet(state,roleId,userIndex,true);
    if(!requestId||!Number.isFinite(since)||since>now)throw Error('钱包更新时间无效');
    if((wallet.refreshRequests||[]).includes(requestId)||wallet.ledger.some(row=>row.sourceRequestId===requestId))return wallet;
    if(!Number.isSafeInteger(wallet.balanceCents))throw Error('钱包余额尚未建立');
    if(!data||!Array.isArray(data.transactions)||data.transactions.length>6)throw Error('钱包更新格式无效');
    const events=data.transactions.map(row=>{if(!row||typeof row.eventKey!=='string'||!row.eventKey.trim()||row.eventKey.length>100||!['expense','income'].includes(row.kind)||typeof row.amount!=='number'||!Number.isFinite(row.amount)||row.amount<=0||typeof row.description!=='string'||!row.description.trim()||!Number.isInteger(row.secondsAgo)||row.secondsAgo<0)throw Error('钱包更新交易无效');const createdAt=now-row.secondsAgo*1000,value=cents(row.amount);if(createdAt<since||!Number.isSafeInteger(value)||value<1||value>100000000000)throw Error('钱包更新超出时间或金额范围');return {id:id('role-tx'),eventKey:row.eventKey.trim(),kind:row.kind==='expense'?'personal-expense':'personal-income',amountCents:row.kind==='expense'?-value:value,description:row.description.trim().slice(0,80),createdAt,source:'ai-wallet-update',sourceRequestId:requestId};}).sort((a,b)=>a.createdAt-b.createdAt);
    const fresh=[],keys=new Set(wallet.ledger.map(row=>row.eventKey).filter(Boolean));let balance=wallet.balanceCents;
    for(const event of events){if(keys.has(event.eventKey)||[...wallet.ledger,...fresh].some(row=>row.amountCents===event.amountCents&&row.description===event.description&&Math.abs(row.createdAt-event.createdAt)<60000))continue;keys.add(event.eventKey);balance+=event.amountCents;if(!Number.isSafeInteger(balance)||balance<0)throw Error('角色余额不足，更新未记账');fresh.push(event)}
    wallet.balanceCents=balance;wallet.ledger=[...fresh].reverse().concat(wallet.ledger);wallet.lastCheckedAt=now;wallet.refreshRequests=[...(wallet.refreshRequests||[]),requestId].slice(-100);return wallet;
  };
  const yuan = cents => (Math.max(0, Number(cents)||0)/100).toFixed(2).replace(/\.00$/,'');
  const normalize = state => {
    state.market ||= {version:1,products:[],shops:[],personas:{},reviews:[],aiCache:{}};
    const m=state.market;m.version=1;m.products=Array.isArray(m.products)?m.products:[];m.shops=Array.isArray(m.shops)?m.shops:[];m.personas=m.personas&&typeof m.personas==='object'?m.personas:{};m.reviews=Array.isArray(m.reviews)?m.reviews:[];m.aiCache=m.aiCache&&typeof m.aiCache==='object'?m.aiCache:{};
    for(const u of state.users||[])if(u&&!u.irisMarketId)u.irisMarketId=id('persona');
    for(const c of state.characters||[])if(c&&!c.irisMarketId)c.irisMarketId=id('character');
    for(const s of shops)if(!m.shops.some(x=>x.id===s.id))m.shops.push({...s});
    for(const [pid,name,category,shopId,price,description,optionName,optionValue,color,material] of seed)if(!m.products.some(x=>x.id===pid))m.products.push({id:pid,name,category,shopId,priceCents:price*100,description,brand:m.shops.find(x=>x.id===shopId)?.name||'Iris精选',colors:[color],specs:[{id:'default',name:optionName,values:[optionValue],priceDeltaCents:0}],material,shipping:category==='饮料'?'同城即时配送':'虚拟世界配送',imageKey:`market:${category}`,source:'catalog',createdAt:1,active:true});
    const knit=m.products.find(x=>x.id==='p-coat-knit');if(knit&&knit.specs?.length===1)knit.specs=[{id:'M',name:'尺码',values:['M'],priceDeltaCents:0},{id:'L',name:'尺码',values:['L'],priceDeltaCents:6000}];
    const extraSpecs={
      'p-flower-rose':[['medium','花束',['中束 · 礼品包装'],8000],['large','花束',['大束 · 礼盒'],20000]],
      'p-flower-sun':[['small','花束',['单枝 · 简装'],-5000],['large','花束',['五枝 · 礼盒'],15600]],
      'p-dessert-cake':[['six','尺寸',['六寸'],10000],['eight','尺寸',['八寸'],20000]],
      'p-dessert-tea':[['four','规格',['四人份'],8000]],
      'p-coat-knit':[['S','尺码',['S'],0],['XL','尺码',['XL'],6000]],
      'p-bag-canvas':[['large','尺寸',['大号 · 米白'],4000],['black','颜色',['中号 · 黑色'],0]],
      'p-earring-silver':[['short','款式',['短链 · 925银'],0],['long','款式',['长链 · 925银'],4000]],
      'p-fragrance-cedar':[['fifty','容量',['50ml'],15000],['hundred','容量',['100ml'],35000]],
      'p-toy-bear':[['large','尺寸',['30cm · 焦糖棕'],6000],['cream','颜色',['18cm · 奶油白'],0]],
      'p-digital-camera':[['gray','颜色',['可调节 · 雾灰'],0],['leather','材质',['皮革 · 黑色'],8000]],
      'p-digital-headphone':[['white','颜色',['珍珠白'],0],['silver','颜色',['银灰'],0]],
      'p-book-poetry':[['hardback','版本',['精装'],2600]],
      'p-record-jazz':[['cd','规格',['CD'], -10000],['collector','规格',['双碟黑胶'],12000]],
      'p-home-mug':[['large','容量',['450ml'],2200],['gray','颜色',['320ml · 雾灰'],0]],
      'p-home-lamp':[['walnut','材质',['胡桃木 · 42cm'],12000],['tall','高度',['榉木 · 55cm'],8000]],
      'p-food-coffee':[['half','重量',['500g'],9000],['whole','重量',['1kg'],22000]],
      'p-drink-milk-tea':[['hot','温度',['中杯 · 热饮 · 双杯'],0],['large','规格',['大杯 · 双杯'],1000]],
      'p-pet-toy':[['three','规格',['三只装'],3900]],
      'p-sport-bottle':[['small','容量',['400ml'], -1000],['large','容量',['900ml'],2000]],
      'p-gift-box':[['large','规格',['大号礼盒'],2000],['ribbon','包装',['标准礼盒 · 丝带'],1000]]
    };
    for(const [productId,variants] of Object.entries(extraSpecs)){const item=m.products.find(p=>p.id===productId&&p.source==='catalog');if(!item)continue;for(const [specId,name,values,priceDeltaCents] of variants)if(!item.specs.some(s=>s.id===specId))item.specs.push({id:specId,name,values,priceDeltaCents})}
    for(const user of state.users||[]){const key=user.irisMarketId;if(!m.personas[key])m.personas[key]={wallet:{currency:'CNY',balanceCents:100000,initialized:true},ledger:[],cart:[],addresses:[],favorites:[],recentlyViewed:[],orders:[],ownedItems:[],characterItems:[],giftRecords:[],reviews:[]};const p=m.personas[key];for(const prop of ['ledger','cart','addresses','favorites','recentlyViewed','orders','ownedItems','characterItems','giftRecords','reviews'])if(!Array.isArray(p[prop]))p[prop]=[];p.wallet ||= {currency:'CNY',balanceCents:100000,initialized:true};p.wallet.accountNumber ||= accountNumber();p.wallet.accountExpiry ||= accountExpiry();p.roleWallets=p.roleWallets&&typeof p.roleWallets==='object'?p.roleWallets:{ };for(const wallet of Object.values(p.roleWallets))if(Number.isSafeInteger(wallet.balanceCents)){wallet.accountNumber ||= accountNumber();wallet.accountExpiry ||= accountExpiry();}}
    return m;
  };
  const personaId=(state,index=state.user)=>state.users?.[index]?.irisMarketId||'';
  const persona=(state,index=state.user)=>normalize(state).personas[personaId(state,index)];
  const roleWallet=(state,roleId,userIndex=state.user,create=false)=>{
    if(!roleId)throw Error('角色实例无效');const p=persona(state,userIndex),wallet=p.roleWallets[roleId]||(create?(p.roleWallets[roleId]={roleId,currency:'CNY',balanceCents:null,ledger:[]}):{roleId,currency:'CNY',balanceCents:null,ledger:[]});
    if(!Array.isArray(wallet.ledger))wallet.ledger=[];
    return wallet;
  };
  const payRoleOrder=(state,userIndex,order,roleId)=>{
    if(!roleId||order.characterId!==roleId)throw Error('角色实例与订单不匹配');const wallet=roleWallet(state,roleId,userIndex,true);if(order.status!=='待支付')throw Error('订单已处理，不能重复代付');
    if(wallet.ledger.some(row=>row.orderId===order.id&&row.kind==='role-payment'))throw Error('该订单已由角色支付');
    if(!Number.isSafeInteger(order.totalCents)||order.totalCents<0)throw Error('订单金额无效');
    if(!Number.isSafeInteger(wallet.balanceCents)||wallet.balanceCents<0)throw Error('角色余额未设定，不能完成代付');
    if(wallet.currency!==(order.currency||'CNY'))throw Error('角色钱包与订单币种不同，暂不支持兑换');if(wallet.balanceCents<order.totalCents)throw Error('角色余额不足，不能完成代付');
    const now=Date.now(),txId=id('role-tx');wallet.balanceCents-=order.totalCents;wallet.ledger.unshift({id:txId,kind:'role-payment',amountCents:-order.totalCents,orderId:order.id,createdAt:now,description:`${(order.items||[]).map(item=>item.name).join('、')||'购物订单'}（代付）`});
    order.pay='role-pay';order.paidByCharacterId=roleId;order.status='已支付';order.paidAt=now;order.transactionId=txId;transition(order,'待发货',now);schedule(order,now);return order;
  };
  const refundRoleOrder=(state,userIndex,order)=>{
    if(!['role-pay','role-funded'].includes(order.pay)||!order.paidByCharacterId||order.rolePaymentReversed)throw Error('角色钱包退款状态无效');
    const wallet=roleWallet(state,order.paidByCharacterId,userIndex);if(!Number.isSafeInteger(wallet.balanceCents))throw Error('角色钱包余额未设定，无法退款入账');
    transition(order,'退款中');for(const event of order.shippingEvents||[]){event.applied=true;event.status='配送已取消'}
    wallet.balanceCents+=order.totalCents;wallet.ledger.unshift({id:id('role-tx'),kind:'refund',amountCents:order.totalCents,orderId:order.id,createdAt:Date.now(),description:`${(order.items||[]).map(item=>item.name).join('、')||'购物订单'}退款`});transition(order,'已退款');order.refundAt=Date.now();order.rolePaymentReversed=true;return order;
  };
  const product=(state,productId)=>normalize(state).products.find(p=>p.id===productId&&p.active!==false);
  const linePrice=(p,specId)=>{const spec=p?.specs?.find(x=>x.id===specId);return Math.max(0,Number(p?.priceCents)||0)+(Number(spec?.priceDeltaCents)||0)};
  const cartTotal=(state,userIndex=state.user)=>persona(state,userIndex).cart.reduce((sum,item)=>{const p=product(state,item.productId);return p?sum+linePrice(p,item.specId)*Math.max(1,Number(item.quantity)||1):sum},0);
  const addCart=(state,pid,specId='default',quantity=1,userIndex=state.user)=>{const p=product(state,pid);if(!p)throw Error('商品已下架或不存在');if(!p.specs?.some(s=>s.id===specId))throw Error('请选择有效规格');const cart=persona(state,userIndex).cart,old=cart.find(x=>x.productId===pid&&x.specId===specId);if(old)old.quantity=Math.min(99,old.quantity+Math.max(1,Number(quantity)||1));else cart.push({id:id('cart'),productId:pid,specId,quantity:Math.min(99,Math.max(1,Number(quantity)||1)),selected:true,addedAt:Date.now()});return cart};
  const cents=(x)=>{const n=Number(x);if(!Number.isFinite(n)||n<0)throw Error('金额无效');return Math.round(n*100)};
  const transition=(order,next,at=Date.now())=>{const allowed={待支付:['已取消','已支付'],已支付:['待发货','退款中'],待发货:['运输中','退款中'],运输中:['派送中','退款中'],派送中:['已送达','退款中'],退款中:['已退款'],已取消:[],已退款:[],已送达:['退款中']};if(!allowed[order.status]?.includes(next))throw Error(`不能将订单从${order.status}变更为${next}`);order.status=next;order.updatedAt=at;return order};
  const createOrder=(state,{userIndex=state.user,items,kind='self',characterIndex=null,addressId='',note='',pay='wallet',paidByCharacterId=''}={})=>{
    const p=persona(state,userIndex),picked=(items||p.cart.filter(x=>x.selected)).map(row=>{const productInfo=product(state,row.productId);if(!productInfo)throw Error('购物车中有商品已下架');const spec=productInfo.specs?.find(s=>s.id===row.specId);if(!spec)throw Error('商品规格已失效');return{productId:productInfo.id,name:productInfo.name,shopId:productInfo.shopId,shopName:normalize(state).shops.find(s=>s.id===productInfo.shopId)?.name||productInfo.brand,imageKey:productInfo.imageKey,specId:spec.id,specName:spec.values?.[0]||spec.name,quantity:Math.max(1,Number(row.quantity)||1),unitPriceCents:linePrice(productInfo,row.specId),lineTotalCents:linePrice(productInfo,row.specId)*Math.max(1,Number(row.quantity)||1),category:productInfo.category}});
    if(!picked.length)throw Error('请先选择商品');const total=picked.reduce((s,x)=>s+x.lineTotalCents,0),now=Date.now(),order={id:id('order'),userId:personaId(state,userIndex),characterId:Number.isInteger(characterIndex)?state.characters?.[characterIndex]?.irisMarketId||null:null,characterName:Number.isInteger(characterIndex)?state.characters?.[characterIndex]?.name||'已删除角色':'',sourceThreadKey:Number.isInteger(characterIndex)?`${characterIndex}-${userIndex}-chat`:null,kind,items:picked,totalCents:total,currency:p.wallet.currency||'CNY',pay,paidByCharacterId,status:pay==='pending-role'?'待支付':'待支付',createdAt:now,paidAt:null,address:kind==='gift'?null:(p.addresses.find(x=>x.id===addressId)||p.addresses.find(x=>x.isDefault)||null),deliveryMode:kind==='gift'?'role-context':'virtual-address',note:String(note||'').slice(0,300),shippingEvents:[],refundAt:null,transactionId:null};
    if(pay==='wallet')payOrder(state,userIndex,order);else if(pay==='role-funded')chargeRoleOrder(state,userIndex,order,paidByCharacterId||order.characterId);p.orders.unshift(order);if(kind==='self')p.cart=p.cart.filter(x=>!(items||p.cart.filter(y=>y.selected)).some(y=>y.productId===x.productId&&y.specId===x.specId));if(pay==='wallet'||pay==='role-funded')schedule(order,now);return order;
  };
  const payOrder=(state,userIndex,order)=>{const p=persona(state,userIndex),duplicate=p.ledger.find(x=>x.orderId===order.id&&x.kind==='purchase');if(duplicate)throw Error('该订单已支付');if(order.totalCents>p.wallet.balanceCents)throw Error('余额不足，请先为当前面具设置钱包初始余额');p.wallet.balanceCents-=order.totalCents;order.status='已支付';order.paidAt=Date.now();const tx={id:id('tx'),kind:'purchase',amountCents:-order.totalCents,orderId:order.id,createdAt:order.paidAt,description:`商场订单 ${order.id}`};p.ledger.unshift(tx);order.transactionId=tx.id;transition(order,'待发货',order.paidAt);return order};
  const chargeRoleOrder=(state,userIndex,order,roleId)=>{if(!roleId||order.characterId!==roleId)throw Error('角色实例与订单不匹配');if(order.status!=='待支付')throw Error('订单状态无效');const wallet=roleWallet(state,roleId,userIndex,true);if(wallet.ledger.some(row=>row.orderId===order.id))throw Error('角色订单已记账');if(!Number.isSafeInteger(order.totalCents)||order.totalCents<0)throw Error('订单金额无效');if(!Number.isSafeInteger(wallet.balanceCents)||wallet.balanceCents<0)throw Error('角色余额未设定，不能完成购物');if(wallet.currency!==(order.currency||'CNY'))throw Error('角色钱包与订单币种不同，暂不支持兑换');if(wallet.balanceCents<order.totalCents)throw Error('角色余额不足，不能完成购物');const now=Date.now(),txId=id('role-tx'),gift=order.kind==='role-gift';wallet.balanceCents-=order.totalCents;wallet.ledger.unshift({id:txId,kind:gift?'gift-expense':'purchase-expense',amountCents:-order.totalCents,orderId:order.id,createdAt:now,description:`${(order.items||[]).map(item=>item.name).join('、')||'购物订单'}${gift?'（赠礼）':'（自购）'}`});order.pay='role-funded';order.paidByCharacterId=roleId;order.status='已支付';order.paidAt=now;order.transactionId=txId;transition(order,'待发货',now);return order};
  const schedule=(order,now=Date.now())=>{if(order.shippingEvents.length)return;const fast=order.items.every(i=>['饮料','食品','鲜花'].includes(i.category)),day=fast?1:order.items.some(i=>['家具','家居'].includes(i.category))?5:2;order.shippingEvents=[{id:id('ship'),status:'商家备货中',at:now+30000},{id:id('ship'),status:'运输途中',at:now+day*86400000},{id:id('ship'),status:'正在派送',at:now+(day+1)*86400000},{id:id('ship'),status:'已送达',at:now+(day+2)*86400000}];};
  const advance=(state,userIndex=state.user,now=Date.now())=>{const p=persona(state,userIndex);for(const o of p.orders){if(o.status==='待发货'&&o.shippingEvents?.length===0)schedule(o,o.paidAt||o.createdAt);for(const e of o.shippingEvents||[]){if(e.at>now||e.applied)continue;const next=e.status==='商家备货中'?'待发货':e.status==='运输途中'?'运输中':e.status==='正在派送'?'派送中':'已送达';if(o.status!==next){if(o.status==='已支付'&&next==='待发货')transition(o,next,e.at);else if(['待发货','运输中','派送中'].includes(o.status))transition(o,next,e.at)}e.applied=true;if(next==='已送达'){const quantity=o.items.reduce((n,x)=>n+x.quantity,0),itemName=o.items.map(x=>x.name).join('、');if(o.kind==='self'||o.kind==='role-gift')p.ownedItems.push({id:id('item'),productId:o.items[0]?.productId,name:itemName,source:o.kind==='self'?'purchase':'role-gift',orderId:o.id,userId:o.userId,characterId:o.characterId,characterName:o.characterName,quantity,createdAt:e.at,state:'持有'});if(o.kind==='role-purchase')p.characterItems.push({id:id('role-item'),characterId:o.characterId,characterName:o.characterName,productId:o.items[0]?.productId,name:itemName,source:'character-purchase',orderId:o.id,quantity,createdAt:e.at,state:'持有'});if(o.kind==='role-gift'||o.kind==='gift'){const gift=p.giftRecords.find(g=>g.orderId===o.id);if(gift)gift.status='已送达'}}}}return p.orders};
  const refund=(state,userIndex,orderId)=>{const p=persona(state,userIndex),o=p.orders.find(x=>x.id===orderId);if(!o)throw Error('订单不存在');if(o.pay==='role-funded')return refundRoleOrder(state,userIndex,o);if(!['已支付','待发货','运输中','派送中','已送达'].includes(o.status))throw Error('当前订单不能申请退款');transition(o,'退款中');for(const event of o.shippingEvents||[]){event.applied=true;event.status='配送已取消'}p.wallet.balanceCents+=o.totalCents;p.ledger.unshift({id:id('tx'),kind:'refund',amountCents:o.totalCents,orderId:o.id,createdAt:Date.now(),description:`订单退款 ${o.id}`});transition(o,'已退款');o.refundAt=Date.now();return o};
  const saveGenerated=(state,data,query)=>{const m=normalize(state),name=String(data.name||'').trim().slice(0,80),category=categories.includes(data.category)?data.category:'礼盒',price=cents(data.price);if(!name||price<100||price>30000000)throw Error('AI 商品名称或价格不合理');const cacheKey=String(query||'').trim().toLowerCase().slice(0,120);const cached=m.aiCache[cacheKey];if(cached){const existing=m.products.find(x=>x.id===cached);if(existing)return existing}let shop=m.shops.find(s=>s.id===data.shopId)||m.shops.find(s=>s.category===category)||m.shops.find(s=>s.category==='礼盒');if(!shop){shop={id:id('shop'),name:String(data.shop||'虹桥杂货铺').slice(0,60),category,description:'Iris 世界中的独立虚拟店铺。'};m.shops.push(shop)}const item={id:id('ai-product'),name,category,shopId:shop.id,brand:String(data.brand||shop.name).slice(0,60),priceCents:price,description:String(data.description||'').slice(0,800),colors:Array.isArray(data.colors)?data.colors.slice(0,8).map(String):[String(data.color||'默认')],specs:[{id:'default',name:String(data.specName||'规格').slice(0,30),values:[String(data.spec||'默认')],priceDeltaCents:0}],material:String(data.material||'').slice(0,80),shipping:String(data.shipping||'虚拟世界配送').slice(0,100),imageKey:`market:${category}`,source:'ai',createdAt:Date.now(),active:true};m.products.unshift(item);if(cacheKey)m.aiCache[cacheKey]=item.id;return item};
  const favorites=(state,userIndex=state.user)=>persona(state,userIndex).favorites;
  window.IrisMarketCore={categories,normalize,personaId,persona,roleWallet,initializeRoleWallet,updateRoleWallet,chargeRoleOrder,payRoleOrder,refundRoleOrder,product,linePrice,cartTotal,addCart,cents,transition,createOrder,payOrder,schedule,advance,refund,saveGenerated,favorites,yuan,id};
})();
