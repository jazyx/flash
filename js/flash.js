/** flash.js **
 *
 *
**/



;(function flashLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }




  jazyx.classes.Flash = class Flash {
    constructor(audioButton, ParseText, url) {
      this.audioButton = audioButton
      this.ParseText = ParseText
      this.folder = folder
      this.fileName = "phrases.txt"

      this.initialize()
      // this.sections = {...}
      // this.text = div element
      // this.cards = [...]
      // this.card = 0
      // this.minCount = 10
      // this.cueCode = "en"
    }


    initialize() {
      let actions = [].slice.call(document.querySelectorAll(".action"))
      let listener = this.treatAction.bind(this)
      actions.forEach(actionLink => {
        actionLink.addEventListener("click", listener, false)
      })

      this.sections = this.getElements("section")
      this.buttons = document.querySelector(".buttons")

      this.frame = document.querySelector("div.frame")
      this.stimulus = document.querySelector("div.front")
      this.response = document.querySelector("div.back")
      this.progress = document.querySelector("div.done")  
      
      this.minCount = 10
      this.cueCode = "en"
      this.cueIsRussian = (this.cueCode === "ru")

      this.complete = false

      let url = this.folder + this.fileName
      new this.ParseText(url, this.treatJSON.bind(this))
    }


    treatJSON(error, cardData) {
      if (error) {
        return console.log(`ERROR: ${{error}} at ${this.url}`)
      }

      this.cards = cardData
      this.total = cardData.length
      this.card = 0

      this.hideSplash()
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


      hideSplash() {
        let delay = 1000

        setTimeout(this.showCard.bind(this), delay)
      }


      showCard() {
        this.showItem("card", this.sections)
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

  /// <<< HARD-CODED
  let folder = "data/introductions/"
  let player = new jazyx.classes.AudioPlayer(folder + "audio/")
  let button = new jazyx.classes.PlayButton("[href='#audio']")
  /// HARD-CODED >>>

  let audioButton = new jazyx.classes.AudioButton(player, button)
  let ParseText = jazyx.classes.ParseText

  jazyx.flash = new jazyx.classes.Flash(audioButton, ParseText, folder)


})(window)