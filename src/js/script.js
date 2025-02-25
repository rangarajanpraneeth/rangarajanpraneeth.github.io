window.history.scrollRestoration = 'manual';

const dropdownLinksGlobal = document.querySelectorAll('.dropdown__link');
const contentPagesGlobal = document.querySelectorAll('.content__page');

// look for dropdown link named introduction otherwise return 0
const getIntroductionIndex = () => {
   for (let i = 0; i < dropdownLinksGlobal.length; i++) {
      if (dropdownLinksGlobal[i].textContent.trim().toLowerCase() === 'introduction' ||
         dropdownLinksGlobal[i].dataset.pageId === 'introduction') {
         return i;
      }
   }
   return 0;
}

const restoreState = () => {
   const hash = window.location.hash.substring(1);
   let selectedIndex = null;

   if (hash) {
      const targetPage = document.getElementById(hash);
      if (targetPage) {
         const pageIndex = Array.from(contentPagesGlobal).indexOf(targetPage);
         if (pageIndex >= 0) {
            selectedIndex = pageIndex;
         }
      }
      if (selectedIndex === null) {
         const targetLink = Array.from(dropdownLinksGlobal).find(link => link.dataset.pageId === hash);
         if (targetLink) {
            selectedIndex = Array.from(dropdownLinksGlobal).indexOf(targetLink);
         }
      }
   }
   // updated code
   if (selectedIndex === null) {
      selectedIndex = localStorage.getItem('selectedIndex');
   }
   if (selectedIndex === null) {
      selectedIndex = getIntroductionIndex();
   }
   // else if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
   //    selectedIndex = localStorage.getItem('selectedIndex');
   // } else {
   //    selectedIndex = getIntroductionIndex();
   //    history.replaceState(null, null, '#introduction');
   // }

   if (selectedIndex !== null) {
      const selectedLink = dropdownLinksGlobal[selectedIndex];
      if (selectedLink) {
         const dropdownList = selectedLink.closest('.dropdown__list');
         if (dropdownList) {
            const dropdownLinks = dropdownList.querySelector('.dropdown__links');
            const arrow = dropdownList.querySelector('.dropdown__title svg');
            if (dropdownLinks) {
               dropdownLinks.style.display = 'flex';
            }
            if (arrow) {
               arrow.style.transform = 'rotate(0deg)';
            }
         }
         dropdownLinksGlobal.forEach(l => l.classList.remove('active'));
         selectedLink.classList.add('active');
         contentPagesGlobal.forEach(page => page.classList.remove('active'));
         if (contentPagesGlobal[selectedIndex]) {
            contentPagesGlobal[selectedIndex].classList.add('active');
         }
         // updated code
         if (!window.location.hash && selectedLink.dataset.pageId) {
            if (selectedIndex !== getIntroductionIndex()) {
               history.replaceState(null, null, `#${selectedLink.dataset.pageId}`);
            }
         }
         // if (hash && selectedLink.dataset.pageId && selectedLink.dataset.pageId !== 'introduction') {
         //    history.replaceState(null, null, `#${selectedLink.dataset.pageId}`);
         // }
      }
   }
   document.querySelectorAll('.dropdown__list').forEach((dropdownList, index) => {
      const listId = dropdownList.dataset.id || index;
      const open = localStorage.getItem(`dropdown_${listId}_open`) === 'true';
      if (open) {
         const dropdownLinks = dropdownList.querySelector('.dropdown__links');
         const arrow = dropdownList.querySelector('.dropdown__title svg');
         if (dropdownLinks) {
            dropdownLinks.style.display = 'flex';
         }
         if (arrow) {
            arrow.style.transform = 'rotate(0deg)';
         }
      }
   });
}

const getPageTitle = (pageId) => {
   const matchingDropdownItem = document.querySelector(`.dropdown__link [data-page-id="${pageId}"]`);
   if (matchingDropdownItem) {
      return matchingDropdownItem.textContent.trim();
   }

   return pageId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}

