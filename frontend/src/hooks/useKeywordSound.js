const keyStrokeSounds = [
  new Audio("/sounds/keystorke1.mp3"),
  new Audio("/sounds/keystorke2.mp3"),
  new Audio("/sounds/keystorke3.mp3"),
  new Audio("/sounds/keystorke4.mp3"),
];

const useKeyboardSound = () => {
  const playRandomKeyStrokeSound = () => {
    const randomSound =
      keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

    randomSound.currentTime = 0;
    randomSound
      .play()
      .catch((error) => console.log("Audio play failed", error));
  };
  return { playRandomKeyStrokeSound };
};

export default useKeyboardSound;
