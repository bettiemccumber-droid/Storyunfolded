/**
 * Loads site JS bundles in order with a cache-bust query from js/version.js.
 * Use: <script src="js/load-bundles.js" data-bundle="article"></script>
 */
(function () {
    var v =
        typeof STORYUNFOLDED_CACHE_BUST === 'string' ? STORYUNFOLDED_CACHE_BUST : '1';
    var bundle = document.currentScript.getAttribute('data-bundle') || 'main';
    /** @type {Record<string, string[]>} */
    var bundles = {
        article: ['data', 'article'],
        blog: ['data', 'blog'],
        main: ['data', 'main'],
        products: ['data', 'products']
    };
    var names = bundles[bundle] || bundles.main;
    names.forEach(function (name) {
        document.write(
            '<script src="js/' + name + '.js?v=' + encodeURIComponent(v) + '"><\/script>'
        );
    });
})();
