import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const quickLinks = [
  {emoji: '📖', label: 'Introducción', to: '/docs/intro'},
  {emoji: '📘', label: 'Guías de Desarrollo', to: '/docs/category/guías-de-desarrollo'},
  {emoji: '⚛️', label: 'Frontend', to: '/docs/category/frontend'},
  {emoji: '🏗️', label: 'Arquitectura', to: '/docs/category/arquitectura'},
  {emoji: '🔐', label: 'Infraestructura', to: '/docs/category/infraestructura'},
  {emoji: '📝', label: 'Blog', to: '/blog'},
];

function HomepageHeader() {
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          Centro de Documentación Técnica
        </Heading>
        <p className={styles.heroSubtitle}>
          Guías, estándares y recursos técnicos para los equipos de desarrollo de Banco Pichincha.
        </p>
        <div className={styles.buttons}>
          <Link className={styles.ctaButton} to="/docs/intro">
            Explorar Documentación
          </Link>
        </div>
      </div>
    </header>
  );
}

function QuickLinks() {
  return (
    <section className={styles.quickLinks}>
      <div className="container">
        <Heading as="h2" className={styles.quickLinksTitle}>
          Accesos Rápidos
        </Heading>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map(({emoji, label, to}) => (
            <Link key={label} className={styles.quickLinkCard} to={to}>
              <span className={styles.quickLinkEmoji}>{emoji}</span>
              <span className={styles.quickLinkLabel}>{label}</span>
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
