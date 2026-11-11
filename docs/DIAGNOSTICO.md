# Diagnóstico e evolução da plataforma Órbita

## 1. Diagnóstico da versão anterior
**Arquitetura:** um único `Orbita_Stays_Portal.html` (~1.000 linhas) com CSS e JS inline, JavaScript puro, roteamento por hash
(`#inicio`, `#portal`), tema claro/escuro, dados do portal gerados no navegador (fictícios), fontes do Google Fonts.
Sem backend, sem build, sem integrações externas (só `localStorage`/`sessionStorage` para tema, meta e login de demonstração).

**Comunicação**
- Promessa central: *renda* ("Seu imóvel gerando renda, com previsibilidade e sem operação"), com vocabulário de sistema
  (precificação dinâmica, operação completa, onboarding, ADR, premissas, repasse).
- O simulador ocupava o topo da página e puxava a conversa para números antes de explicar o benefício.
- Havia conteúdo fora do escopo do negócio: "conformidade regulatória", "Suporte regulatório e fiscal", aprovação em assembleia,
  FAQ de tributação.
- Havia conteúdo interno/acadêmico visível ao cliente: "modelo financeiro do projeto", "meta de captação", "marketing tradicional (proposto)",
  rodapé de trabalho acadêmico, marcadores "[a definir]".

**UX e UI**
- Cabeçalho em duas linhas no celular; faixa de demonstração pesada no portal.
- Sem caminho claro para quem quer começar (não havia cadastro do imóvel).
- Texto pequeno (11–13 px) em calendário, notas e rótulos; tabelas largas com rolagem horizontal no celular.
- Fontes dependiam de CDN (falha offline e atrasa a primeira renderização).
- Sem forma de compartilhar o anúncio.

## 2. O que mudou
**Eixo de comunicação:** de "rentabilidade" para **conveniência, praticidade e tranquilidade**. Título: *"Deixe seu imóvel render. A gente cuida do resto."*
Todos os textos (títulos, botões, formulários, mensagens, FAQ, portal) foram reescritos em linguagem simples, mostrando o benefício
("Hóspede bem recebido", "Imóvel limpo e cuidado") e não a função. Seção "Sua parte é pequena" deixa claro o que o proprietário faz.

**Jornada:** primeiro contato → entender o valor → cadastro em 3 etapas (sem documentos) → mensagem pronta para o WhatsApp →
"o que acontece depois" → portal para acompanhar. O simulador agora leva tipo e quantidade de imóveis para o cadastro.

**Divulgação (nova aba "Divulgar" + página do imóvel)** — o que funciona hoje, sem integração fictícia:
link próprio por imóvel (`#imovel-<id>`), mensagem pronta e editável, WhatsApp / e-mail / Facebook / "Compartilhar" do celular
(Web Share API, só aparece onde existe), QR code gerado no navegador (baixa em PNG) e links dos anúncios por canal, quando configurados.

**UI:** mesma identidade (azul-marinho, azul, laranja "cerrado" só para o dinheiro, Sora + Public Sans, claro/escuro), com mais espaço,
texto de no mínimo 14 px, botões de 44–54 px, cabeçalho de uma linha com menu no celular, barra fixa "Cadastrar meu imóvel" no celular,
abas do portal rolando com a ativa centralizada, tabelas viram cartões no celular, fontes hospedadas no projeto.

**Escopo (diretriz permanente):** removido tudo o que atribuía à Órbita regularização ou assessoria regulatória/fiscal/documental.
Nada foi colocado no lugar.

**Código:** HTML/CSS/JS separados em arquivos por responsabilidade; configuração concentrada em `config.js`; lógica de cálculo do simulador
e do portal preservada; dados fictícios preservados.

## 3. O que falta para ficar real (não foi simulado)
| Item | O que é preciso |
|---|---|
| Receber cadastros | Hoje o cadastro abre o WhatsApp com a mensagem pronta (nada fica salvo). Para guardar: um endpoint (função serverless da Vercel + planilha/CRM ou banco) e aviso de privacidade (LGPD). |
| Login e dados reais do portal | Autenticação (e-mail + link mágico ou senha) e API com reservas, extratos e avaliações vindos do sistema de gestão. |
| Calendário sincronizado | Exportar/importar iCal por imóvel é viável; sincronização completa com Airbnb/Booking/VRBO exige parceiro de conectividade (channel manager) ou API com credenciamento. |
| Publicar em outros canais | Facebook/Instagram (Meta Graph API, app com revisão), Google Vacation Rentals (parceiro de conectividade) etc. Cada um exige credenciamento. Até lá, o link e o QR code cobrem a divulgação manual. |
| Prévia bonita do link no WhatsApp | O link da página do imóvel usa `#`, então a prévia mostra os dados gerais do site. Para prévia por imóvel: páginas estáticas ou rotas geradas no servidor com meta tags próprias. |
| Fotos | A página do imóvel não tem fotos (não havia imagens). Quando existirem, entram em `assets/img/` e na página do imóvel. |

## 4. Testes realizados (Chromium, 390×844 e 1440×900)
Console sem erros nem requisições falhas; sem rolagem horizontal em nenhuma tela; cadastro (validações, máscara, revisão, copiar,
editar, pré-preenchimento vindo do simulador); simulador nos três modos; menu móvel e âncoras; login e demonstração; todas as abas
do portal, troca de mês, meta editável (persiste), pedido de datas; kit de divulgação (link, mensagem editável, QR, download PNG,
troca de imóvel); página do imóvel e link inválido; tema claro/escuro; links internos.
