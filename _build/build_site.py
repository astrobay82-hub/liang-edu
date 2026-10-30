"""產生靜態網站：首頁、每篇獨立文章頁、醫師介紹、看診手記、sitemap。
用法：python3 build_site.py  （輸出到上一層網站根目錄）"""
import json, re, os, html, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from refs import refs_for
from checklists import checklist_for

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
SITE = 'https://liang.ialdsm.com'
UPDATED = '2026-10-30'
LINE_BOT = 'https://lin.ee/P1qhxUq'
LINE_DR = 'https://lin.ee/WiNimzB'
REG = 'https://reg-prod.tzuchi-healthcare.org.tw/tchw/HIS5OpdReg/DtQuery?Loc=TC&Doc=30226'
SYS_COLOR = {'teal': 'c-teal', 'amber': 'c-amber', 'rose': 'c-rose', 'indigo': 'c-indigo', 'emerald': 'c-emerald', 'purple': 'c-purple'}

themes = json.load(open(os.path.join(HERE, 'themes_final.json')))
for _th in themes:
    for _t in _th['topics']:
        _t['tcm_view'] = _t['tcm_view'].replace('中醫在這題', '中醫在這個問題上')
        for _s in _t['custom_detailed_sections']:
            _s['body'] = _s['body'].replace('這反而是這題最值得家長注意的地方', '這反而是最值得家長注意的地方')
notes = json.load(open(os.path.join(HERE, 'notes50.json')))
e = lambda s: html.escape(str(s), quote=True)

# ---------------- content cleanup ----------------
META_CUT = re.compile(r'\s*(#+\s*)?(這一題最值得留下|醫療內容定位|診間一句話收尾|家長最好記的一句話|醫師一句話|診間價值標註|這題我會標成|把核心記憶點|這一篇的醫療邏輯|這題也可以和|這題的核心數字)')


def clean_flag(s):
    m = META_CUT.search(s)
    if m:
        s = s[:m.start()]
    return s.strip()


MARK = re.compile(r'⚠️|⚠|🔸|🚩|🔹|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]')


def split_top(s, seps):
    out, depth, buf = [], 0, ''
    for ch in s:
        if ch in '（(「':
            depth += 1
        elif ch in '）)」':
            depth = max(0, depth - 1)
        if depth == 0 and ch in seps:
            out.append(buf); buf = ''
        else:
            buf += ch
    out.append(buf)
    return [x.strip(' 。・\n') for x in out if x.strip(' 。・\n')]


def parse_flag(s):
    """回傳 groups=[(label, [items])], paras=[str]"""
    s = clean_flag(s)
    s = re.sub(r'#+\s*', '', s).replace('**', '')
    groups, paras = [], []
    if MARK.search(s):
        first = MARK.search(s).start()
        intro = s[:first].strip()
        rest = s[first:]
        chunks = [c for c in MARK.split(rest) if c.strip()]
        items = []
        for k, c in enumerate(chunks):
            c = c.strip()
            if k == len(chunks) - 1 and re.search(r'\s{2,}', c):
                c, outro = re.split(r'\s{2,}', c, maxsplit=1)
                paras_tail = outro.strip()
            else:
                paras_tail = ''
            items.append(c.strip(' 。'))
        if len(items) == 1 and not intro:
            return parse_flag(items[0])
        groups.append((intro, items))
        if paras_tail:
            paras.append(paras_tail)
        return groups, paras
    for sent in split_top(s, '。'):
        m = re.match(r'^([^：:]{2,40})[：:](.+)$', sent)
        if m:
            body = m.group(2)
            items = []
            for x in split_top(body, '；;'):
                for y in split_top(x, '、'):
                    y = re.sub(r'^或', '', y)
                    if items and len(y) <= 3:
                        items[-1] += '、' + y
                    else:
                        items.append(y)
            if len(items) >= 3:
                groups.append((m.group(1).strip() + '：', items)); continue
        if re.search(r'[；;]', sent) and len(split_top(sent, '；;')) >= 3:
            groups.append(('', split_top(sent, '；;'))); continue
        paras.append(sent + '。')
    return groups, paras


def item_html(x):
    m = re.match(r'^(\S{2,22}?)\s+(\S.*)$', x)
    if m and re.search(r'[\u4e00-\u9fff]$', m.group(1)) and re.match(r'[\u4e00-\u9fff（]', m.group(2)):
        return f'<b>{e(m.group(1))}</b>　{e(m.group(2))}'
    return e(x)


