export function registerFonts() {
  CONFIG.fontDefinitions["Alegreya"] = {
    editor: true,
    fonts: [
      { urls: ["systems/crysborg/assets/fonts/Alegreya-Regular.ttf"] },
      {
        urls: ["systems/crysborg/assets/fonts/Alegreya-Bold.ttf"],
        weight: 700,
      },
    ],
  };
  CONFIG.fontDefinitions["FetteTrumpDeutsch"] = {
    editor: true,
    fonts: [{ urls: ["systems/crysborg/assets/fonts/FetteTrumpDeutsch.ttf"] }],
  };
  CONFIG.fontDefinitions["Benjamin Franklin"] = {
    editor: true,
    fonts: [{ urls: ["systems/crysborg/assets/fonts/BenjaminFranklin.ttf"] }],
  };
  CONFIG.fontDefinitions["Inconsolata"] = {
    editor: true,
    fonts: [
      { urls: ["systems/crysborg/assets/fonts/Inconsolata-Regular.ttf"] },
      {
        urls: ["systems/crysborg/assets/fonts/Inconsolata-Bold.ttf"],
        weight: 700,
      },
    ],
  };
};
