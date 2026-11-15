
// NAVBAR
// Menu hambúrguer
(function () {
    const nav = document.querySelector('nav');
    const btn = document.getElementById('btnMenu');
    if (!nav || !btn) return;

    function alternar(abrir) {
        nav.classList.toggle('aberto', abrir);
        btn.setAttribute('aria-expanded', abrir);
        btn.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    }

    btn.addEventListener('click', () => alternar(!nav.classList.contains('aberto')));

    // Fecha ao escolher uma seção ou ao apertar Esc
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => alternar(false)));
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') alternar(false);
    });

    // Voltando para tela larga, garante o menu fechado
    window.matchMedia('(min-width: 701px)').addEventListener('change', e => {
        if (e.matches) alternar(false);
    });
})();


// NAVBAR MUDA DE COR CONFORME A SEÇÃO
(function () {
    const nav = document.querySelector('nav');
    const secoes = [...document.querySelectorAll('main > section, footer')];
    if (!nav || !secoes.length) return;

    let agendado = false;

    function fundoDe(el) {
        const cor = getComputedStyle(el).backgroundColor;
        return cor === 'rgba(0, 0, 0, 0)'
            ? getComputedStyle(document.body).backgroundColor
            : cor;
    }

    function atualizar() {
        agendado = false;
        const y = nav.offsetHeight / 2;

        const secao = secoes.find(s => {
            const r = s.getBoundingClientRect();
            return r.top <= y && r.bottom > y;
        });

        if (!secao) return;

        const cor = fundoDe(secao);
        const [r, g, b] = cor.match(/\d+/g).map(Number);
        const claro = (r * 299 + g * 587 + b * 114) / 1000 > 150;

        nav.style.setProperty('--navFundo', cor);
        nav.classList.toggle('sobre-claro', claro);
    }

    function pedir() {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(atualizar);
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    atualizar();
})();


// LITERATURA
(function () {
    const slides = document.querySelectorAll('#literatura .slider');
    if (!slides.length) return;

    let atual = 0;

    function mostrar(i) {
        atual = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('ativo', n === atual));
    }

    document.getElementById('avancarCarrossel').addEventListener('click', () => mostrar(atual + 1));
    document.getElementById('voltarCarrossel').addEventListener('click', () => mostrar(atual - 1));
})();


// EVENTOS
(function () {
    const slides = document.querySelectorAll('#eventos .slideEv');
    const cards = document.querySelectorAll('#eventos .cardEv');
    if (!slides.length) return;

    let atual = 0;

    function mostrar(i) {
        atual = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('ativo', n === atual));

        const evento = slides[atual].dataset.evento;

        cards.forEach(c => c.classList.toggle('ativo', c.dataset.evento === evento));
    }

    document.getElementById('avancarEv').addEventListener('click', () => mostrar(atual + 1));
    document.getElementById('voltarEv').addEventListener('click', () => mostrar(atual - 1));

    // Clicar num card leva à primeira foto daquele evento
    cards.forEach(c => c.addEventListener('click', () => {
        const i = [...slides].findIndex(s => s.dataset.evento === c.dataset.evento);
        if (i >= 0) mostrar(i);
    }));

    mostrar(0);
})();


// AUDIOVISUAL
(function () {
    const slides = document.querySelectorAll('#audiovisual .audio-slide');
    if (!slides.length) return;

    let atual = 0;

    function mostrar(i) {
        const video = slides[atual].querySelector('video');
        if (video) video.pause();

        atual = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('ativo', n === atual));
    }

    document.getElementById('avancarAudio').addEventListener('click', () => mostrar(atual + 1));
    document.getElementById('voltarAudio').addEventListener('click', () => mostrar(atual - 1));
})();


// PROJETOS DIGITAIS
document.querySelectorAll('#projetosDigitais .projeto').forEach(projeto => {
    const slides = projeto.querySelectorAll('.slideProj');
    const texto = projeto.querySelector('.explicacaoProj p');
    let atual = 0;

    function mostrar(i) {
        atual = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('ativo', n === atual));
        texto.textContent = slides[atual].dataset.texto;
    }

    projeto.querySelector('.seta-avancar').addEventListener('click', () => mostrar(atual + 1));
    projeto.querySelector('.seta-voltar').addEventListener('click', () => mostrar(atual - 1));
});


