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
  const roleRegionCode=location=>{
    const value=String(location||'').trim().toLowerCase();if(!value)return'';
    const regions=[['北京|beijing','11'],['天津|tianjin','12'],['河北|hebei','13'],['山西|shanxi','14'],['内蒙古|neimenggu|inner mongolia','15'],['辽宁|liaoning','21'],['吉林|jilin','22'],['黑龙江|heilongjiang','23'],['上海|shanghai','31'],['江苏|jiangsu','32'],['浙江|zhejiang','33'],['安徽|anhui','34'],['福建|fujian','35'],['江西|jiangxi','36'],['山东|shandong','37'],['河南|henan','41'],['湖北|hubei','42'],['湖南|hunan','43'],['广东|guangdong','44'],['广西|guangxi','45'],['海南|hainan','46'],['重庆|chongqing','50'],['四川|sichuan','51'],['贵州|guizhou','52'],['云南|yunnan','53'],['西藏|xizang|tibet','54'],['陕西|shaanxi','61'],['甘肃|gansu','62'],['青海|qinghai','63'],['宁夏|ningxia','64'],['新疆|xinjiang','65'],['台湾|taiwan','71'],['香港|hong kong','81'],['澳门|macao|macau','82']];
    for(const [pattern,code] of regions)if(new RegExp(pattern,'i').test(value))return code;
    const countries=[['中国|china','86'],['美国|united states|\\busa\\b|\\bus\\b|new york|los angeles|chicago|san francisco','01'],['英国|united kingdom|\\buk\\b|england|london|manchester','44'],['日本|japan|tokyo|osaka','81'],['韩国|south korea|korea|seoul','82'],['法国|france|paris','33'],['德国|germany|berlin|munich','49'],['意大利|italy|rome|milan','39'],['加拿大|canada|toronto|vancouver','02'],['澳大利亚|australia|sydney|melbourne','61'],['新西兰|new zealand|auckland','64'],['新加坡|singapore','65'],['俄罗斯|russia|moscow','07'],['印度|india|mumbai|delhi','91']];
    for(const [pattern,code] of countries)if(new RegExp(pattern,'i').test(value))return code;
    return'';
  };
  const accountNumber=(location='',style='numeric')=>{const region=roleRegionCode(location);if(style==='token')return`IR-${region||'00'}-${Array.from({length:10},()=>Math.floor(Math.random()*36).toString(36).toUpperCase()).join('')}`;const prefix=region?`9900${region}`:'9900',digits=prefix+Array.from({length:15-prefix.length},()=>Math.floor(Math.random()*10)).join('');let sum=0;for(let i=0;i<digits.length;i++){let n=Number(digits[i])*(i%2===0?2:1);sum+=n>9?n-9:n}return digits+((10-sum%10)%10)};
  const roleLocation=role=>String(role?.residence||role?.location||role?.country||role?.hometown||'').trim();
  const accountExpiry=()=>`${String(1+Math.floor(Math.random()*12)).padStart(2,'0')}/${String(new Date().getFullYear()+4).slice(-2)}`;
  const initializeRoleWallet=(state,userIndex,roleId,data)=>{
    const wallet=roleWallet(state,roleId,userIndex,true);
    // Upgrade a previously generated opening balance without replacing saved shopping facts.
    if((wallet.historyGeneratedAt&&Number.isSafeInteger(wallet.balanceCents))||(Number.isSafeInteger(wallet.balanceCents)&&!wallet.generatedAt))return wallet;
    if(!data||typeof data.bankName!=='string'||!data.bankName.trim()||!['numeric','token'].includes(data.accountStyle))throw Error('钱包资料格式无效');
    const currency=String(data.currency||'').trim().toUpperCase();if(!/^[A-Z0-9_]{2,12}$/.test(currency))throw Error('钱包币种格式无效');
    if(data.balance!==null&&(typeof data.balance!=='number'||!Number.isFinite(data.balance)))throw Error('钱包余额格式无效');
    const amount=Number.isSafeInteger(wallet.balanceCents)?wallet.balanceCents:data.balance===null?null:cents(data.balance);if(amount!==null&&amount>100000000000)throw Error('钱包金额超出范围');
    if(!Array.isArray(data.transactions)||data.transactions.length>6)throw Error('近期交易格式无效');
    if(amount===null&&data.transactions.length)throw Error('未知余额不能生成确定的交易账本');
    const now=Date.now(),history=data.transactions.map(row=>{if(!row||!['expense','income'].includes(row.kind)||typeof row.amount!=='number'||!Number.isFinite(row.amount)||row.amount<=0||typeof row.description!=='string'||!row.description.trim()||!Number.isInteger(row.daysAgo)||row.daysAgo<0||row.daysAgo>30)throw Error('近期交易内容无效');const value=cents(row.amount);if(!Number.isSafeInteger(value)||value<1||value>100000000000)throw Error('近期交易金额无效');return {id:id('role-tx'),kind:row.kind==='expense'?'personal-expense':'personal-income',amountCents:row.kind==='expense'?-value:value,description:row.description.trim().slice(0,80),createdAt:now-row.daysAgo*86400000,source:'ai-wallet-history'};}).sort((a,b)=>a.createdAt-b.createdAt);
    const existingFacts=wallet.ledger.filter(row=>row.kind!=='opening'),combined=[...history,...existingFacts].sort((a,b)=>a.createdAt-b.createdAt),opening=amount===null?null:amount-combined.reduce((sum,row)=>sum+row.amountCents,0);let running=opening;
    if(opening!==null&&(!Number.isSafeInteger(opening)||opening<0))throw Error('近期交易与余额不一致');
    for(const row of combined){running+=row.amountCents;if(opening!==null&&(!Number.isSafeInteger(running)||running<0))throw Error('近期交易导致负余额');}
    const role=state.characters?.find(item=>item.irisMarketId===roleId),location=roleLocation(role),region=roleRegionCode(location);wallet.currency=existingFacts.length?wallet.currency:Number.isSafeInteger(wallet.balanceCents)?wallet.currency:currency;wallet.balanceCents=amount;wallet.bankName=wallet.bankName||data.bankName.trim().slice(0,40);wallet.accountStyle=data.accountStyle;wallet.accountRegion=region;wallet.accountNumber ||= accountNumber(location,data.accountStyle);wallet.accountExpiry ||= accountExpiry();wallet.generatedAt ||= now;wallet.historyGeneratedAt=now;
    wallet.ledger=[...combined].reverse();if(opening!==null)wallet.ledger.push({id:id('role-tx'),kind:'opening',amountCents:opening,createdAt:(combined[0]?.createdAt||now)-1,description:'角色钱包期初余额'});
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
  const catalogReviewText={
    '鲜花':['花材状态不错，拆开后简单修剪就插瓶了。','颜色比想象中柔和，摆在桌上刚好。','包装路上压了一点，好在花枝没有折。'],
    '食品':['味道挺合口，分量适合两个人分着吃。','包装收得整齐，口感和介绍差不多。','甜度对我来说稍高，其他都还可以。'],
    '饮料':['送到时温度还合适，少糖的口味比较清爽。','杯盖封得稳，路上没有洒。','味道不错，就是冰块化了以后会淡一些。'],
    '服装':['面料摸起来舒服，洗过一次暂时没有变形。','版型比较日常，颜色和页面描述接近。','尺码略宽松，介意的话建议看清尺寸。'],
    '鞋包':['做工比预期细致，日常装东西够用。','颜色和图片接近，背起来也不重。','容量合适，内袋如果再多一个会更方便。'],
    '饰品':['戴了一整天没有不舒服，细节也挺干净。','款式简单，搭日常衣服不挑。','质感还行，扣子需要慢慢适应一下。'],
    '香水':['留香不算很久，但前调闻着很舒服。','气味比较克制，日常用不会太浓。','木质调比我预想的明显，建议先试香。'],
    '数码':['日常用起来顺手，基本功能都够了。','做工扎实，连接和使用都比较简单。','功能符合预期，说明书可以再清楚些。'],
    '书籍':['纸张和装订都不错，内容适合慢慢读。','读起来很顺，适合通勤时带着。','选题挺有意思，部分章节节奏稍慢。'],
    '唱片':['碟面保存得不错，试听没有明显杂音。','包装保护到位，收进唱片架刚好。','声音整体满意，外封角有一点小折痕。'],
    '家居':['放在家里很合适，日常清洁也方便。','尺寸和做工都符合预期。','实物颜色稍深一些，使用上没有问题。'],
    '家具':['安装过程不复杂，摆好后挺稳。','尺寸适合小房间，边角处理得还可以。','整体实用，安装配件最好分袋标清。'],
    '玩偶':['手感柔软，缝线看着也比较牢。','大小适合放在床头，颜色很耐看。','外形可爱，刚拆封时有一点包装味。'],
    '礼盒':['包装简洁，送人时不用再额外准备。','细节做得挺周到，卡片也放得平整。','整体合适，盒角运输后稍有压痕。'],
    '运动用品':['用了一阵子感觉顺手，清洗也不麻烦。','轻便耐用，日常运动带着方便。','功能够用，握感还可以再防滑一点。'],
    '宠物用品':['家里的猫愿意玩，布料摸着也结实。','大小合适，清理起来比较方便。','宠物接受度不错，耐咬程度还要再观察。'],
    '珠宝':['细节做得规整，日常搭配比较合适。','包装稳妥，实物质感不错。','款式喜欢，尺寸选择时要仔细确认。'],
    '美妆':['用起来比较温和，日常步骤里不突兀。','质地和描述一致，包装没有漏。','整体满意，效果因人而异，建议先看成分。']
  };
  const ensureCatalogReviews=m=>{for(const item of m.products){if(item.source!=='catalog')continue;const texts=catalogReviewText[item.category]||['日常使用挺方便，整体符合预期。','收到后检查了一下，做工和描述接近。','用起来还可以，细节有优点也有小地方能改进。'];texts.forEach((text,index)=>{const reviewId=`review-catalog-${item.id}-${index+1}`;if(m.reviews.some(row=>row.id===reviewId))return;m.reviews.push({id:reviewId,productId:item.id,author:['林间来信','南巷住客','周末买家'][index],rating:[5,4,3][index],text,createdAt:1+index,source:'catalog'});})}};
  const normalize = state => {
    state.market ||= {version:1,products:[],shops:[],personas:{},reviews:[],aiCache:{}};
    const m=state.market;m.version=1;m.products=Array.isArray(m.products)?m.products:[];m.shops=Array.isArray(m.shops)?m.shops:[];m.personas=m.personas&&typeof m.personas==='object'?m.personas:{};m.reviews=Array.isArray(m.reviews)?m.reviews:[];m.aiCache=m.aiCache&&typeof m.aiCache==='object'?m.aiCache:{};
    for(const u of state.users||[])if(u&&!u.irisMarketId)u.irisMarketId=id('persona');
    for(const c of state.characters||[])if(c&&!c.irisMarketId)c.irisMarketId=id('character');
    for(const s of shops)if(!m.shops.some(x=>x.id===s.id))m.shops.push({...s});
    for(const [pid,name,category,shopId,price,description,optionName,optionValue,color,material] of seed)if(!m.products.some(x=>x.id===pid))m.products.push({id:pid,name,category,shopId,priceCents:price*100,description,brand:m.shops.find(x=>x.id===shopId)?.name||'Iris精选',colors:[color],specs:[{id:'default',name:optionName,values:[optionValue],priceDeltaCents:0}],material,shipping:shippingSummary({category}),imageKey:`market:${category}`,source:'catalog',createdAt:1,active:true});
    ensureCatalogReviews(m);
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
    for(const user of state.users||[]){const key=user.irisMarketId;if(!m.personas[key])m.personas[key]={wallet:{currency:'CNY',balanceCents:888800,initialized:true},ledger:[],cart:[],addresses:[],favorites:[],recentlyViewed:[],orders:[],ownedItems:[],characterItems:[],giftRecords:[],reviews:[]};const p=m.personas[key];for(const prop of ['ledger','cart','addresses','favorites','recentlyViewed','orders','ownedItems','characterItems','giftRecords','reviews'])if(!Array.isArray(p[prop]))p[prop]=[];p.wallet ||= {currency:'CNY',balanceCents:888800,initialized:true};if(p.wallet.initialized===true&&p.wallet.balanceCents===100000&&p.ledger.length===0)p.wallet.balanceCents=888800;p.wallet.accountNumber ||= accountNumber();p.wallet.accountExpiry ||= accountExpiry();p.roleWallets=p.roleWallets&&typeof p.roleWallets==='object'?p.roleWallets:{ };for(const wallet of Object.values(p.roleWallets)){if(!Array.isArray(wallet.ledger))wallet.ledger=[];const role=state.characters?.find(item=>item.irisMarketId===wallet.roleId),location=roleLocation(role),region=roleRegionCode(location);if(region&&wallet.accountRegion!==region){wallet.accountNumber=accountNumber(location,wallet.accountStyle||'numeric');wallet.accountRegion=region;}else wallet.accountNumber ||= accountNumber(location,wallet.accountStyle||'numeric');wallet.accountExpiry ||= accountExpiry();}}
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
  const payOrder=(state,userIndex,order)=>{const p=persona(state,userIndex),duplicate=p.ledger.find(x=>x.orderId===order.id&&x.kind==='purchase');if(duplicate)throw Error('该订单已支付');if(order.totalCents>p.wallet.balanceCents)throw Error('银行卡余额不足');p.wallet.balanceCents-=order.totalCents;order.status='已支付';order.paidAt=Date.now();const tx={id:id('tx'),kind:'purchase',amountCents:-order.totalCents,orderId:order.id,createdAt:order.paidAt,description:`商场订单 ${order.id}`};p.ledger.unshift(tx);order.transactionId=tx.id;transition(order,'待发货',order.paidAt);return order};
  const chargeRoleOrder=(state,userIndex,order,roleId)=>{if(!roleId||order.characterId!==roleId)throw Error('角色实例与订单不匹配');if(order.status!=='待支付')throw Error('订单状态无效');const wallet=roleWallet(state,roleId,userIndex,true);if(wallet.ledger.some(row=>row.orderId===order.id))throw Error('角色订单已记账');if(!Number.isSafeInteger(order.totalCents)||order.totalCents<0)throw Error('订单金额无效');if(!Number.isSafeInteger(wallet.balanceCents)||wallet.balanceCents<0)throw Error('角色余额未设定，不能完成购物');if(wallet.currency!==(order.currency||'CNY'))throw Error('角色钱包与订单币种不同，暂不支持兑换');if(wallet.balanceCents<order.totalCents)throw Error('角色余额不足，不能完成购物');const now=Date.now(),txId=id('role-tx'),gift=order.kind==='role-gift';wallet.balanceCents-=order.totalCents;wallet.ledger.unshift({id:txId,kind:gift?'gift-expense':'purchase-expense',amountCents:-order.totalCents,orderId:order.id,createdAt:now,description:`${(order.items||[]).map(item=>item.name).join('、')||'购物订单'}${gift?'（赠礼）':'（自购）'}`});order.pay='role-funded';order.paidByCharacterId=roleId;order.status='已支付';order.paidAt=now;order.transactionId=txId;transition(order,'待发货',now);return order};
  const schedule=(order,now=Date.now())=>{if(order.shippingEvents.length)return;const fast=order.items.every(i=>['饮料','食品','鲜花'].includes(i.category)),day=fast?1:order.items.some(i=>['家具','家居'].includes(i.category))?5:2;order.shippingEvents=[{id:id('ship'),status:'商家备货中',at:now+30000},{id:id('ship'),status:'运输途中',at:now+day*86400000},{id:id('ship'),status:'正在派送',at:now+(day+1)*86400000},{id:id('ship'),status:'已送达',at:now+(day+2)*86400000}];};
  const advance=(state,userIndex=state.user,now=Date.now())=>{const p=persona(state,userIndex);for(const o of p.orders){if(o.status==='待发货'&&o.shippingEvents?.length===0)schedule(o,o.paidAt||o.createdAt);for(const e of o.shippingEvents||[]){if(e.at>now||e.applied)continue;const next=e.status==='商家备货中'?'待发货':e.status==='运输途中'?'运输中':e.status==='正在派送'?'派送中':'已送达';if(o.status!==next){if(o.status==='已支付'&&next==='待发货')transition(o,next,e.at);else if(['待发货','运输中','派送中'].includes(o.status))transition(o,next,e.at)}e.applied=true;if(next==='已送达'){const quantity=o.items.reduce((n,x)=>n+x.quantity,0),itemName=o.items.map(x=>x.name).join('、');if(o.kind==='self'||o.kind==='role-gift')p.ownedItems.push({id:id('item'),productId:o.items[0]?.productId,name:itemName,source:o.kind==='self'?'purchase':'role-gift',orderId:o.id,userId:o.userId,characterId:o.characterId,characterName:o.characterName,quantity,createdAt:e.at,state:'持有'});if(o.kind==='role-purchase')p.characterItems.push({id:id('role-item'),characterId:o.characterId,characterName:o.characterName,productId:o.items[0]?.productId,name:itemName,source:'character-purchase',orderId:o.id,quantity,createdAt:e.at,state:'持有'});if(o.kind==='role-gift'||o.kind==='gift'){const gift=p.giftRecords.find(g=>g.orderId===o.id);if(gift)gift.status='已送达'}}}}return p.orders};
  const refund=(state,userIndex,orderId)=>{const p=persona(state,userIndex),o=p.orders.find(x=>x.id===orderId);if(!o)throw Error('订单不存在');if(o.pay==='role-funded')return refundRoleOrder(state,userIndex,o);if(!['已支付','待发货','运输中','派送中','已送达'].includes(o.status))throw Error('当前订单不能申请退款');transition(o,'退款中');for(const event of o.shippingEvents||[]){event.applied=true;event.status='配送已取消'}p.wallet.balanceCents+=o.totalCents;p.ledger.unshift({id:id('tx'),kind:'refund',amountCents:o.totalCents,orderId:o.id,createdAt:Date.now(),description:`订单退款 ${o.id}`});transition(o,'已退款');o.refundAt=Date.now();return o};
  const shippingSummary=item=>{const value=String(item?.shipping||'').trim();if(value&&!/虚拟世界|虚拟配送|仅供剧情/i.test(value)&&/(?:\d+\s*(?:-|至|–)?\s*\d*\s*(?:分钟|小时|天|个工作日)|(?:当日|次日|隔日).{0,8}(?:送达|配送))/i.test(value))return value;return ({'饮料':'同城配送，通常 30–60 分钟送达','鲜花':'同城配送，通常 2–4 小时送达；跨区约 1 天','食品':'冷藏配送，通常 2–4 小时送达','服装':'通常 1–3 个工作日送达','鞋包':'通常 1–3 个工作日送达','饰品':'通常 1–3 个工作日送达','珠宝':'通常 1–3 个工作日送达','美妆':'通常 1–3 个工作日送达','香水':'通常 1–3 个工作日送达','家具':'大件配送，通常 3–7 个工作日送达','家居':'通常 1–3 个工作日送达','书籍':'通常 1–3 个工作日送达','唱片':'通常 1–3 个工作日送达','数码':'通常 1–3 个工作日送达','乐器':'大件配送，通常 2–5 个工作日送达','宠物用品':'通常 1–3 个工作日送达','运动用品':'通常 1–3 个工作日送达','玩偶':'通常 1–3 个工作日送达','礼盒':'通常 1–3 个工作日送达'})[item?.category]||'通常 1–3 个工作日送达'};
  const saveGenerated=(state,data,query)=>{const m=normalize(state),name=String(data.name||'').trim().slice(0,80),category=categories.includes(data.category)?data.category:'礼盒',price=cents(data.price);if(!name||price<100||price>30000000)throw Error('AI 商品名称或价格不合理');const cacheKey=String(query||'').trim().toLowerCase().slice(0,120);if(cacheKey){const cached=m.aiCache[cacheKey],cachedIds=Array.isArray(cached)?cached:cached?.productIds||[cached];const existing=cachedIds.map(value=>m.products.find(x=>x.id===value)).find(Boolean);if(existing)return existing}const duplicate=m.products.find(item=>item.active!==false&&item.name.trim().toLowerCase()===name.toLowerCase()&&item.category===category);if(duplicate)return duplicate;let shop=m.shops.find(s=>s.id===data.shopId)||m.shops.find(s=>s.category===category)||m.shops.find(s=>s.category==='礼盒');if(!shop){shop={id:id('shop'),name:String(data.shop||'虹桥杂货铺').slice(0,60),category,description:'Iris 世界中的独立虚拟店铺。'};m.shops.push(shop)}const item={id:id('ai-product'),name,category,shopId:shop.id,brand:String(data.brand||shop.name).slice(0,60),priceCents:price,description:String(data.description||'').slice(0,800),colors:Array.isArray(data.colors)?data.colors.slice(0,8).map(String):[String(data.color||'默认')],specs:[{id:'default',name:String(data.specName||'规格').slice(0,30),values:[String(data.spec||'默认')],priceDeltaCents:0}],material:String(data.material||'').slice(0,80),shipping:shippingSummary({category,shipping:data.shipping}),imageKey:`market:${category}`,source:'ai',createdAt:Date.now(),active:true};m.products.unshift(item);if(cacheKey)m.aiCache[cacheKey]={productIds:[item.id]};return item};
  const saveGeneratedBatch=(state,rows,query,{userId='',allowedCharacters=[]}={})=>{const m=normalize(state),items=[],created=[];for(const row of Array.isArray(rows)?rows:[]){if(items.length>=8)break;try{const item=saveGenerated(state,row,'');if(items.some(existing=>existing.id===item.id))continue;items.push(item);created.push({item,row})}catch{}}
    const characterIds=new Set(allowedCharacters.map(role=>role.id));for(const {item,row} of created){const addReview=(data,author,extra={})=>{const text=String(data?.text||'').trim().slice(0,500),rating=Number(data?.rating);if(!text||!Number.isInteger(rating)||rating<1||rating>5)return;const reviewId=extra.characterId?`review-role-${item.id}-${extra.characterId}`:`review-ai-${item.id}-${String(data.id||m.reviews.length).slice(0,60)}`;if(m.reviews.some(review=>review.id===reviewId))return;m.reviews.push({id:reviewId,productId:item.id,author:String(author||'').slice(0,40)||'商场买家',rating,text,createdAt:Date.now(),source:'ai-generated',...extra})};
      (Array.isArray(row.reviews)?row.reviews.slice(0,4):[]).forEach((review,index)=>addReview(review,String(review?.author||`买家${index+1}`),{userId,source:'ai-generated'}));
      (Array.isArray(row.characterReviews)?row.characterReviews.slice(0,4):[]).forEach(review=>{const characterId=String(review?.characterId||'');if(!characterIds.has(characterId))return;const role=allowedCharacters.find(candidate=>candidate.id===characterId);addReview(review,role?.name,{userId,characterId,source:'ai-character'})});
    }
    const cacheKey=String(query||'').trim().toLowerCase().slice(0,120);if(cacheKey&&items.length)m.aiCache[cacheKey]={productIds:items.map(item=>item.id)};return items;
  };
  // Transfer settlement shares the market wallet; each event is posted at most once.
  const settleTransfer=(state,userIndex,item,action,roleSettlement={})=>{
    if(!state.users?.[userIndex]||item?.type!=='transfer')throw Error('转账所属面具不存在');
    const p=persona(state,userIndex),owner=personaId(state,userIndex);
    if(item.walletUserId&&item.walletUserId!==owner)throw Error('转账不属于当前面具');
    if(!['send','accept','return'].includes(action))throw Error('转账操作无效');
    item.id||=id('transfer');
    const kind=action==='send'?'transfer-out':action==='accept'?'transfer-in':'transfer-refund';
    const existing=p.ledger.find(row=>row.transferId===item.id&&row.kind===kind);
    if(existing)return existing;
    if(action==='send'&&!item.mine||action==='accept'&&item.mine)throw Error('转账方向无效');
    if(!['pending','sent'].includes(item.status))throw Error('转账已处理');
    const debit=p.ledger.find(row=>row.transferId===item.id&&row.kind==='transfer-out');
    if(action==='return'&&(!item.mine||!debit)){item.status='returned';item.walletUserId=owner;return null}
    const currency=p.wallet.currency||'CNY',originalCurrency=item.currency||'CNY';
    const value=action==='return'?-debit.amountCents:originalCurrency===currency?cents(item.amount):currency==='CNY'&&Number.isFinite(item.exchangeRate)&&item.exchangeRate>0?cents(Number(item.amount)*item.exchangeRate):NaN;
    if(!Number.isSafeInteger(value)||value<=0)throw Error('金额或兑换汇率不可用，暂时无法入账');
    const delta=action==='send'?-value:value,next=p.wallet.balanceCents+delta;
    if(!Number.isSafeInteger(p.wallet.balanceCents)||!Number.isSafeInteger(next))throw Error('钱包余额无效');
    if(next<0)throw Error('银行卡余额不足');
    const roleTransfer=action==='accept'&&!item.mine&&Boolean(item.characterId),roleBook=roleTransfer?roleWallet(state,item.characterId,userIndex,true):null,roleExisting=roleTransfer&&roleBook.ledger.find(row=>row.transferId===item.id&&row.kind==='transfer-out');
    let roleNext=null,roleTx=null;
    if(roleTransfer&&!roleExisting){const roleCurrency=String(roleSettlement.roleCurrency||'').toUpperCase(),roleAmountCents=roleSettlement.roleAmountCents;if(!/^[A-Z0-9_]{2,12}$/.test(roleCurrency)||!Number.isSafeInteger(roleAmountCents)||roleAmountCents<=0)throw Error('角色转账账目或汇率无效，暂时无法入账');if(Number.isSafeInteger(roleBook.balanceCents)){if(roleBook.currency!==roleCurrency)throw Error('角色钱包币种已变化，请刷新后重试');roleNext=roleBook.balanceCents-roleAmountCents;if(roleNext<0)throw Error('角色钱包余额不足，转账暂时无法入账')}else if(roleBook.balanceCents!==null)throw Error('角色钱包余额无效');const now=Date.now();roleTx={id:id('role-tx'),kind:'transfer-out',transferId:item.id,amountCents:-roleAmountCents,currency:roleCurrency,originalAmount:item.amount,originalCurrency,createdAt:now,description:`转账给 ${item.toName||'用户'}`}}
    const tx={id:id('tx'),kind,transferId:item.id,amountCents:delta,currency,originalAmount:item.amount,originalCurrency,exchangeRate:item.exchangeRate,createdAt:Date.now(),description:action==='send'?`转账给 ${item.toName||'角色'}`:action==='return'?`转账退回 · ${item.toName||'角色'}`:`收到 ${item.fromName||'角色'} 的转账`};
    p.wallet.balanceCents=next;p.ledger.unshift(tx);if(roleTx){if(!Number.isSafeInteger(roleBook.balanceCents))roleBook.currency=roleSettlement.roleCurrency;else roleBook.balanceCents=roleNext;roleBook.ledger.unshift(roleTx)}item.walletUserId=owner;
    if(action!=='send')item.status=action==='accept'?'accepted':'returned';
    return tx;
  };
  const favorites=(state,userIndex=state.user)=>persona(state,userIndex).favorites;
  window.IrisMarketCore={settleTransfer,categories,normalize,personaId,persona,shippingSummary,roleWallet,initializeRoleWallet,updateRoleWallet,chargeRoleOrder,payRoleOrder,refundRoleOrder,product,linePrice,cartTotal,addCart,cents,transition,createOrder,payOrder,schedule,advance,refund,saveGenerated,saveGeneratedBatch,favorites,yuan,id};
})();
