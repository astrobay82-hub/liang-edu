# 參考資料庫：只收錄可查證的指引／系統性回顧／官方衛教來源。
# 連結原則：不自行拼湊文章網址；期刊文獻一律連到 PubMed 以標題搜尋，官方機構只連首頁。
import re
from urllib.parse import quote

def pm(title):
    return 'https://pubmed.ncbi.nlm.nih.gov/?term=' + quote(f'"{title}"')

R = {}
def add(k, text, title=None, url=None):
    R[k] = {'text': text, 'url': url or (pm(title) if title else None)}

# ---- 呼吸道與五官 ----
add('fever', 'Sullivan JE, Farrar HC; AAP. Fever and antipyretic use in children. Pediatrics. 2011;127(3):580-587.', 'Fever and antipyretic use in children')
add('febsz', 'AAP Subcommittee on Febrile Seizures. Febrile seizures: guideline for the neurodiagnostic evaluation of the child with a simple febrile seizure. Pediatrics. 2011;127(2):389-394.', 'Febrile seizures: guideline for the neurodiagnostic evaluation of the child with a simple febrile seizure')
add('aom', 'Lieberthal AS, et al. The diagnosis and management of acute otitis media. Pediatrics. 2013;131(3):e964-e999.', 'The diagnosis and management of acute otitis media')
add('sinus', 'Wald ER, et al. Clinical practice guideline for the diagnosis and management of acute bacterial sinusitis in children aged 1 to 18 years. Pediatrics. 2013;132(1):e262-e280.', 'Clinical practice guideline for the diagnosis and management of acute bacterial sinusitis in children aged 1 to 18 years')
add('icar', 'Wise SK, et al. International consensus statement on allergy and rhinology: Allergic rhinitis – 2023. Int Forum Allergy Rhinol. 2023;13(4):293-859.', 'International consensus statement on allergy and rhinology: Allergic rhinitis - 2023')
add('aria', 'Bousquet J, et al. Next-generation Allergic Rhinitis and Its Impact on Asthma (ARIA) guidelines for allergic rhinitis based on GRADE and real-world evidence. J Allergy Clin Immunol. 2020;145(1):70-80.', 'Next-generation Allergic Rhinitis and Its Impact on Asthma (ARIA) guidelines for allergic rhinitis based on Grading of Recommendations Assessment, Development and Evaluation (GRADE) and real-world evidence')
add('saline', 'Head K, et al. Saline irrigation for allergic rhinitis. Cochrane Database Syst Rev. 2018;6:CD012597.', 'Saline irrigation for allergic rhinitis')
add('gina', 'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention（每年更新）.', url='https://ginasthma.org/')
add('osa', 'Marcus CL, et al. Diagnosis and management of childhood obstructive sleep apnea syndrome. Pediatrics. 2012;130(3):576-584.', 'Diagnosis and management of childhood obstructive sleep apnea syndrome')
add('croup', 'Bjornson CL, Johnson DW. Croup in children. CMAJ. 2013;185(15):1317-1323.', 'Croup in children')
add('wetcough', 'Chang AB, et al. Management of children with chronic wet cough and protracted bacterial bronchitis: CHEST guideline and expert panel report. Chest. 2017;151(4):884-890.', 'Management of Children With Chronic Wet Cough and Protracted Bacterial Bronchitis: CHEST Guideline and Expert Panel Report')
add('epistaxis', 'Tunkel DE, et al. Clinical practice guideline: nosebleed (epistaxis). Otolaryngol Head Neck Surg. 2020;162(1_suppl):S1-S38.', 'Clinical Practice Guideline: Nosebleed (Epistaxis)')
add('tonsil', 'Mitchell RB, et al. Clinical practice guideline: tonsillectomy in children (update). Otolaryngol Head Neck Surg. 2019;160(1_suppl):S1-S42.', 'Clinical Practice Guideline: Tonsillectomy in Children (Update)')
add('myopia', 'Wu PC, et al. Myopia prevention and outdoor light intensity in a school-based cluster randomized trial. Ophthalmology. 2018;125(8):1239-1250.', 'Myopia Prevention and Outdoor Light Intensity in a School-Based Cluster Randomized Trial')
add('hpa', '衛生福利部國民健康署：兒童及青少年健康、視力保健與生長發育衛教資源。', url='https://www.hpa.gov.tw/')
add('urti', 'Thompson M, et al. Duration of symptoms of respiratory tract infections in children: systematic review. BMJ. 2013;347:f7027.', 'Duration of symptoms of respiratory tract infections in children: systematic review')
add('honey', 'Oduwole O, et al. Honey for acute cough in children. Cochrane Database Syst Rev. 2018;4:CD007094.', 'Honey for acute cough in children')
add('cdc', '衛生福利部疾病管制署：腸病毒、流感、呼吸道傳染病與疫苗接種資訊。', url='https://www.cdc.gov.tw/')
# ---- 腸胃與泌尿 ----
add('age', 'Guarino A, et al. ESPGHAN/ESPID evidence-based guidelines for the management of acute gastroenteritis in children in Europe: update 2014. J Pediatr Gastroenterol Nutr. 2014;59(1):132-152.', 'European Society for Pediatric Gastroenterology, Hepatology, and Nutrition/European Society for Pediatric Infectious Diseases evidence-based guidelines for the management of acute gastroenteritis in children in Europe: update 2014')
add('gerd', 'Rosen R, et al. Pediatric gastroesophageal reflux clinical practice guidelines: joint recommendations of NASPGHAN and ESPGHAN. J Pediatr Gastroenterol Nutr. 2018;66(3):516-554.', 'Pediatric Gastroesophageal Reflux Clinical Practice Guidelines: Joint Recommendations of the North American Society for Pediatric Gastroenterology, Hepatology, and Nutrition and the European Society for Pediatric Gastroenterology, Hepatology, and Nutrition')
add('constip', 'Tabbers MM, et al. Evaluation and treatment of functional constipation in infants and children: evidence-based recommendations from ESPGHAN and NASPGHAN. J Pediatr Gastroenterol Nutr. 2014;58(2):258-274.', 'Evaluation and treatment of functional constipation in infants and children: evidence-based recommendations from ESPGHAN and NASPGHAN')
add('enuresis', 'Nevéus T, et al. Management and treatment of nocturnal enuresis—an updated standardization document from the International Children\'s Continence Society. J Pediatr Urol. 2020;16(1):10-19.', 'Management and treatment of nocturnal enuresis-an updated standardization document from the International Children\'s Continence Society')
add('rome_child', 'Hyams JS, et al. Childhood functional gastrointestinal disorders: child/adolescent. Gastroenterology. 2016;150(6):1456-1468.', 'Functional Disorders: Children and Adolescents')
add('rome_infant', 'Benninga MA, et al. Childhood functional gastrointestinal disorders: neonate/toddler. Gastroenterology. 2016;150(6):1443-1455.', 'Childhood Functional Gastrointestinal Disorders: Neonate/Toddler')
add('cmpa', 'Koletzko S, et al. Diagnostic approach and management of cow\'s-milk protein allergy in infants and children: ESPGHAN GI Committee practical guidelines. J Pediatr Gastroenterol Nutr. 2012;55(2):221-229.', 'Diagnostic approach and management of cow\'s-milk protein allergy in infants and children: ESPGHAN GI Committee practical guidelines')
add('feeding', 'Kerzner B, et al. A practical approach to classifying and managing feeding difficulties. Pediatrics. 2015;135(2):344-353.', 'A practical approach to classifying and managing feeding difficulties')
add('responsive', 'Pérez-Escamilla R, et al. Feeding guidelines for infants and young toddlers: a responsive parenting approach. Healthy Eating Research; 2017.')
add('probiotic', 'Szajewska H, et al. Probiotics for the management of pediatric gastrointestinal disorders: position paper of the ESPGHAN Special Interest Group on Gut Microbiota and Modifications. J Pediatr Gastroenterol Nutr. 2023;76(2):232-247.', 'Probiotics for the Management of Pediatric Gastrointestinal Disorders: Position Paper of the ESPGHAN Special Interest Group on Gut Microbiota and Modifications')
add('uti', 'AAP Subcommittee on Urinary Tract Infection. Urinary tract infection: clinical practice guideline for the diagnosis and management of the initial UTI in febrile infants and children 2 to 24 months. Pediatrics. 2011;128(3):595-610.', 'Urinary tract infection: clinical practice guideline for the diagnosis and management of the initial UTI in febrile infants and children 2 to 24 months')
# ---- 孕產與婦女 ----
add('nvp', 'ACOG Practice Bulletin No. 189: Nausea and vomiting of pregnancy. Obstet Gynecol. 2018;131(1):e15-e30.', 'ACOG Practice Bulletin No. 189: Nausea And Vomiting Of Pregnancy')
add('pfmt', 'Woodley SJ, et al. Pelvic floor muscle training for preventing and treating urinary and faecal incontinence in antenatal and postnatal women. Cochrane Database Syst Rev. 2020;5:CD007471.', 'Pelvic floor muscle training for preventing and treating urinary and faecal incontinence in antenatal and postnatal women')
add('pregex', 'ACOG Committee Opinion No. 804: Physical activity and exercise during pregnancy and the postpartum period. Obstet Gynecol. 2020;135(4):e178-e188.', 'Physical Activity and Exercise During Pregnancy and the Postpartum Period: ACOG Committee Opinion, Number 804')
add('perinatalmh', 'ACOG Clinical Practice Guideline No. 4: Screening and diagnosis of mental health conditions during pregnancy and postpartum. Obstet Gynecol. 2023;141(6):1232-1261.', 'Screening and Diagnosis of Mental Health Conditions During Pregnancy and Postpartum: ACOG Clinical Practice Guideline No. 4')
add('pmd', 'ACOG Clinical Practice Guideline No. 7: Management of premenstrual disorders. Obstet Gynecol. 2023;142(6):1516-1533.', 'Management of Premenstrual Disorders: ACOG Clinical Practice Guideline No. 7')
add('icp', 'Royal College of Obstetricians and Gynaecologists. Intrahepatic cholestasis of pregnancy (Green-top Guideline No. 43). 2022.', url='https://www.rcog.org.uk/')
# ---- 皮膚 ----
add('ad', 'Eichenfield LF, et al. Guidelines of care for the management of atopic dermatitis: section 2. Management and treatment of atopic dermatitis with topical therapies. J Am Acad Dermatol. 2014;71(1):116-132.', 'Guidelines of care for the management of atopic dermatitis: section 2. Management and treatment of atopic dermatitis with topical therapies')
add('emoll', 'van Zuuren EJ, et al. Emollients and moisturisers for eczema. Cochrane Database Syst Rev. 2017;2:CD012119.', 'Emollients and moisturisers for eczema')
add('urtic', 'Zuberbier T, et al. The international EAACI/GA²LEN/EuroGuiDerm/APAAACI guideline for the definition, classification, diagnosis, and management of urticaria. Allergy. 2022;77(3):734-766.', 'The international EAACI/GA²LEN/EuroGuiDerm/APAAACI guideline for the definition, classification, diagnosis, and management of urticaria')
add('burn', 'Griffin BR, et al. Cool running water first aid decreases skin grafting requirements in pediatric burns: a cohort study of two thousand four hundred ninety-five children. Ann Emerg Med. 2020;75(1):75-85.', 'Cool Running Water First Aid Decreases Skin Grafting Requirements in Pediatric Burns: A Cohort Study of Two Thousand Four Hundred Ninety-five Children')
add('acne', 'Reynolds RV, et al. Guidelines of care for the management of acne vulgaris. J Am Acad Dermatol. 2024;90(5):1006.e1-1006.e30.', 'Guidelines of care for the management of acne vulgaris')
add('mollusc', 'van der Wouden JC, et al. Interventions for cutaneous molluscum contagiosum. Cochrane Database Syst Rev. 2017;5:CD004767.', 'Interventions for cutaneous molluscum contagiosum')
add('g6pd', '慈濟醫療志業中醫衛教資料：G6PD缺乏症（蠶豆症）與中藥、外用藥使用注意。', url='https://med.tzuchi.com.tw/tcmed/images/NEW/181/n70.pdf')
add('fda', '衛生福利部食品藥物管理署：用藥安全與兒童用藥衛教資訊。', url='https://www.fda.gov.tw/')
# ---- 神經、睡眠、發展 ----
add('sleepdur', 'Paruthi S, et al. Recommended amount of sleep for pediatric populations: a consensus statement of the American Academy of Sleep Medicine. J Clin Sleep Med. 2016;12(6):785-786.', 'Recommended Amount of Sleep for Pediatric Populations: A Consensus Statement of the American Academy of Sleep Medicine')
add('teensleep', 'AAP Adolescent Sleep Working Group; Committee on Adolescence; Council on School Health. School start times for adolescents. Pediatrics. 2014;134(3):642-649.', 'School start times for adolescents')
add('who5', 'World Health Organization. Guidelines on physical activity, sedentary behaviour and sleep for children under 5 years of age. 2019.', url='https://www.who.int/')
add('media', 'AAP Council on Communications and Media. Media use in school-aged children and adolescents. Pediatrics. 2016;138(5):e20162592.', 'Media Use in School-Aged Children and Adolescents')
add('adhd', 'Wolraich ML, et al. Clinical practice guideline for the diagnosis, evaluation, and treatment of attention-deficit/hyperactivity disorder in children and adolescents. Pediatrics. 2019;144(4):e20192528.', 'Clinical Practice Guideline for the Diagnosis, Evaluation, and Treatment of Attention-Deficit/Hyperactivity Disorder in Children and Adolescents')
add('adhdpsy', 'Evans SW, et al. Evidence-based psychosocial treatments for children and adolescents with attention deficit/hyperactivity disorder. J Clin Child Adolesc Psychol. 2018;47(2):157-198.', 'Evidence-Based Psychosocial Treatments for Children and Adolescents With Attention Deficit/Hyperactivity Disorder')
add('asd', 'Hyman SL, et al. Identification, evaluation, and management of children with autism spectrum disorder. Pediatrics. 2020;145(1):e20193447.', 'Identification, Evaluation, and Management of Children With Autism Spectrum Disorder')
add('tic', 'Pringsheim T, et al. Practice guideline recommendations summary: treatment of tics in people with Tourette syndrome and chronic tic disorders. Neurology. 2019;92(19):896-906.', 'Practice guideline recommendations summary: Treatment of tics in people with Tourette syndrome and chronic tic disorders')
add('headache', 'Oskoui M, et al. Practice guideline update summary: acute treatment of migraine in children and adolescents. Neurology. 2019;93(11):487-499.', 'Practice guideline update summary: Acute treatment of migraine in children and adolescents')
add('devscreen', 'Lipkin PH, Macias MM; AAP Council on Children with Disabilities. Promoting optimal development: identifying infants and young children with developmental disorders through developmental surveillance and screening. Pediatrics. 2020;145(1):e20193449.', 'Promoting Optimal Development: Identifying Infants and Young Children With Developmental Disorders Through Developmental Surveillance and Screening')
add('sensory', 'Zimmer M, Desch L; AAP. Sensory integration therapies for children with developmental and behavioral disorders. Pediatrics. 2012;129(6):1186-1189.', 'Sensory integration therapies for children with developmental and behavioral disorders')
add('emoreg', 'Gross JJ. Emotion regulation: current status and future prospects. Psychol Inq. 2015;26(1):1-26.', 'Emotion Regulation: Current Status and Future Prospects')
add('harsh', 'Wang MT, Kenny S. Longitudinal links between fathers\' and mothers\' harsh verbal discipline and adolescents\' conduct problems and depressive symptoms. Child Dev. 2014;85(3):908-923.', 'Longitudinal links between fathers\' and mothers\' harsh verbal discipline and adolescents\' conduct problems and depressive symptoms')
add('harvard', 'Center on the Developing Child, Harvard University：執行功能（Executive Function）與自我調節衛教資源。', url='https://developingchild.harvard.edu/')
add('burnout', 'Mikolajczak M, Gross JJ, Roskam I. Parental burnout: what is it, and why does it matter? Clin Psychol Sci. 2019;7(6):1319-1329.')
# ---- 生長與結構 ----
add('shortstat', 'Rogol AD, Hayden GF. Etiologies and early diagnosis of short stature and growth failure in children and adolescents. J Pediatr. 2014;164(5 Suppl):S1-S14.', 'Etiologies and early diagnosis of short stature and growth failure in children and adolescents')
add('cpp', 'Carel JC, Léger J. Clinical practice. Precocious puberty. N Engl J Med. 2008;358(22):2366-2377.', 'Clinical practice. Precocious puberty')
add('gnrha', 'Bangalore Krishna K, et al. Use of gonadotropin-releasing hormone analogs in children: update by an international consortium. Horm Res Paediatr. 2019;91(6):357-372.', 'Use of Gonadotropin-Releasing Hormone Analogs in Children: Update by an International Consortium')
add('vitd', 'Munns CF, et al. Global consensus recommendations on prevention and management of nutritional rickets. J Clin Endocrinol Metab. 2016;101(2):394-415.', 'Global Consensus Recommendations on Prevention and Management of Nutritional Rickets')
add('growpain', 'Evans AM. Growing pains: contemporary knowledge and recommended practice. J Foot Ankle Res. 2008;1(1):4.', 'Growing pains: contemporary knowledge and recommended practice')
add('flatfoot', 'Evans AM, Rome K. A Cochrane review of the evidence for non-surgical interventions for flexible pediatric flat feet. Eur J Phys Rehabil Med. 2011;47(1):69-89.', 'A Cochrane review of the evidence for non-surgical interventions for flexible pediatric flat feet')
add('scoli', 'Negrini S, et al. 2016 SOSORT guidelines: orthopaedic and rehabilitation treatment of idiopathic scoliosis during growth. Scoliosis Spinal Disord. 2018;13:3.', '2016 SOSORT guidelines: orthopaedic and rehabilitation treatment of idiopathic scoliosis during growth')
add('ankle', 'Vuurberg G, et al. Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline. Br J Sports Med. 2018;52(15):956.', 'Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline')
add('osgood', 'Ladenhauf HN, et al. Osgood-Schlatter disease: a 2020 update of a common knee condition in children. Curr Opin Pediatr. 2020;32(1):107-112.', 'Osgood-Schlatter disease: a 2020 update of a common knee condition in children')
add('pulled', 'Krul M, et al. Manipulative interventions for reducing pulled elbow in young children. Cochrane Database Syst Rev. 2017;7:CD007759.', 'Manipulative interventions for reducing pulled elbow in young children')
add('torti', 'Kaplan SL, et al. Physical therapy management of congenital muscular torticollis: a 2018 evidence-based clinical practice guideline from the APTA Academy of Pediatric Physical Therapy. Pediatr Phys Ther. 2018;30(4):240-290.', 'Physical Therapy Management of Congenital Muscular Torticollis: A 2018 Evidence-Based Clinical Practice Guideline From the APTA Academy of Pediatric Physical Therapy')
add('soy', 'Messina M. Soy and health update: evaluation of the clinical and epidemiologic literature. Nutrients. 2016;8(12):754.', 'Soy and Health Update: Evaluation of the Clinical and Epidemiologic Literature')
# ---- 中醫典籍與教材 ----
add('qianyi', '［宋］錢乙《小兒藥證直訣》：論小兒「臟腑柔弱，易虛易實，易寒易熱」的生理病理特點。')
add('wanquan', '［明］萬全《育嬰家秘》：小兒「肝常有餘，脾常不足」等五臟有餘不足之說。')
add('tcmped', '汪受傳主編《中醫兒科學》（全國中醫藥行業高等教育規劃教材），中國中醫藥出版社。')
add('fuqingzhu', '［清］傅山《傅青主女科》：婦人經、帶、胎、產病證論治。')
add('neijing', '《黃帝內經・素問》：四氣調神、陰陽與臟腑理論。')

