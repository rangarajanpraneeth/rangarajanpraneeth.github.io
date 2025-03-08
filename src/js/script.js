const elements = {
   dropdownTitles: document.querySelectorAll('.dropdown__title'),
   dropdownLinks: document.querySelectorAll('.dropdown__link'),
   contentPages: document.querySelectorAll('.content__page'),
   hierarchyContainer: document.querySelector('.hierarchy__container'),
   hierarchyElements: {
      parents: () => document.querySelectorAll('.hierarchy__parent__link'),
      children: () => document.querySelectorAll('.hierarchy__child__link'),
   }
}

// util page functions
const getIntroductionIndex = () => {
   for (let i = 0; i < elements.dropdownLinks.length; i++) {
      const link = elements.dropdownLinks[i];
      if (link.textContent.trim().toLowerCase() === 'introduction' || link.dataset.pageId === 'introduction') {
         return i;
      }
   }
   return 0;
}

const getPageTitle = pageId => {
   const match = document.querySelector(`.dropdown__link[data-page-id="${pageId}"]`);
   return match
      ? match.textContent.trim()
      : pageId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const highlightElement = element => {
   const selection = window.getSelection();
   const range = document.createRange();
   range.selectNodeContents(element);
   selection.removeAllRanges();
   selection.addRange(range);
   setTimeout(() => selection.removeAllRanges(), 1000);
}

// util mis function
const extractSlug = text => text.trim().toLowerCase().replace(/\s+/g, '-');

const updateURL = path => history.pushState(null, null, `#${path}`);



// navigation functions
const openParentDropdowns = link => {
   if (!link) return;

   let currentElement = link;

   while (currentElement && !currentElement.matches('.sidebar__dropdown')) {
      const parentDropdownList = currentElement.closest('.dropdown__list');
      if (!parentDropdownList) return;

      const dropdownTitle = parentDropdownList.querySelector('.dropdown__title');
      const dropdownLinks = parentDropdownList.querySelector('.dropdown__links');

      if (!dropdownTitle || !dropdownLinks) return;
      dropdownLinks.style.display = 'flex';
      const arrow = dropdownTitle.querySelector('svg');
      if (arrow) arrow.style.transform = 'rotate(0deg)';

      currentElement = parentDropdownList.parentElement;
   }
}

const activatePage = index => {
   if (index === null || index === undefined || index < 0 || index >= elements.dropdownLinks.length) {
      index = getIntroductionIndex();
   }

   const link = elements.dropdownLinks[index];
   const page = elements.contentPages[index];

   if (!link || !page) {
      console.error('dropdown link / content page not found at index: ', index);
      return;
   }

   elements.dropdownLinks.forEach(l => l.classList.remove('active'));
   elements.contentPages.forEach(p => p.classList.remove('active'));

   link.classList.add('active');
   page.classList.add('active');

   const pageId = link.dataset.pageId;
   updateURL(pageId);
   localStorage.setItem('selectedIndex', index);

   openParentDropdowns(link);
   setTimeout(buildHierarchy, 100);
}

// main functions

const restoreState = () => {
   const hash = window.location.hash.substring(1);

   if (!hash) {
      const introductionIndex = getIntroductionIndex();
      const introductionLink = elements.dropdownLinks[introductionIndex];
      if (!introductionLink && !introductionLink.dataset.pageId) return;

      history.replaceState(null, null, `#${introductionLink.dataset.pageId}`);
      activatePage(introductionIndex);
      return;
   }

   if (hash.includes('/')) {
      const pageId = hash.split('/')[0];
      const targetLink = Array.from(elements.dropdownLinks).find(link => link.dataset.pageId === pageId);
      if (!targetLink) {
         activatePage(getIntroductionIndex());
         return;
      }

      const index = Array.from(elements.dropdownLinks).indexOf(targetLink);
      activatePage(index);

      setTimeout(() => {
         const targetElement = document.querySelector(`[data-nav-path="${hash}"]`);
         if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
            highlightElement(targetElement);
            return;
         }

         let bestMatch = null;
         let bestMatchLength = 0;

         document.querySelectorAll('[data-nav-path]').forEach(element => {
            const path = element.dataset.navPath;
            if (!path) return;

            const pathParts = path.split('/');
            const hashParts = hash.split('/');

            const matchLength = pathParts.reduce((acc, part, i) => part === hashParts[i] ? acc + 1 : acc, 0);
            if (matchLength > bestMatchLength) {
               bestMatch = element;
               bestMatchLength = matchLength;
            }
         });

         if (bestMatch) {
            bestMatch.scrollIntoView({ behavior: 'instant', block: 'start' });
            highlightElement(bestMatch);
         }
      }, 100);
      return;
   }

   const targetLink = Array.from(elements.dropdownLinks).find(link => link.dataset.pageId === hash);
   if (targetLink) {
      const index = Array.from(elements.dropdownLinks).indexOf(targetLink);
      activatePage(index);
      return;
   }

   const selectedIndex = parseInt(localStorage.getItem('selectedIndex'));
   const validIndex = !isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < elements.dropdownLinks.length
      ? selectedIndex
      : getIntroductionIndex();

   activatePage(validIndex);
}

