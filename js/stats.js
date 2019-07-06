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
      this.ul.onclick = this.rememberCard.bind(this)

      let language = section.querySelector("div.language")
      language.onclick = this.selectLanguage.bind(this)

      let actions = section.querySelector("div.actions")
      actions.onclick = this.applyAction.bind(this)
    }


    show(data) {
      this.injectHTML(data)
    }


    injectHTML(data) {
      while (this.ul.firstChild) {
        this.ul.removeChild(this.ul.firstChild);
      }

      data.forEach((cardData, index) => {
        let li = document.createElement("li")
        let ru = cardData.ru
        let id = `card-${index}`
        li.innerHTML = `
        <input type="checkbox" id="${id}">
        <label for="${id}">
          <div></div>
          <span class="ru">${ru}</span>
          <span class="vo">${cardData.en}</span>
        </label>
        `

        if (cardData.known) {
          li.querySelector("input").checked = true
        }

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
    }


    rememberCard(event) {
      let target = event.target
      let tagName = target.tagName

      if (tagName === "A") {
        return this.playAudio(event)
      } else if (tagName !== "INPUT") {
        return
      }

      let index = parseInt(target.id.replace("card-", ""))
      this.callback("rememberCard", index, target.checked)
    }


    applyAction(event) {
      let target = event.target
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