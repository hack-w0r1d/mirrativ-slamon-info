(function () {
  const memo = document.querySelector('.memo');
  const searchInput = document.getElementById('searchInput');
  const searchCount = document.getElementById('searchCount');
  const prevBtn = document.getElementById('searchPrev');
  const nextBtn = document.getElementById('searchNext');
  const searchBar = document.getElementById('searchBar');
  const footer = document.querySelector('footer.footer');

  const originalHTML = memo.innerHTML;
  let matches = [];
  let currentIndex = -1;

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function clearHighlights() {
    memo.innerHTML = originalHTML;
    matches = [];
    currentIndex = -1;
  }

  function highlight(query) {
    clearHighlights();
    if (!query) {
      updateCount();
      return;
    }

    const regex = new RegExp(escapeRegExp(query), 'gu');
    const walker = document.createTreeWalker(memo, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent;
      regex.lastIndex = 0;
      let match;
      let lastIndex = 0;
      let found = false;
      const frag = document.createDocumentFragment();

      while ((match = regex.exec(text))) {
        found = true;
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }
        const mark = document.createElement('mark');
        mark.className = 'search-highlight';
        mark.textContent = match[0];
        frag.appendChild(mark);
        matches.push(mark);
        lastIndex = match.index + match[0].length;
        if (match.index === regex.lastIndex) {
          regex.lastIndex += 1;
        }
      }

      if (found) {
        if (lastIndex < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });

    if (matches.length > 0) {
      currentIndex = 0;
      setActive();
    }
    updateCount();
  }

  function setActive() {
    matches.forEach((m) => m.classList.remove('search-highlight--active'));
    const current = matches[currentIndex];
    if (current) {
      current.classList.add('search-highlight--active');
      current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function updateCount() {
    searchCount.textContent = matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0';
    prevBtn.disabled = matches.length === 0;
    nextBtn.disabled = matches.length === 0;
  }

  function goNext() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex + 1) % matches.length;
    setActive();
    updateCount();
  }

  function goPrev() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    setActive();
    updateCount();
  }

  searchInput.addEventListener('input', (e) => {
    highlight(e.target.value.trim());
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        goPrev();
      } else {
        goNext();
      }
    }
  });

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  function updateSearchBarPosition() {
    if (!window.visualViewport) return;
    const vv = window.visualViewport;
    const keyboardOffset = window.innerHeight - vv.height - vv.offsetTop;
    const offset = keyboardOffset > 0 ? keyboardOffset + 16 : 16;
    document.documentElement.style.setProperty('--search-bar-offset', `${offset}px`);
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateSearchBarPosition);
    window.visualViewport.addEventListener('scroll', updateSearchBarPosition);
  }

  searchInput.addEventListener('focus', updateSearchBarPosition);
  searchInput.addEventListener('blur', () => {
    document.documentElement.style.setProperty('--search-bar-offset', '16px');
  });

  if (footer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          searchBar.classList.toggle('search-bar--hidden', entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    observer.observe(footer);
  }
})();
