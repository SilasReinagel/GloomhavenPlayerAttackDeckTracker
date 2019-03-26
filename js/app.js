const remToPixels = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

// State
const devMode = false;
let deck = gh.starterDeck;
let currentDeck = gh.starterDeck;
let odds = gh.odds(currentDeck.cards);
let mode = 'setup';

// Gui Components
const title = () => h2('Gloomhaven Player Attack Deck Tracker');

const setupDeckView = () =>
    rowWith('deck',
        () => oddsView(),
        () => textButton('Deck Is Ready', 'start', startGame));

const playDeckView = () =>
    rowWith('deck',
        () => oddsView(),
        () => textButton('Reshuffle', 'shuffle', reshuffle),
        () => textButton('Setup Deck', 'setup', setupDeck));

const oddsRow = (first, second) => tr(td(first), td(second));
const oddsView = () => {
    return divWith('odds',
        () => table('oddsDetail',
            oddsRow('Cards', odds.totalCards),
            oddsRow('Hit', odds.hit),
            oddsRow('Miss', odds.miss)));
};

const oddsBarChart = (name, chartData) => {
    const e = document.createElement('canvas');
    const gfx = e.getContext('2d');
    e.classList.add(name);
    e.id = name;

    const gradient = gfx.createLinearGradient(0,0, Math.min(remToPixels(42), window.innerWidth * 0.9), 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'green');
    chartData.datasets[0].backgroundColor = gradient;

    new Chart(gfx, {
        type: 'bar',
        data: chartData,
        options: {
            legend: {
                display: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 50,
                        stepSize: 5,
                        callback: (value, index, values) => `${value}%`
                    }
                }]
            }
        }
    });

    return e;
};

const oddsChartData = (odds) => {
    const b = odds.breakdown;
    return ({

        labels: [ '0X', '-2', '-1', '0,', '+1', '+2', '2X' ],
        datasets: [{
            label: 'odds',
            data: [ b.miss, b.minusTwo, b.minusOne, b.zero, b.plusOne, b.plusTwo, b.crit ]
        }]
    });
};

const oddsChart = () => oddsBarChart('oddsChart', oddsChartData(odds));

const setupDeckControls = () => flexWith('insertCards',
    () => textButton('Reset Deck', 'button', () => resetDeck()),
    () => textButton('Add Curse', 'button', () => addCard(gh.card.curse)),
    () => textButton('Add Blessing', 'button', () => addCard(gh.card.blessing)),
    () => textButton('Add -2', 'button', () => addCard(gh.card.minusTwo)),
    () => textButton('Add -1', 'button', () => addCard(gh.card.minusOne)),
    () => textButton('Add 0', 'button', () => addCard(gh.card.zero)),
    () => textButton('Add +1', 'button', () => addCard(gh.card.plusOne)),
    () => textButton('Add +2', 'button', () => addCard(gh.card.plusTwo)),
    () => textButton('Remove -2', 'button', () => removeCard(gh.card.minusTwo)),
    () => textButton('Remove -1', 'button', () => removeCard(gh.card.minusOne)),
    () => textButton('Remove 0', 'button', () => removeCard(gh.card.zero)));

const drawCardControls = () => flexWith('drawCards',
    () => textButton('Draw Curse', 'button', () => drawCard(gh.card.curse)),
    () => textButton('Draw Null', 'button', () => drawCard(gh.card.null)),
    () => textButton('Draw -2', 'button', () => drawCard(gh.card.minusTwo)),
    () => textButton('Draw -1', 'button', () => drawCard(gh.card.minusOne)),
    () => textButton('Draw 0', 'button', () => drawCard(gh.card.zero)),
    () => textButton('Draw +1', 'button', () => drawCard(gh.card.plusOne)),
    () => textButton('Draw +2', 'button', () => drawCard(gh.card.plusTwo)),
    () => textButton('Draw Crit', 'button', () => drawCard(gh.card.crit)),
    () => textButton('Draw Blessing', 'button', () => drawCard(gh.card.blessing)));

// App Actions
const update = () => {
    odds = gh.odds(currentDeck.cards);
    render();
};

const reshuffle = () => {
    currentDeck = deck;
    update();
};

const addCard = (card) => {
    deck = deck.with(card);
    currentDeck = currentDeck.with(card);
    update();
};

const removeCard = (card) => {
    deck = deck.without(card);
    currentDeck = currentDeck.without(card);
    update();
};

const drawCard = (card) => {
    if (card.isTemporary)
        deck = deck.without(card);
    currentDeck = currentDeck.without(card);
    update();
};

const resetDeck = () => {
    deck = gh.starterDeck;
    currentDeck = deck;
    update();
};

const startGame = () => {
    mode = 'play';
    render();
};

const setupDeck = () => {
    mode = 'setup';
    render();
};

// Main

const h = (app, createElement) => {
    if (!devMode)
        app.appendChild(createElement());
};

const renderSetupView = (app) => {
    h(app, () => setupDeckView());
    app.appendChild(setupDeckControls());
};

const renderPlayView = (app) => {
    h(app, () => playDeckView());
    app.appendChild(drawCardControls());
    app.appendChild(oddsChart());
};

const render = () => {
    const header = document.getElementById('header');
    while (header.firstChild) { header.firstChild.remove(); }
    h(header, () => title());

    const app = document.getElementById('app');
    while (app.firstChild) { app.firstChild.remove(); }

    if (mode === 'setup')
        renderSetupView(app);
    else
        renderPlayView(app);
};

window.addEventListener("resize", render);
document.addEventListener("DOMContentLoaded", render);
