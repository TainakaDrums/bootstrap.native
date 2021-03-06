
/* Native JavaScript for Bootstrap 4 | Popover
---------------------------------------------- */

import { styleTip } from './util/misc.js';
import { hasClass, addClass, removeClass } from './util/class.js';
import { bootstrapCustomEvent, dispatchCustomEvent, on, off, mouseHover, passiveHandler } from './util/event.js';
import { queryElement } from './util/selector.js';
import { emulateTransitionEnd } from './util/transition.js';

// POPOVER DEFINITION
// ==================

export default function Popover(element,options) {

  // initialization element
  element = queryElement(element);

  // reset on re-init
  element.Popover && element.Popover.dispose();

  // set instance options
  options = options || {};

  // popover and timer
  let popover = null,
    timer = 0,
    // title and content
    titleString,
    contentString;

  // bind, popover and timer
  const 
    self = this,

    // DATA API
    triggerData = element.getAttribute('data-trigger'), // click / hover / focus
    animationData = element.getAttribute('data-animation'), // true / false

    placementData = element.getAttribute('data-placement'),
    dismissibleData = element.getAttribute('data-dismissible'),
    delayData = element.getAttribute('data-delay'),
    containerData = element.getAttribute('data-container'),

    // close btn for dissmissible popover
    closeBtn = '<button type="button" class="close">×</button>',

    // custom events
    showCustomEvent = bootstrapCustomEvent('show', 'popover'),
    shownCustomEvent = bootstrapCustomEvent('shown', 'popover'),
    hideCustomEvent = bootstrapCustomEvent('hide', 'popover'),
    hiddenCustomEvent = bootstrapCustomEvent('hidden', 'popover'),

    // check container
    containerElement = queryElement(options.container),
    containerDataElement = queryElement(containerData),

    // maybe the element is inside a modal
    modal = element.closest('.modal'),

    // maybe the element is inside a fixed navbar
    navbarFixedTop = element.closest('.fixed-top'),
    navbarFixedBottom = element.closest('.fixed-bottom');

  // set instance options
  self.options = {};
  self.options.template = options.template ? options.template : null; // JavaScript only
  self.options.trigger = options.trigger ? options.trigger : triggerData || 'hover';
  self.options.animation = options.animation && options.animation !== 'fade' ? options.animation : animationData || 'fade';
  self.options.placement = options.placement ? options.placement : placementData || 'top';
  self.options.delay = parseInt(options.delay || delayData) || 200;
  self.options.dismissible = options.dismissible || dismissibleData === 'true' ? true : false;
  self.options.container = containerElement ? containerElement 
                          : containerDataElement ? containerDataElement 
                          : navbarFixedTop ? navbarFixedTop
                          : navbarFixedBottom ? navbarFixedBottom
                          : modal ? modal : document.body;

  // set initial placement from option
  const placementClass = `bs-popover-${self.options.placement}`;

  // handlers
  function dismissibleHandler(e) {
    if (popover !== null && e.target === queryElement('.close',popover)) {
      self.hide();
    }
  }
  // private methods
  function getContents() {
    return {
      0 : options.title || element.getAttribute('data-title') || null,
      1 : options.content || element.getAttribute('data-content') || null
    }
  }
  function removePopover() {
    self.options.container.removeChild(popover);
    timer = null; popover = null; 
  }

  function createPopover() {
    titleString = getContents()[0] || null;
    contentString = getContents()[1];
    // fixing https://github.com/thednp/bootstrap.native/issues/233
    contentString = !!contentString ? contentString.trim() : null;

    popover = document.createElement('div');

    // popover arrow
    const popoverArrow = document.createElement('div');
    addClass(popoverArrow,'arrow');
    popover.appendChild(popoverArrow);

    if ( contentString !== null && self.options.template === null ) { //create the popover from data attributes

      popover.setAttribute('role','tooltip');     

      if (titleString !== null) {
        const popoverTitle = document.createElement('h3');
        addClass(popoverTitle,'popover-header');
        popoverTitle.innerHTML = self.options.dismissible ? titleString + closeBtn : titleString;
        popover.appendChild(popoverTitle);
      }

      //set popover content
      var popoverBody = document.createElement('div');
      addClass(popoverBody,'popover-body');
      popoverBody.innerHTML = self.options.dismissible && titleString === null ? contentString + closeBtn : contentString;
      popover.appendChild(popoverBody);

    } else {  // or create the popover from template
      const popoverTemplate = document.createElement('div');
      popoverTemplate.innerHTML = self.options.template.trim();
      popover.className = popoverTemplate.firstChild.className;
      popover.innerHTML = popoverTemplate.firstChild.innerHTML;

      const popoverHeader = queryElement('.popover-header',popover), 
            popoverBody = queryElement('.popover-body',popover);

      // fill the template with content from data attributes
      titleString && popoverHeader && (popoverHeader.innerHTML = titleString.trim());
      contentString && popoverBody && (popoverBody.innerHTML = contentString.trim());
    }

    //append to the container
    self.options.container.appendChild(popover);
    popover.style.display = 'block';
    !hasClass(popover, 'popover') && addClass(popover, 'popover');
    !hasClass(popover, self.options.animation) && addClass(popover, self.options.animation);
    !hasClass(popover, placementClass) && addClass(popover, placementClass);      
  }
  function showPopover() {
    !hasClass(popover,'show') && ( addClass(popover,'show') );
  }
  function updatePopover() {
    styleTip(element, popover, self.options.placement, self.options.container);
  }
  function toggleEvents(action) {
    if (self.options.trigger === 'hover') {
      action( element, mouseHover[0], self.show );
      if (!self.options.dismissible) { action( element, mouseHover[1], self.hide ); }
    } else if ('click' == self.options.trigger || 'focus' == self.options.trigger) {
      action( element, self.options.trigger, self.toggle );
    }
  }
  // event toggle
  function dismissHandlerToggle(action) {
    if ('click' == self.options.trigger || 'focus' == self.options.trigger) {
      !self.options.dismissible && action( element, 'blur', self.hide );
    }
    self.options.dismissible && action( document, 'click', dismissibleHandler );     
    action( window, 'resize', self.hide, passiveHandler );
  }
  // triggers
  function showTrigger() {
    dismissHandlerToggle(on);
    dispatchCustomEvent.call(element, shownCustomEvent);
  }
  function hideTrigger() {
    dismissHandlerToggle(off);
    removePopover();
    dispatchCustomEvent.call(element, hiddenCustomEvent);
  }

  // public methods / handlers
  self.toggle = () => {
    if (popover === null) { self.show(); } 
    else { self.hide(); }
  };
  self.show = () => {
    clearTimeout(timer);
    timer = setTimeout( () => {
      if (popover === null) {
        dispatchCustomEvent.call(element, showCustomEvent);
        if ( showCustomEvent.defaultPrevented ) return;

        createPopover();
        updatePopover();
        showPopover();
        !!self.options.animation ? emulateTransitionEnd(popover, showTrigger) : showTrigger();
      }
    }, 20 );
  };
  self.hide = () => {
    clearTimeout(timer);
    timer = setTimeout( () => {
      if (popover && popover !== null && hasClass(popover,'show')) {
        dispatchCustomEvent.call(element, hideCustomEvent);
        if ( hideCustomEvent.defaultPrevented ) return;
        removeClass(popover,'show');
        !!self.options.animation ? emulateTransitionEnd(popover, hideTrigger) : hideTrigger();
      }
    }, self.options.delay );
  };
  self.dispose = () => {
    self.hide();
    toggleEvents(off);
    delete element.Popover;
  };

  // invalidate
  titleString = getContents()[0];
  contentString = getContents()[1];
  if ( !contentString && !self.options.template ) return;

  // init
  if ( !element.Popover ) { // prevent adding event handlers twice
    toggleEvents(on);
  }

  // associate target to init object
  self.element = element;
  element.Popover = self;

}

