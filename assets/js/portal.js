/* Portal do proprietário (demonstração com dados fictícios). Mesmas telas e cálculos da versão anterior, com textos mais simples. */
(function () {
  'use strict';
  var O = window.Orbita, $ = O.$, BRL = O.BRL, NUM = O.NUM, pad = O.pad, esc = O.esc, clamp = O.clamp, safe = O.safe, D = O.data;
  var P = D.P, M = D.M, NCH = D.NCH, HOJE = D.HOJE, PF = D.PF, ADM = D.ADM, HOL = D.HOL;
  var st = { tab: 'resumo', m: 6, cal: 1, blocks: [], blkMsg: '', goal: 8500, msg: 'bloqueio' };
  safe(function () { var g = +localStorage.getItem('orbita-meta'); if (g >= 500) st.goal = g; });

  var authed = false;
  safe(function () { authed = sessionStorage.getItem('orbita-auth') === '1'; });
  function paintAuth() { $('portal-login').hidden = authed; $('portal-app').hidden = !authed; }

  var fmtD = function (s, mo) { return pad(s) + '/' + pad(mo + 1); };
  var pct = function (x) { return Math.round(x * 100) + '%'; };
  var delta = function (cur, prev, label) {
    if (!prev) return '';
    var d = (cur - prev) / prev * 100, up = d >= 0;
    return '<span class="delta ' + (up ? 'up' : 'down') + '">' + (up ? '▲ ' : '▼ ') + Math.abs(d).toFixed(1).replace('.', ',') + '% em relação a ' + label + '</span>';
  };

  function renderMonths() {
    $('months').innerHTML = M.slice(0, NCH).map(function (m, i) { return '<button type="button" data-m="' + i + '" aria-pressed="' + (i === st.m) + '">' + m.k + '</button>'; }).join('');
  }

  /* --- meta do mês --- */
  function goalCard() {
    var m = M[st.m], t = D.total(st.m), goal = st.goal, p = goal ? t.rep / goal : 0;
    var perNightSold = t.noites ? t.rep / t.noites : 0;
    var needNights = perNightSold ? goal / perNightSold : 0, needOcc = needNights / t.disp;
    var diffNights = Math.round(needNights - t.noites), title, badge;
    if (m.partial) { title = 'Já reservado: ' + pct(p) + ' da meta'; badge = '<span class="badge wait">Mês em andamento</span>'; }
    else if (p >= 1) { title = 'Meta batida: ' + pct(p) + ' do que você queria'; badge = '<span class="badge ok">Atingida</span>'; }
    else { title = 'Você chegou a ' + pct(p) + ' da meta'; badge = '<span class="badge wait">Abaixo da meta</span>'; }
    var rest = goal - t.rep, sub;
    if (m.partial) sub = rest > 0 ? 'Faltam ' + BRL(rest) + ' em reservas, o equivalente a cerca de ' + Math.max(0, diffNights) + ' noites a mais.' : 'As reservas já cobrem a sua meta.';
    else sub = p >= 1 ? 'Você passou da meta em ' + BRL(-rest) + '.' : 'Faltaram ' + BRL(rest) + ', cerca de ' + Math.max(0, diffNights) + ' noites ocupadas a mais.';
    var w = Math.min(100, p * 100);
    return '<div class="panel goal">' +
      '<div class="gh"><div><p class="eyebrow">Sua meta de ' + m.k + ' ' + badge + '</p><h3>' + title + '</h3></div>' +
      '<div class="gset"><label for="goal-in">Quanto quero receber</label><div class="stepper"><span class="pre">R$</span><input id="goal-in" type="number" inputmode="numeric" min="500" step="100" value="' + goal + '"></div></div></div>' +
      '<div><div class="gbar" role="img" aria-label="' + pct(p) + ' da meta"><i class="' + (p >= 1 ? 'over' : '') + '" style="width:' + w + '%"></i></div>' +
      '<div class="glab"><span class="num">' + (m.partial ? 'Reservado: ' : 'Recebido: ') + '<b>' + BRL(t.rep) + '</b></span><span class="num">Meta: <b>' + BRL(goal) + '</b></span></div></div>' +
      '<p>' + sub + '</p>' +
      '<div class="gstats">' +
      '<div><span>Ocupação para chegar na meta</span><b class="num">' + pct(needOcc) + '</b></div>' +
      '<div><span>Ocupação ' + (m.partial ? 'reservada' : 'do mês') + '</span><b class="num">' + pct(t.noites / t.disp) + '</b></div>' +
      '<div><span>Você recebe por noite ocupada</span><b class="num">' + BRL(perNightSold) + '</b></div>' +
      '</div></div>';
  }

  /* --- gráfico --- */
  function chart() {
    var vals = [], i; for (i = 0; i < NCH; i++) vals.push(D.total(i).rep);
    var max = Math.max.apply(null, vals.concat([st.goal])) * 1.15;
    var W = 640, H = 250, base = 215, top = 30, bw = 56, gap = (W - 32 - bw * vals.length) / (vals.length - 1);
    var out = '<line x1="16" y1="' + base + '" x2="' + (W - 16) + '" y2="' + base + '"/>';
    vals.forEach(function (v, i) {
      var h = v / max * (base - top), x = 16 + i * (bw + gap), y = base - h;
      out += '<rect class="b' + (i === st.m ? ' sel' : '') + (M[i].partial ? ' part' : '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw + '" height="' + h.toFixed(1) + '" rx="3"/>';
      out += '<text class="val" x="' + (x + bw / 2).toFixed(1) + '" y="' + (y - 8).toFixed(1) + '" text-anchor="middle">' + (v / 1000).toFixed(1).replace('.', ',') + '</text>';
      out += '<text x="' + (x + bw / 2).toFixed(1) + '" y="' + (base + 22) + '" text-anchor="middle">' + M[i].k.slice(0, 3) + '</text>';
    });
    var gy = base - st.goal / max * (base - top);
    out += '<line class="goal" x1="16" y1="' + gy.toFixed(1) + '" x2="' + (W - 16) + '" y2="' + gy.toFixed(1) + '"/>';
    out += '<text class="gl" x="' + (W - 16) + '" y="' + (gy - 8).toFixed(1) + '" text-anchor="end">Meta ' + (st.goal / 1000).toFixed(1).replace('.', ',') + ' mil</text>';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Quanto você recebeu em cada mês, de maio a novembro de 2026, em milhares de reais, com a linha da sua meta">' + out + '</svg>';
  }

  /* --- resumo --- */
  function nov() { var r = []; P.forEach(function (p) { D.genRes(p, 6).forEach(function (x) { r.push(x); }); }); return r.sort(function (a, b) { return a.s - b.s; }); }
  function vResumo() {
    var m = M[st.m], t = D.total(st.m), pv = st.m > 0 ? D.total(st.m - 1) : null, prevK = st.m > 0 ? M[st.m - 1].k : '';
    var adr = t.noites ? t.gross / t.noites : 0, occ = t.noites / t.disp;
    var h = '<div class="kpis">' +
      '<div class="kpi hl"><div class="l">' + (m.partial ? 'Você deve receber (reservas até agora)' : 'Você recebeu') + '</div><div class="v num">' + BRL(t.rep) + '</div>' + (m.partial ? '<span class="delta muted">dados até 03/11</span>' : delta(t.rep, pv && pv.rep, prevK)) + '</div>' +
      '<div class="kpi"><div class="l">Ocupação</div><div class="v num">' + pct(occ) + '</div>' + (m.partial ? '' : delta(occ, pv && pv.noites / pv.disp, prevK)) + '</div>' +
      '<div class="kpi"><div class="l">Preço médio da noite</div><div class="v num">' + BRL(adr) + '</div>' + (m.partial ? '' : delta(adr, pv && pv.gross / pv.noites, prevK)) + '</div>' +
      '<div class="kpi"><div class="l">Noites ' + (m.partial ? 'reservadas' : 'ocupadas') + '</div><div class="v num">' + t.noites + '</div><span class="delta muted">de ' + t.disp + ' do mês</span></div></div>';
    h += goalCard();
    var rs = nov().filter(function (x) { return x.s >= 3; }).slice(0, 4), fe = nov().slice(0, 3), f11 = D.total(6), f12 = D.total(7);
    h += '<div class="grid2"><div class="panel"><h3>Quanto você recebeu, mês a mês</h3>' + chart() + '<p class="note">Em milhares de reais, somando seus dois imóveis ativos. A barra mais clara é o mês em andamento.</p></div>' +
      '<div class="stack"><div class="panel"><h3>Quem chega em breve</h3><div class="tw"><table class="rt c3"><thead><tr><th>Entrada</th><th class="l">Imóvel e hóspede</th><th>Canal</th><th>Noites</th></tr></thead><tbody>' +
      rs.map(function (r) { return '<tr><td class="num" data-l="Entrada">' + fmtD(r.s, 10) + '</td><td class="l" data-l="Imóvel">' + P[r.pid - 1].curto + ' · ' + r.guest + '</td><td data-l="Canal">' + r.canal + '</td><td class="num" data-l="Noites">' + r.L + '</td></tr>'; }).join('') +
      '</tbody></table></div></div>' +
      '<div class="panel"><h3>O que já está reservado</h3><div class="tw"><table><thead><tr><th>Mês</th><th>Noites</th><th>Você recebe</th></tr></thead><tbody>' +
      '<tr><td>Nov/26</td><td class="num">' + f11.noites + '</td><td class="num">' + BRL(f11.rep) + '</td></tr>' +
      '<tr><td>Dez/26</td><td class="num">' + f12.noites + '</td><td class="num">' + BRL(f12.rep) + '</td></tr></tbody></table></div>' +
      '<p class="note">O valor cresce conforme novas reservas entram. Nós ajustamos o preço das noites livres.</p></div></div></div>';
    h += '<div class="panel"><h3>Novidades</h3><ul class="feed">' +
      fe.map(function (r) { return '<li><span><b>Reserva confirmada</b> · ' + P[r.pid - 1].curto + ' · ' + r.guest + ' · ' + fmtD(r.s, 10) + ' a ' + fmtD(r.e, 10) + ' · ' + r.canal + '</span></li>'; }).join('') +
      '<li><span><b>Extrato de Out/26 disponível</b> · repasse previsto para 10/11</span></li></ul></div>';
    return h;
  }

  /* --- calendário --- */
  function vCal() {
    var p = P[st.cal - 1], m = M[st.m], r = D.genRes(p, st.m), first = new Date(2026, m.mo, 1).getDay(), map = {};
    r.forEach(function (x) { for (var d = x.s; d < x.s + x.L; d++) map[d] = { x: x, first: d === x.s }; });
    var blocked = function (d) { return st.blocks.some(function (b) { return b.pid === p.id && b.from <= new Date(2026, m.mo, d) && new Date(2026, m.mo, d) <= b.to; }); };
    var cells = '', i;
    ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].forEach(function (x) { cells += '<div class="dw">' + x + '</div>'; });
    for (i = 0; i < first; i++) cells += '<div class="c off"></div>';
    for (var d = 1; d <= m.d; d++) {
      var isHol = HOL[m.mo + '-' + d], isToday = (m.mo === HOJE.getMonth() && d === HOJE.getDate()), o = map[d], b = blocked(d), cls = 'c', body;
      if (b) { cls += ' blk'; body = '<span class="p">Seu uso</span>'; }
      else if (o) { cls += ' res'; body = '<span class="p">' + (o.first ? esc(o.x.guest.split(' ')[0]) : '·') + '</span>'; }
      else body = '<span class="p">' + NUM(D.price(p, st.m, d)) + '</span>';
      if (isToday) cls += ' today';
      cells += '<div class="' + cls + '"><span class="d"><span>' + d + '</span>' + (isHol ? '<span class="h" title="Feriado">●</span>' : '') + '</span>' + body + '</div>';
    }
    var h = '<div class="panel"><div class="calhead"><div><h3>' + p.nome + ' · ' + p.end + '</h3><p class="muted small">' + m.k + '. Nas noites livres, o número é o preço da noite, em reais.</p></div>' +
      '<div class="seg" role="group" aria-label="Imóvel">' + P.map(function (q) { return '<button type="button" data-cal="' + q.id + '" aria-pressed="' + (q.id === st.cal) + '">' + q.curto + '</button>'; }).join('') + '</div></div>' +
      '<div class="cal">' + cells + '</div>' +
      '<div class="legend"><span><i class="lg-res"></i>Reservado</span><span><i class="lg-blk"></i>Seu uso</span><span><i class="lg-free"></i>Livre, com preço</span><span><b class="hdot">●</b> Feriado: preço mais alto</span></div></div>';
    h += '<div class="grid2"><div class="panel"><h3>Vai usar o imóvel?</h3><p class="muted small">Escolha as datas e a sua gestora confirma com você.</p>' +
      '<div class="two-f"><div class="fld"><label for="blk-from">De</label><input type="date" id="blk-from" min="2026-11-03" value="2026-12-24"></div><div class="fld"><label for="blk-to">Até</label><input type="date" id="blk-to" min="2026-11-03" value="2026-12-27"></div></div>' +
      '<button class="btn block" type="button" id="blk-go">Reservar essas datas para mim</button>' +
      '<p class="small" id="blk-msg" aria-live="polite">' + st.blkMsg + '</p><p class="note">Na demonstração, o pedido aparece só neste calendário. Na operação, a gestora confirma e o calendário dos canais é atualizado.</p></div>' +
      '<div class="panel"><h3>Como o preço de cada noite é definido</h3><div class="kv"><span>Preço base do mês</span><span class="num">' + BRL(p.adr[st.m]) + '</span></div><div class="kv"><span>Sexta e sábado</span><span class="num">+12%</span></div><div class="kv"><span>Domingo a quinta</span><span class="num">−3%</span></div><div class="kv"><span>Feriados nacionais</span><span class="num">+25%</span></div><p class="note">Regras de demonstração. Na operação, o preço também considera demanda, antecedência e eventos da cidade.</p></div></div>';
    return h;
  }
  function doBlock() {
    var f = $('blk-from').value, t = $('blk-to').value, p = P[st.cal - 1];
    if (!f || !t) { st.blkMsg = 'Escolha as duas datas.'; return; }
    var from = new Date(f + 'T00:00:00'), to = new Date(t + 'T00:00:00');
    if (to < from) { st.blkMsg = 'A data final precisa ser depois da inicial.'; return; }
    for (var d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      var mi = M.findIndex(function (m) { return m.mo === d.getMonth() && d.getFullYear() === 2026; });
      if (mi >= 0 && D.genRes(p, mi).some(function (x) { return d.getDate() >= x.s && d.getDate() < x.s + x.L; })) { st.blkMsg = 'Já existe reserva em ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '. Escolha outras datas ou fale com a sua gestora.'; return; }
    }
    st.blocks.push({ pid: p.id, from: from, to: to });
    st.blkMsg = 'Pedido enviado para o ' + p.curto + ', de ' + pad(from.getDate()) + '/' + pad(from.getMonth() + 1) + ' a ' + pad(to.getDate()) + '/' + pad(to.getMonth() + 1) + '. A Camila confirma com você em breve.';
  }

  /* --- extrato --- */
  function vExtrato() {
    var m = M[st.m], T = D.total(st.m), all = [];
    P.forEach(function (p) { D.line(p, st.m).res.forEach(function (x) { all.push(x); }); });
    all.sort(function (a, b) { return a.s - b.s || a.pid - b.pid; });
    var pay = new Date(2026, m.mo + 1, 10), paid = pay <= HOJE;
    var payTxt = (paid ? 'Pago em ' : 'Previsto para ') + pad(pay.getDate()) + '/' + pad(pay.getMonth() + 1);
    var h = '<div class="kpis three"><div class="kpi"><div class="l">Os hóspedes pagaram</div><div class="v num">' + BRL(T.gross) + '</div><span class="delta muted">soma das diárias</span></div>' +
      '<div class="kpi"><div class="l">Descontos</div><div class="v num">− ' + BRL(T.plat + T.adm) + '</div><span class="delta muted">plataformas e Órbita</span></div>' +
      '<div class="kpi hl"><div class="l">Seu repasse</div><div class="v num">' + BRL(T.rep) + '</div><span class="delta ' + (paid ? 'up' : 'muted') + '">' + payTxt + '</span></div></div>';
    h += '<div class="panel"><h3>Reserva por reserva · ' + m.k + (m.partial ? ' (até agora)' : '') + '</h3><div class="tw tall"><table class="rt"><thead><tr><th>Entrada</th><th class="l">Imóvel e hóspede</th><th>Canal</th><th>Noites</th><th>Hóspede pagou</th><th>Comissão do canal</th><th>Líquido</th></tr></thead><tbody>' +
      all.map(function (x) { return '<tr><td class="num" data-l="Entrada">' + fmtD(x.s, m.mo) + '</td><td class="l" data-l="Imóvel">' + P[x.pid - 1].curto + ' · ' + x.guest + '</td><td data-l="Canal">' + x.canal + '</td><td class="num" data-l="Noites">' + x.L + '</td><td class="num" data-l="Hóspede pagou">' + BRL(x.gross) + '</td><td class="num" data-l="Comissão do canal">− ' + BRL(x.plat) + '</td><td class="num" data-l="Líquido">' + BRL(x.net) + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<div class="tw sum"><table><tbody>' +
      '<tr class="tot"><td>Diárias líquidas (soma das reservas)</td><td class="num">' + BRL(T.net) + '</td></tr>' +
      '<tr><td>(−) Taxa de administração da Órbita (' + Math.round(ADM * 100) + '%)</td><td class="num">− ' + BRL(T.adm) + '</td></tr>' +
      '<tr><td>Despesas do período</td><td class="num">Nenhuma</td></tr>' +
      '<tr class="hl"><td>Seu repasse</td><td class="num">' + BRL(T.rep) + '</td></tr></tbody></table></div>' +
      '<p class="note">A taxa de limpeza paga pelos hóspedes neste mês foi de <b class="num">' + BRL(T.limp) + '</b>. Ela vai para a equipe de limpeza e não sai do seu repasse. Gastos de manutenção que você aprova aparecem aqui, com comprovante. Como referência, o repasse sai até o dia 10 do mês seguinte.</p>' +
      '<button class="btn ghost" type="button" id="copy-ext">Copiar resumo do extrato</button></div>';
    return h;
  }

  /* --- imóveis --- */
  function spark(arr) {
    var W = 160, H = 40, min = 4.4, max = 5, pts = arr.map(function (v, i) { return [i / (arr.length - 1) * (W - 8) + 4, H - 4 - (v - min) / (max - min) * (H - 8)]; });
    var d = pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' '), l = pts[pts.length - 1];
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="160" height="40" role="img" aria-label="Como a nota evoluiu de maio a novembro"><path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="' + l[0].toFixed(1) + '" cy="' + l[1].toFixed(1) + '" r="3.5" fill="var(--accent)"/></svg>';
  }
  function vImoveis() {
    var h = '<div class="props">';
    P.forEach(function (p) {
      var l = D.line(p, st.m), o = Math.round(l.noites / l.disp * 100);
      h += '<div class="panel"><div class="ph"><div><h3>' + p.nome + '</h3><p class="muted small">' + p.end + '</p></div><span class="badge ok">No ar</span></div>' +
        '<div class="kv"><span>Ocupação em ' + M[st.m].k + '</span><span class="num">' + o + '%</span></div><div class="bar" aria-hidden="true"><i style="width:' + o + '%"></i></div>' +
        '<div class="kv"><span>Preço médio da noite</span><span class="num">' + BRL(l.noites ? l.gross / l.noites : 0) + '</span></div>' +
        '<div class="kv"><span>Anúncios</span><span>Airbnb · Booking · VRBO</span></div>' +
        '<div class="kv"><span>Nota no Airbnb</span><span class="num">' + p.air + ' de 5</span></div>' +
        '<div class="kv"><span>Nota no Booking</span><span class="num">' + p.book + ' de 10</span></div>' +
        '<div class="kv"><span>Nota no VRBO</span><span class="num">' + p.vrbo + ' de 5</span></div>' +
        '<div class="kv"><span>Avaliações recebidas</span><span class="num">' + p.aval + '</span></div>' +
        '<div class="kv"><span>Nota de maio a novembro</span><span>' + spark(p.nota) + '</span></div>' +
        '<div class="ph-act"><a class="btn ghost sm" href="#imovel-' + p.id + '">Ver página do imóvel</a></div></div>';
    });
    var steps = [['Vistoria do imóvel', 'ok'], ['Fotos profissionais', 'ok'], ['Anúncios nos três canais', 'wait'], ['Primeira reserva', 'todo']];
    h += '<div class="panel"><div class="ph"><div><h3>Apto 1 quarto</h3><p class="muted small">CLSW 103 · Sudoeste</p></div><span class="badge wait">Sendo preparado</span></div>' +
      steps.map(function (s) { return '<div class="check"><span class="badge ' + s[1] + '">' + (s[1] === 'ok' ? 'Feito' : s[1] === 'wait' ? 'Em andamento' : 'A seguir') + '</span><span>' + s[0] + '</span></div>'; }).join('') +
      '<p class="note">Agora a Camila está publicando os anúncios. Quando estiverem no ar, ela avisa você.</p></div></div>' +
      '<p class="note">Uma boa nota ajuda o anúncio a aparecer mais e a ter mais reservas. Notas e quantidades de demonstração.</p>';
    return h;
  }

  /* --- atendimento --- */
  var MSG = {
    bloqueio: 'Olá, Camila! Quero reservar datas do Apto 2 quartos (SQS 308) de __/__ a __/__ para uso próprio.',
    manut: 'Olá, Camila! Preciso de uma manutenção no Studio (SQN 205): [descreva o problema].',
    repasse: 'Olá, Camila! Tenho uma dúvida sobre o extrato de ' + M[5].k + ': [qual linha?].',
    meta: 'Olá, Camila! Quero ajustar minha meta de [valor atual] para [novo valor]. O que você sugere para os próximos meses?',
    indicar: 'Olá, Camila! Quero indicar um proprietário ou síndico para a Órbita: [nome e contato].'
  };
  function vSuporte() {
    var wa = O.waLink(MSG[st.msg]);
    return '<div class="grid2"><div class="stack"><div class="panel"><div class="agent"><div class="avatar" aria-hidden="true">CR</div><div><h3>Camila R.</h3><p class="muted small">Sua gestora de conta, só para os seus imóveis</p></div></div>' +
      '<div class="kv"><span>Como falar com ela</span><span>WhatsApp</span></div>' +
      '<div class="kv"><span>Seus hóspedes</span><span>Atendidos 24h pelo WhatsApp</span></div></div>' +
      '<div class="panel"><h3>Seus pedidos</h3>' +
      '<div class="doc"><div><b>Troca de lâmpadas da sala</b><p class="muted small">Apto 2 quartos · aberto em 30/10</p></div><span class="badge wait">Em andamento</span></div>' +
      '<div class="doc"><div><b>Datas de 24 a 27/12 reservadas para você</b><p class="muted small">Studio · pedido em 28/10</p></div><span class="badge ok">Confirmado</span></div></div></div>' +
      '<div class="stack"><div class="panel"><h3>Fale com a Camila</h3><p class="muted small">Escolha o assunto, ajuste a mensagem e envie.</p>' +
      '<div class="chips" id="msgchips">' + [['bloqueio', 'Reservar datas para mim'], ['manut', 'Pedir manutenção'], ['repasse', 'Dúvida no repasse'], ['meta', 'Ajustar minha meta'], ['indicar', 'Indicar um proprietário']].map(function (c) { return '<button type="button" class="chip" data-msg="' + c[0] + '" aria-pressed="' + (st.msg === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div>' +
      '<div class="field"><label for="msgbox">Mensagem</label><textarea id="msgbox">' + esc(MSG[st.msg]) + '</textarea></div>' +
      '<div class="sharebtns">' + (wa ? '<a class="btn" id="open-wa" href="' + esc(wa) + '" target="_blank" rel="noopener">Abrir no WhatsApp</a>' : '') + '<button class="btn' + (wa ? ' ghost' : '') + '" type="button" id="copy-msg">Copiar mensagem</button></div></div>' +
      '<div class="panel"><h3>Dúvidas frequentes</h3>' +
      '<details class="faq flat"><summary>Como o repasse é calculado?</summary><p>Somamos o que os hóspedes pagaram e tiramos a comissão das plataformas. Sobre o que sobra, a Órbita cobra a taxa de administração de 20%. O restante é seu repasse. O extrato mostra cada reserva.</p></details>' +
      '<details class="faq flat"><summary>Quem paga a limpeza?</summary><p>O hóspede, pela taxa de limpeza da reserva. Ela não sai do seu repasse.</p></details>' +
      '<details class="faq flat"><summary>Preciso ir ao imóvel?</summary><p>Não. Check-in, limpeza, manutenção e atendimento ficam com a equipe local da Órbita.</p></details></div></div></div>';
  }

  /* --- montagem --- */
  var VIEWS = { resumo: vResumo, cal: vCal, extrato: vExtrato, imoveis: vImoveis, divulgar: function () { return O.share.html(); }, suporte: vSuporte };
  function render(keepScroll) {
    renderMonths();
    var tabs = O.qsa('#tabs button');
    tabs.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === st.tab ? 'true' : 'false'); });
    $('months').hidden = (st.tab === 'divulgar' || st.tab === 'suporte' || st.tab === 'imoveis');
    var y = window.scrollY;
    $('pbody').innerHTML = VIEWS[st.tab]();
    if (st.tab === 'divulgar') O.share.after();
    if (keepScroll) window.scrollTo(0, y);
    var act = document.querySelector('#tabs [aria-selected="true"]');
    if (act && act.scrollIntoView && !O.reduceMotion()) { var box = $('tabs'); box.scrollTo({ left: act.offsetLeft - (box.clientWidth - act.offsetWidth) / 2, behavior: 'smooth' }); }
    else if (act) { $('tabs').scrollLeft = act.offsetLeft - 16; }
  }
  $('months').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.m = +b.getAttribute('data-m'); render(true); });
  $('tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.tab = b.getAttribute('data-tab'); render(false); });
  $('pbody').addEventListener('change', function (e) {
    if (e.target.id === 'goal-in') { var v = clamp(Math.round(+e.target.value || 0), 500, 200000); st.goal = v; safe(function () { localStorage.setItem('orbita-meta', String(v)); }); render(true); }
  });
  $('pbody').addEventListener('input', function (e) { if (st.tab === 'divulgar') O.share.input(e); });
  $('pbody').addEventListener('click', function (e) {
    if (st.tab === 'divulgar' && O.share.click(e, function () { render(true); })) return;
    var cp = e.target.closest('[data-cal]');
    if (cp) { st.cal = +cp.getAttribute('data-cal'); st.blkMsg = ''; render(true); return; }
    var c = e.target.closest('[data-msg]');
    if (c) { st.msg = c.getAttribute('data-msg'); render(true); return; }
    if (e.target.id === 'copy-msg') { O.copy($('msgbox').value, e.target, $('msgbox')); return; }
    if (e.target.id === 'blk-go') { doBlock(); render(true); var mm = $('blk-msg'); if (mm && mm.scrollIntoView) mm.scrollIntoView({ block: 'nearest' }); return; }
    if (e.target.id === 'copy-ext') {
      var T = D.total(st.m);
      O.copy('Extrato ' + M[st.m].k + ': os hóspedes pagaram ' + BRL(T.gross) + '; comissão das plataformas − ' + BRL(T.plat) + '; taxa de administração − ' + BRL(T.adm) + '; seu repasse ' + BRL(T.rep) + '.', e.target);
    }
  });
  /* o botão "Abrir no WhatsApp" usa o texto editado */
  $('pbody').addEventListener('input', function (e) {
    if (e.target.id === 'msgbox') { var a = $('open-wa'); if (a) a.href = O.waLink(e.target.value); }
  });

  /* entrada */
  function login() { authed = true; safe(function () { sessionStorage.setItem('orbita-auth', '1'); }); paintAuth(); render(false); window.scrollTo(0, 0); }
  $('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var u = $('login-user').value.trim(), pw = $('login-pass').value;
    if (!u || !pw) { $('login-err').textContent = 'Preencha o e-mail e a senha para entrar.'; return; }
    $('login-err').textContent = ''; $('login-pass').value = ''; login();
  });
  $('login-demo').addEventListener('click', function () { $('login-err').textContent = ''; login(); });
  $('logout').addEventListener('click', function () { authed = false; safe(function () { sessionStorage.removeItem('orbita-auth'); }); paintAuth(); window.scrollTo(0, 0); });

  O.hooks.portal = function () { paintAuth(); if (authed) render(false); };
  render(false);
})();
