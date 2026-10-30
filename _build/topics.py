# 主題標籤：每篇文章依標題／標籤自動歸入 1–3 個主題，產生 /t/<slug> 主題頁與門診用 QR 卡
import re

TOPICS = [
    ('nasal-allergy', '鼻過敏', r'鼻過敏|過敏性鼻炎|鼻塞|鼻涕|洗鼻|黑眼圈|過敏體質|除濕|清淨機|三伏|三九|換季', '鼻塞、流鼻水、打噴嚏反覆發作？從環境、洗鼻到體質調理一次看懂。'),
    ('cough-asthma', '咳嗽與氣喘', r'咳|喘|哮吼|痰', '夜咳、久咳、咳到喘，先分辨是哪一種咳，再決定怎麼照顧、何時就醫。'),
    ('cold-fever', '感冒與發燒', r'感冒|發燒|燒退|抵抗力|幼兒園|熱痙攣', '孩子發燒、反覆感冒時，在家怎麼觀察、怎麼照顧，什麼情況要立刻就醫。'),
    ('ent', '耳鼻喉與口腔', r'耳朵|中耳|扁桃腺|嘴巴痛|鼻血|喉嚨|磨牙|牙', '耳朵痛、喉嚨痛、流鼻血、牙齒與口腔問題的居家照護重點。'),
    ('snoring', '打呼與張口呼吸', r'打呼|張口|張嘴|腺樣體|呼吸中止', '打呼不等於睡得熟：長期打呼與張口呼吸可能影響睡眠、專注與生長。'),
    ('eyes', '視力保健', r'揉眼|視力|近視|看書', '學齡孩子的用眼習慣、戶外活動與視力保健。'),
    ('constipation', '便秘', r'便秘|大便|軟便|纖維|益生菌', '大便硬、排便痛、不敢大？從飲食、如廁習慣到何時就醫。'),
    ('vomit-diarrhea', '嘔吐與腹瀉', r'吐|拉肚子|腹瀉|乳糖|牛奶就拉|尿布或馬桶', '孩子嘔吐、拉肚子時怎麼補水、怎麼吃，脫水警訊要注意什麼。'),
    ('appetite', '胃口與挑食', r'胃口|挑食|餵飯|吃兩口|含在嘴|瘦巴巴|飢餓|酸臭|捏脊|摩腹|肚子痛|腸絞痛|哭鬧兩小時', '胃口差、挑食、吃飯含著不吞？先找原因，再重建用餐節奏。'),
    ('reflux', '胃食道逆流', r'逆流|清喉嚨|喉嚨卡卡', '溢奶、喉嚨卡卡、一直清喉嚨，可能和逆流有關。'),
    ('bedwetting', '尿床與泌尿', r'尿床|夜尿|警報器|尿痛|分泌物|漏尿', '幾歲還尿床要注意？警報器、生活調整與泌尿道問題。'),
    ('skin', '濕疹與皮膚', r'濕疹|異位性|抓|癢|疹|皮屑|痘|唇|水泡|汗疹|藥膏|藥浴|紫雲膏|黃連|蚊子', '濕疹、蕁麻疹、汗疹、蚊蟲叮咬與外用藥膏的安全使用。'),
    ('wounds', '外傷與燙傷', r'跌倒|破皮|燙|傷口|肉刺|甲溝|疤|蟹足腫', '擦傷、燙傷、傷口感染與疤痕照護。'),
    ('sleep', '睡眠', r'睡|夜驚|晚睡|叫不醒|盜汗|滿頭大汗|生理時鐘|手機', '不肯睡、半夜醒、睡不飽：從作息、睡前習慣到睡眠障礙。'),
    ('emotion', '情緒與脾氣', r'情緒|脾氣|崩潰|爆炸|冷靜|失控|一輸|高敏感|吼|拒學|退化', '情緒爆炸、輸不起、高敏感：先安撫再教的陪伴方法。'),
    ('attention', '專注力與ADHD', r'ADHD|專注|不專心|拖延|粗心|忘記帶|時間感|獎勵|自閉', '分心、拖延、忘東忘西很常見；了解專注力的發展，以及何時需要評估。'),
    ('development', '發展與感覺統合', r'感統|感覺|說話|笨拙|發展|職能|刷牙|洗頭|抽動|眨眼|雷射|頭皮針|手痠|握筆', '說話慢、動作笨拙、感覺敏感、抽動：發展觀察與早期評估。'),
    ('headache', '頭痛頭暈', r'頭痛|頭暈|烏龜頸', '孩子常喊頭痛頭暈的常見原因與紅旗警訊。'),
    ('growth', '長高與生長', r'長高|身高|生長|骨齡|轉骨|跳繩|營養|維生素D|遺傳|發育慢', '孩子會不會長高？生長曲線、骨齡、睡眠營養與轉骨調理。'),
    ('puberty', '性早熟與青春期', r'性早熟|提早發育|胸部|抑制針|豆漿|牛奶會造成|肥胖|初經|青春期', '性早熟的警訊、骨齡超前與青春期的身心變化。'),
    ('bones', '骨骼姿勢與運動傷害', r'脊椎|側彎|肩膀|領口|坐正|斜頸|O型|X型|W坐|踮腳|扁平足|腳累|扭傷|膝蓋|腳後跟|牽牛手|拉單槓|腿痛|生長痛|疼痛', '脊椎側彎、扁平足、生長痛、扭傷與姿勢問題。'),
    ('women', '孕期與產後', r'孕|產後|害喜|妊娠|剖腹|坐月子|月經|經前|媽媽手', '孕吐、產後掉髮與情緒、骨盆與漏尿、經前不適的中西醫照護。'),
    ('daily-life', '生活自理與習慣', r'出門|不盯|穿衣|玩具|自理|國中|節氣|換季衣服|小藥箱|中藥粉|身體訊號', '早上出門、收玩具、穿衣、餵藥：培養孩子自理能力的小步驟。'),
    ('parenting', '家長照顧與親子關係', r'照顧生病|愧疚|隊友|阿公阿嬤|查症狀|診間|二寶|大寶', '照顧者也需要被照顧：家長情緒、分工、隔代教養與看診準備。'),
]
SLUG_NAME = {s: n for s, n, _, _ in TOPICS}


