/** select.js **
 *
 * 
**/



;(function selectLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.Select = class Select {
    constructor(section, data, urlArray, callback) {
      this.section = section
      this.data = data
      this.cardSets = this.getCardSets(urlArray)
      this.callback = callback

      this.injectHTML()
    }


    getCardSets(urlArray) {
      let cardSets = {}

      urlArray.forEach(iconURL => {
        let path = iconURL.split("/")
        path.pop() // split off icon filename
        let folder = path.join("/") + "/"
        let name = path.pop()

        // name = name.replace(/Q$/, "?").toLowerCase().replace(/_/g, " ")
        name = name.replace(/^\d+-/, "").replace(/Q$/, "?").replace(/_/g, " ")
        name = name[0].toUpperCase() + name.substring(1)

        let hash = "#" + iconURL.hashCode() // e.g. "#-566766435"

        cardSets[hash] = {
          name: name
        , hash: hash
        , icon: iconURL
        , audio: folder + this.data.audio
        , phrases: folder + this.data.phrases
        }

      })
      
      return cardSets
    }


    injectHTML() {
      let ul = document.createElement("ul")
      let keys = Object.keys(this.cardSets)

      keys.forEach(key => {
        let cardData = this.cardSets[key]

        let li = document.createElement("li")
        li.id = cardData.hash

        li.innerHTML = `
        <a class="action cardset" href="#">
          <img src="${cardData.icon}">
          <span class="title">${cardData.name}</span>
          <span class="percent">100%</span>
        </a>
        `
        ul.appendChild(li)
      })

      while (this.section.firstChild) {
        this.section.firstChild.remove();
      }

      this.section.appendChild(ul)
      ul.onclick = this.selectCardSet.bind(this)
    }


    selectCardSet(event) {
      event.preventDefault()

      let target = event.target
      let showStats = (target.classList.contains("percent"))

      while (target && target.tagName !== "LI") {
        target = target.parentNode
      }

      if (!target) {
        return
      }

      let cardSetData = this.cardSets[target.id]

      this.callback(cardSetData, showStats)
    }
  }

})(window)