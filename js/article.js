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

    updateSEOTags(article);

    document.getElementById('articleHeader').innerHTML = `
        <span class="category">${article.category}</span>
        <h1>${article.title}</h1>
        <p class="meta">
            <i class="far fa-calendar"></i> ${formatDate(article.date)}
            <span style="margin: 0 10px;">•</span>
            <i class="far fa-clock"></i> 5 min read
        </p>
        <img src="${article.image}" alt="${article.title}">
    `;

    document.getElementById('articleContent').innerHTML = article.content;

    const relatedArticles = sortArticlesByDateDesc(
        articles.filter(a => a.category === article.category && a.id !== article.id)
    ).slice(0, 3);

    document.getElementById('relatedArticles').innerHTML = relatedArticles.map(a => `
        <article class="post-card">
            <img src="${a.image}" alt="${a.title}">
            <div class="card-content">
                <span class="category">${a.category}</span>
                <h3>${a.title}</h3>
                <p class="meta"><i class="far fa-calendar"></i> ${formatDate(a.date)}</p>
                <a href="/${getArticlePath(a)}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');

    const recentPosts = sortArticlesByDateDesc(articles).slice(0, 5);
    document.getElementById('recentPosts').innerHTML = recentPosts.map(a => `
        <div class="post-item">
            <img src="${a.image}" alt="${a.title}">
            <div>
                <h4><a href="/${getArticlePath(a)}">${a.title}</a></h4>
                <p class="meta"><i class="far fa-calendar"></i> ${formatDate(a.date)}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('categoryList').innerHTML = categories.map(cat => `
        <li>
            <a href="blog.html?category=${cat.slug}">
                ${cat.name}
                <span>(${cat.count})</span>
            </a>
        </li>
    `).join('');

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

    document.title = `${article.title} | Storyunfolded`;

    updateMetaTag('name', 'description', article.excerpt);
    updateMetaTag('name', 'keywords', `${article.category}, ${article.title}, product review, lifestyle tips`);

    updateMetaTag('property', 'og:title', article.title);
    updateMetaTag('property', 'og:description', article.excerpt);
    updateMetaTag('property', 'og:image', article.image);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'article:published_time', article.date);
    updateMetaTag('property', 'article:section', article.category);

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
        "articleSection": article.category,
        "keywords": `${article.category}, product review, lifestyle`
    });
    document.head.appendChild(script);
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
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
