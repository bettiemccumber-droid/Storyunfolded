/**
 * Generates one static HTML file per article at article/{slug}.html.
 * Run after adding or renaming articles: node scripts/generate-article-pages.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataPath = path.join(root, 'js', 'data.js');
const templatePath = path.join(root, 'article.html');
const outDir = path.join(root, 'article');

const dataSource = fs.readFileSync(dataPath, 'utf8');
const articlesBlock = dataSource.match(/const articles = \[([\s\S]*?)\n\];/);
if (!articlesBlock) {
    console.error('Could not parse articles from js/data.js');
    process.exit(1);
}

/**
 * @param {string} title
 * @returns {string}
 */
function slugifyTitle(title) {
    return title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s*&\s*/g, '-and-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 120);
}

const titleRe = /title:\s*"((?:\\.|[^"\\])*)"/g;
const titles = [];
let match;
while ((match = titleRe.exec(articlesBlock[1])) !== null) {
    titles.push(match[1].replace(/\\"/g, '"'));
}

if (titles.length === 0) {
    console.error('No article titles found');
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const slugs = titles.map((title) => slugifyTitle(title));
slugs.forEach((slug) => {
    const outPath = path.join(outDir, `${slug}.html`);
    fs.writeFileSync(outPath, template, 'utf8');
});

console.log(`Wrote ${slugs.length} files under article/`);
slugs.forEach((slug, i) => console.log(`  ${i + 1}. article/${slug}.html`));