def prose(text):
    text = text.replace('**', '').strip()
    out, ul = [], []
    def flush():
        if ul:
            out.append('<ul>' + ''.join(f'<li>{e(x)}</li>' for x in ul) + '</ul>')
            ul.clear()
    for para in re.split(r'\n\s*\n', text):
        lines = [l.strip() for l in para.split('\n') if l.strip()]
        buf = []
        for l in lines:
            if re.match(r'^[・•\-]\s*', l):
                if buf:
                    flush(); out.append('<p>' + '<br>'.join(e(x) for x in buf) + '</p>'); buf = []
                ul.append(re.sub(r'^[・•\-]\s*', '', l))
            elif l.startswith('>'):
                flush()
                if buf:
                    out.append('<p>' + '<br>'.join(e(x) for x in buf) + '</p>'); buf = []
                out.append('<blockquote>' + e(l.lstrip('> ')) + '</blockquote>')
            else:
                flush(); buf.append(l)
        flush()
        if buf:
            out.append('<p>' + '<br>'.join(e(x) for x in buf) + '</p>')
    return '\n'.join(out)


def first_sents(s, n=90):
    s = re.sub(r'\s+', '', s)
    out = ''
    for x in re.split(r'(?<=[。！？])', s):
        if len(out) + len(x) > n and out:
            break
        out += x
    return out[:n + 30]


def desc_of(t):
    d = t['subtitle'] if len(t['subtitle']) > 20 else first_sents(t['ext_reading_500'], 80)
    return re.sub(r'\s+', ' ', d)[:150]


def read_min(t):
    n = len(t['ext_reading_500']) + sum(len(x['body']) for x in t['custom_detailed_sections']) + len(t['tcm_view'])
    return max(2, round(n / 450))


# ---------------- shared shell ----------------
ICON = {
    'search': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>',
    'note': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3h10l4 4v14H5z"/><path d="M9 11h6M9 15h6"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    'sprout': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-9"/><path d="M12 12C12 7 8.5 4.5 4 4.5 4 9 7 12 12 12z"/><path d="M12 14c0-4 3-6.5 8-6.5 0 4-3 6.5-8 6.5z"/></svg>',
    'bookmark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
    'share': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
    'print': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z"/></svg>',
    'image': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 9"/></svg>',
}


def shell(title, desc, path, body, active='', head_extra='', og_image='/assets/og-default.jpg', og_type='website'):
    canon = SITE + path
    nav = [('/', '首頁', 'home'), ('/#topics', '文章分類', 'topics'), ('/growth', '成長手帳', 'growth'), ('/notes', '看診手記', 'notes'), ('/doctor', '醫師介紹', 'doctor')]
    topnav = ''.join(f'<a href="{h}"{" class=on" if k == active else ""}>{n}</a>' for h, n, k in nav)
    bn = [('/', '首頁', 'home', 'home'), ('/#topics', '分類', 'grid', 'topics'), ('/growth', '成長手帳', 'sprout', 'growth'), ('/notes', '手記', 'note', 'notes'), ('/doctor', '醫師', 'user', 'doctor')]
    bnav = ''.join(f'<a href="{h}"{" class=on" if k == active else ""}>{ICON[i]}<span>{n}</span></a>' for h, n, i, k in bn)
    return f'''<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="梁雅淳醫師｜婦兒中醫衛教專欄">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{SITE}{og_image}">
<meta property="og:locale" content="zh_TW">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#3A6356">
<link rel="icon" type="image/png" href="/assets/favicon-64.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v={UPDATED}">
{head_extra}
</head>
<body>
<a class="sr" href="#main">跳到主要內容</a>
<header class="topbar"><div class="in">
  <a class="brand" href="/" aria-label="回首頁"><img src="/assets/avatar.webp" width="40" height="40" alt=""><span><b>梁雅淳醫師</b><small>婦兒中醫衛教專欄</small></span></a>
  <nav class="topnav" aria-label="主選單">{topnav}</nav>
  <a class="icon-btn" href="/#search" aria-label="搜尋文章">{ICON['search']}</a>
  <a class="line-btn" href="{LINE_BOT}" target="_blank" rel="noopener">LINE 問小幫手</a>
</div></header>
<main id="main">
{body}
</main>
<footer class="site"><div class="wrap">
  <div class="cols"><a href="/">首頁</a><a href="/#topics">文章分類</a><a href="/growth">雅淳醫師成長手帳</a><a href="/notes">看診手記</a><a href="/doctor">醫師介紹與門診</a><a href="{REG}" target="_blank" rel="noopener">網路掛號</a><a href="{LINE_DR}" target="_blank" rel="noopener">雅淳醫師官方 LINE</a></div>
  <p>本網站內容為一般衛教資訊，不能取代醫師面對面診察。孩子精神活動力明顯變差、呼吸困難、意識改變或持續高燒等情況，請立即就醫。</p>
  <p>© 梁雅淳醫師｜台中慈濟醫院中醫部中醫兒科　內容更新：{UPDATED}</p>
</div></footer>
<nav class="bnav" aria-label="快速選單">{bnav}</nav>
<script src="/assets/site.js?v={UPDATED}" defer></script>
</body>
</html>
'''