const updateURL = path => {
   history.pushState(null, null, `#${path}`);
}

const handlePathNavigation = () => {
   const pathFromURL = window.location.hash.substring(1);

   if (pathFromURL) {
      const targetElement = document.querySelector(`[data-nav-path="${pathFromURL}"]`);

      if (targetElement) {
         setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });

            // added code
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(targetElement);
            selection.removeAllRanges();
            selection.addRange(range);

            setTimeout(() => {
               selection.removeAllRanges();
            }, 1000);

         }, 100);
         return;
      }

      // added
      // if (!pathFromURL.includes('/')) {
      //    return;
      // }

      const pathParts = pathFromURL.split('/');

      if (pathParts.length >= 2) {
         const pageId = pathParts[0];
         const pageLinkElement = document.querySelector(`.dropdown__child [data-page-id="${pageId}"]`);

         if (pageLinkElement) {
            const currentActiveSection = document.querySelector('.content__page.active');
            if (!currentActiveSection || currentActiveSection.id !== pageId) {
               pageLinkElement.click();
               return;
            }

            let bestMatchElement = null;
            let bestMatchLength = 0;

            document.querySelector('[data-nav-path]').forEach(element => {
               const elementPath = element.dataset.navPath;
               const elementPathParts = elementPath.split('/');

               let matchLength = 0;
               for (let i = 0; i < Math.min(pathParts.length, elementPathParts.length); i++) {
                  if (pathParts[i] === elementPathParts[i]) {
                     matchLength++;
                  } else {
                     break;
                  }
               }
               if (matchLength > bestMatchLength) {
                  bestMatchElement = element;
                  bestMatchLength = matchLength;
               }
            });
            if (bestMatchElement) {
               setTimeout(() => {
                  bestMatchElement.scrollIntoView({ behavior: 'instant', block: 'start' });

                  // added code
                  const selection = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(bestMatchElement);
                  selection.removeAllRanges();
                  selection.addRange(range);

                  setTimeout(() => {
                     selection.removeAllRanges();
                  }, 1000);

               }, 100);
            }
         }
      }
   } else {
      const lastScrollPosition = localStorage.getItem('lastScrollPosition');
      if (lastScrollPosition) {
         window.scrollTo(0, parseInt(lastScrollPosition));
      }
   }
}

const setupCopyLinks = () => {
   document.querySelectorAll('.copy__link').forEach(icon => {
      icon.addEventListener('click', e => {
         e.stopPropagation();

         const parentLink = icon.closest('.hierarchy__parent__link, .hierarchy__child__link');
         if (!parentLink) {
            return;
         }

         const navPath = parentLink.dataset.navPath;
         if (!navPath) {
            return
         }

         history.pushState(null, null, `#${navPath}`);
         const fullURL = window.location.origin + window.location.pathname + window.location.hash;
         navigator.clipboard.writeText(fullURL);
      });
   });
}

const setupScrollSpy = () => {
   const activePage = document.querySelector('.content__page.active');
   if (!activePage) return;

   const navElements = activePage.querySelectorAll('[data-nav-path]');
   const hierarchyElements = document.querySelectorAll('.hierarchy__parent__title, .hierarchy__child');

   const pathToHierarchyMap = {};
   hierarchyElements.forEach(element => {
      if (element.dataset.path) {
         pathToHierarchyMap[element.dataset.path] = element;
      }
   });

   const options = {
      root: null,
      // rootMargin: '-100px 0px -70% 0px',
      // rootMargin: '0px 0px -75% 0px',
      // rootMargin: '48px 0px 96px 0px',
      rootMargin: '0px 0px 48px 0px',
      threshold: 0
   }

   const clearActiveElements = () => {
      hierarchyElements.forEach(element => element.classList.remove('hierarchy__highlight'));
   }
   const handleIntersect = entries => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
         clearActiveElements();

         const targetElement = visibleEntries[0].target;
         const navPath = targetElement.dataset.navPath;

         if (navPath && pathToHierarchyMap[navPath]) {
            pathToHierarchyMap[navPath].classList.add('hierarchy__highlight');
         }
      }
   }
   const observer = new IntersectionObserver(handleIntersect, options);

   navElements.forEach(element => {
      observer.observe(element);
   });

   return observer;
}

