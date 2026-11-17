
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
    const links = [...nav.querySelectorAll('#navbar a[href^="#"]')];

    let agendado = false;

    function selecionar(href) {
        links.forEach(link => {
            const ativo = link.getAttribute('href') === href;
            const item = link.parentElement;

            item.classList.toggle('ativo', ativo);
            if (ativo) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function fundoDe(el) {
        const cor = getComputedStyle(el).backgroundColor;
        return cor === 'rgba(0, 0, 0, 0)'
            ? getComputedStyle(document.body).backgroundColor
            : cor;
    }

    function atualizar() {
        agendado = false;
        const y = nav.getBoundingClientRect().bottom + 20;

        const secao = secoes.find(s => {
            const r = s.getBoundingClientRect();
            return r.top <= y && r.bottom > y;
        });

        if (!secao) return;

        const cor = fundoDe(secao);
        const [r, g, b] = cor.match(/\d+/g).map(Number);
        const claro = (r * 299 + g * 587 + b * 114) / 1000 > 150;

        selecionar(`#${secao.id}`);

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
    window.addEventListener('hashchange', pedir);
    window.addEventListener('pageshow', pedir);
    window.addEventListener('load', () => {
        const hash = window.location.hash;
        if (links.some(link => link.getAttribute('href') === hash)) selecionar(hash);
        pedir();
    }, { once: true });
    links.forEach(link => link.addEventListener('click', () => selecionar(link.getAttribute('href'))));
    atualizar();
    requestAnimationFrame(atualizar);
})();


(function () {
    function criarCarrossel({ slides, avancar, voltar, area, aoMudar = () => {} }) {
        if (!slides.length || !avancar || !voltar || !area) return;

        let atual = 0;
        let inicio = null;

        function mostrar(indice) {
            atual = (indice + slides.length) % slides.length;
            slides.forEach((slide, n) => slide.classList.toggle('ativo', n === atual));
            aoMudar(atual, slides[atual]);
        }

        avancar.addEventListener('click', () => mostrar(atual + 1));
        voltar.addEventListener('click', () => mostrar(atual - 1));

        area.addEventListener('pointerdown', e => {
            if (e.target instanceof Element && e.target.closest('button, a')) return;
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            inicio = { x: e.clientX, y: e.clientY };
        });

        area.addEventListener('pointerup', e => {
            if (!inicio) return;

            const dx = e.clientX - inicio.x;
            const dy = e.clientY - inicio.y;
            inicio = null;

            if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
            mostrar(atual + (dx < 0 ? 1 : -1));
        });

        area.addEventListener('pointercancel', () => { inicio = null; });

        mostrar(0);
        return mostrar;
    }

    // LITERATURA
    criarCarrossel({
        slides: document.querySelectorAll('#literatura .slider'),
        avancar: document.getElementById('avancarCarrossel'),
        voltar: document.getElementById('voltarCarrossel'),
        area: document.querySelector('#literatura .carrossel')
    });


    // EVENTOS
    const slidesEv = document.querySelectorAll('#eventos .slideEv');
    const cardsEv = document.querySelectorAll('#eventos .cardEv');
    const mostrarEvento = criarCarrossel({
        slides: slidesEv,
        avancar: document.getElementById('avancarEv'),
        voltar: document.getElementById('voltarEv'),
        area: document.querySelector('#eventos .carrosselEv'),
        aoMudar: (_, slide) => {
            cardsEv.forEach(card => {
                const ativo = card.dataset.evento === slide.dataset.evento;
                card.classList.toggle('ativo', ativo);
                card.setAttribute('aria-pressed', ativo);
            });
        }
    });

    cardsEv.forEach(card => {
        function selecionar() {
            const indice = [...slidesEv].findIndex(slide => slide.dataset.evento === card.dataset.evento);
            if (indice >= 0) mostrarEvento(indice);
        }

        card.addEventListener('click', selecionar);
        card.addEventListener('keydown', e => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            card.click();
        });
    });


    // AUDIOVISUAL
    criarCarrossel({
        slides: document.querySelectorAll('#audiovisual .audio-slide'),
        avancar: document.getElementById('avancarAudio'),
        voltar: document.getElementById('voltarAudio'),
        area: document.querySelector('#audiovisual .carrossel-audio')
    });


    // PROJETOS DIGITAIS
    document.querySelectorAll('#projetosDigitais .projeto').forEach(projeto => {
        const texto = projeto.querySelector('.explicacaoProj p');

        criarCarrossel({
            slides: projeto.querySelectorAll('.slideProj'),
            avancar: projeto.querySelector('.seta-avancar'),
            voltar: projeto.querySelector('.seta-voltar'),
            area: projeto.querySelector('.carrosselProj'),
            aoMudar: (_, slide) => { texto.textContent = slide.dataset.texto; }
        });
    });


    ///ilustras
    (function () {
    const secao = document.getElementById('ilustracoes');
    if (!secao) return;

    const slides = secao.querySelectorAll('.slideIlus');
    criarCarrossel({
        slides,
        avancar: secao.querySelector('.seta-avancar'),
        voltar: secao.querySelector('.seta-voltar'),
        area: secao.querySelector('.carrosselIlus')
    });

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
})();
