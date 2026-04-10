document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const articlesPerPage = 6;
    let filteredArticles = [...articles];
    let currentCategory = new URLSearchParams(window.location.search).get('category');
    let searchQuery = '';

    // Initialize
    renderCategories();
    renderRecentPosts();
    if (currentCategory) {
        filterByCategory(currentCategory);
    } else {
        renderArticles();
    }

    // Search functionality
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        searchQuery = searchInput.value.toLowerCase();
        filterArticles();
    });

    // Category filter
    function filterByCategory(category) {
        currentCategory = category;
        filterArticles();
    }

    // Filter articles based on search and category
    function filterArticles() {
        filteredArticles = articles.filter(article => {
            const matchesSearch = !searchQuery || 
                article.title.toLowerCase().includes(searchQuery) ||
                article.excerpt.toLowerCase().includes(searchQuery);
            const matchesCategory = !currentCategory || 
                article.category.toLowerCase() === currentCategory.toLowerCase();
            return matchesSearch && matchesCategory;
        });
        
        currentPage = 1;
        renderArticles();
        updateResultsCount();
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', function() {
        const sortValue = this.value;
        
        switch(sortValue) {
            case 'date-desc':
                filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'title':
                filteredArticles.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        
        renderArticles();
    });

    // Render articles
    function renderArticles() {
        const articlesGrid = document.getElementById('articlesGrid');
        const startIndex = (currentPage - 1) * articlesPerPage;
        const endIndex = startIndex + articlesPerPage;
        const articlesToShow = filteredArticles.slice(startIndex, endIndex);

        if (articlesToShow.length === 0) {
            articlesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No articles found.</p>';
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        articlesGrid.innerHTML = articlesToShow.map(article => `
            <article class="post-card">
                <img src="${article.image}" alt="${article.title}">
                <div class="card-content">
                    <span class="category">${article.category}</span>
                    <h3>${article.title}</h3>
                    <p class="meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</p>
                    <p>${article.excerpt}</p>
                    <a href="article.html?id=${article.id}" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `).join('');

        renderPagination();
    }

    // Render pagination
    function renderPagination() {
        const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>`;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationHTML += '<button disabled>...</button>';
            }
        }
        
        // Next button
        paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>`;
        
        pagination.innerHTML = paginationHTML;
    }

    // Change page function (global)
    window.changePage = function(page) {
        currentPage = page;
        renderArticles();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Render categories
    function renderCategories() {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = categories.map(cat => `
            <li>
                <a href="#" onclick="filterByCategory('${cat.slug}'); return false;">
                    ${cat.name}
                    <span>(${cat.count})</span>
                </a>
            </li>
        `).join('');
    }

    // Make filterByCategory global
    window.filterByCategory = function(category) {
        currentCategory = category;
        filterArticles();
    };

    // Render recent posts
    function renderRecentPosts() {
        const recentPosts = document.getElementById('recentPosts');
        const recent = articles.slice(0, 5);
        
        recentPosts.innerHTML = recent.map(article => `
            <div class="post-item">
                <img src="${article.image}" alt="${article.title}">
                <div>
                    <h4><a href="article.html?id=${article.id}">${article.title}</a></h4>
                    <p class="meta"><i class="far fa-calendar"></i> ${formatDate(article.date)}</p>
                </div>
            </div>
        `).join('');
    }

    // Update results count
    function updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (searchQuery || currentCategory) {
            resultsCount.textContent = `Showing ${filteredArticles.length} result${filteredArticles.length !== 1 ? 's' : ''}`;
        } else {
            resultsCount.textContent = 'Showing all articles';
        }
    }

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

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
