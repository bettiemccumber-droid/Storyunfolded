document.addEventListener('DOMContentLoaded', function() {
    const article = findArticleFromLocation();

    if (!article) {
        document.getElementById('articleHeader').innerHTML = '<h1>Article not found</h1>';
        return;
    }

    const canonicalPath = `/${getArticlePath(article)}`;
    const onLegacyArticlePage = /\/article\.html$/i.test(window.location.pathname);
    const hasLegacyQuery =
        new URLSearchParams(window.location.search).has('id') ||
        new URLSearchParams(window.location.search).has('slug');

    if (onLegacyArticlePage || hasLegacyQuery || window.location.pathname !== canonicalPath) {
        window.history.replaceState(null, '', canonicalPath);
    }

    const ui = getArticleUi(article);
    updateSEOTags(article);

    const heroImgClass = article.heroImageFit === 'contain' ? 'hero-contain' : '';
    const categoryLabel = article.categoryLabel || article.category;

    document.getElementById('articleHeader').innerHTML = `
        <span class="category">${categoryLabel}</span>
        <h1>${article.title}</h1>
        <p class="meta">
            <i class="far fa-calendar"></i> ${formatDate(article.date, article.locale)}
            <span style="margin: 0 10px;">•</span>
            <i class="far fa-clock"></i> ${ui.minRead}
        </p>
        <img src="${article.image}" alt="${article.title}" class="${heroImgClass}">
    `;

    applyArticlePageUi(article, ui);

    document.getElementById('articleContent').innerHTML = article.content;

    const relatedArticles = sortArticlesByDateDesc(
        articles.filter(a => a.category === article.category && a.id !== article.id)
    ).slice(0, 3);

    document.getElementById('relatedArticles').innerHTML = relatedArticles.map(a => `
        <article class="post-card">
            <img src="${a.image}" alt="${a.title}">
            <div class="card-content">
                <span class="category">${a.categoryLabel || a.category}</span>
                <h3>${a.title}</h3>
                <p class="meta"><i class="far fa-calendar"></i> ${formatDate(a.date, article.locale)}</p>
                <a href="/${getArticlePath(a)}" class="read-more">${ui.readMore} <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');

    const recentPosts = sortArticlesByDateDesc(articles).slice(0, 5);
    document.getElementById('recentPosts').innerHTML = recentPosts.map(a => `
        <div class="post-item">
            <img src="${a.image}" alt="${a.title}">
            <div>
                <h4><a href="/${getArticlePath(a)}">${a.title}</a></h4>
                <p class="meta"><i class="far fa-calendar"></i> ${formatDate(a.date, article.locale)}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('categoryList').innerHTML = categories.map(cat => {
        const name = getCategoryDisplayName(cat, article.lang);
        return `
        <li>
            <a href="blog.html?category=${cat.slug}">
                ${name}
                <span>(${cat.count})</span>
            </a>
        </li>
    `;
    }).join('');

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

/**
 * Update document meta tags and canonical URL for the active article.
 * @param {object} article - Article record
 */
function updateSEOTags(article) {
    const canonicalUrl = getArticleCanonicalUrl(article);
    const ui = getArticleUi(article);
    const categoryLabel = article.categoryLabel || article.category;

    if (article.lang) {
        document.documentElement.lang = article.lang;
    }

    document.title = `${article.title} | Storyunfolded`;

    updateMetaTag('name', 'description', article.excerpt);
    updateMetaTag(
        'name',
        'keywords',
        article.keywords || `${categoryLabel}, ${article.title}, ${ui.keywordsSuffix}`
    );
    updateMetaTag('name', 'language', ui.languageName);

    updateMetaTag('property', 'og:title', article.title);
    updateMetaTag('property', 'og:description', article.excerpt);
    updateMetaTag('property', 'og:image', article.image);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:locale', ui.ogLocale);
    updateMetaTag('property', 'article:published_time', article.date);
    updateMetaTag('property', 'article:section', categoryLabel);

    updateMetaTag('property', 'twitter:title', article.title);
    updateMetaTag('property', 'twitter:description', article.excerpt);
    updateMetaTag('property', 'twitter:image', article.image);
    updateMetaTag('property', 'twitter:url', canonicalUrl);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = canonicalUrl;
    }

    addArticleStructuredData(article, canonicalUrl);
}

/**
 * @param {string} attr - Attribute name (name or property)
 * @param {string} attrValue - Attribute value
 * @param {string} content - Meta content
 */
function updateMetaTag(attr, attrValue, content) {
    let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
    if (element) {
        element.setAttribute('content', content);
    } else {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        element.setAttribute('content', content);
        document.head.appendChild(element);
    }
}

/**
 * @param {object} article - Article record
 * @param {string} canonicalUrl - Canonical page URL
 */
function addArticleStructuredData(article, canonicalUrl) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.excerpt,
        "image": article.image,
        "datePublished": article.date,
        "dateModified": article.date,
        "author": {
            "@type": "Organization",
            "name": "Storyunfolded"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Storyunfolded",
            "logo": {
                "@type": "ImageObject",
                "url": "https://storyunfolded.top/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        },
        "articleSection": article.categoryLabel || article.category,
        "inLanguage": article.locale || "en-US",
        "keywords":
            article.keywords ||
            `${article.categoryLabel || article.category}, ${getArticleUi(article).keywordsSuffix}`
    });
    document.head.appendChild(script);
}

/** @type {Record<string, string>} */
const CATEGORY_LABELS_UK = {
    technology: 'Технології',
    fashion: 'Мода',
    home: 'Дім і побут',
    beauty: 'Краса',
    fitness: 'Фітнес',
    travel: 'Подорожі'
};

/**
 * @param {{ slug: string, name: string }} category - Category record
 * @param {string | undefined} lang - Article language code
 * @returns {string} Display name
 */
function getCategoryDisplayName(category, lang) {
    if (lang === 'uk' && CATEGORY_LABELS_UK[category.slug]) {
        return CATEGORY_LABELS_UK[category.slug];
    }
    return category.name;
}

/**
 * @param {object} article - Article record
 * @returns {object} UI copy for article chrome (share labels, sidebar, etc.)
 */
function getArticleUi(article) {
    if (article.lang === 'uk' || article.locale === 'uk-UA') {
        return {
            minRead: '5 хв читання',
            readMore: 'Читати далі',
            shareHeading: 'Поділитися статтею',
            relatedHeading: 'Схожі статті',
            recentHeading: 'Останні публікації',
            categoriesHeading: 'Категорії',
            languageName: 'Українська',
            ogLocale: 'uk_UA',
            keywordsSuffix: 'огляд, косметика, парфумерія, Notino.ua'
        };
    }
    return {
        minRead: '5 min read',
        readMore: 'Read More',
        shareHeading: 'Share this article',
        relatedHeading: 'Related Articles',
        recentHeading: 'Recent Posts',
        categoriesHeading: 'Categories',
        languageName: 'English',
        ogLocale: 'en_US',
        keywordsSuffix: 'product review, lifestyle tips'
    };
}

/**
 * Localize static headings in the article page shell for the active article.
 * @param {object} article - Article record
 * @param {object} ui - UI strings from getArticleUi
 */
function applyArticlePageUi(article, ui) {
    const shareHeading = document.querySelector('.share-section h3');
    if (shareHeading) {
        shareHeading.textContent = ui.shareHeading;
    }
    const relatedHeading = document.querySelector('.related-articles h3');
    if (relatedHeading) {
        relatedHeading.textContent = ui.relatedHeading;
    }
    document.querySelectorAll('.article-sidebar .widget h3').forEach((heading, index) => {
        if (index === 0) {
            heading.textContent = ui.recentHeading;
        } else if (index === 1) {
            heading.textContent = ui.categoriesHeading;
        }
    });
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.querySelector('h1').textContent);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
}

function shareOnPinterest() {
    const url = encodeURIComponent(window.location.href);
    const media = encodeURIComponent(document.querySelector('.article-header img').src);
    const description = encodeURIComponent(document.querySelector('h1').textContent);
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
}

/**
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString, locale) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale || 'en-US', options);
}
