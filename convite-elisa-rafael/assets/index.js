(function () {
  const bookEl = document.getElementById('book');
  const bookWrap = document.getElementById('bookWrap');
  const pages = bookEl.querySelectorAll('.page');

  const pageFlip = new St.PageFlip(bookEl, {
    width: 380,
    height: 680,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 900,
    minHeight: 500,
    maxHeight: 1400,
    showCover: true,
    maxShadowOpacity: 0.55,
    drawShadow: true,
    flippingTime: 700,
    usePortrait: true,
    mobileScrollSupport: false,
  });

  pageFlip.loadFromHTML(pages);

  // ---------------- Intro / seal ----------------
  const intro = document.getElementById('intro');
  const sealBtn = document.getElementById('sealBtn');
  sealBtn.addEventListener('click', () => {
    if (sealBtn.classList.contains('breaking')) return;
    sealBtn.classList.add('breaking');
    setTimeout(() => intro.classList.add('hidden'), 420);
  });

  // ---------------- Modal ----------------
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  const modalContent = {
    local: {
      title: 'Como chegar',
      html: '<p>Sítio das Lavandas — Estrada dos Lírios, km 4, Ibiúna/SP. Estacionamento gratuito no local.</p>',
      button: { label: 'Abrir no mapa', href: 'https://www.google.com/maps/search/S%C3%ADtio%20das%20Lavandas%20Ibi%C3%BAna' },
    },
    'rsvp-info': {
      title: 'Confirmar presença',
      html: '<p>Contamos com você! Confirme sua presença até 20 de novembro pelo formulário na última página ou pelo WhatsApp.</p>',
      button: { label: 'Confirmar por WhatsApp', href: 'https://wa.me/558185945080?text=Ol%C3%A1!%20Gostaria%20de%20confirmar%20minha%20presen%C3%A7a%20no%20casamento.' },
    },
    presentes: {
      title: 'Lista de presentes',
      html: '<p>Preparamos algumas ideias de presente na página seguinte do convite — inclusive opções para contribuir com a lua de mel e a casa nova.</p>',
    },
    traje: {
      title: 'Dress code',
      html: '<p>Traje esporte fino. Tons pastéis são muito bem-vindos — o branco é reservado à noiva.</p>',
    },
  };

  function openModal(key) {
    const data = modalContent[key];
    if (!data) return;
    modalBody.innerHTML =
      '<h3>' + data.title + '</h3>' + data.html +
      (data.button ? '<a class="btn" href="' + data.button.href + '" target="_blank" rel="noopener">' + data.button.label + '</a>' : '');
    modalBackdrop.classList.add('open');
  }
  function closeModal() { modalBackdrop.classList.remove('open'); }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.menu-item[data-modal]');
    if (trigger) openModal(trigger.dataset.modal);
  });
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // ---------------- RSVP form ----------------
  const rsvpForm = document.getElementById('rsvpForm');
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(rsvpForm);
    const nome = (data.get('nome') || '').toString().trim();
    const telefone = (data.get('telefone') || '').toString().trim();
    const pessoas = (data.get('pessoas') || '1').toString().trim();
    const msg =
      'Olá! Gostaria de confirmar presença no casamento de Elisa e Rafael.\n' +
      'Nome: ' + nome + '\n' +
      'Telefone: ' + telefone + '\n' +
      'Quantidade de pessoas: ' + pessoas;
    const url = 'https://wa.me/558185945080?text=' + encodeURIComponent(msg);
    window.open(url, '_blank', 'noopener');
  });
})();