def jsonld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False).replace('</', '<\\/') + '</script>'


DR_PERSON = {'@type': 'Physician', 'name': '梁雅淳', 'jobTitle': '中醫兒科主任', 'url': SITE + '/doctor',
             'image': SITE + '/assets/dr-liang.webp', 'worksFor': {'@type': 'Hospital', 'name': '台中慈濟醫院'},
             'medicalSpecialty': 'Pediatric', 'sameAs': ['https://www.facebook.com/dr.lyc/', 'https://www.instagram.com/kids_health_tcm', 'https://www.threads.com/@kids_health_tcm']}

DOCBOX = f'''<aside class="card docbox">
  <img src="/assets/avatar.webp" width="64" height="64" alt="梁雅淳醫師Q版頭像" loading="lazy">
  <div><b>梁雅淳 醫師</b><p>台中慈濟醫院中醫部中醫兒科主任｜藥師＋中醫師雙專業</p>
  <div class="row"><a class="btn pri" href="{REG}" target="_blank" rel="noopener">網路掛號</a><a class="btn" href="/doctor">門診時間</a><a class="btn" href="{LINE_DR}" target="_blank" rel="noopener">官方 LINE</a></div></div>
</aside>'''

# ---------------- article pages ----------------
all_topics = []
for th in themes:
    for t in th['topics']:
        all_topics.append((th, t))

flat_index = []
card_jobs = []
nlm_dir = os.path.join(OUT, 'cards', 'nlm')
os.makedirs(os.path.join(OUT, 'a'), exist_ok=True)
os.makedirs(os.path.join(OUT, 'cards'), exist_ok=True)