const buildHierarchy = () => {
   const activePage = document.querySelector('.content__page.active');
   if (!activePage) return;

   const activePageId = activePage.id || 'page';
   const allElements = [...activePage.querySelectorAll('.hierarchy__parent__link, .hierarchy__child__link')];

   allElements.sort((a, b) => {
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
   });

   const hierarchy = document.createElement('div');
   hierarchy.className = 'hierarchy';
   hierarchy.dataset.parentPage = activePageId;

   const hierarchyName = document.createElement('div');
   hierarchyName.className = 'hierarchy__name';
   hierarchyName.textContent = getPageTitle(activePageId);
   hierarchy.appendChild(hierarchyName);

   let currentParent = null;
   let currentChildren = null;
   let currentParentPath = '';

   allElements.forEach(element => {
      if (!element.querySelector('.copy__link')) {
         element.insertAdjacentHTML('beforeend', `
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy__link">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
         </svg>
         `);
      }

      if (element.classList.contains('hierarchy__parent__link')) {
         const slug = extractSlug(element.textContent);
         const path = `${activePageId}/${slug}`;
         currentParentPath = path;

         element.dataset.navPath = path;

         const hierarchyParent = document.createElement('div');
         hierarchyParent.className = 'hierarchy__parent';

         const hierarchyTitle = document.createElement('div');
         hierarchyTitle.className = 'hierarchy__title';
         hierarchyTitle.textContent = element.textContent.trim();
         hierarchyTitle.dataset.path = path;

         hierarchyTitle.addEventListener('click', () => {
            element.scrollIntoView({ behavior: 'instant', block: 'start' });
            updateURL(path);
            localStorage.setItem('lastScrollPosition', window.scrollY);
            highlightElement(element);
         });

         const hierarchyChildren = document.createElement('div');
         hierarchyChildren.className = 'hierarchy__children';

         hierarchyParent.appendChild(hierarchyTitle);
         hierarchyParent.appendChild(hierarchyChildren);
         hierarchy.appendChild(hierarchyParent);

         currentParent = hierarchyParent;
         currentChildren = hierarchyChildren;
      } else if (element.classList.contains('hierarchy__child__link') && currentChildren) {
         const slug = extractSlug(element.textContent);
         const path = `${currentParentPath}/${slug}`;

         element.dataset.navPath = path;

         const hierarchyChild = document.createElement('div');
         hierarchyChild.className = 'hierarchy__child';
         hierarchyChild.textContent = element.textContent.trim();
         hierarchyChild.dataset.path = path;

         hierarchyChild.addEventListener('click', () => {
            element.scrollIntoView({ behavior: 'instant', block: 'start' });
            updateURL(path);
            localStorage.setItem('lastScrollPosition', window.scrollY);
            highlightElement(element);
         });

         currentChildren.appendChild(hierarchyChild);
      }
   });

   if (elements.hierarchyContainer) {
      elements.hierarchyContainer.innerHTML = '';
      elements.hierarchyContainer.appendChild(hierarchy);
   }

   setTimeout(setupScrollSpy, 100);
   setupCopyLinks();
}

