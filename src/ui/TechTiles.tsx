import React from "react";
import styled from "styled-components";
import { techGroups } from "../data/tech";
import { useT } from "../i18n";

const Group = styled.div`
  & + & {
    margin-top: 16px;
  }

  h3 {
    margin-bottom: 8px;
    color: #55556e;
    font-size: 0.8rem;
    font-weight: 600;
  }
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 10px;
  list-style: none;
`;

const Tile = styled.li<{ $color: string; $ink: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: ${({ $color }) => $color};
  color: ${({ $ink }) => $ink};
  box-shadow: 0 3px 10px rgba(29, 29, 58, 0.12);
  text-align: center;
  break-inside: avoid;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }

  svg {
    width: 30px;
    height: 30px;
    fill: currentColor;
  }

  span {
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.2;
  }
`;

const Other = styled.p`
  margin-top: 14px;
  color: #55556e;
  font-size: 0.85rem;
`;

// Dark logo on light brand colours, white on dark ones.
const inkFor = (hex: string) => {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#111118" : "#ffffff";
};

const TechTiles: React.FC = () => {
  const t = useT();
  return (
    <>
      {techGroups.map(({ group, items }, index) => (
        <Group key={group}>
          <h3>{t.techGroups[index] ?? group}</h3>
          <Grid>
            {items.map(({ name, icon }) => (
              <Tile key={name} $color={`#${icon.hex}`} $ink={inkFor(icon.hex)}>
                <svg viewBox="0 0 24 24" role="img" aria-hidden>
                  <path d={icon.path} />
                </svg>
                <span>{name}</span>
              </Tile>
            ))}
          </Grid>
        </Group>
      ))}
      <Other>
        <strong>{t.also}</strong> {t.otherSkills.join(" · ")}
      </Other>
    </>
  );
};

export default TechTiles;
