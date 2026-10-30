import React from "react";
import styled from "styled-components";
import Panel from "./Panel";
import TechTiles from "./TechTiles";
import { useCv, useT } from "../i18n";

const Page = styled.article`
  padding: 0 0 40px;
  font-size: 0.95rem;
  line-height: 1.55;
`;

const Header = styled.header`
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 32px 40px 28px;
  background: #12122a;
  color: #ffffff;
  border-bottom: 6px solid transparent;
  border-image: linear-gradient(90deg, #6c63ff, #4fd1c5) 1;

  h1 {
    font-size: clamp(1.9rem, 5vw, 2.6rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.85);
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    align-items: flex-start;
    padding: 24px 20px;

    img {
      width: 88px;
      height: 88px;
    }
  }
`;

const Title = styled.p`
  margin-top: 6px;
  color: #a9a4ff;
  font-size: 1.15rem;
  font-weight: 500;
`;

const Meta = styled.p`
  margin-top: 6px;
  color: #c9c9dd;
  font-size: 0.9rem;

  a {
    color: inherit;
  }
`;

const Badge = styled.span`
  display: inline-block;
  margin-top: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(79, 209, 197, 0.15);
  color: #4fd1c5;
  font-size: 0.8rem;
  font-weight: 500;
`;

const Section = styled.section`
  padding: 24px 40px 0;

  h2 {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 14px;
    color: #6c63ff;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;

    &::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #e6e4f5;
    }
  }

  @media (max-width: 640px) {
    padding: 20px 20px 0;
  }
`;

const Grid = styled.div<{ $min: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${({ $min }) => $min}px, 1fr));
  gap: 12px;
`;

const Card = styled.div`
  padding: 14px 16px;
  border-radius: 10px;
  background: #f3f2ff;

  h3 {
    font-size: 1rem;
  }

  p {
    margin-top: 4px;
    color: #55556e;
    font-size: 0.85rem;
  }
`;

const Job = styled.div`
  & + & {
    margin-top: 20px;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 16px;
  }

  h3 {
    font-size: 1.05rem;
  }

  h3 span {
    color: #4b43d6;
  }

  time {
    color: #6b6b82;
    font-size: 0.85rem;
    font-weight: 500;
  }

  ul {
    margin: 8px 0 0 18px;
  }

  li::marker {
    color: #6c63ff;
  }
`;

const Details = styled.p`
  color: #6b6b82;
  font-size: 0.85rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;

  span {
    padding: 2px 10px;
    border-radius: 999px;
    background: #efeeff;
    color: #3a3577;
    font-size: 0.75rem;
  }
`;

const Product = styled(Card)`
  background: #ffffff;
  border: 1px solid #e6e4f5;

  h3 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  h3 span {
    padding: 1px 8px;
    border-radius: 999px;
    background: #e3f8f5;
    color: #1f8f84;
    font-size: 0.7rem;
    font-weight: 500;
  }

  small {
    display: block;
    margin-top: 8px;
    color: #8b8ba3;
    font-size: 0.75rem;
  }
`;

const PrintButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e6e4f5;
  border-radius: 8px;
  background: #ffffff;
  color: #3a3577;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background: #efeeff;
  }
`;

const CvPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const t = useT();
  const { profile, experience, ownProducts, education } = useCv();
  return (
    <Panel
      title="cv.pdf"
      variant="paper"
      onClose={onClose}
      print
      actions={
        <PrintButton onClick={() => window.print()}>{t.print}</PrintButton>
      }
    >
      <Page>
        <Header>
          <div>
            <h1>{profile.name}</h1>
            <Title>{profile.title}</Title>
            <Meta>{profile.stack}</Meta>
            <Meta>
              <a href={`mailto:${profile.email}`}>{profile.email}</a> ·{" "}
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                {profile.phone}
              </a>{" "}
              · {profile.location}
              {profile.links.map((link) => (
                <React.Fragment key={link.url}>
                  {" · "}
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </Meta>
            <Badge>{profile.availability}</Badge>
          </div>
          <img src={profile.photo} alt={profile.name} />
        </Header>

        <Section>
          <h2>{t.profileTitle}</h2>
          <p>{profile.summary}</p>
          <Grid $min={200} style={{ marginTop: 14 }}>
            {profile.highlights.map((item) => (
              <Card key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section>
          <h2>{t.experienceTitle}</h2>
          {experience.map((job) => (
            <Job key={job.company}>
              <header>
                <h3>
                  <span>{job.company}</span> · {job.role}
                </h3>
                <time>{job.period}</time>
              </header>
              <Details>{job.details}</Details>
              <ul>
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {job.tags.length > 0 && (
                <Tags>
                  {job.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </Tags>
              )}
            </Job>
          ))}
        </Section>

        <Section>
          <h2>{t.productsTitle}</h2>
          <Grid $min={260}>
            {ownProducts.map((product) => (
              <Product key={product.name}>
                <h3>
                  {product.name} <span>{product.status}</span>
                </h3>
                <p>{product.description}</p>
                <small>{product.stack}</small>
              </Product>
            ))}
          </Grid>
        </Section>

        <Section>
          <h2>{t.techTitle}</h2>
          <TechTiles />
        </Section>

        <Section>
          <h2>{t.educationTitle}</h2>
          <Grid $min={200}>
            <div>
              <h3>{education.degree}</h3>
              <Details>{education.school}</Details>
            </div>
            <div>
              {education.languages.map((language) => (
                <p key={language.name}>
                  <strong>{language.name}</strong> · {language.level}
                </p>
              ))}
            </div>
            <div>
              <h3>{education.more.title}</h3>
              <Details>{education.more.text}</Details>
            </div>
          </Grid>
        </Section>
      </Page>
    </Panel>
  );
};

export default CvPanel;
