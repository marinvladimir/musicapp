import React, { useCallback, useEffect, useState } from "react";
import Scene from "./scene/Scene";
import Hud from "./ui/Hud";
import Intro from "./ui/Intro";
import CvPanel from "./ui/CvPanel";
import TvPanel from "./ui/TvPanel";
import MusicPanel from "./ui/MusicPanel";
import { loadAlbums, useStore } from "./store";
import SoundScape from "./ui/SoundScape";
import LoadingScreen from "./ui/LoadingScreen";

const App: React.FC = () => {
  const entered = useStore((state) => state.entered);
  const enter = useStore((state) => state.enter);
  const panel = useStore((state) => state.panel);
  const closePanel = useStore((state) => state.closePanel);
  const [loading, setLoading] = useState(true);
  const finishLoading = useCallback(() => setLoading(false), []);

  useEffect(() => {
    loadAlbums().catch((error) => console.error(error));
  }, []);

  // Lets screen readers and the browser know which language is shown.
  const lang = useStore((state) => state.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <>
      <Scene />
      {loading && <LoadingScreen onDone={finishLoading} />}
      <SoundScape />
      {entered && <Hud />}
      {panel === "cv" && <CvPanel onClose={closePanel} />}
      {panel === "projects" && <TvPanel onClose={closePanel} />}
      {panel === "music" && <MusicPanel onClose={closePanel} />}
      {!entered && <Intro onEnter={() => enter()} onSkip={() => enter("cv")} />}
    </>
  );
};

export default App;
