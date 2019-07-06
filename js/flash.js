/** flash.js **
 *
 *
**/



;(function flashLoaded(global){
  "use strict"


  let jazyx = global.jazyx
  // global.jazyx.classes must exist



  /// <<< HARD-CODED
  let data = {
    php:      "php/sets.php"
  , phrases:  "phrases.txt"
  , audio:    "audio/"
  , audioButton: "[href='#audio']"
  , stats:    "#stats"
  }
  /// HARD-CODED >>>



  class Flash {
    constructor(classes, data) {
      this.classes = classes
      // User
      // Storage
      // ParseText
      // GetJSON
      // Select
      // AudioPlayer
      // PlayButton
      // AudioButton
      // (Flash)

      this.data = data
      // phrases:  "phrases.text"
      // audio:    "audio/"
      // selector: "[href='#audio']"

      this.initialize()
      // creates the properties:
      // 
      // this.sections = {...}
      // this.text = div element
      // this.cards = [...]
      // this.card = 0
      // this.minCount = 10
      // this.cueCode = "en"
    }


    initialize() {
      /// <<< HARD-CODED
      let delay = 1000
      /// HARD-CODED >>>

      this.setupHTMLObjects()

      // TODO: Deal with registered users
      this.storage = new this.classes.Storage("user_name_goes_here")

      let player = new this.classes.AudioPlayer()
      let button = new this.classes.PlayButton(this.data.audioButton)
      this.audioButton = new this.classes.AudioButton(player, button)

      this.getCardSetJSON()
      this.jsonDone = false
      this.timeOut = setTimeout(this.hideSplash.bind(this), delay)

      let callback = this.updateStats.bind(this)
      this.stats = new this.classes.Stats(this.data.stats, callback)
    }


    setupHTMLObjects() {
      let actions = [].slice.call(document.querySelectorAll(".action"))
      let listener = this.treatAction.bind(this)
      actions.forEach(actionLink => {
        actionLink.addEventListener("click", listener, false)
      })

      this.sections = this.getElements("section")
      this.buttons  = document.querySelector(".buttons")

      this.frame    = document.querySelector("div.frame")
      this.stimulus = document.querySelector("div.front")
      this.response = document.querySelector("div.back")
      this.progress = document.querySelector("div.done")  
      
      this.minCount = 10
      this.cueCode  = "en"
      this.cueIsRussian = (this.cueCode === "ru")

      this.complete = false

      // let url = this.folder + this.fileName
      // new this.ParseText(url, this.treatJSON.bind(this))
    }



    getCardSetJSON() {
      let callback = this.getCardSetIcons.bind(this)
      let url = this.data.php
      new this.classes.GetJSON(url, callback)
    }


    getCardSetIcons(error, iconURLArray) {
      if (error) {
        // We might be offline. Use stored cardsets as fallback.
        let iconURLArray = getCardSetIconsFromLocalStorage()

        if (!iconURLArray) {
          return console.log(
            `Ajax call to ${this.data.php} returned error\n${error}`
          )
        }
      }

      let section = this.sections.selector
      let callback = this.selectCardSet.bind(this)
      this.selector = new this.classes.Select(
        section
      , this.data
      , iconURLArray
      , callback
      )

      this.jsonDone = true
      this.hideSplash(true)
    }


    getCardSetIconsFromLocalStorage() {
      let iconURLArray = this.storage.getCardSetIcons()
      if (iconURLArray.length) {
        iconURLArray = false
      }

      return iconURLArray
    }


    selectCardSet(cardSetData, showStats) {
      this.showStats = showStats
      this.cardSetData = cardSetData
      // { name:    "Introductions"
      // , phrases: "data/introductions/phrases.text"
      // , audio:   "data/introductions/audio/"
      // , hash:    "#361358634"
      // , icon:    "data/introductions/icon.svg"
      // }
      
      let cardSet = this.storage.getCardSet(cardSetData.name)
      if (cardSet) {
        return this.display(cardSet)
      }

      let url = cardSetData.phrases
      new this.classes.ParseText(url, this.treatJSON.bind(this))
    }


    treatJSON(error, cardData) {
      if (error) {
        return console.log(`ERROR: ${{error}} at ${this.url}`)
      }

      this.convertToHTML(cardData)
      cardData.data = this.cardSetData
      this.storage.addCardSet(cardData)

      this.display(cardData)
    }


    convertToHTML(cardData) {
      let getHTML = (text) => {
        text = text.replace(" f ", "<sup>(formal)</sup> ")
        text = text.replace(" inf ", "<sup>(informal)</sup> ")

        let index = text.indexOf("|")
        if (index < 0) {
        } else {
          let precision = text.substring(index + 1).trim()
          text = text.substring(0, index).trim()
               + `<span class="precision">${precision}<span>`
        }

        return "<p>" + text + "</p>"
      }

      cardData.forEach(cardArray => {
        let keys = Object.keys(cardArray)
        keys.forEach(key => {
          if (key === "audio" || key === "index") {
            return
          }

          cardArray[key] = getHTML(cardArray[key])
        })
      })
    }


    display(cardData) {
      let showStats = this.showStats
      this.showStats = false

      if (showStats) {
        this.showStatPage(cardData)
      } else {
        this.showCards(cardData)
      }
    }


    showCards(cardData) {
      // Remove known cards, and create a new array, disconnected
      // from the array in this.storage.data
      this.cards = cardData.filter((card => !card.known))

      this.total = cardData.length
      this.card = 0

      this.audioButton.setFolder(this.cardSetData.audio)


      this.showItem("card", this.sections)
      this.showNext()
    }


    showStatPage(cardData) {
      this.stats.show(cardData)
      this.showItem("stats", this.sections)
    }


    // SECTIONS // SECTIONS // SECTIONS // SECTIONS // SECTIONS //

    getElements(selector) {
      let elements = {}
      let array = [].slice.call(document.querySelectorAll(selector))

      array.forEach(element => {
        elements[element.id] = element
      })

      return elements
    }


    hideSplash(selectorIsSet) {
      if (selectorIsSet) {
        if (this.timeOut) {
          return this.jsonDone = true
        }
      } else if (!this.jsonDone) {
        return this.timeOut = 0
      }

      this.showItem("selector", this.sections)
    }


    showItem(id, group) {
      let ids = Object.keys(group)
      ids.forEach(itemId => {
        let item = group[itemId]
        if (itemId === id) {
          item.classList.add("active")
        } else {
          item.classList.remove("active")
        }
      })
    }

    // ACTIONS // ACTIONS // ACTIONS // ACTIONS // ACTIONS // ACTIONS 

    treatAction(event) {
      event.preventDefault()

      if (this.complete) {
        return
      }

      let target = event.target
      while (target && target.tagName !== "A") {
        target = target.parentNode
      }

      if (!target) {
        return
      }

      let href = target.href
      let index = href.indexOf("#") + 1
      let hash = href.substring(index)

      switch (hash) {
        case "select":
          this.showItem("selector", this.sections)
        break
        case "turn_back":
          this.turnBack()
        break
        case "turn":
          this.turnCard()
        break
        case "hint":

        break
        case "audio":

        break
        case "learnt":
          this.showNext(true)
        break
        case "repeat":
          this.showNext()
        break
      }
    }


    turnCard() {
      this.frame.classList.add("response")
      this.buttons.classList.remove("stimulus")
      this.buttons.classList.add("response")
      this.playCue(!this.cueIsRussian)
    }


    turnBack() {
      this.frame.classList.remove("response")
      this.buttons.classList.remove("response")
      this.buttons.classList.add("stimulus")
      this.playCue(this.cueIsRussian)
    }


    showNext(dontRepeat) {
      if (this.card) {
        if (!dontRepeat) {
          this.repeat(this.card)
        } else {
          this.rememberCard(this.card)
        }
      }

      this.card = this.cards.shift()
      if (!this.card) {
        // All the cards have been learnt
        return this.finish()
      }

      this.showCue()

      this.turnBack()
    }


    rememberCard(card) {
      let setName = this.cardSetData.name
      let index = this.card.index
      // Mark the card as known in localStorage. There is no need to
      // mark it as known in this.cards, since it no longer appears 
      // there.

      this.storage.rememberCard(setName, index, true) 
      this.showProgress()
    }


    showProgress() {
      let done = this.total - this.cards.length
      let ratio = done / this.total * 100
      this.progress.style = `width:${ratio}%`
    }


    updateStats(action, index, state) {
      let setName = this.cardSetData.name

      console.log(setName, action, index, state)

      switch (action) {
        case "rememberCard":
          this.storage.rememberCard(setName, index, state)
      }
    }


    // CUE // CUE // CUE // CUE // CUE // CUE // CUE // CUE // CUE //

    showCue() {
      let stimulus
        , response 

      [stimulus, response] = this.cueIsRussian
                           ? [this.card.ru, this.card[this.cueCode]]
                           : [this.card[this.cueCode], this.card.ru]

      this.stimulus.innerHTML = stimulus
      this.response.innerHTML = response
    }


    playCue(isRussian) {
      if (isRussian) {
        this.audioButton.link(this.card.audio, "play")
      } else {
        this.audioButton.toggleEnabled(false)
      }
    }


    finish() {
      this.response.innerHTML = `
        <p>Congratulations!<br>
        You've learnt all the cards.</p>
      `
      this.complete = true
      document.body.classList.add("complete")
    }


    repeat(card) {
      let index = Math.random() * (this.cards.length - this.minCount)
      if (index < this.minCount) {
        this.cards.push(card)
      } else {
        this.cards.splice(index, 0, card)
      }
    }
  }



  jazyx.flash = new Flash(jazyx.classes, data)

})(window)