const setupScrollSpy = () => {
   const activePage = document.querySelector('.content__page.active');
   if (!activePage) return;

   const navElements = activePage.querySelectorAll('[data-nav-path]');
   const hierarchyElements = document.querySelectorAll('.hierarchy__title, .hierarchy__child');

   const pathToHierarchyMap = {};
   hierarchyElements.forEach(element => {
      if (!element.dataset.path) return;
      pathToHierarchyMap[element.dataset.path] = element;
   });

   const observer = new IntersectionObserver(entries => {
      const visibleEntries = entries
         .filter(entry => entry.isIntersecting)
         .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (!visibleEntries.length) return;

      hierarchyElements.forEach(element => element.classList.remove('active'));

      const targetElement = visibleEntries[0]?.target;
      const navPath = targetElement?.dataset.navPath;

      if (!navPath || !pathToHierarchyMap[navPath]) return;
      pathToHierarchyMap[navPath].classList.add('active');

   }, { root: null, rootMargin: '-1px 0px -99% 0px', threshold: 0 });

   navElements.forEach(element => observer.observe(element));
   return observer;
}

const setupCopyLinks = () => {
   document.querySelectorAll('.copy__link').forEach(icon => {
      icon.addEventListener('click', e => {
         e.stopPropagation();

         const parentLink = icon.closest('.hierarchy__parent__link, .hierarchy__child__link');
         if (!parentLink?.dataset?.navPath) return;

         const navPath = parentLink.dataset.navPath;
         history.pushState(null, null, `#${navPath}`);
         navigator.clipboard.writeText(window.location.href);
      });
   });
}



// add event listeners
document.addEventListener('DOMContentLoaded', () => {
   if (!window.location.hash) {
      const introductionIndex = getIntroductionIndex();
      const introductionPageId = elements.dropdownLinks[introductionIndex].dataset.pageId;
      history.replaceState(null, null, `#${introductionPageId}`);
   }
   restoreState();

   document.querySelectorAll('a').forEach(a => a.setAttribute('target', '_blank'));

   elements.dropdownTitles.forEach(title => {
      title.addEventListener('click', () => {
         const arrow = title.querySelector('svg');
         const links = title.nextElementSibling;

         if (!links) return;
         const open = links.style.display === 'flex';
         arrow.style.transform = open ? 'rotate(-90deg)' : 'rotate(0deg)';
         links.style.display = open ? 'none' : 'flex';

         const list = title.closest('.dropdown__list');
         if (!list) return;
         const listId = list.dataset.id ||
            Array.from(document.querySelectorAll('.dropdown__list')).indexOf(list);
         localStorage.setItem(`dropdown_${listId}_open`, !open);
      });
   });
   elements.dropdownLinks.forEach((link, index) => {
      const pageId = link.dataset.pageId || extractSlug(link.textContent) || `page-${index}`;
      if (!link.dataset.pageId) link.dataset.pageId = pageId;
      if (elements.contentPages[index] && !elements.contentPages[index].id) {
         elements.contentPages[index].id = pageId;
      }
      link.addEventListener('click', () => activatePage(index));
   });
   window.addEventListener('popstate', restoreState);

   document.querySelectorAll('pre code').forEach(element => {
      const lines = element.textContent.split('\n')
         .filter((l, i, a) => !(i === 0 && !l.trim()) && !(i === a.length - 1 && !l.trim()));
      const indent = (lines.find(line => line.trim())?.match(/^\s+/) || [''])[0];
      if (indent) {
         const regex = new RegExp(`^${indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gm');
         element.textContent = lines.map(line => line.replace(regex, '')).join('\n');
      }
      hljs.highlightElement(element);
   });
});