// const updateActiveHierarchyLink = element => {
//    document.querySelectorAll('.hierarchy__parent__title, .hierarchy__child').forEach(item => {
//       item.classList.remove('active');
//    });

//    element.classList.add('active');
// }

const buildHierarchy = () => {
   const activePage = document.querySelector('.content__page.active');
   const activePageId = activePage && activePage.id ? activePage.id : 'page';

   const parentLinks = activePage.querySelectorAll('.hierarchy__parent__link');
   const childLinks = activePage.querySelectorAll('.hierarchy__child__link');

   const hierarchy = document.createElement('div');
   hierarchy.className = 'hierarchy';
   hierarchy.dataset.parentPage = activePageId;

   const hierarchyTitle = document.createElement('div');
   hierarchyTitle.className = 'hierarchy__title';
   hierarchyTitle.textContent = getPageTitle(activePageId);
   hierarchy.appendChild(hierarchyTitle);

   let currentParent = null;
   let currentChildren = null;
   let currentParentPath = '';

   const allElements = [...activePage.querySelectorAll('.hierarchy__parent__link, .hierarchy__child__link')];
   allElements.sort((a, b) => {
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
   });
   allElements.forEach((element, index) => {
      if (element.classList.contains('hierarchy__parent__link')) {
         const slug = element.textContent.trim().toLowerCase().replace(/\s+/g, '-');
         const path = `${activePageId}/${slug}`;
         currentParentPath = path;

         const hierarchyParent = document.createElement('div');
         hierarchyParent.className = 'hierarchy__parent';

         const hierarchyParentTitle = document.createElement('div');
         hierarchyParentTitle.className = 'hierarchy__parent__title';
         hierarchyParentTitle.textContent = element.textContent.trim();
         hierarchyParentTitle.dataset.path = path;

         const hierarchyChildren = document.createElement('div');
         hierarchyChildren.className = 'hierarchy__children';

         hierarchyParent.appendChild(hierarchyParentTitle);
         hierarchyParent.appendChild(hierarchyChildren);
         hierarchy.appendChild(hierarchyParent);

         currentParent = hierarchyParent;
         currentChildren = hierarchyChildren;

         element.dataset.navPath = path;

         hierarchyParentTitle.addEventListener('click', e => {
            element.scrollIntoView({ behavior: 'instant', block: 'start' });
            updateURL(path);
            localStorage.setItem('lastScrollPosition', window.scrollY);

            // added code
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            // added code
            // updateActiveHierarchyLink(hierarchyParentTitle);

            setTimeout(() => {
               selection.removeAllRanges();
            }, 1000);
         });
      } else if (element.classList.contains('hierarchy__child__link') && currentChildren) {
         const slug = element.textContent.trim().toLowerCase().replace(/\s+/g, '-');
         const path = `${currentParentPath}/${slug}`;

         const hierarchyChild = document.createElement('div');
         hierarchyChild.className = 'hierarchy__child';
         hierarchyChild.textContent = element.textContent.trim();
         hierarchyChild.dataset.path = path;

         currentChildren.appendChild(hierarchyChild);

         element.dataset.navPath = path;

         hierarchyChild.addEventListener('click', e => {
            element.scrollIntoView({ behavior: 'instant', block: 'start' });
            updateURL(path);
            localStorage.setItem('lastScrollPosition', window.scrollY);

            // added code
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            // added code
            // updateActiveHierarchyLink(hierarchyChild);

            setTimeout(() => {
               selection.removeAllRanges();
            }, 1000);
         });
      }
   });

   const hierarchyContainer = document.querySelector('.hierarchy__container');

   if (hierarchyContainer) {
      hierarchyContainer.innerHTML = '';
      hierarchyContainer.appendChild(hierarchy);
   } else {
      const newHierarchyContainer = document.createElement('div');
      newHierarchyContainer.className = 'hierarchy__container';
      newHierarchyContainer.appendChild(hierarchyContainer);

      const dropdown = document.querySelector('.sidebar__dropdown');
      if (dropdown && dropdown.parentNode) {
         dropdown.parentNode.insertBefore(newHierarchyContainer, dropdown.nextSibling);
      } else {
         document.body.insertBefore(newHierarchyContainer, document.body.firstChild);
      }
   }
   handlePathNavigation();

   // added code
   setupCopyLinks();

   // added code
   setTimeout(() => {
      setupScrollSpy();
   }, 200);
}

