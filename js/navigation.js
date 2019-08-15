/** navigation.js **
 *
 * An instance of this script controls movement between the different
 * sections:
 * 
 * • Splash screen, shown while the app is loading data from the server
 * • Selector, where the user chooses which card set to work with
 * • Card, where the user sees one card at a time
 * • List, where the user sees all the cards
 * • Settings, to be decided
**/



;(function navigationLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.Navigation = class Navigation {
    constructor() {
      this.sections = this.getElements("section")
      this.sectionIds = Object.keys(this.sections)

      this.initializeNavigationButtons()
    }


    getElements(selector, asArray) {
      let elements = {}
      let array = [].slice.call(document.querySelectorAll(selector))

      if (asArray) {
        return array
      }

      // If we get here, create an object map
      array.forEach(element => {
        elements[element.id] = element
      })

      return elements
    }


    initializeNavigationButtons() {
      let buttons = this.getElements(".navigate", true)
      let listener = this.go.bind(this)

      buttons.forEach(button => {
        button.onclick = listener
      })
    }


    go(event) {
      let target = event.target

      while (target && target.tagName !== "A") {
        target = target.parentNode
      }

      if (!target) {
        return
      }

      let id = target.href.split("#").pop()
      this.showSection(id)
    }


    showSection(id) {
      this.sectionIds.forEach(sectionId => {
        let item = this.sections[sectionId]

        if (sectionId === id) {
          item.classList.add("active")

        } else {
          item.classList.remove("active")
        }
      })
    }
  }


})(window)