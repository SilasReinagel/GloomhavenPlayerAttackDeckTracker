"use strict";

// Utilities
const without = (arr, index) => arr.filter((x, i) => i !== index);
const percent = (portion, total) => ((portion/total) * 100);
const percentString = (odds) => odds.toFixed(2) + '%';
const output = (...o) => console.log(o);
const outputted = (o) => { console.log(o); return o; };
const groupBy = (key, array) =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});
const countsBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || 0) + 1;
        return objectsByKeyValue;
    }, {});

// Constants
const isHit = true;
const isMiss = false;
const shouldReshuffle = true;
const noReshuffle = false;

// Root Module
const gh = {};

gh.effect = (name, value, isHit, applyEffect, reshuffle) => ({
    name: name,
    isHit: isHit,
    applyEffect: applyEffect,
    reshuffle: reshuffle,
    value: value
});

gh.draw = (cards, card) => {
    const cardIndex = cards.findIndex((c) => c.value === card.value);
    if (cardIndex === -1)
        throw new Error(`No ${card.name} found in deck`);
    return without(cards, cardIndex);
};

gh.odds = (cards) => {
    const numCards = cards.length;
    const hitChance = percent(cards.filter(x => x.isHit).length, numCards);
    return {
        totalCards: numCards,
        hit: percentString(hitChance),
        miss: percentString(100 - hitChance),
        breakdown: {
            miss: percent(cards.filter(x => x.name === gh.card.null.name).length, numCards),
            crit: percent(cards.filter(x => x.name === gh.card.crit.name).length, numCards),
            minusTwo: percent(cards.filter(x => x.name === gh.card.minusTwo.name).length, numCards),
            minusOne: percent(cards.filter(x => x.name === gh.card.minusOne.name).length, numCards),
            zero: percent(cards.filter(x => x.name === gh.card.zero.name).length, numCards),
            plusOne: percent(cards.filter(x => x.name === gh.card.plusOne.name).length, numCards),
            plusTwo: percent(cards.filter(x => x.name === gh.card.plusTwo.name).length, numCards),
        }}
};

gh.deckOf = (cards) => {
    const deck = { cards: cards };
    deck.without = (card) => gh.deckOf(gh.draw(deck.cards, card));
    deck.with = (card) => gh.deckOf(cards.concat([card]));
    Object.freeze(deck);
    return deck;
};

gh.card = {
    null: gh.effect("x0", -99, isMiss, dmg => 0, shouldReshuffle),
    crit: gh.effect("x2", 99, isHit, dmg => dmg * 2, shouldReshuffle),
    zero: gh.effect("0", 0, isHit, dmg => dmg, noReshuffle),
    minusOne: gh.effect("-1", -1, isHit, dmg => dmg - 1, noReshuffle),
    minusTwo: gh.effect("-2", -2, isHit, dmg => dmg - 2, noReshuffle),
    plusOne: gh.effect("+1", 1, isHit, dmg => dmg + 1, noReshuffle),
    plusTwo: gh.effect("+2", 2, isHit, dmg => dmg + 2, noReshuffle),
    blessing: gh.effect("x2", 100, isHit, dmg => dmg * 2, noReshuffle),
    curse: gh.effect("x0", -100, isMiss, dmg => 0, noReshuffle),
};

gh.starterDeck = gh.deckOf([
    gh.card.null,
    gh.card.crit,
    gh.card.plusTwo,
    gh.card.minusTwo,
    gh.card.minusOne,
    gh.card.minusOne,
    gh.card.minusOne,
    gh.card.minusOne,
    gh.card.minusOne,
    gh.card.plusOne,
    gh.card.plusOne,
    gh.card.plusOne,
    gh.card.plusOne,
    gh.card.plusOne,
    gh.card.zero,
    gh.card.zero,
    gh.card.zero,
    gh.card.zero,
    gh.card.zero,
    gh.card.zero
]);

Object.freeze(gh);

// Main
let current = gh.starterDeck
    .draw(gh.card.plusOne)
    .draw(gh.card.zero)
    .draw(gh.card.minusOne)
    .draw(gh.card.minusOne)
    .draw(gh.card.plusTwo);

//output(gh.odds(current.cards));

// TODO: Frontend
// TODO: Advantage
// TODO: Disadvantage
// TODO: Add Card
