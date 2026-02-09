import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Guías Técnicas',
    emoji: '📘',
    description: (
      <>
        Documentación detallada sobre estándares de desarrollo, buenas prácticas
        y lineamientos técnicos para todos los equipos.
      </>
    ),
  },
  {
    title: 'APIs & Servicios',
    emoji: '🔗',
    description: (
      <>
        Referencia completa de APIs, contratos de servicios, integraciones
        y patrones de comunicación entre microservicios.
      </>
    ),
  },
  {
    title: 'Arquitectura',
    emoji: '🏗️',
    description: (
      <>
        Diagramas de arquitectura, decisiones técnicas, patrones de diseño
        y guías de infraestructura cloud.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span className={styles.featureEmoji}>{emoji}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
