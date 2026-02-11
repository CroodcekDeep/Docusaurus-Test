import React, { useState } from 'react';
import TOCDesktop from '@theme-original/DocItem/TOC/Desktop';
import type TOCDesktopType from '@theme/DocItem/TOC/Desktop';
import type { WrapperProps } from '@docusaurus/types';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { useHistory } from '@docusaurus/router';
import type { Document } from '@site/src/types/document';
import { documentApi } from '@site/src/services/documentApi';
import DocEditor from '@site/src/components/DocEditor';
import styles from './styles.module.css';

type Props = WrapperProps<typeof TOCDesktopType>;

export default function TOCDesktopWrapper(props: Props): React.JSX.Element {
  const { metadata } = useDoc();
  const history = useHistory();
  const [editorOpen, setEditorOpen] = useState(false);
  const [docData, setDocData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const isDatabaseDoc = metadata.tags?.some((tag) => tag.label === 'database');
  const slug = metadata.slug?.split('/').pop() || '';

  const handleEdit = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getBySlug(slug);
      setDocData(data);
      setEditorOpen(true);
    } catch {
      alert('No se pudo cargar el documento para editar.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const data = await documentApi.getBySlug(slug);
      await navigator.clipboard.writeText(data.content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch {
      alert('No se pudo copiar el contenido.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) {
      return;
    }
    try {
      const data = await documentApi.getBySlug(slug);
      await documentApi.remove(data.id);
      history.push('/docs/intro');
    } catch {
      alert('No se pudo eliminar el documento.');
    }
  };

  return (
    <>
      <TOCDesktop {...props} />

      {isDatabaseDoc && (
        <div className={styles.actionPanel}>
          <div className={styles.actionTitle}>Acciones</div>

          <button
            className={`${styles.actionButton} ${styles.actionEdit}`}
            onClick={handleEdit}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {loading ? 'Cargando...' : 'Editar'}
          </button>

          <button
            className={`${styles.actionButton} ${styles.actionCopy}`}
            onClick={handleCopy}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copiar Markdown
          </button>

          {copyFeedback && (
            <div className={styles.copyFeedback}>Copiado!</div>
          )}

          <button
            className={`${styles.actionButton} ${styles.actionDelete}`}
            onClick={handleDelete}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Eliminar
          </button>
        </div>
      )}

      {editorOpen && docData && (
        <DocEditor
          doc={docData}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            window.location.href = window.location.href;
          }}
        />
      )}
    </>
  );
}
