/**
 * Override the default Initiative formula to customize special behaviors of the system.
 * See Combat._getInitiativeFormula for more detail.
 */
export const _getInitiativeFormula = function(combatant) {
  const actor = combatant.actor;
  if (actor) {
    const agility = actor.data.data.attributes.agility;
    if (agility) {
      return `1d6+${agility.value}`
    }
  }
  // default
  return "1d6";
};