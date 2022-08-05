export const byName = (a, b) =>
  a.name > b.name ? 1 : b.name > a.name ? -1 : 0;

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const evalRoll = (formula) => {
  return new Roll(formula).evaluate({ async: false });
};

export const rollTotal = (formula) => {
  return new Roll(formula).evaluate({ async: false }).total;
};