///ilustras
(function () {
    const secao = document.getElementById('ilustracoes');
    if (!secao) return;

    // Carrossel
    const slides = secao.querySelectorAll('.slideIlus');
    let atual = 0;

    function mostrar(i) {
        atual = (i + slides.length) % slides.length;
        slides.forEach((s, n) => s.classList.toggle('ativo', n === atual));
    }

    secao.querySelector('.seta-avancar').addEventListener('click', () => mostrar(atual + 1));
    secao.querySelector('.seta-voltar').addEventListener('click', () => mostrar(atual - 1));

    // Tela de pintura
    const canvas = document.getElementById('telaPintura');
    const ctx = canvas.getContext('2d');

    const VIDA = 1500;
    const FAIXA_MATIZ = [80, 300];
    const SATURACAO = 70;
    const ESPESSURA = 10;

    const pontos = [];
    const dica = document.getElementById('dicaIlus');
    let animando = false;
    let fase = 0;

    function ajustar() {
        const w = secao.clientWidth;
        const h = secao.clientHeight;
        if (!w || !h || (canvas.width === w && canvas.height === h)) return;

        const copia = document.createElement('canvas');
        copia.width = canvas.width;
        copia.height = canvas.height;
        copia.getContext('2d').drawImage(canvas, 0, 0);

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(copia, 0, 0);
    }

    ajustar();

    let espera;
    window.addEventListener('resize', () => {
        clearTimeout(espera);
        espera = setTimeout(ajustar, 150);
    });

    // Desenha a pincelada
    function pincel(a, b, vida, indice) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distancia = Math.hypot(dx, dy);
        if (!distancia) return;

        const nx = -dy / distancia;
        const ny = dx / distancia;
        const cor = `hsl(${b.h}, ${25 + (SATURACAO - 25) * vida}%, ${58 + 36 * (1 - vida)}%)`;
        const largura = ESPESSURA * (0.35 + 0.65 * vida);

        // Corpo principal
        ctx.globalAlpha = 0.9 * vida;
        ctx.strokeStyle = cor;
        ctx.lineWidth = largura;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        // Cerdas irregulares
        for (let i = 0; i < 12; i++) {
            const ruido = Math.sin(indice * 127.1 + i * 311.7) * 43758.5453;
            const aleatorio = ruido - Math.floor(ruido);
            const deslocamento = (aleatorio - 0.5) * largura * 1.6;

            ctx.globalAlpha = aleatorio * 0.35 * vida;
            ctx.lineWidth = Math.max(0.5, largura * 0.07);
            ctx.lineCap = 'butt';

            ctx.beginPath();
            ctx.moveTo(a.x + nx * deslocamento, a.y + ny * deslocamento);
            ctx.lineTo(b.x + nx * deslocamento, b.y + ny * deslocamento);
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.lineCap = 'round';
    }

    // Anima o traço
    function quadro(agora) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        while (pontos.length && agora - pontos[0].t > VIDA) pontos.shift();

        for (let i = 1; i < pontos.length; i++) {
            const a = pontos[i - 1], b = pontos[i];
            if (b.inicio) continue;

            const vida = 1 - (agora - b.t) / VIDA;
            pincel(a, b, vida, i);
        }

        if (pontos.length > 1) requestAnimationFrame(quadro);
        else animando = false;
    }

    // Movimento do mouse
    secao.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;

        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const agora = performance.now();
        const ant = pontos[pontos.length - 1];

        fase += 0.05;
        const [min, max] = FAIXA_MATIZ;

        pontos.push({
            x, y, t: agora,
            h: min + (max - min) * (0.5 - 0.5 * Math.cos(fase)),
            inicio: !ant || agora - ant.t > 120
        });

        if (dica && pontos.length > 25) dica.classList.add('some');

        if (!animando) {
            animando = true;
            requestAnimationFrame(quadro);
        }
    });
})();
