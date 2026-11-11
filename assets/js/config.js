/*
  Configuração da Órbita Stays — é o único arquivo que você precisa editar para colocar o site no ar.

  whatsapp   Número do WhatsApp Business, só dígitos, com 55 + DDD. Ex.: '5561999998888'.
             Enquanto estiver vazio, os botões "Falar no WhatsApp" ficam escondidos e o
             cadastro oferece "Copiar mensagem" no lugar de "Enviar pelo WhatsApp".
  instagram  Perfil sem o @. Ex.: 'orbitastays'. Vazio = o link não aparece.
  email      E-mail de contato (opcional). Vazio = não aparece.
  siteUrl    Endereço público do site, usado nos links de divulgação e no QR code.
             Ex.: 'https://orbitastays.com.br'. Vazio = usa o endereço em que o site está aberto.
  anuncios   Links reais dos anúncios de cada imóvel nos canais (opcional). A chave é o id do imóvel.
             Quando preenchidos, aparecem na aba "Divulgar" e na página do imóvel.
             Ex.: { '1': { airbnb: 'https://www.airbnb.com.br/rooms/...', booking: '', vrbo: '' } }
*/
window.ORBITA_CONFIG = {
  whatsapp: '',
  instagram: '',
  email: '',
  siteUrl: '',
  anuncios: {}
};
