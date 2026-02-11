const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const { buildFrontmatter } = require('../lib/markdown');
const { CATEGORY } = require('../lib/category');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- Paths ---
const DOCS_DIR = path.join(__dirname, '..', 'docs');

// --- Prepared statements (reuse across requests) ---
const stmts = {
  all: db.prepare('SELECT * FROM documents ORDER BY sidebar_position ASC'),
  byId: db.prepare('SELECT * FROM documents WHERE id = ?'),
  bySlug: db.prepare('SELECT * FROM documents WHERE slug = ?'),
  insert: db.prepare(`
    INSERT INTO documents (title, slug, category, sidebar_position, author, last_updated, content)
    VALUES (?, ?, ?, ?, ?, date('now'), ?)
  `),
  update: db.prepare(`
    UPDATE documents
    SET title = ?, slug = ?, category = ?, sidebar_position = ?, author = ?, last_updated = date('now'), content = ?
    WHERE id = ?
  `),
  remove: db.prepare('DELETE FROM documents WHERE id = ?'),
};

// --- Doc regeneration: writes .md files for Docusaurus dev server ---
function regenerateDocs() {
  try {
    const categoryDir = path.join(DOCS_DIR, CATEGORY.slug);
    const documents = stmts.all.all();

    fs.mkdirSync(categoryDir, { recursive: true });

    fs.writeFileSync(
      path.join(categoryDir, '_category_.json'),
      JSON.stringify({
        label: CATEGORY.label,
        position: CATEGORY.position,
        description: CATEGORY.description,
        link: { type: 'generated-index', description: CATEGORY.description },
      }, null, 2),
    );

    const expectedFiles = new Set(['_category_.json']);

    for (const doc of documents) {
      const filename = `${doc.slug}.md`;
      expectedFiles.add(filename);

      const filePath = path.join(categoryDir, filename);
      const newContent = buildFrontmatter(doc) + doc.content;

      const currentContent = fs.existsSync(filePath)
        ? fs.readFileSync(filePath, 'utf-8')
        : null;

      if (currentContent !== newContent) {
        fs.writeFileSync(filePath, newContent);
      }
    }

    for (const file of fs.readdirSync(categoryDir)) {
      if (!expectedFiles.has(file)) {
        fs.unlinkSync(path.join(categoryDir, file));
      }
    }

    console.log(`[api] Regenerated ${documents.length} docs`);
  } catch (err) {
    console.error('[api] Error regenerating docs:', err.message);
  }
}

// --- Helpers ---
function findDocOrFail(res, id) {
  const doc = stmts.byId.get(id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return null;
  }
  return doc;
}

// --- Routes ---
app.get('/api/documents', (_req, res) => {
  res.json(stmts.all.all());
});

app.get('/api/documents/by-slug/:slug', (req, res) => {
  const doc = stmts.bySlug.get(req.params.slug);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
});

app.get('/api/documents/:id', (req, res) => {
  const doc = findDocOrFail(res, req.params.id);
  if (doc) res.json(doc);
});

app.post('/api/documents', (req, res) => {
  const { title, slug, category, sidebar_position, author, content } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: 'title, slug, and content are required' });
  }

  try {
    const result = stmts.insert.run(
      title, slug, category || 'base-de-datos-demo',
      sidebar_position || 0, author || '', content,
    );
    const newDoc = stmts.byId.get(result.lastInsertRowid);
    regenerateDocs();
    res.status(201).json(newDoc);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A document with that slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/documents/:id', (req, res) => {
  const existing = findDocOrFail(res, req.params.id);
  if (!existing) return;

  const { title, slug, category, sidebar_position, author, content } = req.body;

  try {
    stmts.update.run(
      title ?? existing.title,
      slug ?? existing.slug,
      category ?? existing.category,
      sidebar_position ?? existing.sidebar_position,
      author ?? existing.author,
      content ?? existing.content,
      req.params.id,
    );
    const updated = stmts.byId.get(req.params.id);
    regenerateDocs();
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A document with that slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', (req, res) => {
  const existing = findDocOrFail(res, req.params.id);
  if (!existing) return;

  stmts.remove.run(req.params.id);
  regenerateDocs();
  res.json({ message: 'Document deleted', id: Number(req.params.id) });
});

app.listen(PORT, () => {
  console.log(`[api] Server running at http://localhost:${PORT}`);
});
