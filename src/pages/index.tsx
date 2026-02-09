import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const quickLinks = [
  {label: 'Introducción', description: 'Primeros pasos y principios base.', to: '/docs/intro'},
  {label: 'Guías de Desarrollo', description: 'Estándares y prácticas del banco.', to: '/docs/category/guías-de-desarrollo'},
  {label: 'Frontend', description: 'Diseño, accesibilidad y performance.', to: '/docs/category/frontend'},
  {label: 'Arquitectura', description: 'Patrones, decisiones y diagramas.', to: '/docs/category/arquitectura'},
  {label: 'Infraestructura', description: 'Cloud, seguridad y operación.', to: '/docs/category/infraestructura'},
  {label: 'Blog', description: 'Novedades y lanzamientos técnicos.', to: '/blog'},
];

const signalCards = [
  {
    title: 'Gobierno técnico',
    description: 'Lineamientos unificados para experiencias consistentes.',
  },
  {
    title: 'Seguridad por diseño',
    description: 'Modelos, controles y cumplimiento en cada entrega.',
  },
  {
    title: 'Arquitectura escalable',
    description: 'Patrones listos para productos críticos.',
  },
];

const spotlightLinks = [
  {label: 'Onboarding de ingeniería', to: '/docs/intro'},
  {label: 'Frontend y diseño', to: '/docs/category/frontend'},
  {label: 'Arquitectura cloud', to: '/docs/category/arquitectura'},
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className="container">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Banco Pichincha · Ingeniería Digital</span>
            <Heading as="h1" className={styles.heroTitle}>
              Plataforma de conocimiento técnico para construir a escala
            </Heading>
            <p className={styles.heroLead}>
              Estándares corporativos, arquitectura y guías operativas para acelerar equipos,
              asegurar cumplimiento y mantener una experiencia bancaria coherente.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryCta} to="/docs/intro">
                Explorar documentación
              </Link>
              <Link className={styles.secondaryCta} to="/docs/category/guías-de-desarrollo">
                Ver estándares
              </Link>
            </div>
            <div className={styles.heroMeta}>
              <div className={styles.metaCard}>
                <span className={styles.metaTitle}>Gobierno unificado</span>
                <span className={styles.metaDescription}>Normas, revisión y cumplimiento técnico.</span>
              </div>
              <div className={styles.metaCard}>
                <span className={styles.metaTitle}>Entrega acelerada</span>
                <span className={styles.metaDescription}>Guías listas para productos críticos.</span>
              </div>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Ruta prioritaria</span>
              <span className={styles.panelBadge}>{siteConfig.title}</span>
            </div>
            <div className={styles.panelBody}>
              {signalCards.map(({title, description}) => (
                <div key={title} className={styles.signalCard}>
                  <span className={styles.signalTitle}>{title}</span>
                  <span className={styles.signalDescription}>{description}</span>
                </div>
              ))}
            </div>
            <div className={styles.panelFooter}>
              {spotlightLinks.map(({label, to}) => (
                <Link key={label} className={styles.panelLink} to={to}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Exploración rápida
          </Heading>
          <p className={styles.sectionSubtitle}>
            Accede a lo más consultado por ingeniería en una sola vista.
          </p>
        </div>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map(({label, description, to}) => (
            <Link key={label} className={styles.quickLinkCard} to={to}>
              <div>
                <span className={styles.quickLinkLabel}>{label}</span>
                <span className={styles.quickLinkDescription}>{description}</span>
              </div>
              <span className={styles.quickLinkArrow} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Centro de Documentación"
      description="Documentación técnica para los equipos de desarrollo de Banco Pichincha">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <QuickLinks />
      </main>
    </Layout>
  );
}
