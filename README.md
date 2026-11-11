 # Órbita Stays — plataforma (versão evoluída)

Site estático (HTML, CSS e JavaScript puro). **Não tem etapa de build**: na Vercel, importe a pasta como projeto
"Other" / Framework Preset: *Other*, deixe *Build Command* e *Output Directory* vazios. Também abre direto no
navegador (`index.html`), sem servidor.

## O que tem
| Tela | Endereço | O que faz |
|---|---|---|
| Página inicial | `#inicio` (e âncoras `#como-funciona`, `#servicos`, `#simulador`, `#duvidas`, `#contato`) | Comunica a proposta (conveniência), serviços, passos, custos, dúvidas, simulador |
| Cadastro do imóvel | `#cadastrar` | 3 etapas curtas; envia os dados por WhatsApp (ou copia a mensagem) |
| Portal do proprietário | `#portal` | Resumo e meta, calendário, extrato, imóveis, **divulgar**, atendimento (demonstração com dados fictícios) |
| Página do imóvel | `#imovel-1`, `#imovel-2` | Página própria de cada imóvel, para compartilhar por link ou QR code |

## Antes de publicar: edite só `assets/js/config.js`
- `whatsapp`: número do WhatsApp Business (`'5561999998888'`). Sem ele, o cadastro mostra "Copiar mensagem" no lugar de "Enviar pelo WhatsApp" e os botões de WhatsApp ficam escondidos.
- `instagram`, `email`: aparecem só se preenchidos.
- `siteUrl`: endereço público (ex.: `https://orbitastays.com.br`). Usado nos links de divulgação e no QR code. Vazio = usa o endereço atual.
- `anuncios`: links reais dos anúncios (Airbnb/Booking/VRBO) por imóvel; aparecem na aba Divulgar e na página do imóvel.

## Estrutura
```
index.html              marcação de todas as telas
vercel.json             cabeçalhos de segurança e cache (cleanUrls)
assets/css/styles.css   estilos (tema claro/escuro, mobile primeiro)
assets/js/config.js     ← configuração
assets/js/core.js       rotas por hash, tema, menu, copiar, avisos
assets/js/simulador.js  simulador de repasse
assets/js/cadastro.js   cadastro em etapas
assets/js/portal-data.js  dados fictícios e cálculos do portal
assets/js/portal.js     telas do portal
assets/js/divulgacao.js aba Divulgar + página do imóvel
assets/js/vendor-qrcode.js  gerador de QR code (MIT, Kazuhiko Arase)
assets/fonts/           Sora e Public Sans hospedadas aqui (sem CDN)
docs/DIAGNOSTICO.md     diagnóstico, mudanças, pendências
```

## O que é real e o que é demonstração
- **Real:** simulador, cadastro (gera a mensagem com os dados), links/QR de divulgação, tema, navegação.
- **Demonstração:** dados do portal (reservas, notas, Camila R., Carolina) e o login (qualquer e-mail/senha entram).
- **Ainda não existe:** servidor para guardar cadastros, login de verdade, publicação automática em outros sites.
  Ver `docs/DIAGNOSTICO.md`, seção "O que falta para ficar real".
