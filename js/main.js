// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Newsletter Form
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert('Thank you for subscribing! We\'ll send updates to ' + email);
            this.reset();
        });
    });

    // Load Latest Posts Grid on Homepage
    const latestGrid = document.getElementById('latestGrid');
    if (latestGrid) {
        const latestArticles = sortArticlesByDateDesc(articles).slice(0, 6);
        latestGrid.innerHTML = latestArticles.map(article => `
            <article class="post-card">
                <img src="${article.image}" alt="${article.title}">
                <div class="card-content">
                    <span class="category">${article.category}</span>
                    <h3>${article.title}</h3>
                    <p class="meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</p>
                    <a href="/${getArticlePath(article)}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');
    }

    // Load Technology Posts
    const techPosts = document.getElementById('techPosts');
    if (techPosts) {
        const techArticles = sortArticlesByDateDesc(articles.filter(a => a.category === 'Technology')).slice(0, 3);
        techPosts.innerHTML = techArticles.map(article => `
            <article class="compact-card">
                <img src="${article.image}" alt="${article.title}">
                <div class="card-content">
                    <span class="category">${article.category}</span>
                    <h4><a href="/${getArticlePath(article)}">${article.title}</a></h4>
                    <p class="meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</p>
                </div>
            </article>
        `).join('');
    }

    // Load Fashion Posts
    const fashionPosts = document.getElementById('fashionPosts');
    if (fashionPosts) {
        const fashionArticles = sortArticlesByDateDesc(articles.filter(a => a.category === 'Fashion')).slice(0, 3);
        fashionPosts.innerHTML = fashionArticles.map(article => `
            <article class="compact-card">
                <img src="${article.image}" alt="${article.title}">
                <div class="card-content">
                    <span class="category">${article.category}</span>
                    <h4><a href="/${getArticlePath(article)}">${article.title}</a></h4>
                    <p class="meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</p>
                </div>
            </article>
        `).join('');
    }

    // Load Popular Posts in Sidebar
    const popularPosts = document.getElementById('popularPosts');
    if (popularPosts) {
        const popular = sortArticlesByDateDesc(articles).slice(0, 5);
        popularPosts.innerHTML = popular.map(article => `
            <div class="post-item">
                <img src="${article.image}" alt="${article.title}">
                <div>
                    <h4><a href="/${getArticlePath(article)}">${article.title}</a></h4>
                    <p class="meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</p>
                </div>
            </div>
        `).join('');
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.post-card, .featured-card, .category-card, .compact-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Utility function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
