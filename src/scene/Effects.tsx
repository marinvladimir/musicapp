import React from "react";
import {
  Bloom,
  EffectComposer,
  Pixelation,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useStore } from "../store";

// Only colours brighter than 1 (the neon strips and signs, which are given
// HDR colours) glow, so screens and paper stay crisp.
const BLOOM_THRESHOLD = 1;
const PIXEL_SIZE = 4;

const Effects: React.FC = () => {
  const pixelMode = useStore((state) => state.pixelMode);

  return pixelMode ? (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.7}
        luminanceThreshold={BLOOM_THRESHOLD}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Pixelation granularity={PIXEL_SIZE} />
      <Vignette offset={0.3} darkness={0.65} />
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.9}
        luminanceThreshold={BLOOM_THRESHOLD}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  );
};

export default Effects;
