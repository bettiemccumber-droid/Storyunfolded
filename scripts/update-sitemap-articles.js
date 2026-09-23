const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataSource = fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8');
const sitemapPath = path.join(root, 'sitemap.xml');

const block = dataSource.match(/const articles = \[([\s\S]*?)\n\];/)[1];
const entries = [];
const idRe = /id:\s*(\d+),/g;
const titleRe = /title:\s*"((?:\\.|[^"\\])*)"/g;
const dateRe = /date:\s*"([^"]+)"/g;

const articleCount = (block.match(/^\s+id:\s*\d+,/gm) || []).length;
const ids = [...block.matchAll(idRe)].map((m) => m[1]).slice(0, articleCount);
const titles = [...block.matchAll(titleRe)].map((m) => m[1].replace(/\\"/g, '"')).slice(0, articleCount);
const dates = [...block.matchAll(dateRe)].map((m) => m[1]).slice(0, articleCount);

for (let i = 0; i < ids.length; i++) {
    entries.push({ id: ids[i], title: titles[i], date: dates[i] });
}

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

const articleXml = entries
    .map(
        (e) => `  <url>
    <loc>https://storyunfolded.top/article/${slugifyTitle(e.title)}.html</loc>
    <lastmod>${e.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('\n  \n');

let sitemap = fs.readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(
    /  <!-- Articles -->[\s\S]*?(?=  <!-- Category Pages -->)/,
    `  <!-- Articles -->\n  \n${articleXml}\n  \n`
);

if (!sitemap.includes('article/dore-and-rose')) {
    console.error('Sitemap replace failed');
    process.exit(1);
}

fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log('Updated sitemap article URLs');
