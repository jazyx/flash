/** user.js **
 *
 * 
**/



;(function userLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.User = class User {
    constructor() {
      
    }


    initialize() {
      
    }
  }


  jazyx.user = new jazyx.classes.User()

})(window)