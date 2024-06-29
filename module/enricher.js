// e.g., @DRAW[Compendium.morkborg.mork-borg-tables.vX47Buopuq9t0x9r]{Names}
// optionally add a roll for the draw at the end
// e.g., @DRAW[Compendium.morkborg.mork-borg-tables.vX47Buopuq9t0x9r]{Names}{1d4}
const DRAW_FROM_TABLE_PATTERN = /@DRAW\[([^\]]+)\]{([^}]*)}(?:{([^}]*)})?/gm;

function drawFromTableEnricher(match) {
  const uuid = match[1];
  const tableName = match[2];
  const roll = match[3];
  const elem = document.createElement("span");
  elem.className = "draw-from-table";
  elem.setAttribute("title", `Draw from ${tableName}`);
  elem.setAttribute("data-uuid", uuid);
  if (roll) {
    elem.setAttribute("data-roll", roll);
  }
  elem.innerHTML = `<i class="fas fa-dice-d20">&nbsp;</i>`;
  return elem;
};

export function enrichTextEditors() {
  CONFIG.TextEditor.enrichers.push({
    pattern: DRAW_FROM_TABLE_PATTERN,
    enricher: drawFromTableEnricher,
  });
};
