import { rollMisery } from "../../miseries.js";
import { miseryTrackerAnimations } from "../../settings.js";

export class MBMiseryTrackerSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["morkborg", "sheet", "actor", "misery-tracker"],
      width: 500,
      height: 740,
    });
  }

  /** @override */
  get template() {
    return "systems/morkborg/templates/actor/misery-tracker-sheet.hbs";
  }

  /** @override */
  getData() {
    const data = super.getData();
    for (let i = 1; i <= 6; i++) {
      const field = `misery${i}`;
      const misery = data.data.system[field];
      data.data.system[field].cssClass =
        misery.psalm && misery.verse ? "activated" : "";
    }
    data.data.system.miseryAnimationClass = miseryTrackerAnimations()
      ? "misery-animations"
      : "";
    data.data.system.seventhMiseryClass = data.data.system
      .seventhMiseryActivated
      ? "seventh-misery"
      : "";

    console.log(data);
    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // sheet header
    html.find(".misery-button").on("click", this._rollMisery.bind(this));
  }

  _rollMisery(event) {
    event.preventDefault();
    rollMisery(this.actor);
  }
}