def topics_for(t, limit=3):
    key = t['title'] + ' ' + t['tag']
    hits = [s for s, _, p, _ in TOPICS if re.search(p, key)]
    if not hits:
        key2 = key + ' ' + t['subtitle']
        hits = [s for s, _, p, _ in TOPICS if re.search(p, key2)]
    return hits[:limit]

OVERRIDE = {
    'S01-12': ['cough-asthma', 'cold-fever'], 'S01-18': ['women', 'cold-fever', 'cough-asthma'], 'S01-26': ['nasal-allergy', 'skin'],
    'S02-15': ['bedwetting'], 'S02-18': ['women', 'reflux', 'constipation'], 'S02-19': ['women', 'bedwetting', 'constipation'],
    'S03-05': ['wounds'], 'S03-07': ['wounds'], 'S04-06': ['development'], 'S04-08': ['development'], 'S04-11': ['cold-fever'],
    'S04-13': ['headache', 'sleep', 'eyes'], 'S04-17': ['sleep', 'emotion', 'vomit-diarrhea'], 'S05-07': ['bones', 'development'],
    'S05-15': ['bones'], 'S05-17': ['bones', 'headache'], 'S05-37': ['bones'], 'S06-01': ['daily-life'],
    'S06-04': ['development', 'daily-life'], 'S06-08': ['daily-life'], 'S06-11': ['parenting'], 'S06-15': ['parenting'],
    'S06-06': ['emotion', 'daily-life'],
}
_auto = topics_for


def topics_for(t, limit=3):
    return OVERRIDE.get(t['id']) or _auto(t, limit)


def qr_svg(url, size=160, dark='#2B4C41'):
    """用 reportlab 的 QR 編碼器產生內嵌 SVG。"""
    from reportlab.graphics.barcode.qrencoder import QRCode, QRErrorCorrectLevel
    q = QRCode(None, QRErrorCorrectLevel.M)
    q.addData(url)
    q.make()
    n = q.getModuleCount()
    quiet = 2
    path = []
    for r in range(n):
        for c in range(n):
            if q.isDark(r, c):
                path.append(f'M{c + quiet} {r + quiet}h1v1h-1z')
    v = n + quiet * 2
    return (f'<svg class="qr" viewBox="0 0 {v} {v}" width="{size}" height="{size}" role="img" aria-label="QR code" shape-rendering="crispEdges">'
            f'<rect width="{v}" height="{v}" fill="#fff"/><path d="{"".join(path)}" fill="{dark}"/></svg>')
