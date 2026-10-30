import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Panel from "./Panel";
import { useStore } from "../store";
import { useCv, useT } from "../i18n";
import { channels } from "../data/cv";
import { OSD_SECONDS, STATIC_SECONDS, changeChannel, tuneTo } from "../tv";
import { drawOsd, drawScanlines, drawStatic, drawTestCard } from "../tvDraw";

const SCREEN_W = 640;
const SCREEN_H = 480;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 20px;
  padding: 20px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

// Plastic CRT casing around the screen.
const Casing = styled.div`
  padding: 18px 18px 14px;
  border-radius: 22px;
  background: linear-gradient(160deg, #3a3a4f, #1f1f2c);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.08),
    0 18px 40px rgba(0, 0, 0, 0.5);
`;

const Screen = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 18px / 24px;
  background: #050508;
  box-shadow:
    inset 0 0 40px rgba(0, 0, 0, 0.9),
    0 0 0 6px #0c0c12;

  canvas,
  video,
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Blurred copy of the picture behind it fills the rest of the screen. */
  .backdrop {
    object-fit: cover;
    filter: blur(18px) brightness(0.45);
    transform: scale(1.15);
  }

  /* Glass reflection and vignette of a curved tube */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
        ellipse at 30% 20%,
        rgba(255, 255, 255, 0.12),
        transparent 45%
      ),
      radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.55));
  }
`;

const ControlStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.75rem;

  button {
    padding: 6px 14px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    background: #15151f;
    color: ${({ theme }) => theme.colors.text};
    font-family: inherit;
    cursor: pointer;
  }

  button:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  span:last-child {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  span:last-child::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff6b6b;
    box-shadow: 0 0 8px #ff6b6b;
  }
`;

// Teletext-style programme guide.
const Guide = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #000000;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.85rem;
`;

const GuideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  background: #0000c0;
  color: #ffff00;
  font-weight: 500;
`;

const ChannelList = styled.ol`
  list-style: none;
  padding: 8px 0;

  button {
    display: flex;
    gap: 12px;
    width: 100%;
    padding: 5px 12px;
    border: none;
    background: none;
    color: #ffffff;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  button span:first-child {
    color: #00ffff;
  }

  button:hover,
  button[aria-current="true"] {
    background: #00c000;
    color: #000000;
  }

  button[aria-current="true"] span:first-child,
  button:hover span:first-child {
    color: #000000;
  }
`;

const Details = styled.div`
  flex: 1;
  padding: 12px;
  border-top: 2px solid #0000c0;
  color: #ffffff;
  line-height: 1.6;

  h3 {
    color: #ffff00;
    font-size: 1rem;
  }

  p {
    margin-top: 8px;
    font-family: ${({ theme }) => theme.fonts.sans};
  }

  small {
    display: block;
    margin-top: 8px;
    color: #00ffff;
  }

  a {
    display: inline-block;
    margin-top: 10px;
    padding: 4px 10px;
    background: #c00000;
    color: #ffffff;
    text-decoration: none;
  }
`;

const Status = styled.span`
  margin-left: 8px;
  color: #00ff00;
  font-size: 0.75rem;
`;

const TvScreen: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const channel = useStore((state) => state.channel);
  const project = channels[channel];

  useEffect(() => {
    let frame = 0;
    let lastDrawn = "";
    const render = () => {
      const context = canvasRef.current?.getContext("2d");
      if (context) {
        const { channel: current, channelChangedAt } = useStore.getState();
        const elapsed = (performance.now() - channelChangedAt) / 1000;
        const showOsd = elapsed < OSD_SECONDS;
        const key = `${current}-${showOsd}`;
        if (elapsed < STATIC_SECONDS) {
          drawStatic(context, SCREEN_W, SCREEN_H);
          drawScanlines(context, SCREEN_W, SCREEN_H);
          lastDrawn = "";
        } else if (key !== lastDrawn) {
          // With a video or screenshot the canvas only carries the channel
          // number; otherwise it shows the test card.
          const media = channels[current].demo || channels[current].image;
          if (media) context.clearRect(0, 0, SCREEN_W, SCREEN_H);
          else drawTestCard(context, SCREEN_W, SCREEN_H, channels[current]);
          if (showOsd) drawOsd(context, SCREEN_W, SCREEN_H, current + 1);
          if (!media) drawScanlines(context, SCREEN_W, SCREEN_H);
          lastDrawn = key;
        }
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Screen>
      {project.image && (
        <img
          key={`${project.image}-backdrop`}
          className="backdrop"
          src={project.image}
          alt=""
        />
      )}
      {project.demo ? (
        <video
          key={project.demo}
          src={project.demo}
          poster={project.image}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        project.image && <img key={project.image} src={project.image} alt="" />
      )}
      <canvas
        ref={canvasRef}
        width={SCREEN_W}
        height={SCREEN_H}
        role="img"
        aria-label={`Channel ${channel + 1}: ${project.name}`}
      />
    </Screen>
  );
};

const TvPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const t = useT();
  // Same channels as the screen, with texts in the visitor's language.
  const { channels: guide } = useCv();
  const channel = useStore((state) => state.channel);
  const project = guide[channel];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown")
        changeChannel(1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
        changeChannel(-1);
      else if (
        /^[1-9]$/.test(event.key) &&
        Number(event.key) <= channels.length
      )
        tuneTo(Number(event.key) - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Panel title={t.tvTitle} variant="window" onClose={onClose}>
      <Layout>
        <div>
          <Casing>
            <TvScreen />
          </Casing>
          <ControlStrip>
            <button
              onClick={() => changeChannel(-1)}
              aria-label={t.previousChannel}
            >
              ◀ CH
            </button>
            <button onClick={() => changeChannel(1)} aria-label={t.nextChannel}>
              CH ▶
            </button>
            <span>{t.switchHint(Math.min(9, guide.length))}</span>
            <span>{t.on}</span>
          </ControlStrip>
        </div>

        <Guide>
          <GuideHeader>
            <span>{t.guide}</span>
            <span>CH {String(channel + 1).padStart(2, "0")}</span>
          </GuideHeader>
          <ChannelList>
            {guide.map((item, index) => (
              <li key={item.name}>
                <button
                  aria-current={index === channel}
                  onClick={() => tuneTo(index)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ChannelList>
          <Details aria-live="polite">
            <h3>
              {project.name}
              <Status>{project.status}</Status>
            </h3>
            <p>{project.description}</p>
            <small>{project.stack}</small>
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                {t.visit(new URL(project.url).hostname)}
              </a>
            )}
          </Details>
        </Guide>
      </Layout>
    </Panel>
  );
};

export default TvPanel;
