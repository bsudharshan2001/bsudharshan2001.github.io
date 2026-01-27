// Search functionality for Sudharshan Balaji's website
(function() {
    const searchData = [
        // Home
        { page: 'Home', title: 'Sudharshan Balaji', preview: 'Ph.D. researcher at University of South Florida, working in the SPRAI Lab', url: 'index.html' },
        { page: 'Home', title: 'About', preview: 'AI systems, large language models, federated learning, and medical NLP', url: 'index.html' },
        { page: 'Home', title: 'Recent Updates', preview: 'Started PhD, Graduated Masters, Thesis published', url: 'index.html#updates' },
        // Experience
        { page: 'Experience', title: 'Graduate Research Assistant', preview: 'SPRAI Lab, USF - Byzantine-resilient Federated Learning and LLM security', url: 'experience.html' },
        { page: 'Experience', title: 'Graduate Instructional Assistant', preview: 'USF - Security and Privacy in ML, Privacy Preserving Cyber-Infrastructures', url: 'experience.html' },
        { page: 'Experience', title: 'ML Engineering Intern', preview: 'dotkonnekt Innovation Labs - Recommender engines, Huggingface, LangChain', url: 'experience.html' },
        // Publications
        { page: 'Publications', title: 'LLMs in Network Intrusion Detection', preview: 'Thesis exploring BERT, RoBERTa, DistilBERT, and Gemma for NIDS', url: 'publications.html' },
        { page: 'Publications', title: 'AI-Augmented Coronary CT Angiography', preview: 'BioBERT-based system for CAD-RADS classification', url: 'publications.html' },
        // Projects
        { page: 'Projects', title: 'LLM-based Network Intrusion Detection', preview: 'Analysis using BERT, RoBERTa, DistilBERT on NSL-KDD and CICIoT2023', url: 'projects.html' },
        { page: 'Projects', title: 'Medical AI Report Interpreter', preview: 'BioBERT for Coronary CT Angiography report automation', url: 'projects.html' },
        { page: 'Projects', title: 'D2C Recommender System', preview: 'Content-based, collaborative filtering, and hybrid recommender', url: 'projects.html' },
        // Timeline
        { page: 'Timeline', title: 'My Journey', preview: 'From first computer interaction to PhD research', url: 'timeline.html' },
        // Writing
        { page: 'Writing', title: 'Blog', preview: 'Thoughts, notes, and writings', url: 'blog.html' },
        // Quick links
        { page: 'Links', title: 'Resume', preview: 'Download my resume (PDF)', url: 'Sudharshan Balaji - Resume.pdf' },
        { page: 'Links', title: 'Email', preview: 'sudharshanbalaji@usf.edu', url: 'mailto:sudharshanbalaji@usf.edu' },
        { page: 'Links', title: 'GitHub', preview: 'github.com/bsudharshan2001', url: 'https://github.com/bsudharshan2001' },
        { page: 'Links', title: 'LinkedIn', preview: 'linkedin.com/in/sudharshanbalaji', url: 'https://linkedin.com/in/sudharshanbalaji' },
        { page: 'Links', title: 'Google Scholar', preview: 'Publications and citations', url: 'https://scholar.google.com/citations?user=z-TM7EYAAAAJ&hl=en' },
    ];

    // Inject search HTML (only if not already present)
    function injectSearchHTML() {
        // Check if search elements already exist (e.g., on index.html with inline code)
        if (document.getElementById('search-trigger') && document.getElementById('search-modal')) {
            return; // Elements already exist, skip injection
        }

        // Add search trigger to footer-right
        const footerRight = document.querySelector('.footer-right');
        if (footerRight && !document.getElementById('search-trigger')) {
            const searchTrigger = document.createElement('button');
            searchTrigger.className = 'search-trigger';
            searchTrigger.id = 'search-trigger';
            searchTrigger.setAttribute('aria-label', 'Search');
            searchTrigger.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <span class="shortcut"><kbd>⌘</kbd><kbd>K</kbd></span>
            `;
            // Insert before the commit hash
            const commitHash = footerRight.querySelector('.commit-hash');
            if (commitHash) {
                footerRight.insertBefore(searchTrigger, commitHash);
            } else {
                footerRight.prepend(searchTrigger);
            }
        }

        // Add search modal (only if not already present)
        if (document.getElementById('search-modal')) {
            return;
        }

        const searchHTML = `
            <div class="search-overlay" id="search-overlay"></div>
            <div class="search-modal" id="search-modal">
                <div class="search-input-wrap">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                    <input type="text" class="search-input" id="search-input" placeholder="Search..." autocomplete="off">
                    <span class="search-hint">esc</span>
                </div>
                <div class="search-results" id="search-results"></div>
                <div class="search-footer">
                    <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>
                    <span><kbd>&crarr;</kbd> select</span>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', searchHTML);
    }

    // Initialize search
    function initSearch() {
        injectSearchHTML();

        const searchTrigger = document.getElementById('search-trigger');
        const searchOverlay = document.getElementById('search-overlay');
        const searchModal = document.getElementById('search-modal');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        let selectedIndex = -1;

        function openSearch() {
            searchOverlay.classList.add('active');
            searchModal.classList.add('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.classList.remove('has-query');
            selectedIndex = -1;
            // Small delay to ensure modal is visible before focusing
            setTimeout(() => searchInput.focus(), 50);
        }

        function closeSearch() {
            searchOverlay.classList.remove('active');
            searchModal.classList.remove('active');
            selectedIndex = -1;
        }

        function performSearch(query) {
            if (!query.trim()) {
                searchResults.innerHTML = '';
                searchResults.classList.remove('has-query');
                selectedIndex = -1;
                return;
            }

            searchResults.classList.add('has-query');
            const q = query.toLowerCase();
            const results = searchData.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.preview.toLowerCase().includes(q) ||
                item.page.toLowerCase().includes(q)
            );

            if (results.length === 0) {
                searchResults.innerHTML = '';
                selectedIndex = -1;
                return;
            }

            searchResults.innerHTML = results.map((item, i) => {
                const highlightedPreview = item.preview.replace(
                    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                    '<mark>$1</mark>'
                );
                return `
                    <a href="${item.url}" class="search-result${i === 0 ? ' selected' : ''}" data-index="${i}">
                        <div class="search-result-page">${item.page}</div>
                        <div class="search-result-title">${item.title}</div>
                        <div class="search-result-preview">${highlightedPreview}</div>
                    </a>
                `;
            }).join('');

            selectedIndex = 0;
        }

        function updateSelection(newIndex) {
            const results = searchResults.querySelectorAll('.search-result');
            if (results.length === 0) return;

            results.forEach(r => r.classList.remove('selected'));
            selectedIndex = Math.max(0, Math.min(newIndex, results.length - 1));
            results[selectedIndex].classList.add('selected');
            results[selectedIndex].scrollIntoView({ block: 'nearest' });
        }

        searchTrigger.addEventListener('click', openSearch);
        searchOverlay.addEventListener('click', closeSearch);

        document.addEventListener('keydown', (e) => {
            // Open with / or Cmd+K
            if ((e.key === '/' && !searchModal.classList.contains('active') && document.activeElement.tagName !== 'INPUT') ||
                ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
                e.preventDefault();
                openSearch();
                return;
            }

            if (!searchModal.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                updateSelection(selectedIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                updateSelection(selectedIndex - 1);
            } else if (e.key === 'Enter') {
                const selected = searchResults.querySelector('.search-result.selected');
                if (selected) {
                    window.location.href = selected.href;
                }
            }
        });

        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }
})();
