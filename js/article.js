document.addEventListener('DOMContentLoaded', function() {
    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id'));
    
    // Find the article
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
        document.getElementById('articleHeader').innerHTML = '<h1>Article not found</h1>';
        return;
    }

    // Update SEO Meta Tags
    updateSEOTags(article);

    /** @type {HTMLElement | null} */
    const navPageTitle = document.getElementById('navPageTitle');
    const navContainer = document.querySelector('.navbar .container');
    if (navPageTitle && navContainer) {
        navPageTitle.textContent = article.title;
        navPageTitle.title = article.title;
        navPageTitle.hidden = false;
        navContainer.classList.add('has-page-title');
    }

    // Render article header
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

    // Render article content
    document.getElementById('articleContent').innerHTML = article.content;

    // Render related articles
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
                <a href="article.html?id=${a.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');

    // Render recent posts in sidebar
    const recentPosts = sortArticlesByDateDesc(articles).slice(0, 5);
    document.getElementById('recentPosts').innerHTML = recentPosts.map(a => `
        <div class="post-item">
            <img src="${a.image}" alt="${a.title}">
            <div>
                <h4><a href="article.html?id=${a.id}">${a.title}</a></h4>
                <p class="meta"><i class="far fa-calendar"></i> ${formatDate(a.date)}</p>
            </div>
        </div>
    `).join('');

    // Render categories in sidebar
    document.getElementById('categoryList').innerHTML = categories.map(cat => `
        <li>
            <a href="blog.html?category=${cat.slug}">
                ${cat.name}
                <span>(${cat.count})</span>
            </a>
        </li>
    `).join('');

    // Mobile menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Back to top
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

// Update SEO Meta Tags dynamically
function updateSEOTags(article) {
    // Update title
    document.title = `${article.title} | Storyunfolded`;
    
    // Update meta description
    updateMetaTag('name', 'description', article.excerpt);
    updateMetaTag('name', 'keywords', `${article.category}, ${article.title}, product review, lifestyle tips`);
    
    // Update Open Graph tags
    updateMetaTag('property', 'og:title', article.title);
    updateMetaTag('property', 'og:description', article.excerpt);
    updateMetaTag('property', 'og:image', article.image);
    updateMetaTag('property', 'og:url', window.location.href);
    updateMetaTag('property', 'article:published_time', article.date);
    updateMetaTag('property', 'article:section', article.category);
    
    // Update Twitter Card tags
    updateMetaTag('property', 'twitter:title', article.title);
    updateMetaTag('property', 'twitter:description', article.excerpt);
    updateMetaTag('property', 'twitter:image', article.image);
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        canonical.href = window.location.href;
    }
    
    // Add structured data for article
    addArticleStructuredData(article);
}

// Helper function to update meta tags
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

// Add structured data for article
function addArticleStructuredData(article) {
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
            "@id": window.location.href
        },
        "articleSection": article.category,
        "keywords": `${article.category}, product review, lifestyle`
    });
    document.head.appendChild(script);
}

// Share functions
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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
