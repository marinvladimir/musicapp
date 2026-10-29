import React, { useEffect, useState } from "react";
import Scene from "./scene/Scene";
import Hud from "./ui/Hud";
import Intro from "./ui/Intro";
import CvPanel from "./ui/CvPanel";
import ProjectsPanel from "./ui/ProjectsPanel";
import MusicPanel from "./ui/MusicPanel";
import { loadAlbums, useStore } from "./store";

const App: React.FC = () => {
  const [entered, setEntered] = useState(false);
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
      {panel === "projects" && <ProjectsPanel onClose={closePanel} />}
      {panel === "music" && <MusicPanel onClose={closePanel} />}
      {!entered && (
        <Intro
          onEnter={() => setEntered(true)}
          onSkip={() => {
            setEntered(true);
            useStore.setState({ panel: "cv" });
          }}
        />
      )}
    </>
  );
};

export default App;
