import React, { useEffect } from "react";
import Scene from "./scene/Scene";
import Hud from "./ui/Hud";
import Intro from "./ui/Intro";
import CvPanel from "./ui/CvPanel";
import TvPanel from "./ui/TvPanel";
import MusicPanel from "./ui/MusicPanel";
import { loadAlbums, useStore } from "./store";

const App: React.FC = () => {
  const entered = useStore((state) => state.entered);
  const enter = useStore((state) => state.enter);
  const panel = useStore((state) => state.panel);
  const closePanel = useStore((state) => state.closePanel);

  useEffect(() => {
    loadAlbums().catch((error) => console.error(error));
  }, []);

  return (
    <>
      <Scene />
      {entered && <Hud />}
      {panel === "cv" && <CvPanel onClose={closePanel} />}
      {panel === "projects" && <TvPanel onClose={closePanel} />}
      {panel === "music" && <MusicPanel onClose={closePanel} />}
      {!entered && <Intro onEnter={() => enter()} onSkip={() => enter("cv")} />}
    </>
  );
};

export default App;
