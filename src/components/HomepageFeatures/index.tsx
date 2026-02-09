import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  tone: 'gold' | 'navy' | 'ice';
  icon: ReactNode;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Guías técnicas corporativas',
    tone: 'gold',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path
          d="M10 13.5c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4V36c0 1.1-.9 2-2 2H16c-3.3 0-6 2.7-6 6V13.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 38h20M16 16h16M16 22h12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    description: (
      <>
        Estándares de ingeniería, prácticas de calidad y criterios de gobierno para
        alinear cada solución con la estrategia corporativa.
      </>
    ),
  },
  {
    title: 'Ecosistema de APIs',
    tone: 'navy',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path
          d="M16 24a6 6 0 0 1 6-6h6a6 6 0 1 1 0 12h-6a6 6 0 0 1-6-6Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 24h4M10 24a10 10 0 0 0 10 10h6M32 14a10 10 0 0 0-10-10H16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    description: (
      <>
        Contratos, modelos y patrones de integración para que cada equipo
        pueda construir servicios interoperables y seguros.
      </>
    ),
  },
  {
    title: 'Arquitectura y operación',
    tone: 'ice',
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path
          d="M10 34h28M14 34V18l10-6 10 6v16M20 34V24h8v10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 14V8M38 12h-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    description: (
      <>
        Visión de arquitectura, decisiones técnicas y lineamientos de operación
        listos para entornos críticos.
      </>
    ),
  },
];

function Feature({title, tone, icon, description}: FeatureItem) {
  return (
    <article className={styles.featureCard}>
      <div className={styles.featureIcon} data-tone={tone}>
        {icon}
      </div>
      <div className={styles.featureBody}>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </article>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            Pilares de la plataforma
          </Heading>
          <p className={styles.sectionSubtitle}>
            Consolidamos la forma de construir productos digitales con gobierno,
            continuidad operativa y experiencia coherente.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
