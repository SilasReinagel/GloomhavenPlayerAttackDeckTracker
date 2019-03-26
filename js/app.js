const remToPixels = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);

// State
const devMode = false;
let deck = gh.starterDeck;
let currentDeck = gh.starterDeck;
let odds = gh.odds(currentDeck.cards);

// Gui Components
const title = () => header(() => h1('Gloomhaven Player Attack Deck Tracker'));

const createDeck = () => divWith('deck', () => img('./img/cardback.jpg'));

const oddsRow = (first, second) => tr(td(first), td(second));
const oddsView = () => {
    return table('odds',
        oddsRow('TotalCards', odds.totalCards),
        oddsRow('Hit', odds.hit),
        oddsRow('Miss', odds.miss));
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

const addCardControls = () => divWith('insertCards',
    () => textButton('Add Curse', () => addCard(gh.card.curse)),
    () => textButton('Add Blessing', () => addCard(gh.card.blessing)));

const drawCardControls = () => divWith('drawCards',
    () => textButton('Draw Curse', () => drawCard(gh.card.curse)),
    () => textButton('Draw Miss', () => drawCard(gh.card.null)),
    () => textButton('Draw -2', () => drawCard(gh.card.minusTwo)),
    () => textButton('Draw -1', () => drawCard(gh.card.minusOne)),
    () => textButton('Draw 0', () => drawCard(gh.card.zero)),
    () => textButton('Draw +1', () => drawCard(gh.card.plusOne)),
    () => textButton('Draw +2', () => drawCard(gh.card.plusTwo)),
    () => textButton('Draw Crit', () => drawCard(gh.card.crit)),
    () => textButton('Draw Blessing', () => drawCard(gh.card.blessing)));

// App Actions
const reshuffle = () => {
    currentDeck = deck;
    odds = gh.odds(currentDeck.cards);
    render();
};

const addCard = (card) => {
    currentDeck = currentDeck.with(card);
    odds = gh.odds(currentDeck.cards);
    render();
};

const drawCard = (card) => {
    currentDeck = currentDeck.without(card);
    odds = gh.odds(currentDeck.cards);
    render();
};

// Main

const h = (app, createElement) => {
    if (!devMode)
        app.appendChild(createElement());
};

const render = () => {
    const header = document.getElementById('header');
    while (header.firstChild) { header.firstChild.remove(); }

    const app = document.getElementById('app');
    while (app.firstChild) { app.firstChild.remove(); }

    h(header, () => title());
    h(app, () => createDeck());
    app.appendChild(textButton('Reshuffle', () => reshuffle()));
    app.appendChild(addCardControls());
    h(app, () => oddsView());
    app.appendChild(drawCardControls());
    app.appendChild(oddsChart());
};


window.addEventListener("resize", render);
window.onload = () => render();
