import { rest } from "../rest.js";

export default class RestDialog extends Application {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "rest-dialog";
    options.classes = ["crysborg"];
    options.title = game.i18n.localize("MB.Rest");
    options.template = "systems/crysborg/templates/dialog/rest-dialog.hbs";
    options.width = 420;
    options.height = "auto";
    return options;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".rest-button").click(this._onRest.bind(this));
  }

  _onRest(event) {
    event.preventDefault();
    const form = $(event.currentTarget).parents(".rest-dialog")[0];
    const restLength = $(form).find("input[name=rest-length]:checked").val();
    const foodAndDrink = $(form)
      .find("input[name=food-and-drink]:checked")
      .val();
    const infected = $(form).find("input[name=infected]").is(":checked");
    this.close();
    // TODO: await this?
    rest(this.actor, restLength, foodAndDrink, infected);
  }
}
