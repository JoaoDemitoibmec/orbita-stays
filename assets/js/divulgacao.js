/*
  Divulgação do imóvel: o que funciona hoje, sem integração externa.
  - Página do imóvel com link próprio (#imovel-<id>), para o proprietário compartilhar.
  - Mensagem pronta + WhatsApp, e-mail, Facebook e "Compartilhar" do celular (Web Share API, quando existir).
  - QR code gerado no próprio navegador (baixa como imagem PNG).
  - Links dos anúncios do Airbnb/Booking/VRBO: aparecem se estiverem em config.js (anuncios).
  Publicar automaticamente em outros sites exigiria APIs e autorização de terceiros. Veja README.md.
*/
(function () {
  'use strict';
  var O = window.Orbita, $ = O.$, esc = O.esc, D = O.data;
  var sel = 1;           // imóvel selecionado na aba Divulgar
  var msgEdited = false;

  function ficha(p) { return O.siteUrl() + '#imovel-' + p.id; }
  function anuncios(p) {
    var a = (O.cfg.anuncios || {})[p.id] || {}, out = [];
    [['airbnb', 'Airbnb'], ['booking', 'Booking'], ['vrbo', 'VRBO']].forEach(function (c) { if (a[c[0]]) out.push({ nome: c[1], url: a[c[0]] }); });
    return out;
  }
  function textoPadrao(p) {
    return 'Olá! O ' + p.nome.replace(/^Apto/, 'apto').replace(/^Studio/, 'studio') + ' na ' + p.regiao + ', em Brasília, está disponível para temporada. Veja os detalhes aqui: ' + ficha(p);
  }
  function qrSvg(text) {
    if (typeof window.qrcode !== 'function') return '';
    var qr = window.qrcode(0, 'M'); qr.addData(text); qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 3, scalable: true });
  }

  /* ---------- aba Divulgar (dentro do portal) ---------- */
  O.share = {
    html: function () {
      var p = D.byId(sel), link = ficha(p), canShare = !!navigator.share;
      var txt = msgEdited && O.share.txt ? O.share.txt : textoPadrao(p);
      var an = anuncios(p);
      var h = '<div class="grid2"><div class="stack">' +
        '<div class="panel"><h3>Mostre o seu imóvel a quem você quiser</h3>' +
        '<p class="muted">Cada imóvel tem uma página própria. É só enviar o link: você não precisa montar anúncio nem tirar print.</p>' +
        '<div class="chips" id="sh-props" role="group" aria-label="Escolha o imóvel">' +
        D.P.map(function (q) { return '<button type="button" class="chip" data-shp="' + q.id + '" aria-pressed="' + (q.id === sel) + '">' + q.curto + '</button>'; }).join('') + '</div>' +
        '<div class="field"><label for="sh-link">Link do imóvel</label><div class="copyrow"><input id="sh-link" type="text" readonly value="' + esc(link) + '"><button class="btn sm" type="button" data-sh="copy-link">Copiar</button></div></div>' +
        '<div class="field"><label for="sh-msg">Mensagem pronta <span class="opt">(pode editar)</span></label><textarea id="sh-msg" rows="5">' + esc(txt) + '</textarea></div>' +
        '<div class="sharebtns">' +
        (canShare ? '<button class="btn" type="button" data-sh="native">Compartilhar</button>' : '') +
        '<a class="btn' + (canShare ? ' ghost' : '') + '" data-sh="wa" target="_blank" rel="noopener" href="#">WhatsApp</a>' +
        '<a class="btn ghost" data-sh="mail" href="#">E-mail</a>' +
        '<a class="btn ghost" data-sh="fb" target="_blank" rel="noopener" href="#">Facebook</a>' +
        '<button class="btn ghost" type="button" data-sh="copy-msg">Copiar mensagem</button></div>' +
        '<p class="note">Para o Instagram, copie a mensagem e cole nos stories, na bio ou na conversa com quem quiser.</p>' +
        '<p class="mini"><a href="#imovel-' + p.id + '">Ver a página do imóvel como seus convidados veem</a></p>' +
        '</div></div>' +
        '<div class="stack"><div class="panel qrp"><h3>QR code</h3><p class="muted">Ótimo para cartão, impresso ou tela. Quem aponta a câmera do celular chega na página do imóvel.</p>' +
        '<div class="qrbox" id="sh-qr" role="img" aria-label="QR code com o link da página do imóvel">' + qrSvg(link) + '</div>' +
        '<button class="btn ghost block" type="button" data-sh="qr-dl">Baixar imagem do QR code</button></div>';
      if (an.length) {
        h += '<div class="panel"><h3>Seus anúncios nos canais</h3>' + an.map(function (a, i) {
          return '<div class="kv"><span>' + a.nome + '</span><span class="rowbtns"><a class="btn ghost sm" href="' + esc(a.url) + '" target="_blank" rel="noopener">Abrir</a><button class="btn ghost sm" type="button" data-sh="copy-an" data-i="' + i + '">Copiar link</button></span></div>';
        }).join('') + '</div>';
      }
      h += '<div class="panel"><details class="faq flat"><summary>E em outros sites e redes sociais?</summary><p>Hoje a Órbita cuida dos seus anúncios no Airbnb, no Booking e no VRBO, e você divulga o link e o QR code onde quiser. A publicação automática em outros sites ainda não está disponível.</p></details></div>';
      h += '</div></div>';
      return h;
    },
    after: function () {
      var p = D.byId(sel);
      O.share.refresh(p);
    },
    refresh: function (p) {
      var box = $('sh-msg'); if (!box) return;
      var t = box.value, url = ficha(p);
      var wa = document.querySelector('[data-sh="wa"]');
      if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(t);
      var mail = document.querySelector('[data-sh="mail"]');
      if (mail) mail.href = 'mailto:?subject=' + encodeURIComponent('Meu imóvel em Brasília: ' + p.nome) + '&body=' + encodeURIComponent(t);
      var fb = document.querySelector('[data-sh="fb"]');
      if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
      O.share.txt = t;
    },
    click: function (e, rerender) {
      var sp = e.target.closest('[data-shp]');
      if (sp) { sel = +sp.getAttribute('data-shp'); msgEdited = false; rerender(); return true; }
      var b = e.target.closest('[data-sh]'); if (!b) return false;
      var k = b.getAttribute('data-sh'), p = D.byId(sel);
      if (k === 'copy-link') { O.copy($('sh-link').value, b, $('sh-link')); return true; }
      if (k === 'copy-msg') { O.copy($('sh-msg').value, b, $('sh-msg')); return true; }
      if (k === 'copy-an') { O.copy(anuncios(p)[+b.getAttribute('data-i')].url, b); return true; }
      if (k === 'native') {
        navigator.share({ title: p.nome + ' · ' + p.regiao, text: $('sh-msg').value.replace(ficha(p), '').trim(), url: ficha(p) }).catch(function () { });
        return true;
      }
      if (k === 'qr-dl') { O.share.downloadQr(p); return true; }
      return false;      // links <a> seguem normalmente
    },
    input: function (e) {
      if (e.target.id === 'sh-msg') { msgEdited = true; O.share.refresh(D.byId(sel)); }
    },
    downloadQr: function (p) {
      var svg = qrSvg(ficha(p)); if (!svg) return;
      var img = new Image(), url = URL.createObjectURL(new Blob([svg.replace('<svg ', '<svg width="1024" height="1024" ')], { type: 'image/svg+xml' }));
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = c.height = 1024;
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 1024, 1024); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, 1024, 1024);
        URL.revokeObjectURL(url);
        c.toBlob(function (blob) {
          var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = 'qrcode-orbita-' + p.curto.toLowerCase().replace(/\s+/g, '-') + '.png';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
          O.toast('Imagem do QR code baixada');
        });
      };
      img.onerror = function () { URL.revokeObjectURL(url); O.toast('Não deu para gerar a imagem. Tente de novo.'); };
      img.src = url;
    }
  };

  /* ---------- página pública do imóvel (#imovel-<id>) ---------- */
  O.hooks.imovel = function (id) {
    var p = D.byId(id), box = $('imovel-body');
    if (!p) {
      box.innerHTML = '<a class="back" href="#inicio">← Voltar ao início</a><h1>Não encontramos esse imóvel</h1><p class="lead">O link pode estar incompleto. Se alguém enviou para você, peça o link de novo.</p><a class="btn" href="#inicio">Ir para a página inicial</a>';
      return;
    }
    var an = anuncios(p), msg = 'Olá! Vi a página do ' + p.nome + ' (' + p.regiao + ') e quero saber mais.';
    var wa = O.waLink(msg);
    box.innerHTML =
      '<a class="back" href="#inicio">← Órbita Stays</a>' +
      '<header class="ficha-head"><p class="eyebrow">Aluguel por temporada · Brasília, DF</p><h1>' + esc(p.nome) + '</h1><p class="lead">' + esc(p.end) + '</p></header>' +
      '<div class="panel">' +
      '<div class="kv"><span>Nota no Airbnb</span><span class="num">' + p.air + ' de 5</span></div>' +
      '<div class="kv"><span>Nota no Booking</span><span class="num">' + p.book + ' de 10</span></div>' +
      '<div class="kv"><span>Nota no VRBO</span><span class="num">' + p.vrbo + ' de 5</span></div>' +
      '<div class="kv"><span>Avaliações de hóspedes</span><span class="num">' + p.aval + '</span></div>' +
      '<div class="kv"><span>Cuidado por</span><span>Órbita Stays</span></div>' +
      '</div>' +
      '<div class="stackb">' +
      an.map(function (a) { return '<a class="btn" href="' + esc(a.url) + '" target="_blank" rel="noopener">Ver no ' + a.nome + '</a>'; }).join('') +
      (wa ? '<a class="btn' + (an.length ? ' ghost' : '') + '" href="' + esc(wa) + '" target="_blank" rel="noopener">Perguntar pelo WhatsApp</a>' : '') +
      '</div>' +
      '<p class="note">Página de demonstração, com notas e avaliações fictícias.</p>' +
      '<aside class="invite"><h2>Tem um imóvel em Brasília?</h2><p>A Órbita cuida de anúncio, hóspedes, limpeza e manutenção. Você só acompanha e recebe.</p><a class="btn" href="#cadastrar">Cadastrar meu imóvel</a></aside>';
    document.title = p.nome + ' · ' + p.regiao + ' — Órbita Stays';
  };
})();
