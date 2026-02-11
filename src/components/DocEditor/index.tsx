import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import type { Document } from '@site/src/types/document';
import { documentApi } from '@site/src/services/documentApi';
import styles from './styles.module.css';

interface DocEditorProps {
  doc: Document;
  onClose: () => void;
  onSaved: () => void;
}

export default function DocEditor({ doc, onClose, onSaved }: DocEditorProps) {
  const [title, setTitle] = useState(doc.title);
  const [author, setAuthor] = useState(doc.author || '');
  const [content, setContent] = useState(doc.content);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  const previewHtml = useMemo(() => {
    try {
      return marked.parse(content) as string;
    } catch {
      return '<p>Error al renderizar preview</p>';
    }
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    try {
      await documentApi.update(doc.id, {
        title,
        slug: doc.slug,
        category: doc.category,
        sidebar_position: doc.sidebar_position,
        author,
        content,
      });

      setStatus({ type: 'success', msg: 'Guardado. Recargando...' });
      await new Promise((r) => setTimeout(r, 500));
      onSaved();
    } catch (err: unknown) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <input
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulo del documento"
            />
            <input
              className={styles.authorInput}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Autor"
            />
            {status && (
              <span className={`${styles.statusMsg} ${styles[status.type]}`}>
                {status.msg}
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.btnSave} onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        <div className={styles.splitView}>
          <div className={styles.editorPane}>
            <div className={styles.editorLabel}>Markdown</div>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className={styles.previewPane}>
            <div className={styles.editorLabel}>Preview</div>
            <div
              className={styles.previewContent}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
