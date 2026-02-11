const fs = require('fs');
const path = require('path');
const { buildFrontmatter } = require('../../lib/markdown');
const { CATEGORY } = require('../../lib/category');

function getDocumentsFromSQLite(siteDir) {
  try {
    const Database = require('better-sqlite3');
    const dbPath = path.join(siteDir, 'db.sqlite');

    if (!fs.existsSync(dbPath)) return null;

    const db = new Database(dbPath, { readonly: true });
    const docs = db.prepare('SELECT * FROM documents ORDER BY sidebar_position ASC').all();
    db.close();

    return docs.length > 0 ? docs : null;
  } catch {
    return null;
  }
}

module.exports = function dbDocsGeneratorPlugin(context) {
  const docsDir = path.join(context.siteDir, 'docs');

  return {
    name: 'db-docs-generator',

    async loadContent() {
      const documents = getDocumentsFromSQLite(context.siteDir);

      if (!documents || documents.length === 0) {
        console.log('[db-docs-generator] No documents found in SQLite');
        return null;
      }

      const categoryDir = path.join(docsDir, CATEGORY.slug);

      if (fs.existsSync(categoryDir)) {
        fs.rmSync(categoryDir, { recursive: true, force: true });
      }
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

      for (const doc of documents) {
        const filePath = path.join(categoryDir, `${doc.slug}.md`);
        fs.writeFileSync(filePath, buildFrontmatter(doc) + doc.content);
      }

      console.log(
        `[db-docs-generator] Generated ${documents.length} documents from SQLite in docs/${CATEGORY.slug}/`,
      );

      return { category: CATEGORY, documents };
    },
  };
};
