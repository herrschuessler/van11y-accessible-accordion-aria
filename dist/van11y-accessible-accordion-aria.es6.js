/*
 * ES2015 accessible accordion system, using ARIA
 * Website: https://van11y.net/accessible-accordion/
 * License MIT: https://github.com/nico3333fr/van11y-accessible-accordion-aria/blob/master/LICENSE
 *
 */
 'use strict';

 const ACCORDION_JS = 'js-accordion';
 const ACCORDION_JS_HEADER = 'js-accordion__header';
 const ACCORDION_JS_PANEL = 'js-accordion__panel';

 const ACCORDION_DATA_PREFIX_CLASS = 'data-accordion-prefix-classes';
 const ACCORDION_DATA_OPENED = 'data-accordion-opened';
 const ACCORDION_DATA_MULTISELECTABLE = 'data-accordion-multiselectable';

 const ACCORDION_PREFIX_IDS = 'accordion';
 const ACCORDION_BUTTON_ID = '_tab';
 const ACCORDION_PANEL_ID = '_panel';

 const ACCORDION_STYLE = 'accordion';
 const ACCORDION_TITLE_STYLE = 'accordion__title';
 const ACCORDION_HEADER_STYLE = 'accordion__header';
 const ACCORDION_PANEL_STYLE = 'accordion__panel';

 const ACCORDION_ROLE_TABLIST = 'tablist';
 const ACCORDION_ROLE_TAB = 'tab';
 const ACCORDION_ROLE_TABPANEL = 'tabpanel';

 const ATTR_ROLE = 'role';
 const ATTR_MULTISELECTABLE = 'aria-multiselectable';
 const ATTR_EXPANDED = 'aria-expanded';
 const ATTR_LABELLEDBY = 'aria-labelledby';
 const ATTR_HIDDEN = 'aria-hidden';
 const ATTR_CONTROLS = 'aria-controls';
 const ATTR_SELECTED = 'aria-selected';

 const IS_OPENED_CLASS = 'is-open';


 if (!Element.prototype.matches) {
  Element.prototype.matches =
  Element.prototype.matchesSelector ||
  Element.prototype.mozMatchesSelector ||
  Element.prototype.msMatchesSelector ||
  Element.prototype.oMatchesSelector ||
  Element.prototype.webkitMatchesSelector ||
  function(s) {
    var matches = (this.document || this.ownerDocument).querySelectorAll(s),
    i = matches.length;
    while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;
  };
}


const findById = id => document.getElementById(id);

const addClass = (el, className) => {
  if (el.classList) {
    el.classList.add(className); // IE 10+
  } else {
    el.className += ' ' + className; // IE 8+
  }
}

const removeClass = (el, className) => {
  if (el.classList) {
    el.classList.remove(className); // IE 10+
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' '); // IE 8+
  }
}

const hasClass = (el, className) => {
  if (el.classList) {
    return el.classList.contains(className); // IE 10+
  } else {
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className); // IE 8+ ?
  }
}

const setAttributes = (node, attrs) => {
  Object
  .keys(attrs)
  .forEach((attribute) => {
    node.setAttribute(attribute, attrs[attribute]);
  });
};

const unSelectHeaders = (elts) => {
  elts
  .forEach((header_node) => {
    setAttributes(header_node, {
      [ATTR_SELECTED]: 'false',
      'tabindex': '-1'
    });
  });
}

const selectHeader = (el) => {
  el.setAttribute(ATTR_SELECTED, true);
  el.removeAttribute('tabindex');
}

const selectHeaderInList = (elts, param) => {
  let indice_trouve;
  elts
  .forEach((header_node, index) => {

    if (header_node.getAttribute(ATTR_SELECTED) === 'true') {
      indice_trouve = index;
    }

  });
  if (param === 'next') {
    selectHeader(elts[indice_trouve + 1]);
    setTimeout(function() {
      elts[indice_trouve + 1].focus();
    }, 0);
  }
  if (param === 'prev') {
    selectHeader(elts[indice_trouve - 1]);
    setTimeout(function() {
      elts[indice_trouve - 1].focus();
    }, 0);
  }

}

