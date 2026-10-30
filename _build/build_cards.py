"""用 Playwright 把每篇文章的重點輸出成 1080x1350 衛教圖卡（JPEG）。
有 NotebookLM 圖卡（cards/nlm/<id>.png|jpg）的文章會跳過。"""
import json, os, html, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'cards')
jobs = json.load(open(os.path.join(HERE, 'card_jobs.json')))
only = set(sys.argv[1:])
COL = {'teal': '#3F7F7A', 'amber': '#B8862F', 'rose': '#B85F6E', 'indigo': '#5B5F9E', 'emerald': '#3A6356', 'purple': '#7E5C93'}
e = lambda s: html.escape(str(s))
import base64, re
AV = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(ROOT, 'assets', 'avatar.webp'),'rb').read()).decode()

def it(x):
    m = re.match(r'^(\S{2,22}?)\s+(\S.*)$', x)
    if m and re.search(r'[\u4e00-\u9fff]$', m.group(1)) and re.match(r'[\u4e00-\u9fff（]', m.group(2)):
        return f'<b>{e(m.group(1))}</b>　{e(m.group(2))}'
    return e(x)


CSS = '''
*{box-sizing:border-box;margin:0;padding:0}
body{width:540px;height:675px;font-family:"Noto Sans CJK TC",sans-serif;background:#F7F4EE;color:#232926;overflow:hidden}
.c{position:relative;width:540px;height:675px;padding:26px 30px 0;display:flex;flex-direction:column}
.c>*{flex-shrink:0}
.top{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:#6E7671;margin-bottom:12px}
.sys{color:#fff;padding:3px 11px;border-radius:999px;font-weight:700;font-size:12.5px}
h1{font-family:"Noto Serif CJK TC",serif;font-weight:900;font-size:29px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px}
.focus{background:#fff;border-left:5px solid var(--c);border-radius:0 12px 12px 0;padding:10px 14px;font-family:"Noto Serif CJK TC",serif;font-weight:600;font-size:15.5px;line-height:1.6;color:#2B4C41;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:12px}
.lab{font-size:13px;font-weight:700;letter-spacing:.08em;margin:2px 0 6px;display:flex;align-items:center;gap:6px}
.flag{background:#FDF6F3;border:1px solid #F2DCD4;border-radius:12px;padding:10px 14px 8px;margin-bottom:12px;flex:0 0 auto;overflow:hidden}
.flag .lab{color:#8C3F27}
.flag li{list-style:none;position:relative;padding-left:20px;font-size:14px;line-height:1.5;color:#5f3122;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.flag li:before{content:"!";position:absolute;left:0;top:2px;width:14px;height:14px;border-radius:50%;background:#C86D51;color:#fff;font-size:10px;font-weight:700;text-align:center;line-height:14px}
.flag p{font-size:14px;line-height:1.6;color:#5f3122;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}
.tcm{background:#EEF3F0;border-radius:12px;padding:10px 14px;margin-bottom:10px}
.tcm .lab{color:#2B4C41}
.tcm p{font-size:14px;line-height:1.6;color:#2B4C41;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.foot{margin-top:auto;display:flex;align-items:center;gap:10px;border-top:1px solid #E8E3DA;padding:12px 0 16px}
.foot img{width:42px;height:42px;border-radius:50%;background:#f3e6e6}
.foot b{font-family:"Noto Serif CJK TC",serif;font-size:15px}
.foot small{display:block;font-size:11.5px;color:#6E7671}
.foot .url{margin-left:auto;text-align:right;font-size:11.5px;color:#3A6356;font-weight:700;line-height:1.4}
'''


def card(j):
    c = COL.get(j['color'], '#3A6356')
    if j['flags']:
        fl = '<ul>' + ''.join(f'<li>{it(x)}</li>' for x in j['flags'][:6]) + '</ul>'
    else:
        fl = f'<p>{e(j["flag_raw"])}</p>'
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="c" style="--c:{c}">
<div class="top"><span class="sys" style="background:{c}">{e(j['sys'])}</span><span>婦兒中醫衛教圖卡・{j['id']}</span></div>
<h1>{e(j['title'])}</h1>
<div class="focus">{e(j['focus'])}</div>
<div class="flag"><div class="lab">這些情況請就醫評估</div>{fl}</div>
<div class="tcm"><div class="lab">中醫小叮嚀</div><p>{e(j['tcm'])}</p></div>
<div class="foot"><img src="{AV}"><div><b>梁雅淳 醫師</b><small>台中慈濟醫院 中醫兒科</small></div><div class="url">完整文章<br>liang.ialdsm.com/a/{j['id']}</div></div>
</div></body></html>'''


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 540, 'height': 675}, device_scale_factor=2)
    n = 0
    for j in jobs:
        if only and j['id'] not in only:
            continue
        if any(os.path.exists(f'{OUT}/nlm/{j["id"]}.{x}') for x in ('png', 'jpg', 'jpeg', 'webp')):
            continue
        pg.set_content(card(j), wait_until='load')
        pg.evaluate('''() => { const f=document.querySelector('.flag'); const lis=[...f.querySelectorAll('li')];
          const c=document.querySelector('.c'); const fits=()=>document.querySelector('.foot').getBoundingClientRect().bottom<=676 && c.scrollHeight<=676; while (lis.length>2 && !fits()) { lis.pop().remove(); } }''')
        pg.screenshot(path=f'{OUT}/{j["id"]}.jpg', type='jpeg', quality=86)
        n += 1
    # default OG image
    pg.set_content(f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS} .og{{width:540px;height:675px}}</style></head><body><div class="c" style="--c:#3A6356;justify-content:center;align-items:center;text-align:center">
<img src="{AV}" style="width:120px;height:120px;border-radius:50%;margin-bottom:18px">
<h1 style="font-size:32px">梁雅淳醫師<br>婦兒中醫衛教專欄</h1><p style="font-size:16px;color:#3D4641;line-height:1.7">兒童過敏・腸胃・睡眠・生長<br>國際指引 × 中醫兒科觀點</p>
<p style="margin-top:18px;color:#3A6356;font-weight:700">liang.ialdsm.com</p></div></body></html>''', wait_until='load')
    pg.screenshot(path=os.path.join(ROOT, 'assets', 'og-default.jpg'), type='jpeg', quality=86)
    b.close()
print('cards', n)
