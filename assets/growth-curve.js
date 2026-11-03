/* 雅淳醫師成長手帳｜生長曲線外掛（成長刻度）
   接在 blueprint.js 之後載入，不修改手帳原本的程式與資料格式。
   - 讀取手帳的 localStorage（shanchun_growth_v1）中的生日與身高體重紀錄
   - 性別與父母身高另存於 liang_growth_curve_v1（只存在這台裝置）
   - 在「生長・青春期」分頁加上台灣百分位曲線、生長提醒、家庭靶身高與限制說明
   - 在「回診摘要」補上百分位與生長速度
   參考：國健署兒童及青少年生長曲線（0–5 歲 WHO；7–18 歲 陳偉德、張美惠 2010），
        衛福部 102 年兒童及青少年 BMI 建議值。 */
(function () {
  'use strict';
  var KEY = 'shanchun_growth_v1', XKEY = 'liang_growth_curve_v1';
  var app = document.getElementById('bp-app');
  if (!app) return;

  /* ---------- reference data (ages 0..18, P3/P25/P50/P75/P97) ---------- */
  var ZS = [-1.8808, -0.6745, 0, 0.6745, 1.8808];
  var REF = {
    h: { M: [[46.3,71.3,82.1,89.1,95.4,101.2,106.5,111.8,117,121.8,126,130.5,135.6,141.9,149.3,155.5,159.3,160.9,161.5],
             [48.6,74.1,85.8,93.6,100.5,106.8,112.3,117.8,123.3,128,132.5,137.8,143.8,151.5,159,163.5,166.2,167.7,168],
             [49.9,75.7,87.8,96.1,103.5,110,115.6,121.2,126.8,131.8,136.5,142,148.8,156.9,163.7,167.6,170,171.5,172],
             [51.2,77.4,89.9,98.6,106.2,113.1,118.9,124.6,130.3,135.5,140.5,146.7,154.2,162,168.3,171.8,173.8,174.8,175],
             [53.4,80.2,93.6,103.1,111.2,118.7,124.9,131.2,137.2,142.5,148.3,156.1,164.4,171,176,179,180.5,181.5,182]],
         F: [[45.6,69.2,80.3,87.9,94.6,100.5,105.5,110.6,115.7,120.7,125.8,131.8,137.9,143.2,146.8,148.5,149.5,150,150],
             [47.9,72.3,84.2,92.5,99.8,106.2,111.3,116.4,122,127.5,133,139.8,146.3,150.7,153.2,154.5,155.3,155.8,156],
             [49.1,74,86.4,95.1,102.7,109.4,114.8,120.3,125.8,131.3,137.5,144.5,150.5,154.5,156.8,157.9,158.7,159.3,159.5],
             [50.4,75.8,88.6,97.6,105.6,112.6,118,123.5,129.2,135.4,142.3,149.4,154.9,158.4,160.4,161.5,162.3,162.8,163],
             [52.7,78.9,92.5,102.2,110.8,118.4,124.2,130.1,136.5,143.5,150.8,157.3,161.8,164.8,167,168.2,168.8,169,169]] },
    w: { M: [[2.5,7.8,9.8,11.4,12.9,14.3,16.3,18.4,20.3,22.1,24,26.3,29.3,32.8,38,43,46.8,49.3,50.3],
             [3,9,11.3,13.2,15,16.7,19,21.3,23.8,26,28.4,31.4,35.2,40.7,46.8,51.3,54.1,56.1,57.5],
             [3.3,9.6,12.2,14.3,16.3,18.3,20.9,23.6,26.3,28.8,31.5,35.3,40.3,46.5,52.5,56.5,59,61,62.5],
             [3.7,10.4,13.1,15.6,17.8,20.1,23.2,26.3,29.6,32.7,36,40.8,46.5,53,58.7,62.5,65,66.6,67.6],
             [4.3,11.8,15.1,18,20.9,23.8,29.2,34.7,40.2,44.3,48.6,54.8,61.5,68.5,74.3,77.6,79.3,80,80]],
         F: [[2.4,7.1,9.2,11,12.5,14,15.9,17.8,19.6,21.5,23.8,26.5,29.8,33.5,37.1,39.3,40.5,41.5,42],
             [2.9,8.2,10.6,12.7,14.7,16.5,18.5,20.6,22.8,25.3,28.3,32.5,37.1,40.9,43.8,45.7,46.7,47.2,47.3],
             [3.2,8.9,11.5,13.9,16.1,18.2,20.5,22.8,25.4,28.2,31.8,36.9,41.7,45.4,48.1,49.6,50.5,51,51],
             [3.6,9.7,12.5,15.1,17.7,20.2,22.8,25.3,28.4,32.1,36.7,42.2,47,50.5,53,54.5,55,55,55],
             [4.2,11.3,14.6,17.8,21.1,24.4,28.6,32.9,37.8,42.8,47.3,52.7,57.8,61.2,63.9,65.5,66.2,66.7,67]] }
  };
  /* BMI cutoffs by half-year 0.0..17.5: under(<), over(>=), obese(>=) */
  var BMI = {
    M: [[11.5,15.2,14.8,14.2,14.2,13.9,13.7,13.6,13.4,13.3,13.3,13.4,13.5,13.6,13.8,14.0,14.1,14.2,14.3,14.4,14.5,14.6,14.8,15.0,15.2,15.4,15.7,16.0,16.3,16.6,16.9,17.2,17.4,17.6,17.8,18.0],
        [14.8,18.9,18.3,17.5,17.4,17.2,17.0,16.8,16.7,16.7,16.7,16.7,16.9,17.3,17.9,18.6,19.0,19.3,19.5,19.7,20.0,20.3,20.7,21.0,21.3,21.5,21.9,22.2,22.5,22.7,22.9,23.1,23.3,23.4,23.5,23.6],
        [15.8,19.9,19.2,18.5,18.3,18.0,17.8,17.7,17.6,17.6,17.7,18.0,18.5,19.2,20.3,21.2,21.6,22.0,22.3,22.5,22.7,22.9,23.2,23.5,23.9,24.2,24.5,24.8,25.0,25.2,25.4,25.5,25.6,25.6,25.6,25.6]],
    F: [[11.5,14.6,14.2,13.7,13.7,13.6,13.5,13.3,13.2,13.1,13.1,13.1,13.1,13.2,13.4,13.7,13.8,13.9,14.0,14.1,14.3,14.4,14.7,14.9,15.2,15.4,15.7,16.0,16.3,16.5,16.7,16.9,17.1,17.2,17.3,17.3],
        [14.7,18.6,17.9,17.2,17.2,17.0,16.9,16.8,16.8,16.9,17.0,17.0,17.2,17.5,17.7,18.0,18.4,18.8,19.1,19.3,19.7,20.1,20.5,20.9,21.3,21.6,21.9,22.2,22.5,22.7,22.7,22.7,22.7,22.7,22.7,22.7],
        [15.5,19.6,19.0,18.2,18.1,17.9,17.8,17.8,17.9,18.0,18.1,18.3,18.8,19.2,19.6,20.3,20.7,21.0,21.3,21.6,22.0,22.3,22.7,23.1,23.5,23.9,24.3,24.6,24.9,25.1,25.2,25.3,25.3,25.3,25.3,25.3]]
  };

  /* ---------- math ---------- */
  function refAt(m, sex, age) { var t = REF[m][sex], a = Math.max(0, Math.min(18, age)), i = Math.min(17, Math.floor(a)), f = a - i; return t.map(function (r) { return r[i] + (r[i + 1] - r[i]) * f; }); }
  function seg(arr, x) { if (x <= arr[0]) return 0; if (x >= arr[4]) return 3; for (var k = 0; k < 4; k++) if (x <= arr[k + 1]) return k; return 3; }
  function zOf(v, x) { var k = seg(v, x); var z = ZS[k] + (x - v[k]) * (ZS[k + 1] - ZS[k]) / (v[k + 1] - v[k]); return Math.max(-4, Math.min(4, z)); }
  function valOfZ(v, z) { var k = seg(ZS, z); return v[k] + (z - ZS[k]) * (v[k + 1] - v[k]) / (ZS[k + 1] - ZS[k]); }
  function phi(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2); var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
  function prText(z) { if (z < ZS[0]) return '<3'; if (z > ZS[4]) return '>97'; return String(Math.round(phi(z) * 100)); }
  function bmiCut(sex, age) { if (age >= 18) return { under: 18.5, over: 24, obese: 27 }; var i = Math.max(0, Math.min(35, Math.floor(age * 2))), t = BMI[sex]; return { under: t[0][i], over: t[1][i], obese: t[2][i] }; }
  function bmiCat(sex, age, b) { var c = bmiCut(sex, age); if (b < c.under) return '過輕'; if (b >= c.obese) return '肥胖'; if (b >= c.over) return '過重'; return '正常'; }
  function r1(x) { return Math.round(x * 10) / 10; }
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function addYears(iso, n) { var p = iso.split('-').map(Number), t = new Date(Date.UTC(p[0] + n, p[1] - 1, p[2])); if (t.getUTCMonth() !== p[1] - 1) t.setUTCDate(0); return t.toISOString().slice(0, 10); }
  function ageAt(birth, date) { return (new Date(date + 'T12:00:00') - new Date(birth + 'T12:00:00')) / (365.25 * 864e5); }
  function ageText(a) { var y = Math.floor(a), m = Math.floor((a - y) * 12 + 1e-6); return y + ' 歲' + (m ? ' ' + m + ' 個月' : ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- data ---------- */
  function readState() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function readX() { try { return JSON.parse(localStorage.getItem(XKEY) || '{}') || {}; } catch (e) { return {}; } }
  function writeX(x) { try { localStorage.setItem(XKEY, JSON.stringify(x)); return true; } catch (e) { return false; } }
  /* 優先寫進手帳本身的孩子資料（會跟著備份檔走）；舊版手帳沒有 bpAPI 時才退回外掛自己的儲存 */
  function setField(id, key, val) {
    if (window.bpAPI && window.bpAPI.update) { var o = {}; o[key] = val; if (window.bpAPI.update(id, o)) return; }
    var x = readX(); x[id] = x[id] || {}; x[id][key] = val; writeX(x);
  }
  /* 把舊版另存的性別與父母身高搬進手帳資料 */
  function migrate() {
    if (!(window.bpAPI && window.bpAPI.update)) return;
    var x = readX(), st = readState(), moved = false;
    if (!st || !Array.isArray(st.children)) return;
    st.children.forEach(function (c) {
      var ex = x[c.id]; if (!ex) return;
      var f = {};
      ['sex', 'fh', 'mh'].forEach(function (k) { if (ex[k] && !c[k]) f[k] = ex[k]; });
      if (Object.keys(f).length && window.bpAPI.update(c.id, f)) { delete x[c.id]; moved = true; }
    });
    if (moved) writeX(x);
  }
  function currentChild() {
    var st = readState(); if (!st || !Array.isArray(st.children) || !st.children.length) return null;
    var sel = document.getElementById('bp-child'), id = sel ? sel.value : st.active;
    var c = st.children.filter(function (x) { return x.id === id; })[0] || st.children[0];
    var ex = readX()[c.id] || {};
    return { id: c.id, name: c.name, birth: c.birthday, sex: c.sex || ex.sex || null, fh: c.fh || ex.fh || null, mh: c.mh || ex.mh || null,
      recs: (c.growth || []).filter(function (g) { return g && g.date && (g.h || g.w); }).slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }),
      puberty: (c.puberty || []).slice() };
  }
  function an(k, r) { var a = ageAt(k.birth, r.date), o = { age: a, young: a < 2 }; var h = +r.h, w = +r.w;
    if (h > 0) o.hz = zOf(refAt('h', k.sex, a), h); if (w > 0) o.wz = zOf(refAt('w', k.sex, a), w);
    if (h > 0 && w > 0) { o.bmi = w / Math.pow(h / 100, 2); o.cat = bmiCat(k.sex, a, o.bmi); } return o; }
  /* 與【長高特工局】醫學修訂版一致：家庭靶身高 (父+母±13)/2，參考範圍 ±8.5 cm（Children's Mercy） */
  var TH_RANGE = 8.5;
  function target(k) { if (!(k.fh > 0 && k.mh > 0)) return null; var m = (k.fh + k.mh + (k.sex === 'M' ? 13 : -13)) / 2; return { mid: m, lo: m - TH_RANGE, hi: m + TH_RANGE }; }
  /* 等同 Excel EDATE(日期,n)：推 n 個曆月，月底自動對齊（8/31+6 個月＝2/28） */
  function addMonths(iso, n) { var p = iso.split('-').map(Number), t = new Date(Date.UTC(p[0], p[1] - 1 + n, 1)), last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate(); t.setUTCDate(Math.min(p[2], last)); return t.toISOString().slice(0, 10); }
  /* 生長速率：與 Excel 相同 (身高差)/(日數差)×365.25，兩點至少相隔 6 個曆月（Excel：A>=EDATE(A0,6)）；
     手帳取「最新一筆」對「最接近一年前、且符合 6 個曆月」的那一筆（近一年速率）。 */
  function velocity(k) { var hs = k.recs.filter(function (r) { return +r.h > 0; }); if (hs.length < 2) return null;
    var last = hs[hs.length - 1], la = ageAt(k.birth, last.date), best = null;
    hs.slice(0, -1).forEach(function (r) { var d = la - ageAt(k.birth, r.date); if (last.date < addMonths(r.date, 6)) return; if (!best || Math.abs(d - 1) < Math.abs(best.d - 1)) best = { r: r, d: d }; });
    if (!best) return null; var mid = (la + ageAt(k.birth, best.r.date)) / 2;
    return { v: (last.h - best.r.h) / best.d, from: best.r, to: last, ref: refAt('h', k.sex, Math.min(18, mid + 0.5))[2] - refAt('h', k.sex, Math.max(0, mid - 0.5))[2] }; }

  function compass(k) {
    var out = [], recs = k.recs.filter(function (r) { var a = ageAt(k.birth, r.date); return a >= 2 && a <= 18.01; });
    if (!recs.length) return out;
    var last = recs[recs.length - 1], A = an(k, last), a = A.age;
    if (A.hz != null) {
      if (A.hz < ZS[0]) out.push(['alert', '身高低於第 3 百分位', '建議帶著紀錄和兒科醫師討論，看看是否需要進一步檢查。']);
      else if (A.hz > ZS[4]) out.push(['warn', '身高高於第 97 百分位', '多數是家族性高個子；如果同時很早出現青春期變化，建議和醫師討論。']);
    }
    var earlier = recs.filter(function (r) { return +r.h > 0 && a - ageAt(k.birth, r.date) >= 0.5; });
    if (A.hz != null && earlier.length) {
      var ref = earlier.reduce(function (p, r) { return Math.abs(a - ageAt(k.birth, r.date) - 1.5) < Math.abs(a - ageAt(k.birth, p.date) - 1.5) ? r : p; });
      var B = an(k, ref), dz = A.hz - B.hz, yrs = r1(a - B.age);
      if (dz <= -1.2) out.push(['alert', '身高百分位明顯往下', '近 ' + yrs + ' 年從 PR ' + prText(B.hz) + ' 到 PR ' + prText(A.hz) + '，跨過約兩條主要百分位線，建議和醫師討論。']);
      else if (dz <= -0.67) out.push(['warn', '身高百分位往下走', '近 ' + yrs + ' 年從 PR ' + prText(B.hz) + ' 到 PR ' + prText(A.hz) + '。可能只是量測誤差，建議 3 個月後用同樣方式再量一次。']);
      else if (dz >= 1.0 && a < (k.sex === 'F' ? 9 : 10)) out.push(['warn', '身高百分位快速往上', '近 ' + yrs + ' 年從 PR ' + prText(B.hz) + ' 到 PR ' + prText(A.hz) + '。年紀小又突然抽高，可以和醫師討論是否需要看骨齡。']);
      if (A.wz != null && B.wz != null && (A.wz - A.hz) - (B.wz - B.hz) >= 0.8) out.push(['warn', '體重增加得比身高快', '體重的百分位往上爬得比身高快，可以先從睡眠、含糖飲料與活動量調整。']);
    }
    var V = velocity(k);
    if (V && a >= 3 && a < (k.sex === 'F' ? 9.5 : 10.5)) {
      if (V.v < 4) out.push(['alert', '一年長 ' + r1(V.v) + ' 公分，偏慢', '青春期前多數孩子一年長約 4–6 公分；低於 4 公分建議和醫師討論。']);
      else if (V.v >= 8) out.push(['warn', '一年長 ' + r1(V.v) + ' 公分，偏快', '青春期前長得特別快，留意是否有青春期提早的變化。']);
    }
    if (A.cat && A.cat !== '正常') out.push([A.cat === '肥胖' ? 'alert' : 'warn', 'BMI ' + r1(A.bmi) + '，' + A.cat, A.cat === '過輕' ? '可以先看看食量、腸胃與作息；持續偏輕請和醫師討論。' : '依衛福部兒童 BMI 建議值判定。可先調整飲食與活動，需要時和醫師討論。']);
    var T = target(k);
    if (T && A.hz != null && a >= 3 && a < 18) { var pj = valOfZ(refAt('h', k.sex, 18), A.hz); if (pj < T.lo) out.push(['warn', '目前軌道低於家庭靶身高範圍', '照目前百分位延伸，成年約 ' + Math.round(pj) + ' cm，低於家庭參考範圍 ' + Math.round(T.lo) + '–' + Math.round(T.hi) + ' cm。先多量幾次確認趨勢。']); }
    var days = Math.floor((new Date(today()) - new Date(last.date)) / 864e5);
    if (days >= 120) out.push(['info', '距離上次量測 ' + days + ' 天', '建議約每 3 個月量一次：同一個時段、赤腳、靠牆站直。']);
    if (!out.some(function (o) { return o[0] === 'alert' || o[0] === 'warn'; })) out.unshift(['ok', '目前沿著自己的曲線前進', recs.length < 3 ? '再累積幾筆、間隔半年以上的紀錄，才看得出生長速度與趨勢。' : '穩定沿著原本的百分位長，比百分位高低更重要。']);
    return out;
  }

  /* ---------- chart ---------- */
  var metric = 'h';
  function chart(k) {
    var recs = k.recs.map(function (r) { return { r: r, A: an(k, r) }; }).filter(function (o) { return o.A.age >= 2 && o.A.age <= 18.01; });
    var W = 640, H = 380, L = 42, R = 52, T = 18, B = 30;
    var x0 = 2, x1 = 18;
    if (recs.length) { x0 = Math.max(2, Math.floor(recs[0].A.age - 1)); x1 = Math.min(18, Math.ceil(recs[recs.length - 1].A.age + 2)); if (x1 - x0 < 4) { x1 = Math.min(18, x0 + 4); x0 = Math.max(2, x1 - 4); } }
    var Tg = target(k), showT = metric === 'h' && Tg && x1 >= 17;
    var xs = []; for (var a = x0; a <= x1 + 1e-9; a += 0.25) xs.push(a);
    var val = function (o) { return metric === 'h' ? +o.r.h : metric === 'w' ? +o.r.w : o.A.bmi; };
    var lo = Infinity, hi = -Infinity;
    if (metric === 'bmi') xs.forEach(function (a) { var c = bmiCut(k.sex, a); lo = Math.min(lo, c.under - 1.5); hi = Math.max(hi, c.obese + 2); });
    else xs.forEach(function (a) { var v = refAt(metric, k.sex, a); lo = Math.min(lo, v[0]); hi = Math.max(hi, v[4]); });
    recs.forEach(function (o) { var v = val(o); if (v > 0) { lo = Math.min(lo, v); hi = Math.max(hi, v); } });
    if (showT) { lo = Math.min(lo, Tg.lo); hi = Math.max(hi, Tg.hi); }
    var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    var X = function (a) { return L + (a - x0) / (x1 - x0) * (W - L - R); }, Y = function (v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); };
    var P = function (pts) { return pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(''); };
    var s = '<svg class="gc-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(k.name) + '的生長曲線">';
    var step = metric === 'h' ? (hi - lo > 80 ? 20 : 10) : metric === 'w' ? (hi - lo > 50 ? 10 : 5) : 2;
    for (var v = Math.ceil(lo / step) * step; v <= hi; v += step) s += '<line class="gc-g" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="gc-ax" x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
    for (var y = Math.ceil(x0); y <= x1; y++) s += '<text class="gc-ax" x="' + X(y) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + y + '</text>';
    s += '<text class="gc-ax" x="' + (W - R) + '" y="' + (H - 2) + '" text-anchor="end">歲</text>';
    if (metric === 'bmi') {
      var cut = function (key) { return xs.map(function (a) { return [X(a), Y(bmiCut(k.sex, a)[key])]; }); };
      var top = xs.map(function (a) { return [X(a), T]; }), bot = xs.map(function (a) { return [X(a), H - B]; });
      var area = function (u, d, c) { return '<path class="' + c + '" d="' + P(u) + 'L' + P(d.slice().reverse()).slice(1) + 'Z"/>'; };
      s += area(cut('under'), bot, 'gc-z1') + area(cut('over'), cut('under'), 'gc-z0') + area(cut('obese'), cut('over'), 'gc-z1') + area(top, cut('obese'), 'gc-z2');
      var c = bmiCut(k.sex, Math.min(x1, 17.9));
      [['過輕', (c.under + lo) / 2], ['正常', (c.under + c.over) / 2], ['過重', (c.over + c.obese) / 2], ['肥胖', Math.min(hi - 0.5, c.obese + 1.2)]].forEach(function (t) { s += '<text class="gc-pl" x="' + (W - R + 6) + '" y="' + (Y(t[1]) + 4) + '">' + t[0] + '</text>'; });
    } else {
      var pc = function (i) { return xs.map(function (a) { return [X(a), Y(refAt(metric, k.sex, a)[i])]; }); };
      s += '<path class="gc-b1" d="' + P(pc(4)) + 'L' + P(pc(0).reverse()).slice(1) + 'Z"/><path class="gc-b2" d="' + P(pc(3)) + 'L' + P(pc(1).reverse()).slice(1) + 'Z"/>';
      [0, 1, 3, 4].forEach(function (i) { s += '<path class="gc-pc" d="' + P(pc(i)) + '"/>'; });
      s += '<path class="gc-med" d="' + P(pc(2)) + '"/>';
      var rv = refAt(metric, k.sex, x1);
      ['3', '25', '50', '75', '97'].forEach(function (t, i) { s += '<text class="gc-pl" x="' + (W - R + 6) + '" y="' + (Y(rv[i]) + 4) + '">P' + t + '</text>'; });
    }
    if (showT) { var tx = X(Math.min(18, x1)); s += '<rect class="gc-t" x="' + (tx - 6) + '" y="' + Y(Tg.hi) + '" width="12" height="' + (Y(Tg.lo) - Y(Tg.hi)) + '" rx="3"/><line class="gc-tl" x1="' + (tx - 10) + '" x2="' + (tx + 10) + '" y1="' + Y(Tg.mid) + '" y2="' + Y(Tg.mid) + '"/><text class="gc-tt" x="' + (tx - 12) + '" y="' + (Y(Tg.hi) - 6) + '" text-anchor="end">家庭靶身高 ' + Math.round(Tg.mid) + '</text>'; }
    k.puberty.forEach(function (p) { var pa = ageAt(k.birth, p.date); if (pa >= x0 && pa <= x1) s += '<line class="gc-ev" x1="' + X(pa) + '" x2="' + X(pa) + '" y1="' + T + '" y2="' + (H - B) + '"/><text class="gc-evt" x="' + (X(pa) + 3) + '" y="' + (T + 11) + '">' + esc(String(p.sign || '').slice(0, 6)) + '</text>'; });
    var pts = recs.filter(function (o) { return val(o) > 0; }).map(function (o) { return { o: o, x: X(o.A.age), y: Y(val(o)) }; });
    if (pts.length > 1) s += '<path class="gc-line" d="' + P(pts.map(function (p) { return [p.x, p.y]; })) + '"/>';
    pts.forEach(function (p) { s += '<circle class="gc-pt" cx="' + p.x + '" cy="' + p.y + '" r="5"><title>' + p.o.r.date + '　' + (metric === 'bmi' ? r1(val(p.o)) : val(p.o)) + '</title></circle>'; });
    if (pts.length) { var lp = pts[pts.length - 1], z = metric === 'h' ? lp.o.A.hz : metric === 'w' ? lp.o.A.wz : null; s += '<text class="gc-lab" x="' + (lp.x > W - R - 60 ? lp.x - 8 : lp.x + 8) + '" y="' + (lp.y - 9) + '" text-anchor="' + (lp.x > W - R - 60 ? 'end' : 'start') + '">' + (metric === 'bmi' ? 'BMI ' + r1(val(lp.o)) : 'PR ' + prText(z)) + '</text>'; }
    return s + '</svg>';
  }

  /* ---------- views ---------- */
  var LIMITS = '<details class="gc-lim" open><summary>這些數字的限制（請先讀）</summary><ul>' +
    '<li><b>參考值：</b>國健署兒童及青少年生長曲線，0–5 歲採 WHO 標準，7–18 歲依陳偉德、張美惠 2010 年台灣資料；BMI 採衛福部 102 年兒童及青少年建議值。</li>' +
    '<li><b>年齡範圍：</b>只計算 2–18 歲。未滿 2 歲（含早產兒的矯正年齡）請用兒童健康手冊或國健署工具判讀。</li>' +
    '<li><b>估算方式：</b>參考表每一歲一個數值，中間月齡以直線內插估算，百分位可能有幾個百分點的差距；低於 3 或高於 97 只標示「&lt;3」「&gt;97」，不再細分。</li>' +
    '<li><b>量測方式：</b>赤腳、硬地、背靠牆站直、平視，同一台設備、相近時段。每次量兩次，相差超過 0.5 公分請重量，再把兩次的平均填進來。不同時段或姿勢，身高可差到 1 公分。</li>' +
    '<li><b>成年身高延伸：</b>假設孩子一直沿著目前的百分位長大。青春期早或晚都會讓它失準，它不是骨齡預測，只當方向參考。</li>' +
    '<li><b>家庭靶身高：</b>（父＋母±13）÷2，參考範圍 ±8.5 公分。這是家庭參考，不是成人身高的預測或保證；父母身高請填實際量測值。</li>' +
    '<li><b>生長速率：</b>（身高差）÷（相隔天數）×365.25。兩筆至少相隔 6 個曆月才計算，取最新一筆和最接近一年前的那一筆。這個數字只描述過去，不預測未來；青春期前後的快慢需由醫師依年齡與發育判讀。</li>' +
    '<li><b>BMI：</b>不分肌肉和脂肪，運動量大、肌肉多的孩子可能被判為過重。</li>' +
    '<li><b>提醒的意思：</b>這裡的提醒是「建議和醫師討論」的時機，不是診斷，也不能取代醫師診察與骨齡、抽血等檢查。</li></ul></details>';

  function growthPanel(k) {
    var x = { fh: k.fh, mh: k.mh };
    var form = '<div class="gc-setup"><div class="gc-sex" role="group" aria-label="性別">' +
      '<span>性別</span><button type="button" data-gcsex="M" class="' + (k.sex === 'M' ? 'on' : '') + '">男孩</button><button type="button" data-gcsex="F" class="' + (k.sex === 'F' ? 'on' : '') + '">女孩</button></div>' +
      '<label>爸爸身高<input id="gc-fh" type="number" min="120" max="220" step="0.1" inputmode="decimal" value="' + (x.fh || '') + '" placeholder="選填"><span>cm</span></label>' +
      '<label>媽媽身高<input id="gc-mh" type="number" min="120" max="220" step="0.1" inputmode="decimal" value="' + (x.mh || '') + '" placeholder="選填"><span>cm</span></label></div>';
    var head = '<div class="card bp-box gc"><h3>台灣生長曲線</h3><p class="muted">選好性別，就會用台灣參考值把每次量測畫成曲線、算出百分位。性別和父母身高會和其他紀錄一起保存，也包含在備份檔裡。</p>' + form;
    var a = ageAt(k.birth, today());
    if (!k.sex) return head + '<p class="note">請先選擇性別。</p>' + LIMITS + '</div>';
    if (a >= 18) head += '<p class="note">孩子已滿 18 歲，曲線只畫到 18 歲。</p>';
    if (a < 2 && !k.recs.some(function (r) { return ageAt(k.birth, r.date) >= 2; })) return head + '<p class="note">孩子還未滿 2 歲。這個階段請以兒童健康手冊的曲線（WHO 標準）判讀；滿 2 歲後，這裡會自動開始畫台灣生長曲線。</p>' + LIMITS + '</div>';
    var valid = k.recs.filter(function (r) { var ra = ageAt(k.birth, r.date); return ra >= 2 && ra <= 18.01; });
    if (!valid.length) return head + '<p class="note">在下方「身高體重紀錄」存第一筆 2 歲以後的量測，曲線就會出現。</p>' + LIMITS + '</div>';
    var last = valid[valid.length - 1], A = an(k, last), V = velocity({ birth: k.birth, sex: k.sex, recs: valid }), Tg = target(k);
    var pj = A.hz != null && A.age < 18 ? valOfZ(refAt('h', k.sex, 18), A.hz) : null;
    var meter = function (z) { return z == null ? '' : '<div class="gc-meter"><b style="left:' + Math.max(0.5, Math.min(99.5, phi(z) * 100)) + '%"></b></div>'; };
    var cls = { '正常': 'ok', '過輕': 'warn', '過重': 'warn', '肥胖': 'alert' }[A.cat] || 'ok';
    var kk = { id: k.id, name: k.name, birth: k.birth, sex: k.sex, fh: k.fh, mh: k.mh, recs: valid, puberty: k.puberty };
    return head +
      '<div class="gc-read"><div><small>身高　' + esc(last.date) + '</small><b>' + (last.h || '—') + '<i>cm</i></b><span>PR ' + (A.hz == null ? '—' : prText(A.hz)) + '</span>' + meter(A.hz) + '</div>' +
      '<div><small>體重</small><b>' + (last.w || '—') + '<i>kg</i></b><span>PR ' + (A.wz == null ? '—' : prText(A.wz)) + '</span>' + meter(A.wz) + '</div>' +
      '<div><small>BMI</small><b>' + (A.bmi ? r1(A.bmi) : '—') + '</b><span>' + (A.cat ? '<em class="gc-pill ' + cls + '">' + A.cat + '</em>' : '') + '</span></div>' +
      '<div><small>一年長高</small><b>' + (V ? r1(V.v) : '—') + '<i>cm</i></b><span>' + (V ? '同齡中位數約 ' + r1(V.ref) : '需相隔 6 個月以上兩筆') + '</span></div></div>' +
      '<div class="gc-tabs" role="group" aria-label="曲線種類"><button type="button" data-gcm="h" class="' + (metric === 'h' ? 'on' : '') + '">身高</button><button type="button" data-gcm="w" class="' + (metric === 'w' ? 'on' : '') + '">體重</button><button type="button" data-gcm="bmi" class="' + (metric === 'bmi' ? 'on' : '') + '">BMI</button></div>' +
      '<div class="gc-chart">' + chart(kk) + '</div>' +
      '<p class="gc-leg">' + (metric === 'bmi' ? '綠：正常　淡橘：過輕／過重　紅：肥胖' : '深色帶：P25–P75　淺色帶：P3–P97　虛線：P50 中位數') + '　橘線：' + esc(k.name) + (k.puberty.length ? '　直線：青春期觀察紀錄' : '') + '</p>' +
      '<h4>生長提醒</h4><ul class="gc-al">' + compass(kk).map(function (o) { return '<li class="' + o[0] + '"><b>' + esc(o[1]) + '</b><span>' + esc(o[2]) + '</span></li>'; }).join('') + '</ul>' +
      '<h4>家庭靶身高與目前軌道</h4><dl class="gc-gen"><dt>家庭靶身高</dt><dd>' + (Tg ? r1(Tg.mid) + ' cm（' + Math.round(Tg.lo) + '–' + Math.round(Tg.hi) + '）' : '填入父母身高即可計算') + '</dd>' +
      '<dt>照目前百分位延伸到成年</dt><dd>' + (pj ? '約 ' + Math.round(pj) + ' cm' : '—') + '</dd>' +
      '<dt>兩者比較</dt><dd>' + (Tg && pj ? (pj < Tg.lo ? '低於家庭參考範圍' : pj > Tg.hi ? '高於家庭參考範圍' : '在家庭參考範圍內') : '—') + '</dd></dl>' +
      LIMITS + '</div>';
  }

  function summaryLines(k) {
    if (!k || !k.sex) return '';
    var valid = k.recs.filter(function (r) { var ra = ageAt(k.birth, r.date); return ra >= 2 && ra <= 18.01; });
    if (!valid.length) return '';
    var last = valid[valid.length - 1], A = an(k, last), V = velocity({ birth: k.birth, sex: k.sex, recs: valid }), Tg = target(k);
    var L = ['生長曲線（台灣參考值，' + (k.sex === 'M' ? '男' : '女') + '）：',
      '・' + last.date + '（' + ageText(A.age) + '）身高 ' + (last.h || '—') + ' cm／PR ' + (A.hz == null ? '—' : prText(A.hz)) + '，體重 ' + (last.w || '—') + ' kg／PR ' + (A.wz == null ? '—' : prText(A.wz)) + (A.bmi ? '，BMI ' + r1(A.bmi) + '（' + A.cat + '）' : '')];
    if (V) L.push('・一年長高 ' + r1(V.v) + ' cm（' + V.from.date + ' 至 ' + V.to.date + '）');
    if (Tg) L.push('・家庭靶身高 ' + r1(Tg.mid) + ' cm（父 ' + k.fh + '／母 ' + k.mh + '）');
    var al = compass({ id: k.id, name: k.name, birth: k.birth, sex: k.sex, fh: k.fh, mh: k.mh, recs: valid, puberty: k.puberty }).filter(function (o) { return o[0] === 'alert' || o[0] === 'warn'; });
    if (al.length) L.push('・工具提醒：' + al.map(function (o) { return o[1]; }).join('；'));
    return L.join('\n');
  }

  /* ---------- injection ---------- */
  function activeTab() { var b = app.querySelector('[data-tab].on'); return b ? b.getAttribute('data-tab') : null; }
  var busy = false;
  function enhance() {
    if (busy) return; busy = true;
    try {
      var panel = document.getElementById('bp-panel'), tab = activeTab(), k = currentChild();
      var dlgB = document.getElementById('f-bday');
      if (dlgB && !dlgB.dataset.gc) { dlgB.dataset.gc = '1'; dlgB.min = addYears(today(), -18); var lab = dlgB.closest('label'); if (lab) lab.insertAdjacentHTML('beforeend', '<small class="gc-hint">適用 18 歲以下</small>'); }
      if (!panel || !k) return;
      if (tab === 'growth' && !panel.querySelector('.gc')) {
        var old = panel.querySelector('.bp-chart'); if (old) { var nx = old.nextElementSibling; old.remove(); if (nx && nx.classList.contains('muted')) nx.remove(); }
        panel.querySelectorAll('.note').forEach(function (n) { if (n.textContent.indexOf('不計算百分位') >= 0) n.innerHTML = '百分位與曲線請看上方「台灣生長曲線」。未滿 2 歲請用兒童健康手冊或 <a href="https://health99.hpa.gov.tw/health99/HC/D/115/ChildGrowthCurve" target="_blank" rel="noopener">國健署兒童生長曲線工具</a> 對照。每筆紀錄右邊的 × 可以刪除登錄錯誤的資料。'; });
        var d = document.getElementById('gr-date'); if (d) { d.min = k.birth; var e18 = addYears(k.birth, 18); if (e18 < today()) d.max = e18; }
        panel.insertAdjacentHTML('afterbegin', growthPanel(k));
        bindPanel(panel);
      }
      if (tab === 'visit') {
        var ta = document.getElementById('bp-summary');
        if (ta && !ta.dataset.gc) { ta.dataset.gc = '1'; var add = summaryLines(k); if (add) { var t = ta.value, mark = '\n\n這次最想問醫師的事：'; var i = t.lastIndexOf(mark); ta.value = i >= 0 ? t.slice(0, i) + '\n\n' + add + t.slice(i) : t + '\n\n' + add; } }
      }
    } finally { busy = false; }
  }
  function redraw() { var p = document.getElementById('bp-panel'); if (!p) return; var g = p.querySelector('.gc'); if (g) g.remove(); enhance(); }
  function bindPanel(panel) {
    panel.querySelectorAll('[data-gcsex]').forEach(function (b) { b.onclick = function () { var k = currentChild(); if (!k) return; setField(k.id, 'sex', b.getAttribute('data-gcsex')); redraw(); }; });
    panel.querySelectorAll('[data-gcm]').forEach(function (b) { b.onclick = function () { metric = b.getAttribute('data-gcm'); redraw(); }; });
    ['gc-fh', 'gc-mh'].forEach(function (id) { var el = document.getElementById(id); if (!el) return; el.onchange = function () { var k = currentChild(); if (!k) return; var v = parseFloat(el.value); if (el.value && !(v >= 120 && v <= 220)) { el.value = ''; return; } setField(k.id, id === 'gc-fh' ? 'fh' : 'mh', v || null); redraw(); }; });
  }
  /* block growth entries outside birth..18th birthday (capture phase, before blueprint saves) */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-act=growth]'); if (!b) return;
    var k = currentChild(), d = document.getElementById('gr-date'); if (!k || !d || !d.value) return;
    var msg = d.value < k.birth ? '量測日期早於生日，請確認。' : d.value > addYears(k.birth, 18) ? '本工具只記錄到 18 歲生日。' : '';
    if (msg) { e.preventDefault(); e.stopImmediatePropagation(); var t = document.getElementById('toast'); if (t) { t.textContent = msg; t.classList.add('show'); setTimeout(function () { t.classList.remove('show'); }, 2400); } else d.setCustomValidity(msg), d.reportValidity(), d.setCustomValidity(''); }
  }, true);

  var css = '.gc h4{font-size:15px;margin:18px 0 8px}.gc-setup{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:10px 0 14px}' +
    '.gc-sex{display:inline-flex;align-items:center;gap:6px}.gc-sex span{font-size:14px;color:#6E7671}.gc-sex button,.gc-tabs button{border:1.5px solid #E8E3DA;background:#fff;border-radius:999px;padding:5px 14px;font:inherit;font-size:14px;cursor:pointer;color:#2A302D}' +
    '.gc-sex button.on,.gc-tabs button.on{background:#3A6356;border-color:#3A6356;color:#fff}.gc-setup label{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:#6E7671}' +
    '.gc-setup input{width:92px;border:1.5px solid #E8E3DA;border-radius:8px;padding:6px 8px;font:inherit;color:#2A302D;background:#fff}' +
    '.gc-read{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:6px 0 14px}@media(max-width:640px){.gc-read{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.gc-read>div{border:1px solid #E8E3DA;border-radius:12px;padding:10px 12px;background:#fff;min-width:0}.gc-read small{display:block;color:#6E7671;font-size:12px}' +
    '.gc-read b{display:block;font-size:22px;font-variant-numeric:tabular-nums;line-height:1.3}.gc-read i{font-style:normal;font-size:12px;color:#6E7671;margin-left:3px}.gc-read span{font-size:13px}' +
    '.gc-meter{position:relative;height:6px;border-radius:3px;margin-top:6px;background:linear-gradient(90deg,#F4DCD3 0 3%,#EEF3F0 3% 25%,#CFE0D8 25% 75%,#EEF3F0 75% 97%,#F4DCD3 97%)}.gc-meter b{position:absolute;top:-4px;width:3px;height:14px;background:#B86B52;border-radius:2px;transform:translateX(-50%)}' +
    '.gc-pill{font-style:normal;font-size:12px;padding:1px 9px;border-radius:999px}.gc-pill.ok{background:#E3F0E8;color:#2E6B48}.gc-pill.warn{background:#FAEFDC;color:#9A6516}.gc-pill.alert{background:#F6E0DC;color:#A23B30}' +
    '.gc-tabs{display:flex;gap:6px;margin-bottom:6px}.gc-chart{overflow-x:auto}.gc-svg{display:block;width:100%;min-width:460px;height:auto}' +
    '.gc-g{stroke:#E8E3DA}.gc-ax{fill:#6E7671;font-size:11px}.gc-b1{fill:#EEF3F0}.gc-b2{fill:#CFE0D8}.gc-pc{fill:none;stroke:#8FA89D;stroke-width:.8}.gc-med{fill:none;stroke:#3A6356;stroke-width:1.6;stroke-dasharray:5 4}.gc-pl{fill:#6E7671;font-size:10.5px}' +
    '.gc-z0{fill:#E3F0E8}.gc-z1{fill:#FAEFDC}.gc-z2{fill:#F6E0DC}.gc-line{fill:none;stroke:#B86B52;stroke-width:2.6;stroke-linejoin:round}.gc-pt{fill:#fff;stroke:#B86B52;stroke-width:2.2}.gc-lab{fill:#B86B52;font-size:12px;font-weight:600}' +
    '.gc-t{fill:#3A6356;opacity:.18}.gc-tl{stroke:#3A6356;stroke-width:2}.gc-tt{fill:#3A6356;font-size:11px}.gc-ev{stroke:#B86B52;stroke-dasharray:2 3;opacity:.6}.gc-evt{fill:#B86B52;font-size:10.5px}' +
    '.gc-leg{font-size:12px;color:#6E7671;margin:4px 0 0}.gc-al{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}' +
    '.gc-al li{border-left:4px solid #8FA89D;background:#F9F7F3;border-radius:0 10px 10px 0;padding:8px 12px}.gc-al li.ok{border-color:#3A8A5E}.gc-al li.warn{border-color:#C58A2B}.gc-al li.alert{border-color:#B8483B}' +
    '.gc-al b{display:block}.gc-al span{font-size:14px;color:#6E7671}.gc-gen{display:grid;grid-template-columns:auto 1fr;gap:6px 14px;margin:0;font-size:14px}.gc-gen dt{color:#6E7671}.gc-gen dd{margin:0;font-variant-numeric:tabular-nums}' +
    '.gc-lim{margin-top:16px;border:1px solid #E8E3DA;border-radius:12px;padding:10px 14px;background:#F9F7F3}.gc-lim summary{cursor:pointer;font-weight:600}.gc-lim ul{margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.7}' +
    '.gc-hint{display:block;color:#6E7671;font-size:12px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  new MutationObserver(function () { if (!busy) requestAnimationFrame(enhance); }).observe(app, { childList: true, subtree: true });
  migrate();
  enhance();
})();
