import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@theme/Layout';
import type { Document, DocumentFormData } from '@site/src/types/document';
import { documentApi } from '@site/src/services/documentApi';
import styles from './styles.module.css';

const EMPTY_FORM: DocumentFormData = {
  title: '',
  slug: '',
  category: 'base-de-datos-demo',
  sidebar_position: 0,
  author: '',
  content: '',
};

export default function AdminPage(): React.JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState<DocumentFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setDocuments(await documentApi.getAll());
      setError('');
    } catch {
      setError('No se pudo conectar con la API. Asegurate de que el servidor esté corriendo en el puerto 3001.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const resetForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const updateField = <K extends keyof DocumentFormData>(key: K, value: DocumentFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editing) {
        await documentApi.update(editing.id, form);
        showSuccess('Documento actualizado');
      } else {
        await documentApi.create(form);
        showSuccess('Documento creado');
      }
      resetForm();
      fetchDocs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const handleEdit = (doc: Document) => {
    setEditing(doc);
    setForm({
      title: doc.title,
      slug: doc.slug,
      category: doc.category,
      sidebar_position: doc.sidebar_position,
      author: doc.author,
      content: doc.content,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar este documento?')) return;

    try {
      await documentApi.remove(id);
      showSuccess('Documento eliminado');
      fetchDocs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <Layout title="Admin - Documentos" description="Panel de administración de documentos">
      <div className={styles.container}>
        <h1>Panel de Administración</h1>
        <p className={styles.subtitle}>
          Gestiona los documentos de la base de datos. Los cambios se reflejan en el sitio tras rebuild.
        </p>

        {error && <div className={styles.alertError}>{error}</div>}
        {success && <div className={styles.alertSuccess}>{success}</div>}

        <div className={styles.formCard}>
          <h2>{editing ? `Editando: ${editing.title}` : 'Crear nuevo documento'}</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Título *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span>Slug *</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  required
                  placeholder="mi-documento"
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span>Autor</span>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => updateField('author', e.target.value)}
                  className={styles.input}
                />
              </label>
              <label className={styles.field}>
                <span>Posición en sidebar</span>
                <input
                  type="number"
                  value={form.sidebar_position}
                  onChange={(e) => updateField('sidebar_position', Number(e.target.value))}
                  className={styles.input}
                />
              </label>
            </div>

            <label className={styles.fieldFull}>
              <span>Contenido (Markdown) *</span>
              <textarea
                value={form.content}
                onChange={(e) => updateField('content', e.target.value)}
                required
                rows={12}
                placeholder="# Mi documento&#10;&#10;Contenido en markdown..."
                className={styles.textarea}
              />
            </label>

            <div className={styles.actions}>
              <button type="submit" className={styles.btnPrimary}>
                {editing ? 'Guardar cambios' : 'Crear documento'}
              </button>
              {editing && (
                <button type="button" onClick={resetForm} className={styles.btnSecondary}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <h2>Documentos ({documents.length})</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : documents.length === 0 ? (
          <p>No hay documentos. Crea uno usando el formulario de arriba.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Slug</th>
                <th>Autor</th>
                <th>Actualizado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>
                  <td>{doc.title}</td>
                  <td className={styles.slugCell}>{doc.slug}</td>
                  <td>{doc.author}</td>
                  <td>{doc.last_updated}</td>
                  <td>
                    <button onClick={() => handleEdit(doc)} className={styles.btnSmall}>
                      Editar
                    </button>{' '}
                    <button onClick={() => handleDelete(doc.id)} className={styles.btnDanger}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
