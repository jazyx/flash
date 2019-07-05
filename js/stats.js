/** stats.js **
 *
 * 
**/



;(function statsLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.Stats = class Stats {
    constructor(selector, callback) {
      let section = this.section = document.querySelector(selector)
      this.callback = callback

      this.ul = section.querySelector("ul")
      this.ul.onclick = this.toggleLearnt.bind(this)

      let language = section.querySelector("div.language")
      language.onclick = this.selectLanguage.bind(this)

      let actions = section.querySelector("div.actions")
      actions.onclick = this.applyAction.bind(this)
    }


    show(data) {
      this.injectHTML(data)
    }


    injectHTML(data) {
      data.forEach(cardData => {
        let li = document.createElement("li")
        let ru = cardData.ru
        let id = "#" + ru.hashCode()
        li.innerHTML = `
        <input type="checkbox" name="" id="${id}" value="">
        <label for="${id}">
          <span class="ru">${ru}</span>
          <span class="vo">${cardData.en}</span>
        </label>
        `

        this.ul.appendChild(li)
      })
    }


    selectLanguage(event) {
      let id = event.target.id
      if (!id) { return } // first event comes from label

      if (id === "ru") {
        this.section.classList.remove("vo")
      } else {
        this.section.classList.add("vo")
      }
      console.log("selectLanguage", event.target.id)
    }


    toggleLearnt() {

    }


    applyAction(event) {
      target = event.target
      if (target.tagName !== "A") {
        return
      }

      let action = target.id.toCamelCase()
      if (this[action]) {
        this[action]()
      }
    }


    selectAll() {
      console.log("selectAll")
      
    }


    deelectAll() {
      console.log("deselectAll")
      
    }


    revert() {
      console.log("revert")
      
    }


    close() {
      console.log("close")
      this.callback()    
    }
  }

})(window)