for th in themes:
    tops = th['topics']
    for i, t in enumerate(tops):
        tid = t['id']
        path = f'/a/{tid}'
        groups, fparas = parse_flag(t['red_flag'])
        flat_items = [x for _, its in groups for x in its]
        refs, tcm_refs = refs_for(t)
        # card image: NotebookLM override first
        nlm = None
        for ext in ('png', 'jpg', 'jpeg', 'webp'):
            if os.path.exists(os.path.join(nlm_dir, f'{tid}.{ext}')):
                nlm = f'/cards/nlm/{tid}.{ext}'
        card_src = nlm or f'/cards/{tid}.jpg'
        card_jobs.append({'id': tid, 'title': t['title'], 'focus': t['focus'], 'flags': flat_items, 'flag_raw': ' '.join(fparas),
                          'tcm': first_sents(t['tcm_view'], 110), 'sys': th['name'], 'color': th['color']})

        secs = ''.join(f'<section class="sub-sec"><h3>{e(s["heading"])}</h3><div class="prose">{prose(s["body"])}</div></section>' for s in t['custom_detailed_sections'])
        flag_html = ''.join((f'<p>{e(lab)}</p>' if lab else '') + '<ul>' + ''.join(f'<li>{item_html(x)}</li>' for x in its) + '</ul>' for lab, its in groups) + ''.join(f'<p>{e(p)}</p>' for p in fparas)
        ref_html = '<div class="grp">醫學指引與研究</div><ol>' + ''.join(
            f'<li>{e(r["text"])}' + (f' <a href="{e(r["url"])}" target="_blank" rel="noopener">查閱</a>' if r['url'] else '') + '</li>' for r in refs) + '</ol>'
        ref_html += '<div class="grp">中醫觀點出處</div><ol start="%d">' % (len(refs) + 1) + ''.join(f'<li>{e(r["text"])}</li>' for r in tcm_refs) + '</ol>'
        prev_t = tops[i - 1] if i > 0 else None
        next_t = tops[i + 1] if i + 1 < len(tops) else None
        pn = '<nav class="pn" aria-label="上下篇">' + (f'<a href="/a/{prev_t["id"]}"><small>← 上一篇</small>{e(prev_t["title"])}</a>' if prev_t else '<span></span>') + (f'<a class="nx" href="/a/{next_t["id"]}"><small>下一篇 →</small>{e(next_t["title"])}</a>' if next_t else '<span></span>') + '</nav>'
        related = [x for x in tops if x['id'] != tid][max(0, i - 2):max(0, i - 2) + 4]
        rel_html = '<ul class="alist">' + ''.join(f'<li><a class="arow" href="/a/{x["id"]}"><div class="t">{e(x["title"])}</div><div class="s">{e(x["subtitle"])}</div></a></li>' for x in related) + '</ul>'
        checks = checklist_for(t)
        check_html = ''.join(f'<label><input type="checkbox" value="{e(c)}"><span>{e(c)}</span></label>' for c in checks)
        desc = desc_of(t)
        ld = jsonld({'@context': 'https://schema.org', '@graph': [
            {'@type': 'MedicalWebPage', 'headline': t['title'], 'description': desc, 'url': SITE + path, 'inLanguage': 'zh-Hant-TW',
             'image': SITE + card_src, 'datePublished': UPDATED, 'dateModified': UPDATED, 'author': DR_PERSON,
             'publisher': {'@type': 'Organization', 'name': '梁雅淳醫師婦兒中醫衛教專欄', 'logo': SITE + '/assets/apple-touch-icon.png'},
             'about': t['tag'], 'audience': {'@type': 'PeopleAudience', 'audienceType': '家長'},
             'citation': [r['text'] for r in refs]},
            {'@type': 'BreadcrumbList', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': '首頁', 'item': SITE + '/'},
                {'@type': 'ListItem', 'position': 2, 'name': th['name'], 'item': SITE + '/#' + th['id']},
                {'@type': 'ListItem', 'position': 3, 'name': t['title'], 'item': SITE + path}]}]})
        body = f'''<article class="narrow art">
<nav class="crumb" aria-label="導覽路徑"><a href="/">首頁</a>›<a href="/#{th['id']}">{e(th['name'])}</a>›<span>{tid}</span></nav>
<h1>{e(t['title'])}</h1>
<p class="sub">{e(t['subtitle'])}</p>
<div class="meta"><span class="chip">{e(th['name'])}</span><span class="chip gray">適用 {e(t['age'])}</span><span class="chip gray">約 {read_min(t)} 分鐘</span></div>
<div class="actions">
  <button class="btn" type="button" data-save="{tid}">{ICON['bookmark']}<span>收藏</span></button>
  <button class="btn" type="button" data-share="{SITE}{path}">{ICON['share']}<span>分享</span></button>
  <a class="btn" href="#card">{ICON['image']}<span>衛教圖卡</span></a>
  <button class="btn" type="button" data-print>{ICON['print']}<span>列印</span></button>
</div>
<p class="focus"><small>醫師叮嚀</small>{e(t['focus'])}</p>
<nav class="toc" aria-label="本文段落"><a href="#quick">重點速讀</a><a href="#detail">詳細衛教</a><a href="#tcm">中醫觀點</a><a href="#flag">何時就醫</a><a href="#card">衛教圖卡</a><a href="#refs">參考資料</a></nav>
<section class="block" id="quick"><h2><span class="tag">3 分鐘</span>重點速讀</h2><div class="prose">{prose(t['ext_reading_500'])}</div></section>
<section class="block" id="detail"><h2><span class="tag">深入</span>詳細衛教</h2>{secs}</section>
<section class="block" id="tcm"><h2><span class="tag">中醫</span>中醫怎麼看</h2><div class="tcm"><dl><dt>相關臟腑</dt><dd>{e(t['tcm_organ'])}</dd><dt>常見證型</dt><dd>{e(t['pattern'])}</dd></dl><div class="prose">{prose(t['tcm_view'])}</div></div></section>
<section class="block" id="flag"><div class="flag"><h2>何時應該就醫評估？</h2>{flag_html}<p class="er">若出現呼吸困難、意識不清、抽搐不止、持續高燒或精神活動力明顯變差，請直接就醫或撥打 119。</p></div></section>
<section class="block infocard" id="card"><h2><span class="tag">可存圖</span>衛教圖卡</h2>
  <img src="{card_src}" width="1080" height="1350" alt="{e(t['title'])}衛教圖卡" loading="lazy">
  <div class="row"><a class="btn pri" href="{card_src}" download="{tid}-{e(t['title'][:16])}.jpg">{ICON['image']}<span>下載圖卡</span></a><a class="btn" href="https://social-plugins.line.me/lineit/share?url={SITE}{path}" target="_blank" rel="noopener">分享到 LINE</a></div>
</section>
<section class="block noprint"><h2><span class="tag">看診用</span>看診前 30 秒小抄</h2>
  <div class="checklist" id="visit-note" data-title="{e(t['title'])}">{check_html}
    <textarea placeholder="其他想補充的觀察（例如：體溫紀錄、照片、症狀變化）" aria-label="補充觀察"></textarea>
    <textarea id="visit-out" readonly aria-label="小抄預覽" rows="6"></textarea>
    <button class="btn pri" type="button" data-copy="visit-out" data-msg="已複製，可貼到手機備忘錄">複製看診小抄</button>
  </div>
</section>
<section class="block refs" id="refs"><h2><span class="tag">可信度</span>參考資料</h2>{ref_html}
  <p class="note">本文依據上列國際指引、系統性回顧與中醫典籍整理，並以台灣臨床情境改寫為家長易讀的衛教內容；文中提及的個別研究可依關鍵字於 PubMed 查詢。最後更新：{UPDATED}。衛教內容不能取代個別診療，用藥（含中藥）請先與醫師、藥師討論。</p>
</section>
{DOCBOX}
{pn}
<h2 style="font-size:19px;margin:8px 0 12px">同系列延伸閱讀</h2>
{rel_html}
</article>'''
        page = shell(f'{t["title"]}｜梁雅淳醫師婦兒中醫衛教', desc, path, body, active='topics', head_extra=ld, og_image=card_src, og_type='article')
        open(os.path.join(OUT, 'a', f'{tid}.html'), 'w', encoding='utf-8').write(page)
        flat_index.append({'id': tid, 'title': t['title'], 'subtitle': t['subtitle'], 'age': t['age'], 'tag': t['tag'], 'kw': t['pattern'] + ' ' + t['tcm_organ']})

