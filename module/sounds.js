export function playSound(src, volume = 0.8) {
  if (src) {
    const pushToOtherClients = false;
    foundry.audio.AudioHelper.play({ src, volume, loop: false }, pushToOtherClients);
  }
};
