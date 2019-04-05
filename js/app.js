const remToPixels = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
const d2 = (num) => +(Math.round(num + "e+2")  + "e-2");

// State
const deckCards = 'deckCards';
let pageIsInitialized = false;
let io = localStorageIo('Gloomhaven-Player-Attack-Deck-Tracker');
let deck = gh.deckOf(io.load(deckCards, () => gh.starterDeck.cards));
let currentDeck = deck;
let odds = gh.odds(currentDeck.cards);
let mode = 'setup';
let lastDrawnCard = null;

// Gui State
let currentChartCanvas = null;
let currentOddsChart = null;
let drawView = null;

// Gui Components
const title = () => h2('Gloomhaven Player Attack Deck');
const githubLink = () => squareTextButton('', 'github',
    () => window.open('https://github.com/SilasReinagel/GloomhavenPlayerAttackDeckTracker','_blank'));

const squareTextButton = (text, className, onClick) =>
    withClass('square-button', textButton(text, className, onClick));

const setupDeckView = () =>
    rowWith('deck',
        () => oddsView(),
        () => squareTextButton('Deck Is Ready', 'start', startGame),
        () => squareTextButton('Encounter Done', 'encounter', endEncounter),
        () => squareTextButton('Reset Deck', 'reset', resetDeck));

const playDeckView = () =>
    rowWith('deck',
        () => oddsView(),
        () => squareTextButton('Reshuffle', 'shuffle', reshuffle),
        () => squareTextButton('Setup Deck', 'setup', setupDeck));

const oddsRow = (first, second) => tr(td(first), td(second));
const oddsView = () => {
    return divWith('odds',
        () => table('oddsDetail',
            oddsRow('Cards', odds.totalCards),
            oddsRow('Hit', odds.hit),
            oddsRow('Miss', odds.miss)));
};

const drawPileView = () => lastDrawnCard
        ? cardButton(lastDrawnCard, () => {})
        : noCardButton();

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

const cardImage = (card) => `./img/am-p-${card.name}.jpg`;
const cardButton = (card, onClick) => imageButton(cardImage(card), 'card-button', onClick);
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

const noCardButton = () => imageButton('./img/am-p-none.png', 'card-button', () => {});
const drawCardButton = (card, imageName) => currentDeck.contains(card)
    ? cardButton(card, () => drawCard(card))
    : noCardButton();

const drawCardControls = () => flexWith('drawCards',
    () => drawCardButton(gh.card.curse, 'curse'),
    () => drawCardButton(gh.card.null, 'null'),
    () => drawCardButton(gh.card.minusTwo, 'minusTwo'),
    () => drawCardButton(gh.card.minusOne, 'minusOne'),
    () => drawCardButton(gh.card.zero, 'zero'),
    () => drawCardButton(gh.card.plusOne, 'plusOne'),
    () => drawCardButton(gh.card.plusTwo, 'plusTwo'),
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
    lastDrawnCard = card;
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

const endEncounter = () => {
    currentDeck = currentDeck.withoutTemporaryCards();
    updateDeck(currentDeck);
    update();
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

const setupView = () =>  divWith('setup-view',
    () => setupDeckView(),
    () => h3('Add Card'),
    () => addCardControls(),
    () => h3('Remove Card'),
    () => removeCardControls()
);

const playView = () => divWith('play-view',
    () => playDeckView(),
    () => drawCardControls(),
    () => oddsChart()
);

const render = () => {
    console.log('render');
    if (!pageIsInitialized) {
        const header = document.getElementById('header');
        while (header.firstChild) { header.firstChild.remove(); }
        header.appendChild(title());

        const footer = document.getElementById('footer');
        while (footer.firstChild) { footer.firstChild.remove(); }
        footer.appendChild(githubLink());
        pageIsInitialized = true;

        drawView = drawPileView();
    }

    const app = document.getElementById('app');
    while (app.firstChild) { app.firstChild.remove(); }

    app.appendChild(mode === 'setup' ? setupView() : playView());
};

window.addEventListener("resize", render);
document.addEventListener("DOMContentLoaded", render);
