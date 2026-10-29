import React from "react";
import styled from "styled-components";
import Panel from "./Panel";
import { Project, clientWork, ownProducts } from "../data/cv";

const Content = styled.div`
  padding: 24px;
  font-family: ${({ theme }) => theme.fonts.sans};

  h3 {
    margin: 8px 0 14px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.85rem;
    font-weight: 400;
  }

  h3 + div + h3 {
    margin-top: 28px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
`;

const Card = styled.article<{ $hue: string }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ $hue }) => $hue};

  header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  h4 {
    font-size: 1.1rem;
  }

  p {
    flex: 1;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    line-height: 1.55;
  }

  small {
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.75rem;
  }

  a {
    align-self: flex-start;
    color: ${({ theme }) => theme.colors.teal};
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const Status = styled.span`
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(79, 209, 197, 0.12);
  color: ${({ theme }) => theme.colors.teal};
  font-size: 0.75rem;
`;

const HUES = ["#6c63ff", "#b56cff", "#4fd1c5", "#ff8fab", "#ffc46b"];

const ProjectGrid: React.FC<{ projects: Project[] }> = ({ projects }) => (
  <Grid>
    {projects.map((project, index) => (
      <Card key={project.name} $hue={HUES[index % HUES.length]}>
        <header>
          <h4>{project.name}</h4>
          <Status>{project.status}</Status>
        </header>
        <p>{project.description}</p>
        <small>{project.stack}</small>
        {project.url && (
          <a href={project.url} target="_blank" rel="noopener noreferrer">
            Open {new URL(project.url).hostname} ↗
          </a>
        )}
      </Card>
    ))}
  </Grid>
);

const ProjectsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <Panel title="marin@dev: ~/projects" variant="window" onClose={onClose}>
    <Content>
      <h3>$ ls ./own-products</h3>
      <ProjectGrid projects={ownProducts} />
      <h3>$ ls ./client-work</h3>
      <ProjectGrid projects={clientWork} />
    </Content>
  </Panel>
);

export default ProjectsPanel;