json.dump(card_jobs, open(os.path.join(HERE, 'card_jobs.json'), 'w'), ensure_ascii=False)

# ---------------- home ----------------
th_index = [{'id': th['id'], 'name': th['name']} for th in themes]
first = th_index[0]['id']
sys_btns = ''.join(f'<button class="sys" type="button" data-sys="{th["id"]}" aria-pressed="false"><span class="ic {SYS_COLOR.get(th["color"], "c-emerald")}">{e(th["name"][0])}</span><span><b>{e(th["name"])}</b><small>{len(th["topics"])} 篇<i>・{e(th["subtitle"])}</i></small></span></button>' for th in themes)
# no-JS fallback list (also good for crawlers)
noscript = ''.join(f'<h3>{e(th["name"])}</h3><ul>' + ''.join(f'<li><a href="/a/{t["id"]}">{e(t["title"])}</a></li>' for t in th['topics']) + '</ul>' for th in themes)
idx_json = json.dumps({'themes': th_index, 'topics': flat_index}, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
total = len(flat_index)
home_ld = jsonld({'@context': 'https://schema.org', '@type': 'WebSite', 'name': '梁雅淳醫師｜婦兒中醫衛教專欄', 'url': SITE + '/',
                  'potentialAction': {'@type': 'SearchAction', 'target': SITE + '/?q={search_term_string}', 'query-input': 'required name=search_term_string'}})
home_body = f'''<div class="wrap">
<section class="hero">
  <p class="eyebrow">婦兒中醫衛教專欄・{total} 篇</p>
  <h1>孩子不舒服的時候，<br>先在這裡找到方向</h1>
  <p class="lead">整理國際兒科指引與研究重點，加上中醫兒科的臨床觀點：今晚在家能做什麼、什麼情況要就醫，一篇看懂。</p>
  <div class="search" id="search"><label class="sr" for="q">搜尋衛教文章</label>{ICON['search']}<input id="q" type="search" placeholder="輸入症狀，例如：鼻塞、便秘、長高" autocomplete="off" enterkeyhint="search"></div>
  <div class="quick" aria-label="熱門搜尋"><button type="button">鼻過敏</button><button type="button">咳嗽</button><button type="button">發燒</button><button type="button">便秘</button><button type="button">長高</button><button type="button">睡眠</button><button type="button">ADHD</button><button type="button">產後</button></div>
  <a class="card doc-mini" href="/doctor" style="color:inherit;text-decoration:none"><img src="/assets/avatar.webp" width="56" height="56" alt=""><div><b>梁雅淳 醫師</b><p>台中慈濟醫院中醫兒科主任｜過敏免疫・兒童生長・脊椎側彎</p></div><span class="btn go">醫師介紹</span></a>
  <a class="card bp-promo" href="/growth"><span class="ic">🌱</span><div><b>雅淳醫師成長手帳（免費試用）</b><p>依孩子年齡看發展觀察重點、記錄生活與身高體重，回診前一鍵整理摘要。</p></div></a>
</section>
<section id="saved" hidden><div class="sec-title"><h2>我的收藏</h2></div><ul class="alist" id="saved-list"></ul></section>
<section id="topics"><div class="sec-title"><h2>依身體系統瀏覽</h2></div><div class="systems">{sys_btns}</div></section>
<section><div class="listhead" id="listhead"><h2 id="listhead-title">文章</h2><span class="count" id="listhead-count"></span></div>
<ul class="alist" id="alist"><li class="empty">載入中…</li></ul>
<noscript>{noscript}</noscript></section>
<section><div class="sec-title"><h2>看診手記</h2><a href="/notes">看全部 50 篇 →</a></div>
<a class="card arow" href="/notes"><div class="t">{e(notes[0]['title'])}</div><div class="s">{e(notes[0]['insight'][:80])}…</div></a></section>
</div>
<script type="application/json" id="topic-index">{idx_json}</script>'''
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(
    shell('梁雅淳醫師｜婦兒中醫衛教專欄－兒童過敏、生長、腸胃、睡眠居家照護', f'台中慈濟醫院中醫兒科主任梁雅淳醫師的衛教專欄：{total} 篇兒童與婦女常見問題，整合國際指引與中醫觀點，告訴家長在家怎麼做、何時該就醫。', '/', home_body, active='home', head_extra=home_ld))

# ---------------- notes ----------------
cats = []
for n in notes:
    if n['category'] not in cats:
        cats.append(n['category'])
pills = '<button class="on" type="button" data-cat="ALL">全部（50）</button>' + ''.join(f'<button type="button" data-cat="{e(c)}">{e(c)}</button>' for c in cats)
nlist = ''.join(f'''<article class="card nt" data-cat="{e(n['category'])}" id="{n['id']}"><span class="chip">{e(n['category'])}</span><h3>{e(n['title'])}</h3>
<div class="lab">診間場景</div><p>{e(n['scene'])}</p><div class="lab">醫師觀察</div><p>{e(n['insight'])}</p><p class="take"><b>帶回家的一句話：</b>{e(n['takeaway'])}</p></article>''' for n in notes)
notes_body = f'''<div class="narrow"><section class="hero"><p class="eyebrow">看診手記・50 篇</p><h1>診間裡常被問的那些事</h1><p class="lead">從真實看診情境整理出來的觀察筆記，一則一個重點。</p></section>
<div class="pills" id="note-pills" role="toolbar" aria-label="分類">{pills}</div><div class="notes">{nlist}</div></div>'''
open(os.path.join(OUT, 'notes.html'), 'w', encoding='utf-8').write(shell('看診手記 50 篇｜梁雅淳醫師婦兒中醫衛教', '梁雅淳醫師整理的 50 則看診手記：發燒、咳嗽、鼻塞、睡眠、情緒與生長的診間觀察與居家重點。', '/notes', notes_body, active='notes'))

# ---------------- doctor ----------------
VIDS = [
    ('HMJ6ulbYtbs', '破解兒童反覆呼吸道感染', '2025-04-01'),
    ('zhMQwtoxikE', '這樣做，孩子睡得香！提升睡眠的3大祕訣', '2025-03-31'),
    ('Qe2YuupYWQY', '中醫幫忙 腸胃變好：改善腸躁症，讓孩子遠離腹痛', '2025-04-02'),
    ('OTKrGFEjEmM', '孩子扭傷？中醫來復位！運動傷害與骨架調整', '2025-04-03'),
    ('cxf7QtYx6kY', '孩子發育慢？中醫幫助成長', '2025-04-04'),
    ('C-MoLmt4qnk', '3階段婦科煩惱全解：熱潮紅、失眠、頻尿調理', '2025-10-20'),
    ('SVluHvjits8', '3招解決乾澀頻尿：更年期保養', '2025-10-21'),
    ('YURfAL60zZI', '5招養好子宮：姿勢不正，子宮肌瘤找上門', '2025-10-22'),
    ('PHCD9TNoECw', '坐姿正確就能變健康：改善自律神經失調、經痛失眠', '2025-10-23'),
]
NEWS = [
    ('長假後常見開學症候群 中醫對症四方協助克服', 'https://taichung.tzuchi.com.tw/index.php/xun-xi-zhuan-qu/xin-wen-bao-dao/geng-duo-xin-wen-bao-dao/geng-duo-xin-wen-bao-dao-70/2025-02-02', '台中慈濟醫院新聞稿'),
    ('中醫傷科結合西醫復健 臺中慈濟醫院推展運動醫學', 'https://taichung.tzuchi.com.tw/index.php/xun-xi-zhuan-qu/xin-wen-bao-dao/geng-duo-xin-wen-bao-dao/geng-duo-xin-wen-bao-dao-70/2023-06-05-08-18-18', '台中慈濟醫院新聞稿'),
    ('社區推廣中醫八段錦 改善長輩常見症狀', 'https://taichung.tzuchi.com.tw/index.php/xun-xi-zhuan-qu/xin-wen-bao-dao/geng-duo-xin-wen-bao-dao/geng-duo-xin-wen-bao-dao-70/she-qu-tui-guang-zhong-yi-ba-duan-jin-gai-shan-zhang-bei-chang-jian-zheng-zhuang', '台中慈濟醫院新聞稿'),
]
vid_html = ''.join(f'<a class="vid" href="https://www.youtube.com/watch?v={v}" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/{v}/hqdefault.jpg" alt="" loading="lazy" width="480" height="270"><div>{e(t)}<small>大愛學漢醫・{d}</small></div></a>' for v, t, d in VIDS)
news_html = ''.join(f'<a class="lk" href="{u}" target="_blank" rel="noopener"><span class="ic" style="background:#8a6d3b">新聞</span><span><b>{e(t)}</b><small>{s}</small></span></a>' for t, u, s in NEWS)
H = {('一', '早'): ('228診', '第一院區'), ('三', '早'): ('178診', '第二院區'), ('六', '早'): ('178診', '第二院區'),
     ('四', '午'): ('228診', '第一院區'), ('二', '晚'): ('178診', '第二院區'), ('五', '晚'): ('178診', '第二院區')}
rows = ''
for sl, lab in (('早', '上午<br><small>9:00–12:00</small>'), ('午', '下午<br><small>13:30–17:00</small>'), ('晚', '夜間<br><small>17:00–21:00</small>')):
    rows += f'<tr><th>{lab}</th>' + ''.join((f'<td class="on">{H[(d, sl)][1]}<small>{H[(d, sl)][0]}</small></td>' if (d, sl) in H else '<td></td>') for d in '一二三四五六') + '</tr>'
dr_ld = jsonld({'@context': 'https://schema.org', **DR_PERSON, 'description': '台中慈濟醫院中醫部中醫兒科主任，藥師與中醫師雙專業，專長過敏免疫調節、小兒脊椎側彎與骨架調整、性早熟與青春期成長調養。'})
dr_body = f'''<div class="wrap">
<section class="dr-hero">
  <div class="dr-photo"><img src="/assets/dr-liang.webp" width="400" height="654" alt="梁雅淳醫師"><img class="q" src="/assets/avatar.webp" width="72" height="72" alt="梁雅淳醫師Q版頭像"></div>
  <div>
    <p class="eyebrow">醫師介紹</p>
    <h1>梁雅淳 醫師</h1>
    <p class="title">台中慈濟醫院 中醫部 中醫兒科主任／主治醫師</p>
    <p class="prose" style="margin:0">藥師與中醫師雙專業，擅長中西醫整合治療、婦兒結構治療與內科調理。看診時重視把「為什麼會這樣」說清楚，讓家長回家知道怎麼照顧、什麼時候要回診。</p>
    <div class="tags"><span class="chip">過敏及免疫調節</span><span class="chip">小兒脊椎側彎・骨架調整</span><span class="chip">小兒運動傷害</span><span class="chip">性早熟</span><span class="chip">青春期成長調養・體重管理</span><span class="chip">兒童青少年皮膚調理</span><span class="chip">睡眠障礙</span><span class="chip">頭暈頭痛</span></div>
    <div class="actions"><a class="btn pri" href="{REG}" target="_blank" rel="noopener">網路掛號（醫師代碼 30226）</a><a class="btn" href="{LINE_DR}" target="_blank" rel="noopener">加入官方 LINE</a></div>
  </div>
</section>
<div class="grid2">
  <section class="card panel"><h2>學歷</h2><ul><li>中國醫藥大學 藥學系</li><li>義守大學 學士後中醫學系 醫學士</li><li>國防醫學院 藥學研究所 臨床藥學組 碩士</li></ul>
  <h2 style="margin-top:16px">經歷</h2><ul><li>台中慈濟醫院 中醫部 實習醫師、住院醫師</li><li>現任 台中慈濟醫院 中醫部 中醫兒科主任／主治醫師</li></ul>
  <h2 style="margin-top:16px">學會</h2><ul><li>台灣中醫兒童暨青少年科醫學會</li><li>中醫兒科醫學會</li><li>台灣中醫皮膚科醫學會</li></ul></section>
  <section class="card panel"><h2>門診時間</h2>
  <div style="overflow-x:auto"><table class="hours"><thead><tr><th></th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody>{rows}</tbody></table></div>
  <p class="note">台中慈濟醫院（台中市潭子區豐興路一段 66 號）。門診時間可能因休診、代診或院區調整而異動，請以<a href="{REG}" target="_blank" rel="noopener">醫院網路掛號系統</a>公告為準。</p></section>
</div>
<div class="sec-title"><h2>追蹤雅淳醫師</h2></div>
<div class="links">
  <a class="lk" href="https://www.facebook.com/dr.lyc/" target="_blank" rel="noopener"><span class="ic" style="background:#1877F2">FB</span><span><b>中醫善淳－梁雅淳醫師</b><small>Facebook 粉絲專頁</small></span></a>
  <a class="lk" href="https://www.threads.com/@kids_health_tcm" target="_blank" rel="noopener"><span class="ic" style="background:#111">@</span><span><b>@kids_health_tcm</b><small>Threads・每天的育兒共感短文</small></span></a>
  <a class="lk" href="https://www.instagram.com/kids_health_tcm" target="_blank" rel="noopener"><span class="ic" style="background:linear-gradient(45deg,#f09433,#dc2743,#bc1888)">IG</span><span><b>kids_health_tcm</b><small>Instagram</small></span></a>
  <a class="lk" href="{LINE_DR}" target="_blank" rel="noopener"><span class="ic" style="background:#06C755">LINE</span><span><b>雅淳醫師官方 LINE</b><small>掛號連結、最新文章與門診公告</small></span></a>
  <a class="lk" href="{LINE_BOT}" target="_blank" rel="noopener"><span class="ic" style="background:#06C755">AI</span><span><b>LINE 衛教小幫手</b><small>查詢本專欄衛教內容</small></span></a>
  <a class="lk" href="https://taichung.tzuchi.com.tw/index.php/dan-wei-jie-shao/2023-08-01-07-33-11/liang-ya-chun-yi-shi" target="_blank" rel="noopener"><span class="ic" style="background:#3A6356">院</span><span><b>台中慈濟醫院・醫師介紹頁</b><small>醫院官網</small></span></a>
</div>
<div class="sec-title"><h2>大愛電視《大愛學漢醫》節目</h2><a href="https://www.youtube.com/results?search_query=%E6%A2%81%E9%9B%85%E6%B7%B3+%E5%A4%A7%E6%84%9B%E5%AD%B8%E6%BC%A2%E9%86%AB" target="_blank" rel="noopener">在 YouTube 看更多 →</a></div>
<div class="vids">{vid_html}</div>
<div class="sec-title"><h2>新聞報導</h2></div>
<div class="links">{news_html}</div>
</div>'''
open(os.path.join(OUT, 'doctor.html'), 'w', encoding='utf-8').write(shell('梁雅淳醫師介紹・門診時間｜台中慈濟醫院中醫兒科', '梁雅淳醫師，台中慈濟醫院中醫兒科主任，藥師與中醫師雙專業。專長過敏免疫調節、小兒脊椎側彎、性早熟與青春期成長調養。門診時間、掛號、大愛學漢醫節目與新聞報導。', '/doctor', dr_body, active='doctor', head_extra=dr_ld, og_image='/assets/dr-liang.webp', og_type='profile'))

# ---------------- growth tool ----------------
art_titles = {x['id']: x['title'] for x in flat_index}
gr_body = f'''<div class="wrap">
<section class="hero" style="padding-bottom:4px"><p class="eyebrow">免費試用版・資料只存在你的裝置</p><h1>雅淳醫師成長手帳</h1>
<p class="lead">梁雅淳醫師為家長設計的成長觀察工具：依孩子年齡看「觀察什麼、在家怎麼陪」，記下生活與身高體重，回診前一鍵整理成摘要。不是測驗，也不是診斷。</p></section>
<div id="bp-app"><noscript><p class="empty">這個工具需要開啟 JavaScript。</p></noscript></div>
</div>
<script type="application/json" id="bp-articles">{json.dumps(art_titles, ensure_ascii=False)}</script>
<script src="/assets/blueprint.js?v={UPDATED}" defer></script>'''
open(os.path.join(OUT, 'growth.html'), 'w', encoding='utf-8').write(shell('雅淳醫師成長手帳｜梁雅淳醫師的兒童成長觀察工具', '依孩子年齡整理發展觀察重點與在家互動點子，記錄生活、身高體重與青春期變化，回診前一鍵整理摘要。免費試用，資料只存在你的裝置。', '/growth', gr_body, active='growth'))

# ---------------- 404, sitemap, robots ----------------
open(os.path.join(OUT, '404.html'), 'w', encoding='utf-8').write(shell('找不到頁面｜梁雅淳醫師婦兒中醫衛教', '找不到這個頁面。', '/404', '<div class="narrow"><section class="hero"><h1>找不到這個頁面</h1><p class="lead">網址可能已更新。可以回首頁用搜尋找文章。</p><a class="btn pri" href="/">回首頁</a></section></div>'))
urls = [('/', '1.0'), ('/doctor', '0.8'), ('/growth', '0.8'), ('/notes', '0.7')] + [(f'/a/{x["id"]}', '0.6') for x in flat_index]
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'<url><loc>{SITE}{u}</loc><lastmod>{UPDATED}</lastmod><priority>{p}</priority></url>\n' for u, p in urls) + '</urlset>\n')
open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
print('pages', len(flat_index), 'notes', len(notes))
