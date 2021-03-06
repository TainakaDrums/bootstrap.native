import { componentsInit } from './globals.js'

/* Native JavaScript for Bootstrap | Initialize Data API
-------------------------------------------------------- */
export const initCallback = function (lookUp){
  lookUp = lookUp || document;
  const initializeDataAPI = function( Constructor, collection ){
    for (let i=0, cl=collection.length; i<cl; i++) {
      try {
        new Constructor(collection[i]);
      } catch(e){
        console.error(e)
      }
    }
  };
  for (const component in componentsInit) {
    initializeDataAPI( componentsInit[component][0], lookUp.querySelectorAll (componentsInit[component][1]) );
  }
};

/* Native JavaScript for Bootstrap | Remove Data API
---------------------------------------------------- */
export const removeDataAPI = function (lookUp) {
  lookUp = lookUp || document;
  const removeElementDataAPI = function( ConstructorName, collection ){
    for (let i=0, cl=collection.length; i<cl; i++) {
      try {
        if (collection[i][ConstructorName]) {
          collection[i][ConstructorName].dispose();
        }
      } catch(e){
        console.error(e)
      }
    }
  };  

  for (const component in componentsInit) {
    removeElementDataAPI( component, lookUp.querySelectorAll (componentsInit[component][1]) );
  }  
};
