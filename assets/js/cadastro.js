/* Cadastro do imóvel: 3 etapas curtas. Sem servidor: os dados seguem por WhatsApp (ou são copiados). */
(function () {
  'use strict';
  var O = window.Orbita, $ = O.$, esc = O.esc;

  var S, step = 1;
  function fresh() { return { tipo: '', regiao: '', local: '', n: '1', aluga: 'Ainda não', nome: '', wpp: '', email: '', hor: '' }; }
  S = fresh();

  var HEAD = {
    1: ['Conte um pouco sobre o seu imóvel', 'Leva cerca de 2 minutos. Depois, a gente conversa com você.'],
    2: ['Agora, como falamos com você?', 'Usamos seus dados só para falar sobre o seu imóvel.'],
    3: ['Confira e envie', 'Falta só um passo: mandar seus dados para a Órbita.']
  };

  function setPressed(groupId, val) {
    O.qsa('#' + groupId + ' button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === val ? 'true' : 'false'); });
  }
  function fillFields() {
    setPressed('w-tipo', S.tipo); setPressed('w-n', S.n); setPressed('w-aluga', S.aluga); setPressed('w-hor', S.hor);
    $('w-regiao').value = S.regiao; $('w-local').value = S.local;
    $('w-nome').value = S.nome; $('w-wpp').value = S.wpp; $('w-email').value = S.email;
  }
  function clearErr() { O.qsa('#v-cadastrar .err').forEach(function (e) { e.textContent = ''; }); O.qsa('#v-cadastrar [aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); }); }
  function err(id, inputId, msg) { $(id).textContent = msg; if (inputId) $(inputId).setAttribute('aria-invalid', 'true'); }

  function show(n, focus) {
    step = n;
    [1, 2, 3].forEach(function (i) { $('wiz-' + i).hidden = (i !== n); });
    $('wiz-title').textContent = HEAD[n][0]; $('wiz-lead').textContent = HEAD[n][1];
    O.qsa('#wiz-prog i').forEach(function (el, i) { el.className = i < n ? 'on' : ''; });
    $('wiz-prog-t').textContent = 'Etapa ' + n + ' de 3';
    if (n === 3) renderReview();
    if (focus) { window.scrollTo(0, 0); var h = $('wiz-title'); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  function digits(s) { return s.replace(/\D/g, ''); }
  function maskPhone(v) {
    var d = digits(v).slice(0, 11), o = '';
    if (d.length > 0) o = '(' + d.slice(0, 2);
    if (d.length >= 3) o += ') ' + d.slice(2, d.length > 10 ? 7 : 6);
    if (d.length > (d.length > 10 ? 7 : 6)) o += '-' + d.slice(d.length > 10 ? 7 : 6);
    return o;
  }

  function message() {
    var l = ['Olá! Quero cadastrar meu imóvel na Órbita Stays.', ''];
    l.push('Nome: ' + S.nome);
    l.push('Imóvel: ' + S.tipo + ', ' + S.regiao + (S.local ? ' (' + S.local + ')' : ''));
    l.push('Quantos imóveis: ' + (S.n === '3' ? '3 ou mais' : S.n));
    l.push('Já aluga por temporada: ' + S.aluga);
    l.push('WhatsApp: ' + S.wpp);
    if (S.email) l.push('E-mail: ' + S.email);
    if (S.hor) l.push('Melhor horário: ' + S.hor);
    return l.join('\n');
  }

  function renderReview() {
    var rows = [
      ['Imóvel', S.tipo + ', ' + S.regiao + (S.local ? ' · ' + S.local : '')],
      ['Quantos imóveis', S.n === '3' ? '3 ou mais' : S.n],
      ['Já aluga por temporada', S.aluga],
      ['Nome', S.nome], ['WhatsApp', S.wpp]
    ];
    if (S.email) rows.push(['E-mail', S.email]);
    if (S.hor) rows.push(['Melhor horário', S.hor]);
    $('w-review').innerHTML = '<h2>Tudo certo, ' + esc(S.nome.split(' ')[0]) + '?</h2>' +
      rows.map(function (r) { return '<div class="kv"><span>' + r[0] + '</span><span>' + esc(r[1]) + '</span></div>'; }).join('');
    var link = O.waLink(message());
    var send = $('w-send'), copy = $('w-copy');
    send.hidden = !link; copy.hidden = !!link;
    if (link) send.href = link;
    $('w-wa-note').textContent = link
      ? 'Ao tocar em “Enviar pelo WhatsApp”, abrimos a conversa com a Órbita já com seus dados escritos. Falta só você enviar.'
      : 'O WhatsApp da Órbita ainda não foi configurado neste site. Copie a mensagem e envie pelo canal combinado com a equipe.';
  }

  /* etapa 1 */
  function chipGroup(id, key, toggle) {
    $(id).addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S[key] = (toggle && S[key] === b.dataset.v) ? '' : b.dataset.v;
      setPressed(id, S[key]);
      if (key === 'tipo') $('e-tipo').textContent = '';
    });
  }
  chipGroup('w-tipo', 'tipo'); chipGroup('w-n', 'n'); chipGroup('w-aluga', 'aluga'); chipGroup('w-hor', 'hor', true);
  $('w-regiao').addEventListener('change', function () { S.regiao = this.value; if (this.value) { $('e-regiao').textContent = ''; this.removeAttribute('aria-invalid'); } });
  $('w-local').addEventListener('input', function () { S.local = this.value.trim(); });

  $('wiz-1').addEventListener('submit', function (e) {
    e.preventDefault(); clearErr();
    var ok = true;
    if (!S.tipo) { err('e-tipo', null, 'Escolha o tipo do imóvel.'); ok = false; }
    if (!S.regiao) { err('e-regiao', 'w-regiao', 'Escolha a região onde ele fica.'); ok = false; }
    if (!ok) { var f = !S.tipo ? $('w-tipo').querySelector('button') : $('w-regiao'); f.focus(); return; }
    show(2, true);
  });

  /* etapa 2 */
  $('w-nome').addEventListener('input', function () { S.nome = this.value; });
  $('w-email').addEventListener('input', function () { S.email = this.value.trim(); });
  $('w-wpp').addEventListener('input', function () { this.value = maskPhone(this.value); S.wpp = this.value; });
  $('wiz-2').addEventListener('click', function (e) { if (e.target.closest('[data-back]')) show(1, true); });
  $('wiz-2').addEventListener('submit', function (e) {
    e.preventDefault(); clearErr();
    var first = null;
    var bad = function (id, input, msg) { err(id, input, msg); if (!first) first = $(input); };
    if (S.nome.trim().length < 2) bad('e-nome', 'w-nome', 'Conte como podemos chamar você.');
    var d = digits(S.wpp);
    if (d.length < 10 || d.length > 11) bad('e-wpp', 'w-wpp', 'Confira o WhatsApp: precisamos do DDD e do número.');
    if (S.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email)) bad('e-email', 'w-email', 'Esse e-mail parece incompleto. Pode deixar em branco se preferir.');
    if (first) { first.focus(); return; }
    S.nome = S.nome.trim();
    show(3, true);
  });

  /* etapa 3 */
  $('w-edit').addEventListener('click', function () { show(1, true); });
  $('w-copy').addEventListener('click', function () { O.copy(message(), this); });

  /* entrada na tela */
  O.hooks.cadastrar = function () {
    var p = O.prefill; O.prefill = null;
    if (p) {
      if (p.tipo) S.tipo = p.tipo;
      if (p.n) S.n = String(p.n);
      if (p.aluga) S.aluga = p.aluga;
      step = 1;
    }
    fillFields(); clearErr(); show(step === 3 ? 3 : step, false);
  };
})();
