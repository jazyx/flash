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
  , selector: "[href='#audio']"
  }
  /// HARD-CODED >>>



  class Flash {
    constructor(classes, data) {
      this.classes = classes
      // ParseText   *
      // GetJSON     *
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

      let player = new this.classes.AudioPlayer()
      let button = new this.classes.PlayButton()
      this.audioButton = new this.classes.AudioButton(player, button)

      this.getCardSetJSON()

      this.jsonDone = false
      this.timeOut = setTimeout(this.hideSplash.bind(this), delay)
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
        return console.log(
          `Ajax call to ${this.data.php} returned error\n${error}`
        )
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


    selectCardSet(cardSetData) {
      this.cardSetData = cardSetData
      // { name:    "Introductions"
      // , phrases: "data/introductions/phrases.text"
      // , audio:   "data/introductions/audio/"
      // , hash:    "#361358634"
      // , icon:    "data/introductions/icon.svg"
      // }
      
      let url = cardSetData.phrases
      new this.classes.ParseText(url, this.treatJSON.bind(this))
    }


    treatJSON(error, cardData) {
      if (error) {
        return console.log(`ERROR: ${{error}} at ${this.url}`)
      }

      this.cards = cardData
      this.total = cardData.length
      this.card = 0

      this.audioButton.setFolder(this.cardSetData.audio)

      this.showItem("card", this.sections)
      this.showNext()
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
          this.showProgress()
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


    showProgress() {
      let done = this.total - this.cards.length
      let ratio = done / this.total * 100
      this.progress.style = `width:${ratio}%`
    }

    // CUE // CUE // CUE // CUE // CUE // CUE // CUE // CUE // CUE //

    showCue() {
      let getHTML = (text => {
        text = text.replace(" f ", "<sup>(formal)</sup> ")
        text = text.replace(" inf ", "<sup>(informal)</sup> ")

        let index = text.indexOf("|")
        if (index < 0) {
        } else {
          text = text.substring(0, index)
               + "<span>" + text.substring(index + 1) + "<span>"
        }

        return "<p>" + text + "</p>"
      })

      let stimulus
        , response 

      [stimulus, response] = this.cueIsRussian
                           ? [this.card.ru, this.card[this.cueCode]]
                           : [this.card[this.cueCode], this.card.ru]

      this.stimulus.innerHTML = getHTML(stimulus)
      this.response.innerHTML = getHTML(response)
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