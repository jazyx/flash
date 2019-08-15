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
    /**
     * Called by getCardSetIcons in Flash.js, after an Ajax call to
     * the server for cardSetData.
     *
     * @param  {HTMLELement}   section      section#selector
     * @param  {object}        data         { ...
     *                                      , phrases:  "phrases.txt"
     *                                      , audio:    "audio/"
     *                                      , ... }
     * @param  {<type>}       cardSetsArray [ <CardSet>, ... ]
     * @param  {Function}     callback      flash.callbackFromSelector()
     */
    constructor(data, callback) {
      let section = document.querySelector(data.selector)
      this.ul = section.querySelector("ul")
      this.data = data
      // { ...
      // , phrases:  "phrases.txt"
      // , audio:    "audio/"
      // , ... }
      
      this.callback = callback

      this.ul.onclick = this.selectCardSet.bind(this)
      this.hashLUT = {}
    }


    adoptCardSets(cardSetsArray, user) {
      this.cardSets = cardSetsArray
      this.injectHTML(user)
    }


    injectHTML(user) {
      while (this.ul.firstChild) {
        this.ul.firstChild.remove();
      }

      this.cardSets.forEach(cardSet => {
        let info = cardSet.info
        let hash = info.hash

        let li = document.createElement("li")
        li.id = hash

        this.hashLUT[info.hash] = cardSet

        li.innerHTML = `
        <a class="action cardset" href="#">
          <div class="progress"></div>
          <img src="${info.icon}">
          <div class="text">
            <span class="title">
              ${info.name}</span>
            <span class="percent">0%</span>
          </div>
        </a>
        `

        this.ul.appendChild(li)
        
        user.getPercentKnown(hash)
      })
    }


    refresh() {
      this.cardSets.forEach(cardSet => {
        let li = document.getElementById(cardSet.info.hash)
        let progress = li.querySelector("div.progress")
        let percent = li.querySelector("span.percent")
        let ratios = cardSet.getRatios()

        progress.style = "width:" + ratios.percent
        percent.innerText = ratios.rounded
      })
    }


    selectCardSet(event) {
      event.preventDefault()

      let target = event.target
      let action = (target.classList.contains("percent"))
                    ? "showList"
                    : "showCards"

      while (target && target.tagName !== "LI") {
        target = target.parentNode
      }

      if (!target) {
        return
      }

      let cardSet = this.hashLUT[target.id]
      // console.log("selectCardSet", cardSet)

      this.callback(action, cardSet)
    }


    updatePercentage(cardSetData) {
      let ratios = this.getRatios(cardSetData)
      let li = document.getElementById(cardSetData.hash)
      let div = li.querySelector("div.progress")
      let percent = li.querySelector("span.percent")
      div.style.width = ratios.percent
      percent.innerText = ratios.rounded
    }


    updatePercent(cardSetHash, ratios) {
      let li = document.getElementById(cardSetHash)
      let div = li.querySelector("div.progress")
      let percent = li.querySelector("span.percent")
      div.style.width = ratios.percent
      percent.innerText = ratios.rounded
    }
  }

})(window)