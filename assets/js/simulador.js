/* Simulador de repasse. Mesma lógica de cálculo da versão anterior; textos reescritos. */
(function () {
  'use strict';
  var O = window.Orbita, $ = O.$, BRL = O.BRL, clamp = O.clamp;

  var DIAS = 365 / 12, ONB = 800;
  var TIPOS = { studio: { adr: 240, nome: 'Studio' }, '1q': { adr: 260, nome: '1 quarto' }, '2q': { adr: 280, nome: '2 quartos' }, '3q': { adr: 360, nome: '3 quartos ou mais' } };
  var sim = O.sim = { mode: 'novo', tipo: '2q', adr: 280, noites: 18, n: 1, goal: 4000, hoje: 2500, pf: 15, adm: 20 };

  var TXT = {
    novo: {
      intro: 'Ainda não aluga por temporada? Escolha o tipo do imóvel e arraste as noites. Começamos com valores comuns e você ajusta.',
      ladr: 'Quanto você acha que pode cobrar por noite?',
      hadr: 'Sugerimos um valor para o tipo do seu imóvel. Ajuste depois de olhar anúncios parecidos.',
      lno: 'Quantas noites por mês o imóvel fica com hóspede?',
      hno: 'Imóvel novo costuma começar mais devagar, até ganhar avaliações. Na dúvida, escolha menos.'
    },
    rec: {
      intro: 'Já aluga e conhece seus números? Veja quanto ficaria com a Órbita.',
      ladr: 'Quanto você cobra por noite?',
      hadr: 'Preço médio, contando fins de semana e feriados.',
      lno: 'Quantas noites por mês ficam ocupadas?',
      hno: ''
    },
    meta: {
      intro: 'Diga quanto quer receber por mês e veja o que isso pede do imóvel.',
      ladr: 'Quanto você cobra por noite?',
      hadr: 'Se não souber, escolha um valor e ajuste depois.',
      lno: '', hno: ''
    }
  };

  var perNight = function () { return sim.adr * (1 - sim.pf / 100) * (1 - sim.adm / 100); };

  function render() {
    var T = TXT[sim.mode], novo = sim.mode === 'novo', rec = sim.mode === 'rec', meta = sim.mode === 'meta';
    $('s-intro').textContent = T.intro;
    $('l-adr').textContent = T.ladr; $('h-adr').textContent = T.hadr;
    $('l-noites').textContent = T.lno; $('h-noites').textContent = T.hno;
    $('q-tipo').hidden = !novo; $('q-rec').hidden = meta; $('q-meta').hidden = !meta;
    $('res-rec').hidden = meta; $('res-meta').hidden = !meta;
    $('cmp').hidden = !rec; $('guide').hidden = !novo; $('novo-extra').hidden = !novo;
    O.qsa('#s-mode button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === sim.mode ? 'true' : 'false'); });
    O.qsa('#s-n button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.n === sim.n ? 'true' : 'false'); });
    O.qsa('#s-tipo button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tipo === sim.tipo ? 'true' : 'false'); });
    $('r-onb').textContent = BRL(ONB * sim.n);
    var pn = perNight();

    if (!meta) {
      $('o-noites').textContent = sim.noites + (sim.noites === 1 ? ' noite' : ' noites');
      $('o-occ').textContent = Math.round(sim.noites / DIAS * 100) + '% do mês';
      var nights = sim.noites * sim.n, gross = nights * sim.adr, plat = gross * sim.pf / 100,
        net = gross - plat, orb = net * sim.adm / 100, rep = net - orb;
      $('r-rep').textContent = BRL(rep);
      $('r-year').textContent = '≈ ' + BRL(rep * 12) + ' por ano' + (sim.n > 1 ? ', com ' + sim.n + ' imóveis' : '');
      $('f-gross').textContent = BRL(gross); $('f-plat').textContent = '− ' + BRL(plat);
      $('f-orb').textContent = '− ' + BRL(orb); $('f-rep').textContent = BRL(rep);
      var g = gross || 1;
      $('b-plat').style.width = (plat / g * 100) + '%'; $('b-orb').style.width = (orb / g * 100) + '%'; $('b-rep').style.width = (rep / g * 100) + '%';
      if (novo) {
        var dias = rep > 0 ? Math.ceil(ONB * sim.n / (rep / DIAS)) : 0;
        $('novo-extra').innerHTML = '<b>Único gasto inicial:</b> ' + BRL(ONB * sim.n) + ' para preparar o imóvel (fotos, anúncios e vistoria), pagos uma vez. ' +
          (rep > 0 ? 'Nesse cenário ele se paga com cerca de <b>' + dias + ' dias</b> de repasse. ' : '') +
          'Nos primeiros meses o resultado costuma ficar abaixo do esperado, até o anúncio ganhar avaliações.';
      }
      if (rec) {
        var hoje = sim.hoje, diff = rep - hoje;
        if (hoje <= 0) { $('c-verdict').textContent = 'Informe quanto sobra para você hoje, para comparar.'; }
        else {
          var need = hoje / pn / sim.n;
          $('c-verdict').innerHTML = 'Para receber o mesmo que hoje, cada imóvel precisa de cerca de <b>' + Math.ceil(need) + ' noites</b> ocupadas por mês com a Órbita. ' +
            (diff >= 0
              ? 'No cenário de ' + sim.noites + ' noites, você recebe <b>' + BRL(diff) + ' a mais</b> por mês do que hoje.'
              : 'No cenário de ' + sim.noites + ' noites, você recebe <b>' + BRL(-diff) + ' a menos</b> por mês do que hoje. Cada noite a mais vale ' + BRL(pn * sim.n) + '.');
        }
      }
    } else {
      var needN = sim.goal / pn, perProp = needN / sim.n, occ = perProp / DIAS * 100;
      $('m-nights').textContent = Math.ceil(perProp) + ' noites por mês';
      $('m-detail').textContent = Math.round(occ) + '% de ocupação, cerca de ' + (perProp / (DIAS / 7)).toFixed(1).replace('.', ',') + ' noites por semana';
      var v;
      if (occ > 90) v = 'Meta muito ambiciosa com esta diária. Reduza a meta, aumente a diária ou coloque mais imóveis.';
      else if (occ > 75) v = 'Meta exigente: pede ocupação alta o ano todo.';
      else if (occ >= 50) v = 'Meta realista para um imóvel bem cuidado.';
      else v = 'Meta confortável: deixa folga para os meses mais fracos.';
      $('m-verdict').textContent = v;
      var adrNeeded = sim.goal / (0.6 * DIAS * sim.n * (1 - sim.pf / 100) * (1 - sim.adm / 100));
      $('m-alt').innerHTML = 'Se o imóvel ficar ocupado 60% do mês, a diária precisaria ser de cerca de <b>' + BRL(adrNeeded) + '</b>.';
    }
  }

  $('s-adr').addEventListener('input', function () { sim.adr = clamp(+this.value || 0, 0, 5000); render(); });
  $('s-goal').addEventListener('input', function () { sim.goal = clamp(+this.value || 0, 0, 200000); render(); });
  $('s-hoje').addEventListener('input', function () { sim.hoje = clamp(+this.value || 0, 0, 200000); render(); });
  $('s-noites').addEventListener('input', function () { sim.noites = +this.value; render(); });
  $('s-pf').addEventListener('input', function () { sim.pf = clamp(+this.value || 0, 0, 30); render(); });
  $('s-adm').addEventListener('input', function () { sim.adm = clamp(+this.value || 0, 0, 40); render(); });
  $('s-tipo').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sim.tipo = b.dataset.tipo; sim.adr = TIPOS[sim.tipo].adr; $('s-adr').value = sim.adr; render(); });
  $('s-n').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sim.n = +b.dataset.n; render(); });
  $('s-mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sim.mode = b.dataset.mode; render(); });
  $('sim-card').addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]'); if (!b) return;
    var k = b.dataset.step, d = +b.dataset.d;
    if (k === 'adr') { sim.adr = clamp(sim.adr + d, 50, 5000); $('s-adr').value = sim.adr; }
    if (k === 'goal') { sim.goal = clamp(sim.goal + d, 500, 200000); $('s-goal').value = sim.goal; }
    render();
  });

  /* Levar o que a pessoa já informou para o cadastro (menos digitação) */
  $('sim-cta').addEventListener('click', function () {
    O.prefill = { tipo: sim.mode === 'novo' ? TIPOS[sim.tipo].nome : null, n: sim.n, aluga: sim.mode === 'rec' ? 'Já alugo' : 'Ainda não' };
  });

  render();
})();
