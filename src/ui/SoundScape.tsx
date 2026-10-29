import { useEffect } from "react";
import { useStore } from "../store";
import { setAmbience, setCrackle, setSoundsEnabled } from "../audio/sfx";

// Keeps the room's background sounds in step with what is going on.
const SoundScape = () => {
  const entered = useStore((state) => state.entered);
  const soundsOn = useStore((state) => state.soundsOn);
  const hasRecord = useStore((state) => !!state.currentSong);
  const isPlaying = useStore((state) => state.isPlaying);

  useEffect(() => {
    setSoundsEnabled(soundsOn);
  }, [soundsOn]);

  // The hum starts with the visitor's click on "Enter the room", since
  // browsers only allow sound after one.
  useEffect(() => {
    if (entered) setAmbience(true);
    return () => {
      setAmbience(false);
    };
  }, [entered]);

  // A record on the turntable with the needle up crackles quietly.
  useEffect(() => {
    setCrackle(entered && hasRecord && !isPlaying);
  }, [entered, hasRecord, isPlaying]);

  return null;
};

export default SoundScape;
