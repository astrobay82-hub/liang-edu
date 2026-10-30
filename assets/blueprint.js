/* 雅淳醫師成長手帳｜梁雅淳醫師的兒童成長觀察工具（免費試用版）
   資料只存在這台裝置的這個瀏覽器（localStorage），不上傳。 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KEY = 'shanchun_growth_v1';
  var ART = JSON.parse(($('#bp-articles') || {}).textContent || '{}');
  var app = $('#bp-app');
  if (!app) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function toast(m) { var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2200); }

  /* ---------------- storage ---------------- */
  var storageOK = true;
  var state;
  try { state = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { storageOK = false; }
  if (!state || !Array.isArray(state.children)) state = { children: [], active: null, tab: 'dev', stage: null };
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { storageOK = false; toast('這個瀏覽器無法保存資料，請改用一般瀏覽器或先匯出備份'); return false; } }
  function child() { var c = state.children.filter(function (x) { return x.id === state.active; })[0] || state.children[0] || null; if (c) { c.obs = c.obs || {}; c.logs = c.logs || []; c.growth = c.growth || []; c.school = c.school || []; c.puberty = c.puberty || []; } return c; }

  /* ---------------- age ---------------- */
  function age(c) {
    var b = new Date(c.birthday + 'T12:00:00'), n = new Date(today() + 'T12:00:00');
    var days = Math.round((n - b) / 864e5);
    var corr = null;
    var ga = parseInt(c.ga, 10);
    if (ga && ga < 37 && days < 730) corr = Math.max(0, days - (40 - ga) * 7);
    return { days: days, months: days / 30.4375, corrMonths: corr == null ? null : corr / 30.4375 };
  }
  function fmtAge(m) { if (m < 24) return Math.floor(m) + ' 個月' + (m < 3 ? Math.floor((m % 1) * 30) + ' 天' : ''); var y = Math.floor(m / 12), r = Math.floor(m % 12); return y + ' 歲' + (r ? ' ' + r + ' 個月' : ''); }
  function stageFor(m) {
    var cut = [[2, 'm0'], [5, 'm2'], [7, 'm5'], [10, 'm7'], [13, 'm10'], [19, 'm13'], [25, 'm19'], [36, 'y2'], [48, 'y3'], [60, 'y4'], [72, 'y5'], [108, 's6']];
    for (var i = 0; i < cut.length; i++) if (m < cut[i][0]) return cut[i][1];
    return 's9';
  }

  /* ---------------- content ---------------- */
  var DOMAINS = [['motor', '大肢體動作'], ['fine', '精細動作'], ['lang', '語言與溝通'], ['cog', '認知與互動遊戲']];
  var UNIVERSAL = ['任何年齡：原本已經會的能力消失或明顯退步', '叫名字很少回應、很少眼神接觸，或不太和你分享感興趣的東西', '你、家人或老師持續覺得「哪裡怪怪的」——這本身就值得討論'];
  var STAGES = [
    { key: 'm0', label: '0–2 個月', title: '初生互動與安穩照顧', intro: '先認識孩子清醒、安靜、想互動或需要休息時的訊號；不需要安排測驗。',
      d: [['在清醒且有人看顧時，留意頭頸與身體活動；每個孩子當下的清醒時間不同。', '抱持、換姿勢與短暫趴玩都以成人全程看顧和孩子舒服為先；睡眠仍採仰睡等安全睡眠方式。'],
        ['觀察手掌張合、手靠近臉或對眼前物品短暫注視。', '用臉和聲音吸引注意，把安全、較大的玩具放在可看見處，不給小物。'],
        ['留意孩子對熟悉人聲、觸碰和照顧者表情的反應，以及哭聲、表情等表達。', '靠近說話、哼唱，停一下等孩子以眼神、動作或聲音回應。'],
        ['觀察孩子何時較清醒、會看向人臉或對熟悉照顧方式安定。', '面對面短暫互動，跟著孩子的狀態開始或停止；疲倦時先休息。']],
      flags: ['對突然的大聲音幾乎沒有反應', '吸奶非常吃力、常嗆咳，或體重增加不理想', '身體特別軟趴趴或特別僵硬'] },
    { key: 'm2', label: '2–4 個月', title: '抬頭、看人與聲音互動', intro: '以日常照顧和清醒遊戲觀察頭頸、視線、手部探索與互動回應；不必反覆測試。',
      d: [['清醒且看顧時，留意趴著抬頭、以前臂支撐，或抱坐時頭頸逐漸穩定。', '用臉或玩具吸引孩子左右看；趴玩只在清醒且成人陪伴下進行。'],
        ['看看孩子是否會張開手、看自己的手、伸手碰物或短暫握住安全玩具。', '提供容易抓握、無小零件的玩具，讓孩子在舒服的位置自由探索。'],
        ['留意聽到人聲是否轉向或安靜下來，有沒有咿呀聲、微笑或表情回應。', '面對面說話、模仿孩子的聲音，再留白等待一輪回應。'],
        ['觀察是否追看移動的人或物、注意熟悉照顧者，或在互動中露出愉快表情。', '慢慢移動色彩清楚的安全物品，跟著孩子視線停下，不要求一直注視。']],
      flags: ['約 4 個月仍很少看人臉、不太追看移動的人或物', '對聲音幾乎沒有反應', '清醒趴著時仍完全無法抬頭片刻', '很少出現微笑或咿呀聲回應'] },
    { key: 'm5', label: '5–6 個月', title: '翻身、伸手與聲音來回', intro: '這階段可多看身體轉動、雙手探索、發聲和對熟悉互動的回應。',
      d: [['留意頭頸控制、翻身、趴姿支撐或在成人扶持下坐著探索。', '把玩具放在安全可及的位置，引導轉身和伸手；不拉手硬坐或獨自留在高處。'],
        ['觀察雙手是否會一起碰物、伸手拿取或把物品在手中移動。', '提供大小適當且不易吞入的玩具，讓孩子雙手輪流摸、抓、敲。'],
        ['留意孩子是否以聲音、笑聲、表情回應熟悉的人聲，或開始有不同音調。', '模仿一個聲音、等孩子回應，再接著說；不必要求模仿指定發音。'],
        ['看看孩子是否會注意掉落或移動的物品、重複有趣動作，或對熟悉遊戲有期待。', '玩簡短的躲臉再出現、搖鈴停下等來回遊戲，留意孩子是否想繼續。']],
      flags: ['約 6 個月頭部仍控制不穩', '不會伸手拿眼前的玩具', '很少發聲、笑，或對熟悉的人沒有反應', '身體明顯一側用得比另一側少'] },
    { key: 'm7', label: '7–9 個月', title: '坐著探索、換手與找物', intro: '觀察孩子如何移動身體、用雙手探索、聽聲音並開始尋找看不見一部分的物品。',
      d: [['留意坐著保持平衡、轉身伸手，以及孩子偏好的地面移動方式。', '在安全地面放置玩具，鼓勵伸手、轉身或移動；不拿爬行形式作比較。'],
        ['觀察雙手拿物、換手、敲碰或用手指拿取合適大小物品的方式。', '提供安全的大型積木、布書或杯子；任何小物和食物都須留意噎食風險。'],
        ['留意聽到熟悉聲音是否轉頭，是否有重複音節、手勢或眼神表達。', '叫名字後留點時間等回應；把孩子的手勢或聲音說成簡短詞語回應。'],
        ['看看孩子是否尋找部分遮住的玩具、模仿熟悉動作或重複動作看結果。', '把玩具部分遮住，讓孩子自己找；需要時給一點提示，不把活動變成考題。']],
      flags: ['約 9 個月扶著也坐不穩', '叫名字幾乎不轉頭', '幾乎沒有咿呀音節（像 ba、da、ma）', '不太看你注意或指著的東西'] },
    { key: 'm10', label: '10–12 個月', title: '扶站、模仿與理解日常提示', intro: '可留意扶站移動、物品放入取出、手勢模仿，以及對熟悉名字與生活流程的反應。',
      d: [['觀察拉物站起、扶家具移動或在成人陪伴下改變姿勢；不必要求獨走。', '清出安全移動空間並固定家具；避免以牽拉手臂催促走路。'],
        ['留意拍手、把物品放入容器、取出或用手指探索物品。', '用大而安全的容器和物品玩放入、拿出；全程陪同並避免小物。'],
        ['觀察對名字或熟悉聲音的反應，是否用揮手、指物、聲音或表情表達。', '在固定情境搭配簡短語句和手勢，例如「再見」或「給我」，等待孩子回應。'],
        ['看看孩子是否模仿拍手、理解熟悉流程，或找被遮住的物品。', '玩輪流放積木、躲玩具等遊戲，將孩子的動作說出來。']],
      flags: ['約 12 個月扶著也無法站', '不會用手勢（揮手、指物、伸手要抱）', '對名字或熟悉的簡短語句沒有反應', '明顯只用一隻手或一側身體'] },
    { key: 'm13', label: '13–18 個月', title: '走動、指物與模仿生活', intro: '孩子可能用不同方式探索；一起看移動穩定度、手部操作、手勢詞語和生活模仿。',
      d: [['留意獨走、走得較穩、蹲下再起或在牽扶下嘗試階梯等日常動作。', '在平坦、安全地面陪走和蹲取玩具；階梯需成人近身保護。'],
        ['觀察翻書、塗畫、放入取出，或嘗試自己拿杯和餐具。', '給厚頁書、粗蠟筆和適齡餐具；弄髒或反覆操作是探索的一部分。'],
        ['留意是否以指物、手勢、聲音或有意義的詞表達；理解和說出可能不同步。', '跟著孩子指向的東西命名，擴充一兩個詞，不強迫跟讀。'],
        ['看看孩子是否模仿熟悉家事、用熟悉方式操作物品或嘗試拿到想要的東西。', '安排安全的模仿遊戲，例如把玩具放進籃子，讓孩子自己試並適度協助。']],
      flags: ['約 18 個月仍不會走', '還沒有任何有意義的詞', '不會指東西給你看，也不看你指的東西', '不會模仿簡單動作'] },
    { key: 'm19', label: '19–24 個月', title: '組合詞語、假裝遊戲與生活參與', intro: '從移動、堆疊翻頁、理解表達與簡單自理，記下孩子常用的方法和需要的支持。',
      d: [['觀察走得更快、蹲起、踢球，或在牽扶下嘗試上下階梯。', '用軟球玩踢或滾；移動和階梯活動需清出安全空間並陪在身旁。'],
        ['留意堆疊積木、翻圖畫書、倒取物品，或嘗試脫衣和使用餐具。', '提供大積木和圖畫書，鼓勵自己試；倒水等活動在成人看顧下進行。'],
        ['觀察是否指認熟悉物品或身體部位、使用詞語／短語提出需要；記下常用語言。', '看書時命名圖片、說出生活步驟，給孩子時間用任何方式回應。'],
        ['看看孩子是否假裝照顧玩偶、模仿家事，或用簡單方法打開、配對和解決問題。', '用熟悉物品玩餵玩偶、收玩具等情境，跟著孩子的玩法延伸。']],
      flags: ['約 2 歲還不會說兩個詞的組合（如「媽媽抱」）', '聽不懂簡單指令（如「拿鞋子來」）', '不會假裝遊戲或模仿家事', '走路仍常跌倒、明顯不穩'] },
    { key: 'y2', label: '2–3 歲', title: '短句表達、想像遊戲與自主練習', intro: '以生活情境觀察語言理解、動作協調、想像玩法和自理參與；不用每項都會，也不拿同齡孩子互相比較。',
      d: [['留意跑、雙腳跳、踢球或上下階梯的嘗試；記下扶手、牽手和安全提醒。', '玩追泡泡、踢軟球或走不同路線；階梯和戶外遊戲需成人陪同。'],
        ['觀察翻頁、堆疊、模仿簡單畫線、用湯匙或嘗試穿脫衣物。', '用粗蠟筆畫畫、一起翻書或用大積木；剪具和小物需成人管理。'],
        ['留意是否用詞語／短句表達需要、命名熟悉物品、提出問題或聽懂簡單生活提示。', '把孩子的話擴成較完整句子，給選擇並等待回答；多語環境可記錄各語言情境。'],
        ['觀察假裝生活情境、簡單配對拼圖、模仿日常步驟和遇到困難時怎麼求助。', '一起假裝煮飯、看圖找物或收拾分類；讓孩子先嘗試，再提供剛好的提示。']],
      flags: ['約 3 歲說話連家人都很難聽懂', '不會用短句表達需要', '對其他小朋友或假裝遊戲沒有興趣', '跑步或上下樓梯明顯吃力、常跌倒'] },
    { key: 'y3', label: '3–4 歲', title: '跑跳、說明想法與一起遊戲', intro: '留意動作協調、手部操作、生活問答與輪流遊戲；記下孩子在家和團體中的差異。',
      d: [['觀察跑、跳、踢／丟球、上下樓梯；看看平衡與協調在熟悉遊戲中如何表現。', '玩追逐、球或階梯遊戲，提供扶手和示範，依場地調整安全。'],
        ['留意堆疊、翻頁、模仿畫圓或操作簡單衣物的方式。', '一起畫圈、拼大塊拼圖、貼貼紙或穿脫衣物，作品不需達到固定樣子。'],
        ['觀察是否能說出需求、回答熟悉問題、描述物品用途或分享經驗。', '看圖輪流說「發生什麼事」，用追問延伸，不急著糾正發音或用詞。'],
        ['看看孩子是否玩假裝情境、依明顯特徵分類、輪流或參與同伴遊戲。', '玩扮家家酒、簡單分類和輪流遊戲，示範如何等待與表達加入。']],
      flags: ['無法用句子說出想要什麼', '聽不懂兩個步驟的指令', '很少和其他孩子互動或輪流', '握筆、塗畫或拿餐具明顯困難'] },
    { key: 'y4', label: '4–5 歲', title: '平衡操作、敘述經驗與同伴協商', intro: '觀察較複雜的動作、畫畫操作、對話敘述、規則理解與同伴互動；情境和支持同樣重要。',
      d: [['留意上下階梯、平衡、短暫單腳跳或變換方向的嘗試。', '用跳格子、音樂停走和安全的平衡路線練習；可牽手，不比速度。'],
        ['觀察握筆塗畫、畫圓或其他形狀、操作衣物和小型拼圖的過程。', '提供畫畫、串大珠或穿衣練習；剪刀只在成人陪同下使用。'],
        ['留意是否說明物品用途、分享經驗、理解日常對話或表達自己的想法。', '一起回顧一天發生的事，以開放問題邀請描述，也接受短答或手勢。'],
        ['看看孩子如何分類、玩角色遊戲、理解輪流規則或和同伴處理分歧。', '玩簡單桌遊、扮演故事或一起整理物品，示範協商和輪流。']],
      flags: ['說話外人大多聽不懂', '無法說出一天裡發生的一件事', '對各種遊戲都很難投入幾分鐘', '跳躍、平衡明顯比同齡吃力'] },
    { key: 'y5', label: '5–6 歲', title: '動作計畫、事件敘述與入學生活準備', intro: '著重日常參與和逐步自主，而不是提早學科訓練；留意孩子如何計畫、表達和接受協助。',
      d: [['觀察連續跳躍、單腳平衡、方向變換或參與團體活動的情形。', '玩舞動、跳格子或球類遊戲，保留自由活動並依孩子興趣調整。'],
        ['留意畫圖、拼組、手指協調、穿衣和整理個人物品的熟練度。', '一起畫圖、拼圖、拉拉鍊或準備用品；需要協助時拆成小步驟。'],
        ['觀察是否輪流對話、描述熟悉事件的先後、聽懂多步驟生活指示。', '一起說故事或規劃外出，使用簡短清楚的指示並確認孩子理解。'],
        ['看看孩子如何遵守簡單規則、排序故事、解決遊戲問題和完成生活流程。', '玩輪流規則遊戲、整理清單或故事排序，讓孩子試著說出自己的方法。']],
      flags: ['無法依序描述熟悉的事情', '難以跟上團體規則或簡單遊戲', '穿衣、如廁等自理仍需大量協助', '畫圖、握筆或剪貼明顯困難'] }
  ];
  var SCHOOL = {
    s6: { label: '6–8 歲', title: '上學適應與學習起步', intro: '重點是建立安全感與可持續的學習習慣；從孩子在哪種情境較投入、哪種提示有幫助開始。',
      goals: ['學校作息、轉換活動與準備用品', '閱讀故事、理解簡短指示與數量概念', '把作業或生活任務拆成小步驟，逐步增加自主', '練習說出感受、需要協助，並在成人支持下處理同儕摩擦', '保留睡眠、活動和自由遊戲時間'],
      topics: [['上學適應與作息', ['S04-05', 'S06-01']], ['閱讀興趣與理解', []], ['數量概念與解題', []], ['書寫／手部疲累', ['S05-01']], ['專注與任務拆解', ['S06-09', 'S04-41', 'S04-44']], ['同儕互動與情緒', ['S04-40', 'S04-34']], ['睡眠與課業平衡', ['S04-42']]] },
    s9: { label: '9–12 歲以上', title: '學習策略、自我管理與身心平衡', intro: '從「孩子如何學」而非只看成績；尊重自主與隱私，和孩子一起找有效方法。',
      goals: ['閱讀理解、表達與數學解題策略', '規劃作業時間、估計步驟、檢查完成度與適時求助', '專注、休息與睡眠安排；避免只用責備推動作業', '同儕關係、情緒壓力、自我認同與界線溝通', '平衡課業、興趣、運動與家庭生活'],
      topics: [['閱讀理解與表達', []], ['數學／問題解決策略', []], ['作業規劃與時間管理', ['S06-02', 'S06-22']], ['專注、休息與睡眠', ['S04-10', 'S04-20']], ['同儕關係與情緒壓力', ['S04-40', 'S04-22']], ['自我管理與求助', ['S06-10', 'S06-02']], ['課外興趣與活動平衡', ['S06-09']]] }
  };
  var SCHOOL_FLAGS = ['持續拒學、常在上學前肚子痛或頭痛', '老師和家長都觀察到專注、學習或人際上的困難超過半年', '睡眠明顯不足、白天嗜睡或情緒長期低落', '提到不想活或傷害自己（請立即就醫或撥 1925 安心專線）'];
  var DEV_LINKS = { motor: ['S05-07', 'S04-08'], fine: ['S05-01', 'S06-03'], lang: ['S04-08'], cog: ['S04-28', 'S04-35'] };
  var ACTS = [['把玩具送回家', '約 5 分鐘', '和孩子一起選一個收納盒，輪流把 3 件玩具放回去。', '觀察孩子是否願意參與、需要什麼提示。'],
    ['今天發現了什麼？', '約 5 分鐘', '散步或看圖時，輪流說出一件看到、聽到或感受到的事。', '留意孩子偏好的表達方式，不必糾正答案。'],
    ['輪流滾球', '約 5 分鐘', '面對面慢慢把軟球滾給孩子，再輪流把球滾回來。', '觀察孩子是否看球、伸手或願意輪流。'],
    ['一起找分類', '約 5 分鐘', '找幾件安全物品，邀請孩子依顏色、形狀或用途分一分。', '讓孩子自己決定分類方式，聽聽他的想法。'],
    ['情緒天氣報告', '約 3 分鐘', '用天氣比喻今天的心情：晴天、陰天或下雨都可以。', '先接住感受，不急著改變孩子的情緒。']];
  var LOG = {
    appetite: ['食慾／用餐', { usual: '與平常差不多', low: '比平常少', selective: '今天較挑食', more: '比平常多', variable: '不太固定' }],
    sleep: ['睡眠', { settled: '大致安穩', slow: '較難入睡', wake: '夜間醒來', hard: '早上較難叫醒', restless: '睡不安穩' }],
    bowel: ['排便', { usual: '與平常差不多', hard: '較乾硬／費力', loose: '較稀／次數多', none: '今天沒有解' }],
    mood: ['情緒／精力', { steady: '大致平穩', irritable: '較容易煩躁', low: '精力較低', high: '活動量較高', sensitive: '對變化較敏感' }],
    body: ['體感／出汗', { usual: '與平常差不多', cold: '較怕冷', warm: '較怕熱', sweaty: '較容易出汗', nightsweat: '睡覺流很多汗' }]
  };
  var LOG_LINKS = { appetite: ['S02-05', 'S02-08', 'S06-07'], sleep: ['S04-01', 'S04-02', 'S04-42'], bowel_hard: ['S02-21', 'S02-04', 'S02-21'], bowel_loose: ['S02-03', 'S02-20'], mood: ['S04-04', 'S04-03', 'S04-27'], body: ['S04-12', 'S06-17'] };
  var PROMPTS = { appetite: '食慾或用餐改變與時段、活動、點心或用餐環境有無關聯？', sleep: '睡眠變化多在什麼時段或情境？作息、午睡或睡前安排有無不同？', bowel: '排便變化與飲水、飲食或如廁習慣有何關聯？孩子有沒有不舒服？', mood: '情緒或精力變化通常發生在什麼情境？什麼支持有幫助？', body: '冷熱感受或出汗和活動量、室溫或身體不適有無關聯？' };

  function links(ids, label) {
    ids = (ids || []).filter(function (i) { return ART[i]; });
    if (!ids.length) return '';
    return '<div class="bp-links"><b>' + esc(label || '延伸閱讀') + '</b>' + ids.map(function (i) { return '<a href="/a/' + i + '">' + esc(ART[i]) + '</a>'; }).join('') + '</div>';
  }

  /* ---------------- render ---------------- */
  function render() {
    var c = child();
    if (!c) { app.innerHTML = emptyView(); bindEmpty(); return; }
    state.active = c.id;
    var a = age(c), m = a.corrMonths != null ? a.corrMonths : a.months;
    var ageTxt = '實際年齡 ' + fmtAge(a.months) + (a.corrMonths != null ? '・矯正年齡 ' + fmtAge(a.corrMonths) : '');
    var tabs = [['dev', '發展觀察'], ['life', '生活紀錄'], ['growth', '生長・青春期'], ['visit', '回診摘要'], ['data', '資料與備份']];
    app.innerHTML = '<div class="card bp-bar"><div class="bp-who"><label class="sr" for="bp-child">切換孩子</label><select id="bp-child">' +
      state.children.map(function (x) { return '<option value="' + x.id + '"' + (x.id === c.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') +
      '</select><small>' + esc(ageTxt) + '</small></div><div class="bp-bar-btns"><button class="btn" type="button" data-act="edit">編輯</button><button class="btn" type="button" data-act="add">＋ 孩子</button></div></div>' +
      '<div class="pills bp-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '" class="' + (state.tab === t[0] ? 'on' : '') + '" aria-selected="' + (state.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div id="bp-panel"></div>';
    var p = $('#bp-panel');
    if (state.tab === 'life') p.innerHTML = lifeView(c);
    else if (state.tab === 'growth') p.innerHTML = growthView(c, a);
    else if (state.tab === 'visit') p.innerHTML = visitView(c);
    else if (state.tab === 'data') p.innerHTML = dataView(c);
    else p.innerHTML = devView(c, m);
    bind(c);
  }

  function emptyView() {
    return '<div class="card bp-empty"><h2>從一位孩子開始</h2><p>只要暱稱和生日，就能看到孩子這個年齡的觀察重點與在家互動點子。可以新增多位孩子，紀錄分開保存。</p>' +
      '<div class="row"><button class="btn pri" type="button" data-act="add">＋ 新增孩子</button><button class="btn" type="button" data-act="demo">先看示範</button></div>' +
      (storageOK ? '' : '<p class="note">這個瀏覽器目前無法保存資料（可能是無痕模式或 App 內建瀏覽器），建議改用 Safari 或 Chrome 開啟。</p>') + '</div>' + childForm();
  }

  function childForm(c) {
    c = c || {};
    return '<dialog id="bp-dlg" class="bp-dlg"><form method="dialog" id="bp-form"><h2>' + (c.id ? '編輯孩子資料' : '新增孩子') + '</h2>' +
      '<label>暱稱 <span class="req">必填</span><input id="f-name" maxlength="20" required value="' + esc(c.name) + '" placeholder="例如：小寶"></label>' +
      '<label>生日 <span class="req">必填</span><input id="f-bday" type="date" required max="' + today() + '" value="' + esc(c.birthday) + '"></label>' +
      '<label>出生週數 <span class="opt">早產兒建議填</span><input id="f-ga" type="number" min="22" max="42" step="1" value="' + esc(c.ga) + '" placeholder="例如：34"></label>' +
      '<p class="hint">未滿 37 週出生的孩子，2 歲前會同時顯示「矯正年齡」，發展觀察以矯正年齡為準。請不要填真實姓名或身分證等可辨識資料。</p>' +
      '<div class="row"><button class="btn" type="button" data-close>取消</button>' + (c.id ? '<button class="btn danger" type="button" data-act="del">刪除這位孩子</button>' : '') + '<button class="btn pri" type="submit">儲存</button></div></form></dialog>';
  }

  function devView(c, m) {
    var sk = state.stage || stageFor(m);
    var opts = STAGES.map(function (s) { return [s.key, s.label]; }).concat([['s6', '6–8 歲'], ['s9', '9–12 歲以上']]);
    var sel = '<div class="bp-stage"><label for="bp-stage">年齡階段</label><select id="bp-stage">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === sk ? ' selected' : '') + '>' + o[1] + (o[0] === stageFor(m) ? '（建議）' : '') + '</option>'; }).join('') + '</select></div>';
    if (SCHOOL[sk]) return sel + schoolView(c, sk);
    var s = STAGES.filter(function (x) { return x.key === sk; })[0];
    var cards = DOMAINS.map(function (d, i) {
      var k = sk + '-' + d[0], o = c.obs[k] || {};
      var st = function (v, t) { return '<button type="button" class="' + (o.s === v ? 'on' : '') + '" data-obs="' + k + '" data-s="' + v + '">' + t + '</button>'; };
      return '<article class="card bp-dom"><h3>' + d[1] + '</h3><p><b>觀察什麼：</b>' + esc(s.d[i][0]) + '</p><p><b>在家可以試：</b>' + esc(s.d[i][1]) + '</p>' +
        '<div class="bp-seg" role="group" aria-label="' + d[1] + '觀察狀態">' + st('seen', '有看到') + st('notyet', '還沒看到') + st('unsure', '不確定') + '</div>' +
        '<div class="bp-row2"><button type="button" class="bp-star' + (o.star ? ' on' : '') + '" data-star="' + k + '" aria-pressed="' + !!o.star + '">' + (o.star ? '★ 已列入回診摘要' : '☆ 想帶去問醫師') + '</button>' + (o.date ? '<small>觀察日期 ' + esc(o.date) + '</small>' : '') + '</div>' +
        '<details' + (o.note ? ' open' : '') + '><summary>記下情境</summary><textarea data-note="' + k + '" maxlength="400" placeholder="什麼時候看到？需要什麼提示或協助？">' + esc(o.note) + '</textarea></details>' +
        links(DEV_LINKS[d[0]], '相關文章') + '</article>';
    }).join('');
    var act = ACTS[(new Date().getDate()) % ACTS.length];
    return sel + '<section class="bp-head"><p class="eyebrow">' + s.label + '</p><h2>' + esc(s.title) + '</h2><p>' + esc(s.intro) + '</p></section>' +
      '<div class="bp-grid">' + cards + '</div>' +
      flagBox(s.flags.concat(UNIVERSAL)) +
      '<div class="card bp-act"><span class="chip">本週一小步・' + act[1] + '</span><h3>' + act[0] + '</h3><p>' + act[2] + '</p><p class="muted">' + act[3] + '</p></div>' +
      '<p class="note">這些是日常觀察的例子，不是每項都要達成的清單、測驗或診斷。孩子的發展順序、速度和表現情境各有不同；記下「何時看見、需要什麼幫忙」比打分數更有用。</p>';
  }

  function flagBox(items) {
    return '<section class="flag bp-flag"><h2>這些情況，建議提早和兒科醫師討論</h2><ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<p>以上是常用的「提早討論」參考，不是診斷切點；有任何一項讓你擔心，就帶著這裡的紀錄去問。7 歲以前，國健署提供 7 次免費兒童預防保健，可順便請醫師看發展。</p></section>';
  }

  function schoolView(c, sk) {
    var s = SCHOOL[sk];
    var notes = c.school.filter(function (n) { return n.stage === sk; }).sort(function (a, b) { return b.date < a.date ? -1 : 1; });
    return '<section class="bp-head"><p class="eyebrow">' + s.label + '</p><h2>' + esc(s.title) + '</h2><p>' + esc(s.intro) + '</p></section>' +
      '<div class="card bp-box"><h3>這個階段的陪伴重點</h3><ul>' + s.goals.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="card bp-box"><h3>記一筆學習與生活觀察</h3><p class="muted">記具體情境與有效的支持，不記分數、不診斷學習問題。</p>' +
      '<div class="bp-form"><label>日期<input type="date" id="sc-date" value="' + today() + '" max="' + today() + '"></label><label>主題<select id="sc-topic">' + s.topics.map(function (t) { return '<option>' + t[0] + '</option>'; }).join('') + '</select></label>' +
      '<label class="wide">看到什麼／什麼有幫助<textarea id="sc-note" maxlength="600" placeholder="例如：寫作業前一起拆成小步驟，固定休息後比較能持續。"></textarea></label></div><button class="btn pri" type="button" data-act="school" data-stage="' + sk + '">儲存觀察</button>' +
      (notes.length ? '<ul class="bp-list">' + notes.map(function (n) { return '<li><b>' + esc(n.date) + '・' + esc(n.topic) + '</b><span>' + esc(n.note) + '</span><button type="button" class="x" data-delschool="' + n.id + '" aria-label="刪除">×</button></li>'; }).join('') + '</ul>' : '') + '</div>' +
      '<div class="card bp-box"><h3>關於專注力，先知道這些</h3><p>上課分心、寫功課拖拖拉拉、常忘東忘西，在這個年紀<b>非常常見</b>，大多不是疾病。睡不夠、鼻塞睡不好、肚子餓、情緒壓力、任務太大太模糊、環境太吵或螢幕時間太長，都會讓孩子的專注力變差。</p><p>先從睡眠、作息和把任務拆小開始調整，通常就會看到改善。只有在調整一段時間後，<b>在家和在學校都</b>持續明顯影響學習、生活或人際，才需要請兒科或兒童心智科醫師評估；不需要也不建議家長自己對照網路量表判斷。</p></div>' +
      '<div class="card bp-box"><h3>各主題的延伸閱讀</h3>' + s.topics.filter(function (t) { return t[1].length; }).map(function (t) { return links(t[1], t[0]); }).join('') + '</div>' +
      flagBox(SCHOOL_FLAGS.concat(UNIVERSAL.slice(2)));
  }

  function recent(c, days) {
    var t = new Date(today() + 'T00:00:00');
    return c.logs.filter(function (l) { var d = (t - new Date(l.date + 'T00:00:00')) / 864e5; return d >= 0 && d < days; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }
  function lifeSummary(c) {
    var logs = recent(c, 14);
    if (!logs.length) return { text: '', hits: [] };
    var days = {}; logs.forEach(function (l) { days[l.date] = 1; });
    var lines = ['近 14 天：' + logs.length + ' 筆紀錄，' + Object.keys(days).length + ' 天有記錄（沒記的日子不代表正常或沒有）。'];
    var hits = [];
    Object.keys(LOG).forEach(function (f) {
      var cnt = {}, n = 0;
      logs.forEach(function (l) { if (l[f]) { cnt[l[f]] = (cnt[l[f]] || 0) + 1; n++; } });
      if (!n) return;
      var parts = Object.keys(cnt).map(function (v) { return LOG[f][1][v] + ' ' + cnt[v] + ' 次'; });
      lines.push('・' + LOG[f][0] + '：' + parts.join('、'));
      var notUsual = Object.keys(cnt).filter(function (v) { return ['usual', 'settled', 'steady'].indexOf(v) < 0; });
      if (notUsual.length) hits.push(f === 'bowel' ? (cnt.hard || cnt.none ? 'bowel_hard' : 'bowel_loose') : f);
    });
    var ctx = logs.filter(function (l) { return l.ctx || l.help; }).slice(0, 3).map(function (l) { return '・' + l.date + (l.ctx ? ' 情境：' + l.ctx : '') + (l.help ? '；有幫助：' + l.help : ''); });
    return { text: lines.concat(ctx).join('\n'), hits: hits };
  }

  function lifeView(c) {
    var sel = Object.keys(LOG).map(function (f) { return '<label>' + LOG[f][0] + '<select id="lg-' + f + '"><option value="">未記錄</option>' + Object.keys(LOG[f][1]).map(function (v) { return '<option value="' + v + '">' + LOG[f][1][v] + '</option>'; }).join('') + '</select></label>'; }).join('');
    var sum = lifeSummary(c);
    var prompts = sum.hits.map(function (h) { return h.indexOf('bowel') === 0 ? 'bowel' : h; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    var logs = recent(c, 60);
    return '<div class="card bp-box"><h3>快速生活紀錄</h3><p class="muted">只有日期必填，其他都選填；記下「和平常不一樣」的地方即可，不需要每天填。這裡不會自動判斷體質或證型。</p>' +
      '<div class="bp-form"><label>日期<input type="date" id="lg-date" value="' + today() + '" max="' + today() + '"></label>' + sel +
      '<label class="wide">情境／可能誘因<input id="lg-ctx" maxlength="200" placeholder="例如：晚睡、外出、飲食改變"></label><label class="wide">什麼有幫助<input id="lg-help" maxlength="200" placeholder="例如：提早睡前流程、安靜休息"></label></div>' +
      '<button class="btn pri" type="button" data-act="log">儲存紀錄</button></div>' +
      '<div class="card bp-box"><h3>近 14 天摘要</h3>' + (sum.text ? '<pre class="bp-pre">' + esc(sum.text) + '</pre>' : '<p class="muted">還沒有紀錄。從今天的一筆開始即可。</p>') +
      (prompts.length ? '<h4>回診時可以聊的問題</h4><ul>' + prompts.map(function (p) { return '<li>' + esc(PROMPTS[p]) + '</li>'; }).join('') + '</ul>' : '') +
      sum.hits.map(function (h) { return links(LOG_LINKS[h], (LOG[h] ? LOG[h][0] : '排便') + '相關文章'); }).join('') + '</div>' +
      '<div class="card bp-box"><h3>中醫怎麼看這些紀錄？</h3><p>中醫看孩子，很重視吃、睡、排便、情緒與冷熱出汗這些日常線索，它們能幫助醫師了解孩子的整體狀態。這裡只幫你整理觀察，不會自動判定體質；體質與證型需要醫師當面望聞問切後判斷。把摘要帶去回診，比回想「好像最近⋯⋯」準確得多。</p></div>' +
      (logs.length ? '<div class="card bp-box"><h3>最近的紀錄</h3><ul class="bp-list">' + logs.map(function (l) {
        var t = Object.keys(LOG).filter(function (f) { return l[f]; }).map(function (f) { return LOG[f][1][l[f]]; }).join('、');
        return '<li><b>' + esc(l.date) + '</b><span>' + esc(t || '（無勾選）') + (l.ctx ? '；' + esc(l.ctx) : '') + '</span><button type="button" class="x" data-dellog="' + l.id + '" aria-label="刪除">×</button></li>';
      }).join('') + '</ul></div>' : '');
  }

  function growthView(c, a) {
    var rows = c.growth.slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; });
    var head = a.months < 84;
    var chart = '';
    var hs = c.growth.filter(function (g) { return g.h; }).sort(function (x, y) { return x.date < y.date ? -1 : 1; });
    if (hs.length >= 2) {
      var W = 320, H = 120, t0 = new Date(hs[0].date) - 0, t1 = new Date(hs[hs.length - 1].date) - 0 || t0 + 1;
      var h0 = Math.min.apply(null, hs.map(function (g) { return g.h; })), h1 = Math.max.apply(null, hs.map(function (g) { return g.h; }));
      if (h1 === h0) h1 = h0 + 1;
      var pts = hs.map(function (g) { return [20 + (new Date(g.date) - t0) / (t1 - t0 || 1) * (W - 40), H - 20 - (g.h - h0) / (h1 - h0) * (H - 40)]; });
      chart = '<svg class="bp-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="身高變化走勢"><polyline fill="none" stroke="#3A6356" stroke-width="2.5" points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '"/>' +
        pts.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#3A6356"/><text x="' + p[0] + '" y="' + (p[1] - 8) + '" font-size="10" text-anchor="middle" fill="#3D4641">' + hs[i].h + '</text>'; }).join('') + '</svg><p class="muted">只顯示你記錄的身高變化，不計算百分位。要和生長曲線比對，請用下方國健署工具或請醫師判讀。</p>';
    }
    var pub = '';
    if (a.months >= 72) {
      var pl = c.puberty.slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; });
      pub = '<div class="card bp-box"><h3>青春期變化（選填）</h3>' +
        '<div class="flag bp-flag"><h2>台灣臨床常用的評估時機</h2><ul><li>女孩 8 歲前出現乳房發育、男孩 9 歲前出現睪丸變大或陰毛：建議評估性早熟</li><li>女孩 10 歲前來初經，或發育在半年內進展很快、身高突然暴衝：建議評估</li><li>女孩 13 歲、男孩 14 歲仍沒有任何青春期跡象，或女孩 15 歲仍未來初經：建議評估青春期延遲</li></ul><p>每個孩子開始的時間與順序都不同，這裡不自動判讀；有疑問就帶著紀錄和兒科討論。</p></div>' +
        '<p class="muted">只記家長實際注意到的時間與疑問；不需要拍照或自行分期。</p>' +
        '<div class="bp-form"><label>大約日期<input type="date" id="pb-date" value="' + today() + '" max="' + today() + '"></label><label>注意到的變化<select id="pb-sign"><option>乳房相關變化</option><option>睪丸／陰囊相關變化</option><option>陰毛、腋毛或體味</option><option>青春痘或皮膚變化</option><option>月經開始</option><option>身高近期長很快</option><option>其他／不確定</option></select></label><label class="wide">備註<input id="pb-note" maxlength="300" placeholder="可留白，或寫下變化速度、想問醫師的事"></label></div>' +
        '<button class="btn pri" type="button" data-act="puberty">儲存</button>' +
        (pl.length ? '<ul class="bp-list">' + pl.map(function (x) { return '<li><b>' + esc(x.date) + '・' + esc(x.sign) + '</b><span>' + esc(x.note) + '</span><button type="button" class="x" data-delpub="' + x.id + '" aria-label="刪除">×</button></li>'; }).join('') + '</ul>' : '') +
        links(['S05-11', 'S05-25', 'S05-31', 'S05-33'], '性早熟與青春期文章') + '</div>';
    }
    return '<div class="card bp-box"><h3>身高體重紀錄</h3><p class="muted">從兒童健康手冊或每次健檢的數值記起即可；盡量用相近的量測方式。</p>' +
      '<div class="bp-form"><label>日期<input type="date" id="gr-date" value="' + today() + '" max="' + today() + '"></label><label>身高／身長（cm）<input type="number" id="gr-h" min="30" max="220" step="0.1" inputmode="decimal"></label><label>體重（kg）<input type="number" id="gr-w" min="1" max="200" step="0.1" inputmode="decimal"></label>' + (head ? '<label>頭圍（cm）<input type="number" id="gr-hc" min="25" max="70" step="0.1" inputmode="decimal"></label>' : '') + '</div>' +
      '<button class="btn pri" type="button" data-act="growth">儲存量測</button>' + chart +
      (rows.length ? '<table class="hours bp-table"><thead><tr><th>日期</th><th>身高</th><th>體重</th>' + (head ? '<th>頭圍</th>' : '') + '<th></th></tr></thead><tbody>' + rows.map(function (g) { return '<tr><td>' + esc(g.date) + '</td><td>' + (g.h || '—') + '</td><td>' + (g.w || '—') + '</td>' + (head ? '<td>' + (g.hc || '—') + '</td>' : '') + '<td><button type="button" class="x" data-delgr="' + g.id + '" aria-label="刪除">×</button></td></tr>'; }).join('') + '</tbody></table>' : '') +
      '<p class="note">不計算百分位，也不判斷生長是否異常。0–5 歲國健署採用 WHO 生長標準；可用 <a href="https://health99.hpa.gov.tw/health99/HC/D/115/ChildGrowthCurve" target="_blank" rel="noopener">國健署兒童生長曲線工具</a> 對照，或帶紀錄請醫師判讀。</p>' +
      links(['S05-23', 'S05-05', 'S05-28', 'S05-32'], '長高與生長曲線文章') + '</div>' + pub;
  }

  function visitView(c) {
    var stars = Object.keys(c.obs).filter(function (k) { return c.obs[k].star; }).map(function (k) {
      var sk = k.split('-')[0], dk = k.split('-')[1], s = STAGES.filter(function (x) { return x.key === sk; })[0], dn = DOMAINS.filter(function (d) { return d[0] === dk; })[0];
      var o = c.obs[k], sv = { seen: '有看到', notyet: '還沒看到', unsure: '不確定' }[o.s] || '尚未標記';
      return '・' + (s ? s.label : '') + ' ' + (dn ? dn[1] : '') + '：' + sv + (o.note ? '（' + o.note + '）' : '');
    });
    var g = c.growth.slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; }).slice(0, 2).map(function (x) { return '・' + x.date + (x.h ? ' 身高 ' + x.h + ' cm' : '') + (x.w ? ' 體重 ' + x.w + ' kg' : '') + (x.hc ? ' 頭圍 ' + x.hc + ' cm' : ''); });
    var pb = c.puberty.slice(0, 3).map(function (x) { return '・' + x.date + ' ' + x.sign + (x.note ? '：' + x.note : ''); });
    var sc = c.school.slice(-3).map(function (x) { return '・' + x.date + ' ' + x.topic + '：' + x.note; });
    var a = age(c);
    var parts = ['【看診摘要｜' + c.name + '】', '年齡：' + fmtAge(a.months) + (a.corrMonths != null ? '（矯正 ' + fmtAge(a.corrMonths) + '，出生 ' + c.ga + ' 週）' : '')];
    var sec = function (t, arr) { if (arr.length) parts.push('', t, arr.join('\n')); };
    sec('想請教的發展觀察：', stars);
    var ls = lifeSummary(c).text; if (ls) parts.push('', '生活紀錄：', ls);
    sec('最近量測：', g); sec('青春期觀察：', pb); sec('學習與生活觀察：', sc);
    parts.push('', '這次最想問醫師的事：');
    return '<div class="card bp-box"><h3>回診摘要</h3><p class="muted">自動整理你標記 ★ 的觀察、近 14 天生活紀錄與最近量測。可以直接修改、補上最想問的事，再複製到手機備忘錄或列印帶去。</p>' +
      '<textarea id="bp-summary" class="bp-sum" rows="14">' + esc(parts.join('\n')) + '</textarea>' +
      '<div class="row"><button class="btn pri" type="button" data-act="copy">複製摘要</button><button class="btn" type="button" data-act="print">列印</button><a class="btn" href="/doctor">梁醫師門診與掛號</a></div>' +
      (stars.length ? '' : '<p class="note">在「發展觀察」按「☆ 想帶去問醫師」，那一項就會出現在這裡。</p>') + '</div>' +
      links(['S06-16'], '看診前怎麼準備');
  }

  function dataView(c) {
    return '<div class="card bp-box"><h3>你的資料存在哪裡？</h3><ul>' +
      '<li>所有紀錄只存在<b>這支手機（或電腦）的這個瀏覽器</b>裡，不會上傳到任何伺服器，醫院與醫師也看不到。</li>' +
      '<li><b>換手機、換瀏覽器、清除瀏覽紀錄或網站資料</b>，紀錄就會不見。</li>' +
      '<li>在 <b>LINE、Facebook 裡直接點開</b>的網頁是另一個 App 內建瀏覽器，資料和 Safari／Chrome 不相通；建議用 Safari 或 Chrome 開啟，並「加入主畫面」。</li>' +
      '<li>iPhone 的 Safari 若<b>一段時間（約 7 天）沒有開啟</b>本網站，系統可能自動清除網站資料；加入主畫面並定期備份可降低風險。</li>' +
      '<li><b>無痕模式</b>關掉視窗就會清空。</li>' +
      '<li>爸爸、媽媽各自的手機<b>無法共用</b>同一份紀錄；可用下方備份檔互相匯入。</li></ul>' +
      '<div class="row"><button class="btn pri" type="button" data-act="export">下載備份檔</button><label class="btn">匯入備份檔<input type="file" id="bp-import" accept="application/json,.json" hidden></label></div>' +
      '<p class="note">建議每個月下載一次備份檔，存到雲端硬碟或傳給自己。匯入會取代目前這個瀏覽器裡的所有紀錄。</p></div>' +
      '<div class="card bp-box"><h3>參考資料</h3><ul class="bp-src">' +
      '<li><a href="https://www.hpa.gov.tw/Pages/List.aspx?nodeid=4856" target="_blank" rel="noopener">衛生福利部國民健康署：兒童發展篩檢與兒童預防保健</a></li>' +
      '<li><a href="https://cdrc.taichung.gov.tw/ChildrenHealthCheck/Milestone.htm" target="_blank" rel="noopener">臺中市兒童發展資源網：嬰幼兒發展里程碑</a></li>' +
      '<li><a href="https://www.cdc.gov/act-early/milestones/index.html" target="_blank" rel="noopener">美國 CDC「Learn the Signs. Act Early.」發展里程碑</a></li>' +
      '<li><a href="https://health99.hpa.gov.tw/health99/HC/D/115/ChildGrowthCurve" target="_blank" rel="noopener">國健署兒童生長曲線工具</a></li>' +
      '<li><a href="https://www.healthychildren.org/English/ages-stages/gradeschool/puberty/Pages/When-Puberty-Starts-Early.aspx" target="_blank" rel="noopener">AAP HealthyChildren：When Puberty Starts Early</a></li></ul>' +
      '<p class="note">本工具是家長觀察與溝通輔助，不是經驗證的發展篩檢量表，也不提供診斷、體質判定或用藥建議。</p></div>';
  }

  /* ---------------- events ---------------- */
  function openForm(c) {
    var old = $('#bp-dlg'); if (old) old.remove();
    app.insertAdjacentHTML('beforeend', childForm(c));
    var dlg = $('#bp-dlg');
    $('[data-close]', dlg).onclick = function () { dlg.close(); };
    var del = $('[data-act=del]', dlg);
    if (del) del.onclick = function () { if (confirm('確定刪除「' + c.name + '」的所有紀錄？此動作無法復原。')) { state.children = state.children.filter(function (x) { return x.id !== c.id; }); state.active = null; save(); dlg.close(); render(); toast('已刪除'); } };
    $('#bp-form').onsubmit = function (e) {
      e.preventDefault();
      var name = $('#f-name').value.trim(), bd = $('#f-bday').value, ga = $('#f-ga').value;
      if (!name || !bd) { toast('請填暱稱與生日'); return; }
      if (bd > today()) { toast('生日不能晚於今天'); return; }
      if (c && c.id) { c.name = name; c.birthday = bd; c.ga = ga; }
      else { var n = { id: uid(), name: name, birthday: bd, ga: ga, obs: {}, logs: [], growth: [], school: [], puberty: [] }; state.children.push(n); state.active = n.id; }
      state.stage = null; state.tab = 'dev'; save(); dlg.close(); render(); toast('已儲存');
    };
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function bindEmpty() {
    $('[data-act=add]', app).onclick = function () { openForm(null); };
    $('[data-act=demo]', app).onclick = function () {
      var b = new Date(); b.setMonth(b.getMonth() - 20);
      var d = { id: uid(), name: '示範寶寶', birthday: b.toISOString().slice(0, 10), ga: '', obs: { 'm19-lang': { s: 'unsure', star: true, note: '會說很多單字，還沒聽到兩個詞連在一起', date: today() }, 'm19-motor': { s: 'seen', date: today() } }, logs: [{ id: uid(), date: today(), sleep: 'wake', bowel: 'hard', ctx: '晚餐較晚' }], growth: [], school: [], puberty: [] };
      state.children.push(d); state.active = d.id; save(); render(); toast('已建立示範寶寶，可在「編輯」中刪除');
    };
  }
  function val(id) { var el = $('#' + id); return el ? el.value.trim() : ''; }
  function bind(c) {
    $('#bp-child').onchange = function () { state.active = this.value; state.stage = null; save(); render(); };
    $('[data-act=edit]').onclick = function () { openForm(c); };
    $('[data-act=add]').onclick = function () { openForm(null); };
    $$('[data-tab]').forEach(function (b) { b.onclick = function () { state.tab = b.getAttribute('data-tab'); save(); render(); }; });
    var st = $('#bp-stage'); if (st) st.onchange = function () { state.stage = this.value; save(); render(); };
    $$('[data-obs]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-obs'), o = c.obs[k] = c.obs[k] || {}, v = b.getAttribute('data-s'); o.s = o.s === v ? '' : v; if (!o.date) o.date = today(); save(); render(); }; });
    $$('[data-star]').forEach(function (b) { b.onclick = function () { var k = b.getAttribute('data-star'), o = c.obs[k] = c.obs[k] || {}; o.star = !o.star; if (!o.date) o.date = today(); save(); render(); toast(o.star ? '已加入回診摘要' : '已移出回診摘要'); }; });
    $$('[data-note]').forEach(function (t) { t.onchange = function () { var k = t.getAttribute('data-note'), o = c.obs[k] = c.obs[k] || {}; o.note = t.value.trim(); if (!o.date) o.date = today(); save(); toast('已儲存'); }; });
    var on = function (sel, fn) { var el = $(sel); if (el) el.onclick = fn; };
    on('[data-act=log]', function () { var l = { id: uid(), date: val('lg-date') || today(), ctx: val('lg-ctx'), help: val('lg-help') }; Object.keys(LOG).forEach(function (f) { var v = val('lg-' + f); if (v) l[f] = v; }); c.logs.push(l); save(); render(); toast('生活紀錄已儲存'); });
    on('[data-act=growth]', function () { var h = parseFloat(val('gr-h')), w = parseFloat(val('gr-w')), hc = parseFloat(val('gr-hc')); if (!h && !w && !hc) { toast('請至少填一項數值'); return; } c.growth.push({ id: uid(), date: val('gr-date') || today(), h: h || null, w: w || null, hc: hc || null }); save(); render(); toast('量測已儲存'); });
    on('[data-act=puberty]', function () { c.puberty.push({ id: uid(), date: val('pb-date') || today(), sign: val('pb-sign'), note: val('pb-note') }); save(); render(); toast('已儲存'); });
    on('[data-act=school]', function () { var sk = $('[data-act=school]').getAttribute('data-stage'); if (!val('sc-note')) { toast('請寫下看到的情況'); return; } c.school.push({ id: uid(), stage: sk, date: val('sc-date') || today(), topic: val('sc-topic'), note: val('sc-note') }); save(); render(); toast('已儲存'); });
    on('[data-act=copy]', function () { var t = $('#bp-summary'); t.select(); var txt = t.value; if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(function () { toast('已複製，可貼到備忘錄'); }); else { try { document.execCommand('copy'); toast('已複製'); } catch (e) { toast('請長按選取複製'); } } });
    on('[data-act=print]', function () { window.print(); });
    on('[data-act=export]', function () { var blob = new Blob([JSON.stringify({ app: 'liang-growth', version: 1, exported: today(), data: state }, null, 2)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '成長手帳備份-' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); toast('備份檔已下載'); });
    var imp = $('#bp-import'); if (imp) imp.onchange = function () { var f = imp.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { try { var j = JSON.parse(r.result); var d = j.data || j; if (!Array.isArray(d.children)) throw 0; if (!confirm('匯入會取代目前的紀錄，確定嗎？')) return; state = d; save(); render(); toast('已匯入'); } catch (e) { toast('檔案格式不正確'); } }; r.readAsText(f); };
    var dels = { dellog: 'logs', delgr: 'growth', delpub: 'puberty', delschool: 'school' };
    Object.keys(dels).forEach(function (k) { $$('[data-' + k + ']').forEach(function (b) { b.onclick = function () { var id = b.getAttribute('data-' + k); c[dels[k]] = c[dels[k]].filter(function (x) { return x.id !== id; }); save(); render(); }; }); });
  }

  render();
})();
