
/* Native JavaScript for Bootstrap 4 | Button
---------------------------------------------*/

import { hasClass, addClass, removeClass  } from './util/class.js';
import { bootstrapCustomEvent, dispatchCustomEvent, on, off  } from './util/event.js';
import { queryElement, getElementsByClassName } from './util/selector.js';

// BUTTON DEFINITION
// =================

export default function Button(element) {

  // initialization element
  element = queryElement(element);

  // reset on re-init
  element.Button && element.Button.dispose();
  
  // constant
  let toggled = false; // toggled makes sure to prevent triggering twice the change.bs.button events

  // bind
  const self = this,

    // changeEvent
    changeCustomEvent = bootstrapCustomEvent('change', 'button'),

    // private methods
    activateItems = () => {
      const labelsToACtivate = getElementsByClassName(element, 'btn'),
            lbll = labelsToACtivate.length;
      for (let i=0; i<lbll; i++) {
        !hasClass(labelsToACtivate[i],'active') 
          && queryElement('input:checked',labelsToACtivate[i])
          && addClass(labelsToACtivate[i],'active');
        hasClass(labelsToACtivate[i],'active') 
          && !queryElement('input:checked',labelsToACtivate[i])
          && removeClass(labelsToACtivate[i],'active');
      }
    },
    toggle = e => {
      const label = e.target.tagName === 'LABEL' ? e.target : e.target.parentNode.tagName === 'LABEL' ? e.target.parentNode : null; // the .btn label
      
      if ( !label ) return; //react if a label or its immediate child is clicked

      const // all the button group buttons
        labels = getElementsByClassName(label.parentNode,'btn'),
        input = label.getElementsByTagName('INPUT')[0];

      if ( !input ) return; // return if no input found

      dispatchCustomEvent.call(input, changeCustomEvent); // trigger the change for the input
      dispatchCustomEvent.call(element, changeCustomEvent); // trigger the change for the btn-group

      // manage the dom manipulation
      if ( input.type === 'checkbox' ) { //checkboxes
        if ( changeCustomEvent.defaultPrevented ) return; // discontinue when defaultPrevented is true

        if ( !input.checked ) {
          addClass(label,'active');
          input.getAttribute('checked');
          input.setAttribute('checked','checked');
          input.checked = true;
        } else {
          removeClass(label,'active');
          input.getAttribute('checked');
          input.removeAttribute('checked');
          input.checked = false;
        }

        if (!toggled) { // prevent triggering the event twice
          toggled = true;
        }
      }

      if ( input.type === 'radio' && !toggled ) { // radio buttons
        if ( changeCustomEvent.defaultPrevented ) return;
        // don't trigger if already active (the OR condition is a hack to check if the buttons were selected with key press and NOT mouse click)
        if ( !input.checked || (e.screenX === 0 && e.screenY == 0) ) {
          addClass(label,'active');
          addClass(label,'focus');
          input.setAttribute('checked','checked');
          input.checked = true;

          toggled = true;
          for (let i = 0, ll = labels.length; i<ll; i++) {
            const otherLabel = labels[i], otherInput = otherLabel.getElementsByTagName('INPUT')[0];
            if ( otherLabel !== label && hasClass(otherLabel,'active') )  {
              dispatchCustomEvent.call(otherInput, changeCustomEvent); // trigger the change
              removeClass(otherLabel,'active');
              otherInput.removeAttribute('checked');
              otherInput.checked = false;
            }
          }
        }
      }
      setTimeout( () => { toggled = false; }, 50 );
    },
    // handlers
    keyHandler = e => {
      const key = e.which || e.keyCode;
      key === 32 && e.target === document.activeElement && toggle(e);
    },
    preventScroll = e => { 
      const key = e.which || e.keyCode;
      key === 32 && e.preventDefault();
    },
    focusHandler = e => {
      addClass(e.target.parentNode,'focus');
    },
    blurHandler = e => {
      removeClass(e.target.parentNode,'focus');
    },
    toggleEvents = action => {
      action( element, 'click', toggle );
      action( element, 'keyup', keyHandler ), action( element, 'keydown', preventScroll );

      const allBtns = getElementsByClassName(element, 'btn');
      for (let i=0; i<allBtns.length; i++) {
        const input = allBtns[i].getElementsByTagName('INPUT')[0];
        action( input, 'focus', focusHandler), action( input, 'blur', blurHandler);
      }
    };

  // public method
  self.dispose = () => {
    toggleEvents(off);
    delete element.Button;
  }

  // init
  // prevent adding event handlers twice
  if ( !element.Button ) { 
    toggleEvents(on);
  }

  // activate items on load
  activateItems();

  // associate target with init object
  self.element = element;
  element.Button = self;
}
