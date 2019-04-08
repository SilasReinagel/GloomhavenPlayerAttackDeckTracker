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
const isPermanent = false;
const isTemporary = true;

// Root Module
const gh = {};

gh.effect = (name, title, value, isHit, applyEffect, reshuffle, isTemporary) => ({
    name: name,
    title: title,
    isHit: isHit,
    applyEffect: applyEffect,
    reshuffle: reshuffle,
    value: value,
    isTemporary: isTemporary
});

gh.draw = (cards, card) => {
    const cardIndex = cards.findIndex((c) => c.value === card.value);
    if (cardIndex === -1)
        throw new Error(`No ${card.title} found in deck`);
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
            miss: percent(cards.filter(x => x.title === gh.card.null.title).length, numCards),
            crit: percent(cards.filter(x => x.title === gh.card.crit.title).length, numCards),
            minusTwo: percent(cards.filter(x => x.title === gh.card.minusTwo.title).length, numCards),
            minusOne: percent(cards.filter(x => x.title === gh.card.minusOne.title).length, numCards),
            zero: percent(cards.filter(x => x.title === gh.card.zero.title).length, numCards),
            plusOne: percent(cards.filter(x => x.title === gh.card.plusOne.title).length, numCards),
            plusTwo: percent(cards.filter(x => x.title === gh.card.plusTwo.title).length, numCards),
        }}
};

gh.deckOf = (cards) => {
    const deck = { cards: cards };
    deck.without = (card) => gh.deckOf(gh.draw(deck.cards, card));
    deck.with = (card) => gh.deckOf(cards.concat([card]));
    deck.withoutTemporaryCards = () => gh.deckOf(cards.filter(c => !c.isTemporary));
    deck.contains = (card) => !!cards.find(c => c.value === card.value);
    Object.freeze(deck);
    return deck;
};

gh.card = {
    null: gh.effect('null', "x0", -99, isMiss, dmg => 0, shouldReshuffle, isPermanent),
    crit: gh.effect('crit', "x2", 99, isHit, dmg => dmg * 2, shouldReshuffle, isPermanent),
    zero: gh.effect('zero', "0", 0, isHit, dmg => dmg, noReshuffle, isPermanent),
    minusOne: gh.effect('minusOne', "-1", -1, isHit, dmg => dmg - 1, noReshuffle, isPermanent),
    minusTwo: gh.effect('minusTwo', "-2", -2, isHit, dmg => dmg - 2, noReshuffle, isPermanent),
    plusOne: gh.effect('plusOne', "+1", 1, isHit, dmg => dmg + 1, noReshuffle, isPermanent),
    plusTwo: gh.effect('plusTwo', "+2", 2, isHit, dmg => dmg + 2, noReshuffle, isPermanent),
    blessing: gh.effect('blessing', "x2", 100, isHit, dmg => dmg * 2, noReshuffle, isTemporary),
    curse: gh.effect('curse', "x0", -100, isMiss, dmg => 0, noReshuffle, isTemporary),
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
    .without(gh.card.plusOne)
    .without(gh.card.zero)
    .without(gh.card.minusOne)
    .without(gh.card.minusOne)
    .without(gh.card.plusTwo);

//output(gh.odds(current.cards));

// TODO: Advantage
// TODO: Disadvantage