RULES = [
    (r'發燒|燒退|退燒', ['fever']),
    (r'熱痙攣|抽搐|眼神上吊', ['febsz', 'fever']),
    (r'耳朵|中耳', ['aom']),
    (r'鼻涕倒流|濃黃鼻涕|鼻竇', ['sinus']),
    (r'鼻過敏|過敏性鼻炎|過敏體質|換季|黑眼圈|除濕|清淨機', ['icar', 'aria']),
    (r'洗鼻', ['saline', 'icar']),
    (r'氣喘|喘|咳聲', ['gina']),
    (r'打呼|張口|張嘴|腺樣體|呼吸中止', ['osa']),
    (r'扁桃腺', ['tonsil']),
    (r'小狗叫|哮吼', ['croup']),
    (r'久咳|慢性咳嗽|四週', ['wetcough']),
    (r'咳', ['honey']),
    (r'鼻血', ['epistaxis']),
    (r'揉眼|視力|近視|看書', ['myopia', 'hpa']),
    (r'感冒|抵抗力|幼兒園', ['urti']),
    (r'嘴巴痛|腸病毒', ['cdc']),
    (r'三伏貼|三九貼', ['icar']),
    (r'拉肚子|腹瀉|吐了|嘔吐', ['age']),
    (r'溢奶|奶喝完就吐|逆流|清喉嚨|喉嚨卡卡', ['gerd']),
    (r'便秘|大便|軟便劑|纖維', ['constip']),
    (r'尿床|夜尿|警報器', ['enuresis']),
    (r'肚子痛|腹痛', ['rome_child']),
    (r'新生兒半夜哭鬧|腸絞痛', ['rome_infant']),
    (r'牛奶就拉|乳糖|牛奶蛋白', ['cmpa']),
    (r'胃口|挑食|追著|含在嘴|吃兩口|瘦巴巴|飢餓', ['feeding', 'responsive']),
    (r'益生菌', ['probiotic']),
    (r'尿痛|分泌物|喊尿', ['uti']),
    (r'孕吐|害喜|孕期', ['nvp']),
    (r'產後漏尿|產後便秘|骨盆|恥骨', ['pfmt', 'pregex']),
    (r'產後掉髮|產後.*睡不著|看什麼都想哭', ['perinatalmh']),
    (r'月經來前|經前', ['pmd']),
    (r'妊娠搔癢|懷孕肚子', ['icp']),
    (r'初經', ['pmd']),
    (r'抓不停|異位性|類固醇藥膏|皮屑|紅紅一片', ['ad', 'emoll']),
    (r'風疹塊|蕁麻疹|全身冒疹子', ['urtic']),
    (r'燙到|燙傷', ['burn']),
    (r'痘痘|紅印', ['acne']),
    (r'珍珠|亮亮的', ['mollusc']),
    (r'藥浴|金銀花|黃連膏|紫雲膏|青黛', ['g6pd', 'ad']),
    (r'小藥箱|中藥粉', ['fda']),
    (r'睡|晚睡|熬夜', ['sleepdur']),
    (r'青春期孩子半夜不睡|叫不醒', ['teensleep']),
    (r'手機|平板|滑', ['media']),
    (r'ADHD|專注|不專心|粗心|拖延|獎勵', ['adhd']),
    (r'ADHD.*(罵|獎勵|暴)', ['adhdpsy']),
    (r'自閉', ['asd']),
    (r'眨眼|抽動|清喉嚨', ['tic']),
    (r'頭痛|頭暈', ['headache']),
    (r'說話比同齡慢|笨拙|發展', ['devscreen']),
    (r'感統|感覺處理|感覺統合|刷牙、洗頭', ['sensory']),
    (r'情緒|脾氣|崩潰|一輸|高敏感|冷靜|爆炸', ['emoreg']),
    (r'吼|越罵', ['harsh']),
    (r'早上出門|不盯就不動|忘記帶|時間感|穿衣|玩具', ['harvard']),
    (r'累到崩潰|一整夜沒睡|愧疚|隊友', ['burnout']),
    (r'長高|身高|生長曲線|骨齡|生長激素|黃金期|跳繩|轉骨|發育慢', ['shortstat', 'hpa']),
    (r'性早熟|提早發育|胸部提早|抑制針|豆漿|牛奶會造成', ['cpp']),
    (r'抑制針', ['gnrha']),
    (r'維生素D', ['vitd']),
    (r'生長痛|腿痛|不像典型', ['growpain']),
    (r'扁平足|腳累|鞋底', ['flatfoot']),
    (r'脊椎側彎|肩膀一高一低|領口一邊歪', ['scoli']),
    (r'扭傷', ['ankle']),
    (r'膝蓋下方|腳後跟', ['osgood']),
    (r'牽牛手|拉單槓', ['pulled']),
    (r'斜頸|脖子歪', ['torti']),
    (r'豆漿', ['soy']),
    (r'營養|骨骼', ['vitd']),
]
FALLBACK = {
    'S01': ['urti', 'hpa'], 'S02': ['rome_child', 'feeding'], 'S03': ['ad', 'fda'],
    'S04': ['sleepdur', 'devscreen'], 'S05': ['shortstat', 'hpa'], 'S06': ['harvard', 'hpa'],
}
WOMEN = re.compile(r'孕|產後|產|媽媽|月經|經前|初經|妊娠|剖腹')


