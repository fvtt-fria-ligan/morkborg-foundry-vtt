export const playSound = (src, volume = 0.8) => {
  if (src) {
    const pushToOtherClients = false;
    AudioHelper.play({ src, volume, loop: false }, pushToOtherClients);
  }
};
