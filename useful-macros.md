# Useful Macros

## Test Ability

```
if (actor !== null) {
  actor.testStrength();
}
```

There are equivalent functions for testAgility(), testPresence(), and testToughness().


## Defend

```
if (actor !== null) {
  actor.defend();
}
```


## Herbmaster Decoctions

```
(async () => {
let pack = game.packs.get('morkborg.rolls-occult-herbmaster');
let content = await pack.getContent();
let table = content.find(i => i.name === 'Occult Herbmaster Decoctions');
await table.drawMany(2);
new Roll('1d4').toMessage({ flavor: 'Doses Brewed' });
})();
```

## Esoteric Hermit - Initiate of the Invisible College
```
(async () => {
const numRoll = new Roll('1d2');
await numRoll.toMessage({
  speaker: ChatMessage.getSpeaker(),
  flavor: "Initiate of the Invisible College: Summon d2 Scrolls"
});
const typeRoll = new Roll('1d4');
await typeRoll.toMessage({
  speaker: ChatMessage.getSpeaker(),
  flavor: "Scroll Type (1-2: Sacred, 3-4: Unclean)"
});
let pack = await game.packs.get('morkborg.random-scrolls');
let content = await pack.getContent();
let tableName = "";
if (typeRoll.total <= 2) {
  tableName = "Sacred Scrolls";
} else {
  tableName = "Unclean Scrolls";
}
let table = content.find(i => i.name === tableName);
await table.drawMany(numRoll.total);
})();
```
