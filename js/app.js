const remToPixels = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
const d2 = (num) => +(Math.round(num + "e+2")  + "e-2");

// State
const deckCards = 'deckCards';
let io = localStorageIo('Gloomhaven-Player-Attack-Deck-Tracker');
let deck = gh.deckOf(io.load(deckCards, () => gh.starterDeck.cards));
let currentDeck = deck;
let odds = gh.odds(currentDeck.cards);
let mode = 'setup';

// Gui State
let currentChartCanvas = null;
let currentOddsChart = null;

// Gui Components
const title = () => h2('Gloomhaven Player Attack Deck Tracker');

const setupDeckView = () =>
    rowWith('deck',
        () => oddsView(),
        () => textButton('Deck Is Ready', 'start', startGame),
        () => textButton('Reset Deck', 'reset', () => resetDeck()));

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
    if (!currentChartCanvas) {
        currentChartCanvas = document.createElement('canvas');
    }

    const e = currentChartCanvas;
    const gfx = e.getContext('2d');
    e.classList.add(name);
    e.id = name;

    const gradient = gfx.createLinearGradient(0,0, Math.min(remToPixels(42), window.innerWidth * 0.9), 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'green');
    chartData.datasets[0].backgroundColor = gradient;

    Chart.defaults.global.animation.duration = 100;
    if (!currentOddsChart)
        currentOddsChart = new Chart(gfx, {
            type: 'bar',
            data: chartData,
            options: {
                defaultFontColor: '#fff',
                scaleFontColor: "#fff",
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
    else
        updateChartData(currentOddsChart, chartData);

    return e;
};

const updateChartData = (chart, data) => {
    chart.data = data;
    chart.update();
};

const oddsChartData = (odds) => {
    const b = odds.breakdown;
    return ({
        labels: [ '0X', '-2', '-1', '0', '+1', '+2', '2X' ],
        datasets: [{
            label: 'odds',
            data: [ d2(b.miss), d2(b.minusTwo), d2(b.minusOne), d2(b.zero), d2(b.plusOne), d2(b.plusTwo), d2(b.crit) ]
        }]
    });
};

const oddsChart = () => oddsBarChart('oddsChart', oddsChartData(odds));


const cardButton = (card, onClick) => imageButton(`./img/am-p-${card.name}.png`, 'img-button', onClick);
const addCardButton = (card) => cardButton(card, () => addCard(card));
const addCardControls = () => flexWith('insertCards',
    () => addCardButton(gh.card.curse),
    () => addCardButton(gh.card.blessing),
    () => addCardButton(gh.card.minusTwo),
    () => addCardButton(gh.card.minusOne),
    () => addCardButton(gh.card.zero),
    () => addCardButton(gh.card.plusOne),
    () => addCardButton(gh.card.plusTwo));

const removeCardButton = (card) => cardButton(card, () => removeCard(card));
const removeCardControls = () => flexWith('removeCards',
    () => removeCardButton(gh.card.minusTwo),
    () => removeCardButton(gh.card.minusOne),
    () => removeCardButton(gh.card.zero));


const noCardButton = () => imageButton('./img/am-p-none.png', 'img-button', () => {});
const drawCardButton = (card, imageName) => currentDeck.contains(card)
    ? cardButton(card, () => drawCard(card))
    : noCardButton();

const drawCardControls = () => flexWith('drawCards',
    () => drawCardButton(gh.card.curse, 'curse'),
    () => drawCardButton(gh.card.null, 'null'),
    () => drawCardButton(gh.card.minusTwo, 'minustwo'),
    () => drawCardButton(gh.card.minusOne, 'minusone'),
    () => drawCardButton(gh.card.zero, 'zero'),
    () => drawCardButton(gh.card.plusOne, 'plusone'),
    () => drawCardButton(gh.card.plusTwo, 'plustwo'),
    () => drawCardButton(gh.card.crit, 'crit'),
    () => drawCardButton(gh.card.blessing, 'blessing'));

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
    updateDeck(deck.with(card));
    currentDeck = currentDeck.with(card);
    update();
};

const removeCard = (card) => {
    updateDeck(deck.without(card));
    currentDeck = currentDeck.without(card);
    update();
};

const drawCard = (card) => {
    if (card.isTemporary)
        updateDeck(deck.without(card));
    currentDeck = currentDeck.without(card);
    update();
};

const resetDeck = () => {
    updateDeck(gh.starterDeck);
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

const updateDeck = (newDeck) => {
    io.save(deckCards, newDeck.cards);
    deck = newDeck;
};

// Main

const renderSetupView = (app) => {
    app.appendChild(setupDeckView());
    app.appendChild(h3('Add Card'));
    app.appendChild(addCardControls());
    app.appendChild(h3('Remove Card'));
    app.appendChild(removeCardControls());
};

const renderPlayView = (app) => {
    app.appendChild(playDeckView());
    app.appendChild(drawCardControls());
    app.appendChild(oddsChart());
};

const render = () => {
    const header = document.getElementById('header');
    while (header.firstChild) { header.firstChild.remove(); }
    header.appendChild(title());

    const app = document.getElementById('app');
    while (app.firstChild) { app.firstChild.remove(); }

    if (mode === 'setup')
        renderSetupView(app);
    else
        renderPlayView(app);
};

window.addEventListener("resize", render);
document.addEventListener("DOMContentLoaded", render);
