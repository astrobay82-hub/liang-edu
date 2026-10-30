# 六大系統的可愛插圖（內嵌 SVG，免外部圖片，手機上也清晰）
FACE = '<circle cx="{x1}" cy="{y}" r="2.2" fill="#3b2f2a"/><circle cx="{x2}" cy="{y}" r="2.2" fill="#3b2f2a"/><path d="M{m1} {my}q{q} 3.2 {w} 0" stroke="#3b2f2a" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="{c1}" cy="{cy}" r="2.6" fill="#ff9aa2" opacity=".75"/><circle cx="{c2}" cy="{cy}" r="2.6" fill="#ff9aa2" opacity=".75"/>'


def face(cx, cy, gap=8):
    return FACE.format(x1=cx - gap, x2=cx + gap, y=cy, m1=cx - 3.2, my=cy + 4, q=3.2, w=6.4, c1=cx - gap - 3.5, c2=cx + gap + 3.5, cy=cy + 4.5)


ICONS = {
    # 呼吸道與五官：小鼻子雲朵＋呼吸氣流
    'S01': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 40c-6 0-9-5-7-10 1-4 5-6 9-5 1-7 7-11 14-10 5 1 9 4 10 9 6-1 11 3 11 9s-5 8-10 8z" fill="#e8f6f4" stroke="#3F7F7A" stroke-width="2.4" stroke-linejoin="round"/>'
           + face(30, 30, 9) + '<path d="M30 33.5q1.5 1.5 0 3" stroke="#3b2f2a" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
           + '<path d="M47 46c4 0 7 2 7 5M42 50c3 0 5 2 5 4M52 40c3 1 5 3 5 6" stroke="#7cc4bd" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
    # 腸胃與泌尿：微笑的胃寶寶
    'S02': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M40 6l14 18M48 4l10 20" stroke="#B8862F" stroke-width="2.6" stroke-linecap="round"/><path d="M11 30c2-8 10-10 14-6 3-6 11-6 14 0 4-4 12-2 14 6z" fill="#fffdf6" stroke="#B8862F" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 30h48c0 14-10 24-24 24S8 44 8 30z" fill="#fff0d2" stroke="#B8862F" stroke-width="2.6" stroke-linejoin="round"/><path d="M24 58h16" stroke="#B8862F" stroke-width="2.6" stroke-linecap="round"/>'
           + face(32, 39, 8) + '</svg>',
    # 皮膚與外傷：笑臉 OK 繃
    'S03': '<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-30 32 32)"><rect x="6" y="21" width="52" height="22" rx="11" fill="#ffe1e6" stroke="#B85F6E" stroke-width="2.4"/><rect x="22" y="21" width="20" height="22" fill="#ffc6cf" stroke="#B85F6E" stroke-width="2.4"/>'
           + '<circle cx="12" cy="29" r="1.2" fill="#B85F6E"/><circle cx="15" cy="35" r="1.2" fill="#B85F6E"/><circle cx="49" cy="29" r="1.2" fill="#B85F6E"/><circle cx="52" cy="35" r="1.2" fill="#B85F6E"/></g>'
           + face(32, 30, 5) + '</svg>',
    # 神經與大腦：睡帽小腦袋＋星星
    'S04': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M16 44c-6-1-9-7-7-12-3-5 1-12 7-12 1-6 8-9 13-6 4-4 11-3 14 1 6-1 11 4 10 10 5 3 5 11-1 14-1 5-6 8-11 6-3 3-8 4-12 1-5 3-11 2-13-2z" fill="#eceefd" stroke="#5B5F9E" stroke-width="2.4" stroke-linejoin="round"/>'
           + '<path d="M28 20q4 4 0 8M38 18q-3 5 1 9" stroke="#a9acdc" stroke-width="2" fill="none" stroke-linecap="round"/>'
           + face(32, 36, 8) + '<path d="M53 8l1.6 3.4 3.6.5-2.6 2.5.7 3.6-3.3-1.8-3.3 1.8.7-3.6-2.6-2.5 3.6-.5z" fill="#f6c453"/></svg>',
    # 生長與結構：長高的小芽＋身高尺
    'S05': '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="47" y="6" width="10" height="52" rx="3" fill="#eef3f0" stroke="#3A6356" stroke-width="2.2"/><path d="M47 14h5M47 22h3M47 30h5M47 38h3M47 46h5" stroke="#3A6356" stroke-width="2" stroke-linecap="round"/>'
           + '<path d="M25 42V22" stroke="#3A6356" stroke-width="3" stroke-linecap="round"/><path d="M25 26c-2-9-10-13-18-11 0 8 8 13 18 11z" fill="#bfe3c9" stroke="#3A6356" stroke-width="2.2" stroke-linejoin="round"/><path d="M25 21c1-9 9-14 17-13-1 8-8 14-17 13z" fill="#d6efdc" stroke="#3A6356" stroke-width="2.2" stroke-linejoin="round"/>'
           + '<path d="M11 41h28l-3.5 17h-21z" fill="#f6dcc4" stroke="#3A6356" stroke-width="2.4" stroke-linejoin="round"/>' + face(25, 47, 5) + '</svg>',
    # 自理與生活能力：微笑小書包
    'S06': '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M24 14v-3a8 8 0 0 1 16 0v3" fill="none" stroke="#7E5C93" stroke-width="2.6"/><rect x="12" y="14" width="40" height="44" rx="12" fill="#f3e9f8" stroke="#7E5C93" stroke-width="2.6"/><path d="M12 30h40" stroke="#7E5C93" stroke-width="2.2"/>'
           + '<rect x="22" y="40" width="20" height="13" rx="5" fill="#e3cdee" stroke="#7E5C93" stroke-width="2"/>' + face(32, 23, 7) + '</svg>',
}
