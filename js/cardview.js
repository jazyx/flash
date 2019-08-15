/** cardview.js **
 *
 * 
**/



;(function cardviewLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.CardView = class CardView {
    constructor(selector, audioButton) {
      this.audioButton = audioButton
      this.setupHTMLObjects(selector) 

      this.complete = false 
      
      /// <<< HARD-CODED
      this.minCount = 10
      this.cueCode  = "en"
      this.cueIsRussian = (this.cueCode === "ru")
      /// HARD-CODED >>>

      // this.section
      // this.buttons
      // this.frame
      // this.stimulus
      // this.response
      // this.progress
    }


    setupHTMLObjects(selector) {
      let section = this.section = document.querySelector(selector)

      let actions = [].slice.call(section.querySelectorAll(".action"))
      let listener = this.treatAction.bind(this)
      actions.forEach(actionLink => {
        actionLink.addEventListener("click", listener, false)
      })

      this.buttons  = document.querySelector(".buttons")

      this.frame    = document.querySelector("div.frame")
      this.stimulus = document.querySelector("div.front")
      this.response = document.querySelector("div.back")
      this.progress = document.querySelector("div.done")
    }

    
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


    adopt(cardSet, percent) {
      this.cardSet = cardSet
      this.audioButton.setFolder(cardSet.info.audio)

      this.complete = false
      document.body.classList.remove("complete")

      this.showProgress(percent)
      this.showNext()
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
      this.card = this.cardSet.getNext(dontRepeat)
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
      // mark it as known in this.cardSet, since it no longer appears 
      // there.

      this.storage.rememberCard(setName, index, true) 
      this.showProgress()
    }


    showProgress(percent) {
      this.progress.style = `width:${percent}%`
    }


    updateList(action, index, state) {
      console.log("updateList called. Not obsolete yet?")
      let setName = this.cardSetData.name
      this.cardSetData.known = this.percentKnown()

      console.log(this.cardSetData)

      switch (action) {
        case "rememberCard":
          this.storage.rememberCard(setName, index, state)
          this.selector.updatePercentage(this.cardSetData)
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
      this.response.innerHTML = 
      this.stimulus.innerHTML = `
        <p>Congratulations!<br>
        You've learnt all the cards in this set.</p>
      `
      this.complete = true
      document.body.classList.add("complete")
    }
  }


})(window)