def refs_for(t):
    key = t['title'] + ' ' + t['subtitle'] + ' ' + t['tag']
    ids = []
    for pat, rs in RULES:
        if re.search(pat, key):
            for r in rs:
                if r not in ids:
                    ids.append(r)
    for r in FALLBACK[t['id'][:3]]:
        if len(ids) >= 2:
            break
        if r not in ids:
            ids.append(r)
    ids = ids[:5]
    tcm = ['fuqingzhu', 'neijing'] if WOMEN.search(t['title'] + t['tag']) else ['tcmped', 'wanquan' if t['id'][:3] in ('S02', 'S05', 'S06') else 'qianyi']
    return [R[i] for i in ids], [R[i] for i in tcm]

OVERRIDE = {
 'S01-01': ['urti', 'icar', 'saline'], 'S01-05': ['fever', 'urti'], 'S01-07': ['gina'], 'S01-10': ['myopia', 'hpa'],
 'S01-12': ['croup', 'fever'], 'S01-13': ['sinus', 'wetcough', 'gerd'], 'S01-18': ['urti', 'honey', 'fda'],
 'S02-01': ['gerd', 'rome_infant'], 'S02-02': ['age'], 'S02-10': ['age', 'constip'], 'S02-12': ['rome_infant', 'cmpa'],
 'S02-15': ['uti'], 'S02-16': ['feeding', 'shortstat'], 'S02-17': ['rome_child', 'constip'], 'S02-35': ['gerd', 'tic'],
 'S03-04': ['urtic', 'fda'], 'S03-05': ['fda'], 'S03-09': ['fda'], 'S03-10': ['ad', 'emoll'], 'S03-11': ['ad', 'emoll'],
 'S03-13': ['ad', 'emoll'], 'S03-17': ['emoll'], 'S03-18': ['fda'], 'S03-19': ['fda'], 'S03-20': ['icp'],
 'S04-01': ['sleepdur', 'media'], 'S04-02': ['sleepdur'], 'S04-05': ['rome_child', 'emoreg'], 'S04-06': ['tic'],
 'S04-12': ['sleepdur', 'vitd'], 'S04-13': ['headache', 'sleepdur', 'myopia', 'sinus'], 'S04-16': ['devscreen', 'enuresis'],
 'S04-17': ['sleepdur', 'rome_child'], 'S05-01': ['devscreen', 'sensory'], 'S05-02': ['scoli', 'media'], 'S05-06': ['scoli'],
 'S05-07': ['devscreen', 'flatfoot'], 'S05-08': ['osa'], 'S05-12': ['shortstat', 'cpp'], 'S05-13': ['hpa'],
 'S05-15': ['torti'], 'S05-16': ['vitd', 'shortstat'], 'S05-17': ['media'], 'S05-36': ['cpp', 'vitd'],
 'S06-06': ['emoreg', 'devscreen'], 'S06-07': ['feeding', 'responsive'], 'S06-11': ['burnout', 'sleepdur', 'fever'],
 'S06-13': ['feeding', 'hpa'], 'S06-15': ['media', 'burnout'], 'S06-16': ['hpa'], 'S06-17': ['urti', 'hpa'],
 'S06-19': ['emoreg', 'harvard'], 'S06-20': ['hpa'],
}
_refs_for = refs_for


def refs_for(t):
    r, tcm = _refs_for(t)
    if t['id'] in OVERRIDE:
        r = [R[i] for i in OVERRIDE[t['id']]]
    return r, tcm
