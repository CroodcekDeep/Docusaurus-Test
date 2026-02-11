/**
 * Generates Docusaurus-compatible markdown frontmatter for a document.
 * Shared between the API server and the build plugin to avoid duplication.
 */
function buildFrontmatter(doc) {
  return [
    '---',
    `title: "${doc.title}"`,
    `sidebar_position: ${doc.sidebar_position}`,
    `slug: ${doc.slug}`,
    `tags: [database, demo]`,
    '---',
    '',
  ].join('\n');
}

module.exports = { buildFrontmatter };