/* gets an element el, search if it is child of parent class, returns id of the parent */
let searchParent = (el, parentClass) => {
  let found = false;
  let parentElement = el.parentNode;
  while (parentElement && found === false) {
    if (hasClass(parentElement, parentClass) === true) {
      found = true;
    } else {
      parentElement = parentElement.parentNode;
    }
  }
  if (found === true) {
    return parentElement.getAttribute('id');
  } else {
    return '';
  }
}

const findAncestor = (el, sel) => {
  if (typeof el.closest === 'function') {
    return el.closest(sel) || null;
  }
  while (el) {
    if (el.matches(sel)) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}


// Find all accordions
const $listAccordions = () => [].slice.call(document.querySelectorAll('.' + ACCORDION_JS));


export const init = () => {

  $listAccordions()
  .forEach((accordion_node, index) => {

    let iLisible = index + 1;
    let prefixClassName = accordion_node.hasAttribute(ACCORDION_DATA_PREFIX_CLASS) === true ? accordion_node.getAttribute(ACCORDION_DATA_PREFIX_CLASS) + '-' : '';
      //let accordionClassName = accordion_node.hasAttribute(ACCORDION_DATA_PREFIX_CLASS) === true ? accordion_node.getAttribute(ACCORDION_DATA_PREFIX_CLASS) : '' ;
      //let multiSelectableAttribute = accordion_node.hasAttribute(ACCORDION_DATA_MULTISELECTABLE) === true ? accordion_node.getAttribute(ACCORDION_DATA_MULTISELECTABLE) : '' ;
      /*let toExpand = node.nextElementSibling;
      let expandmoreText = node.innerHTML;
      let expandButton = document.createElement("BUTTON");*/

      // clear element before adding button to it
      //node.innerHTML = '';

      // Init attributes accordion
      if (accordion_node.getAttribute(ACCORDION_DATA_MULTISELECTABLE) === 'none') {
        accordion_node.setAttribute(ATTR_MULTISELECTABLE, 'false');
      } else {
        accordion_node.setAttribute(ATTR_MULTISELECTABLE, 'true');
      }
      accordion_node.setAttribute(ATTR_ROLE, ACCORDION_ROLE_TABLIST);
      addClass(accordion_node, prefixClassName + ACCORDION_STYLE);

      let $listAccordionsHeader = [].slice.call(accordion_node.querySelectorAll('.' + ACCORDION_JS_HEADER));
      $listAccordionsHeader
      .forEach((header_node, index_header) => {

        let indexHeaderLisible = index_header + 1;
        let accordionPanel = header_node.nextElementSibling;
        let accordionHeaderText = header_node.innerHTML;
        let accordionButton = document.createElement("BUTTON");
        let accordionOpenedAttribute = header_node.hasAttribute(ACCORDION_DATA_OPENED) === true ? header_node.getAttribute(ACCORDION_DATA_OPENED) : '';

          // set button with attributes
        accordionButton.innerHTML = accordionHeaderText;
        addClass(accordionButton, ACCORDION_JS_HEADER);
        addClass(accordionButton, prefixClassName + ACCORDION_HEADER_STYLE);
        setAttributes(accordionButton, {
          [ATTR_ROLE]: ACCORDION_ROLE_TAB,
          'id': ACCORDION_PREFIX_IDS + iLisible + ACCORDION_BUTTON_ID + indexHeaderLisible,
          [ATTR_CONTROLS]: ACCORDION_PREFIX_IDS + iLisible + ACCORDION_PANEL_ID + indexHeaderLisible,
          [ATTR_SELECTED]: 'false',
          'tabindex': '-1',
          'type': 'button'
        });

          // place button
        accordionButton = header_node.parentElement.insertBefore(accordionButton, header_node);

          // move title into panel
        accordionPanel.insertBefore(header_node, accordionPanel.firstChild);
          // set title with attributes
        addClass(header_node, prefixClassName + ACCORDION_TITLE_STYLE);
        removeClass(header_node, ACCORDION_JS_HEADER);

          // set attributes to panels
        addClass(accordionPanel, prefixClassName + ACCORDION_PANEL_STYLE);
        setAttributes(accordionPanel, {
          [ATTR_ROLE]: ACCORDION_ROLE_TABPANEL,
          [ATTR_LABELLEDBY]: ACCORDION_PREFIX_IDS + iLisible + ACCORDION_BUTTON_ID + indexHeaderLisible,
          'id': ACCORDION_PREFIX_IDS + iLisible + ACCORDION_PANEL_ID + indexHeaderLisible
        });

        if (accordionOpenedAttribute === 'true') {
          accordionButton.setAttribute(ATTR_EXPANDED, 'true');
          header_node.removeAttribute(ACCORDION_DATA_OPENED);
          accordionPanel.setAttribute(ATTR_HIDDEN, 'false');
        } else {
          accordionButton.setAttribute(ATTR_EXPANDED, 'false');
          accordionPanel.setAttribute(ATTR_HIDDEN, 'true');
        }

          // init first one focusable
        if (indexHeaderLisible === 1) {
          accordionButton.removeAttribute('tabindex');
        }

      });


    });

  // click on
  ['click', 'keydown', 'focus']
  .forEach(eventName => {
    //let isCtrl = false;

    document.body
    .addEventListener(eventName, e => {

        // focus on button
      if (hasClass(e.target, ACCORDION_JS_HEADER) === true && eventName === 'focus') {
        let buttonTag = e.target;
        let accordionContainer = buttonTag.parentNode;
        let $accordionAllHeaders = [].slice.call(accordionContainer.querySelectorAll('.' + ACCORDION_JS_HEADER));

        unSelectHeaders($accordionAllHeaders);

        selectHeader(buttonTag);

      }

      // click on button
      if (hasClass(e.target, ACCORDION_JS_HEADER) === true && eventName === 'click') {
        let buttonTag = e.target;
        let accordionItem = buttonTag.parentNode;
        let accordionContainer = findAncestor(buttonTag, '.' + ACCORDION_JS);
        let $accordionAllHeaders = [].slice.call(accordionContainer.querySelectorAll('.' + ACCORDION_JS_HEADER));
        let accordionMultiSelectable = accordionContainer.getAttribute(ATTR_MULTISELECTABLE);
        let destination = findById(buttonTag.getAttribute(ATTR_CONTROLS));
        let stateButton = buttonTag.getAttribute(ATTR_EXPANDED);

        // if closed
        if (stateButton === 'false') {
          buttonTag.setAttribute(ATTR_EXPANDED, true);
          destination.removeAttribute(ATTR_HIDDEN);

          // add class to container
          addClass(accordionItem, IS_OPENED_CLASS);
          addClass(accordionContainer, IS_OPENED_CLASS);

        } else {
          buttonTag.setAttribute(ATTR_EXPANDED, false);
          destination.setAttribute(ATTR_HIDDEN, true);

          // remove class to container
          removeClass(accordionItem, IS_OPENED_CLASS);
          removeClass(accordionContainer, IS_OPENED_CLASS);
        }

        if (accordionMultiSelectable === 'false') {
          $accordionAllHeaders
          .forEach((header_node) => {

            let accordionItem = header_node.parentNode;
            let destinationPanel = findById(header_node.getAttribute(ATTR_CONTROLS));

            if (header_node !== buttonTag) {
              header_node.setAttribute(ATTR_SELECTED, false);
              header_node.setAttribute(ATTR_EXPANDED, false);
              destinationPanel.setAttribute(ATTR_HIDDEN, true);
              removeClass(accordionItem, IS_OPENED_CLASS);
            } else {
              header_node.setAttribute(ATTR_SELECTED, true);
            }
          });

        }

        setTimeout(function() {
          buttonTag.focus();
        }, 0);
        e.preventDefault();

      }

        // keyboard management for headers
      if (hasClass(e.target, ACCORDION_JS_HEADER) === true && eventName === 'keydown') {
        let buttonTag = e.target;
        let accordionContainer = buttonTag.parentNode;
        let $accordionAllHeaders = [].slice.call(accordionContainer.querySelectorAll('.' + ACCORDION_JS_HEADER));

          // strike home on a tab => 1st tab
        if (e.keyCode === 36) {
          unSelectHeaders($accordionAllHeaders);
          selectHeader($accordionAllHeaders[0]);
          setTimeout(function() {
            $accordionAllHeaders[0].focus();
          }, 0);
          e.preventDefault();
        }
          // strike end on the tab => last tab
        else if (e.keyCode === 35) {
          unSelectHeaders($accordionAllHeaders);
          selectHeader($accordionAllHeaders[$accordionAllHeaders.length - 1]);
          setTimeout(function() {
            $accordionAllHeaders[$accordionAllHeaders.length - 1].focus();
          }, 0);
          e.preventDefault();
        }
          // strike up or left on the tab => previous tab
        else if ((e.keyCode === 37 || e.keyCode === 38) && !e.ctrlKey) {

            // if first selected = select last
            //if ( $accordionAllHeaders[ $accordionAllHeaders.length-1 ].getAttribute( ATTR_SELECTED ) === 'true' ) {
          if ($accordionAllHeaders[0].getAttribute(ATTR_SELECTED) === 'true') {
            unSelectHeaders($accordionAllHeaders);
            selectHeader($accordionAllHeaders[$accordionAllHeaders.length - 1]);
            setTimeout(function() {
              $accordionAllHeaders[$accordionAllHeaders.length - 1].focus();
            }, 0);
            e.preventDefault();
          } else {
            selectHeaderInList($accordionAllHeaders, 'prev');
            e.preventDefault();
          }

        }
          // strike down or right in the tab => next tab
        else if ((e.keyCode === 40 || e.keyCode === 39) && !e.ctrlKey) {

            // if last selected = select first
          if ($accordionAllHeaders[$accordionAllHeaders.length - 1].getAttribute(ATTR_SELECTED) === 'true') {
            unSelectHeaders($accordionAllHeaders);
            selectHeader($accordionAllHeaders[0]);
            setTimeout(function() {
              $accordionAllHeaders[0].focus();
            }, 0);
            e.preventDefault();
          } else {
            selectHeaderInList($accordionAllHeaders, 'next');
            e.preventDefault();
          }

        }
      }


        // keyboard management for panels
      let id_panel = searchParent(e.target, ACCORDION_JS_PANEL);
      if (id_panel !== '' && eventName === 'keydown') {

        let panelTag = findById(id_panel);
        let accordionContainer = panelTag.parentNode;
        let $accordionAllHeaders = [].slice.call(accordionContainer.querySelectorAll('.' + ACCORDION_JS_HEADER));
        let buttonTag = findById(panelTag.getAttribute(ATTR_LABELLEDBY));

          // strike up + ctrl => go to header
        if (e.keyCode === 38 && e.ctrlKey) {
          unSelectHeaders($accordionAllHeaders);
          selectHeader(buttonTag);
          setTimeout(function() {
            buttonTag.focus();
          }, 0);
          e.preventDefault();
        }
          // strike pageup + ctrl => go to prev header
        if (e.keyCode === 33 && e.ctrlKey) {
            // go to header
          unSelectHeaders($accordionAllHeaders);
          selectHeader(buttonTag);
          buttonTag.focus();
          e.preventDefault();
            // then previous
          if ($accordionAllHeaders[0].getAttribute(ATTR_SELECTED) === 'true') {
            unSelectHeaders($accordionAllHeaders);
            selectHeader($accordionAllHeaders[$accordionAllHeaders.length - 1]);
            setTimeout(function() {
              $accordionAllHeaders[$accordionAllHeaders.length - 1].focus();
            }, 0);
          } else {
            selectHeaderInList($accordionAllHeaders, 'prev');
          }

        }
          // strike pagedown + ctrl => go to next header
        if (e.keyCode === 34 && e.ctrlKey) {
            // go to header
          unSelectHeaders($accordionAllHeaders);
          selectHeader(buttonTag);
          buttonTag.focus();
          e.preventDefault();
            // then next
          if ($accordionAllHeaders[$accordionAllHeaders.length - 1].getAttribute(ATTR_SELECTED) === 'true') {
            unSelectHeaders($accordionAllHeaders);
            selectHeader($accordionAllHeaders[0]);
            setTimeout(function() {
              $accordionAllHeaders[0].focus();
            }, 0);
          } else {
            selectHeaderInList($accordionAllHeaders, 'next');
          }

        }


      }

    }, true);
});
}
