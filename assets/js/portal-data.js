/* Dados fictícios e cálculos do portal de demonstração. Na operação real, estes dados virão do sistema da Órbita. */
(function () {
  'use strict';
  var O = window.Orbita;

  var D = O.data = {};
  D.PF = 0.15; D.ADM = 0.20; D.LIMP = 120;
  D.HOJE = new Date(2026, 10, 3);          // data simulada da demonstração
  D.M = [
    { k: 'Mai/26', mo: 4, d: 31 }, { k: 'Jun/26', mo: 5, d: 30 }, { k: 'Jul/26', mo: 6, d: 31 }, { k: 'Ago/26', mo: 7, d: 31 },
    { k: 'Set/26', mo: 8, d: 30 }, { k: 'Out/26', mo: 9, d: 31 }, { k: 'Nov/26', mo: 10, d: 30, partial: true }, { k: 'Dez/26', mo: 11, d: 31, fut: true }
  ];
  D.NCH = 7;                                // meses nos botões (0..6); dezembro é só previsão
  D.P = [
    { id: 1, nome: 'Apto 2 quartos', curto: 'Apto 2Q', end: 'SQS 308 · Asa Sul', regiao: 'Asa Sul',
      adr: [295, 300, 310, 315, 320, 326, 330, 335], occ: [.58, .61, .66, .69, .72, .74, .45, .20],
      nota: [4.7, 4.7, 4.8, 4.8, 4.8, 4.8, 4.9], air: '4,9', book: '9,4', vrbo: '4,8', aval: 38 },
    { id: 2, nome: 'Studio', curto: 'Studio', end: 'SQN 205 · Asa Norte', regiao: 'Asa Norte',
      adr: [215, 220, 225, 235, 240, 245, 250, 255], occ: [.50, .57, .60, .63, .67, .69, .40, .18],
      nota: [4.6, 4.6, 4.7, 4.7, 4.7, 4.7, 4.8], air: '4,8', book: '9,2', vrbo: '4,7', aval: 21 }
  ];
  D.HOL = { '4-1': 1, '5-4': 1, '8-7': 1, '9-12': 1, '10-2': 1, '10-20': 1, '11-25': 1 };
  var NOMES = ['Mariana S.', 'Rafael O.', 'Beatriz L.', 'Thiago M.', 'Camila P.', 'Lucas F.', 'Juliana R.', 'André C.', 'Paula T.', 'Diego N.', 'Larissa V.', 'Bruno A.'];
  var CANAIS = ['Airbnb', 'Airbnb', 'Airbnb', 'Booking', 'Booking', 'VRBO'];

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  D.price = function (p, mi, day) {
    var m = D.M[mi], dow = new Date(2026, m.mo, day).getDay();
    var f = (dow === 5 || dow === 6) ? 1.12 : 0.97;
    if (D.HOL[m.mo + '-' + day]) f = 1.25;
    return Math.round(p.adr[mi] * f / 5) * 5;
  };

  var cache = {};
  D.genRes = function (p, mi) {
    var key = p.id + '-' + mi; if (cache[key]) return cache[key];
    var m = D.M[mi], occ = new Array(m.d + 2).fill(false), T = Math.round(m.d * p.occ[mi]), R = rng(p.id * 1000 + mi * 17 + 5);
    var n = 0, tries = 0, stays = [];
    while (n < T && tries < 500) {
      tries++;
      var L = 2 + Math.floor(R() * 4); if (n + L > T) L = Math.max(1, T - n);
      var s = 1 + Math.floor(R() * (m.d - L + 1)), ok = true, i;
      for (i = s; i < s + L; i++) { if (occ[i]) { ok = false; break; } }
      if (!ok) continue;
      for (i = s; i < s + L; i++) occ[i] = true;
      n += L; stays.push({ s: s, L: L });
    }
    stays.sort(function (a, b) { return a.s - b.s; });
    var out = stays.map(function (x) {
      var gross = 0; for (var d = x.s; d < x.s + x.L; d++) gross += D.price(p, mi, d);
      return { pid: p.id, mi: mi, s: x.s, L: x.L, e: x.s + x.L, guest: NOMES[Math.floor(R() * NOMES.length)], canal: CANAIS[Math.floor(R() * CANAIS.length)], gross: gross, plat: gross * D.PF, net: gross * (1 - D.PF) };
    });
    cache[key] = out; return out;
  };
  D.line = function (p, mi) {
    var r = D.genRes(p, mi), noites = 0, gross = 0;
    r.forEach(function (x) { noites += x.L; gross += x.gross; });
    var plat = gross * D.PF, net = gross - plat, adm = net * D.ADM;
    return { noites: noites, disp: D.M[mi].d, gross: gross, plat: plat, net: net, adm: adm, rep: net - adm, limp: r.length * D.LIMP, res: r };
  };
  D.total = function (mi) {
    var t = { noites: 0, disp: 0, gross: 0, plat: 0, net: 0, adm: 0, rep: 0, limp: 0 };
    D.P.forEach(function (p) { var l = D.line(p, mi); Object.keys(t).forEach(function (k) { t[k] += l[k]; }); });
    return t;
  };
  D.byId = function (id) { return D.P.filter(function (p) { return p.id === +id; })[0] || null; };
})();