// check and format foreach iterator name
const connectWithDropdown = () => {
   document.querySelectorAll('.dropdown__link').forEach(link => {
      link.addEventListener('click', () => {
         setTimeout(buildHierarchy, 100);
      });
   });
   window.addEventListener('popstate', () => {
      setTimeout(handlePathNavigation, 100);
   });
}

document.addEventListener('DOMContentLoaded', () => {
   restoreState();
   window.addEventListener('popstate', restoreState());

   // added code
   document.querySelectorAll('a').forEach(link => {
      link.setAttribute('target', '_blank');
   });

   // added code
   svgLinkIcon = `
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy__link">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
   </svg>
   `
   const allHierarchyLinks = document.querySelectorAll('.hierarchy__parent__link, .hierarchy__child__link');
   allHierarchyLinks.forEach(hierarchyLink => {
      hierarchyLink.insertAdjacentHTML('beforeend', svgLinkIcon);
   });

   // pre code formatting
   document.querySelectorAll('pre code').forEach(element => {
      const lines = element.textContent.split('\n')
         // l: line, i: index, a: array (lines)
         .filter((l, i, a) =>
            !(i === 0 && !l.trim()) &&
            !(i === a.length - 1 && !l.trim()));

      const indent = (lines.find(line => line.trim())?.match(/^\s+/) || [''])[0];
      if (indent) {
         const regex = new RegExp(`^${indent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gm');
         element.textContent = lines.map(line => line.replace(regex, '')).join('\n');
      }
      hljs.highlightElement(element);
   });

   // dropdown toggle logic
   document.querySelectorAll('.dropdown__title').forEach(title => {
      title.addEventListener('click', () => {
         const arrow = title.querySelector('svg');
         const links = title.nextElementSibling;
         const list = title.closest('.dropdown__list');
         if (links) {
            const open = links.style.display === 'flex';
            links.style.display = open ? 'none' : 'flex';
            arrow.style.transform = open ? 'rotate(-90deg)' : 'rotate(0deg)';
            if (list) {
               const listId = list.dataset.id ||
                  Array.from(document.querySelectorAll('.dropdown__list')).indexOf(list);
               localStorage.setItem(`dropdown_${listId}_open`, !open);
            }
         }
      });
   });

   // selected link highlight logic
   dropdownLinksGlobal.forEach((link, index) => {
      const pageId = link.dataset.pageId ||
         link.textContent.trim().toLowerCase().replace(/\s+/g, '-') ||
         `page-${index}`;
      if (!link.dataset.pageId) {
         link.dataset.pageId = pageId;
      }
      if (contentPagesGlobal[index] && !contentPagesGlobal[index].id) {
         contentPagesGlobal[index].id = pageId;
      }
      link.addEventListener('click', function () {
         dropdownLinksGlobal.forEach(l => l.classList.remove('active'));
         this.classList.add('active');
         contentPagesGlobal.forEach(page => page.classList.remove('active'));
         contentPagesGlobal[index].classList.add('active');
         const pageId = this.dataset.pageId;
         history.pushState(null, null, `#${pageId}`);
         localStorage.setItem('selectedIndex', index);
      });
   });

   buildHierarchy();
   connectWithDropdown();
});