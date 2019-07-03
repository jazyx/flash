/** audio.js **
 *
 * This script contains 3 classes:
 * * AudioPlayer creates an Audio element on the fly, and uses it to
 *   play the files that it is linked to
 * * PlayButton 
**/



;(function audioLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }

  ///// AUDIOPLAYER // AUDIOPLAYER // AUDIOPLAYER // AUDIOPLAYER /////

  jazyx.classes.AudioPlayer = class AudioPlayer {
    constructor (folder) {
      this.folder = folder 
      
      let audio = this.audio = new Audio()
      audio.onerror          = this.audioError.bind(this)
      audio.oncanplaythrough = this.audioReady.bind(this)
      audio.onended          = this.audioEnded.bind(this)

      this.playing = false //// HOW IS THIS USED? ////

      this.callback = null
    }


    setCallback(callback) {
      if (typeof callback !== "function") {
        // Any non-functions will destroy the current callback
        callback = null
      }

      this.callback = callback
    }


    link(filename, play) {
      this.audio.src = this.folder + filename

      if (play) {
        this.play()
      }
    }


    async play() {
      try {
        await this.audio.play()
        this.playing = true
        this.report("playing")
        
      } catch(error) {
        this.playing = false
        this.report("error")
      }
    }


    audioError(event) {
      this.report("error")
    }


    audioReady(event) {
      this.report("loaded")
    }


    audioEnded(event) {
      this.playing = false
      this.report("ended")
    }


    report(message) {
      if (this.callback) {
        this.callback(message)
      }
    }
  }


  ///// BUTTON // BUTTON // BUTTON // BUTTON // BUTTON // BUTTON ////
 

  /**
   * A PlayButton instance modifies the classList of the HTML
   * element identified by `selector`. The appearance of the button
   * should be set using CSS.
   */

  jazyx.classes.PlayButton = class PlayButton {
    constructor(selector) {
      if (this.button = document.querySelector(selector)) {
        this.initialize(this.button)
      }

      this.states = ["up", "hover", "down", "disabled"]
      this.state = 0 // none of the above, to begin with
      // this.hover = false
      this.active = 0

      this.callback = null
    }


    initialize(button) {
      button.onclick = this.click.bind(this)

      // button.onmouseover = onmouseout = this.hover.bind(this)
    }


    setCallback(callback) {
      if (typeof callback !== "function") {
        // Any non-functions will destroy the current callback
        callback = null
      }

      this.callback = callback
    }


    click(event) {
      if (!this.active) { return }

      if (this.callback) {
        this.callback(this.state)
      }
    }


    // /**
    //  * this.hover will update even when the button is disabled, but
    //  * the button's classList will only be changed if it is
    //  *
    //  * @param      {<type>}  event   The event
    //  * @return     {<type>}  { description_of_the_return_value }
    //  */
    // hover(event) {
    //   if (!this.button) { return }

    //   let hover = event ? (event.type === "mouseover") : this.hover

    //   if (this.hover === hover) { return }

    //   this.hover = hover

    //   if (!this.active) { return }

    //   if (hover) {
    //     this.button.classList.add("hover")
    //   } else {
    //     this.button.classList.remove("hover")
    //   }
    // }


    toggleEnabled(isEnabled) {
      if (!this.button) { return }

      isEnabled = !!isEnabled

      if (this.active === isEnabled) { return }

      this.active = isEnabled

      if (isEnabled) {
        this.showState() // will use current this.state
      } else {
        this.showState("disabled")
      }
    }


    showState(state) {
      if (!this.button) { return }
      if (this.state === state) { return }

      if (!state) {
        state = this.state
      }

      if (this.states.indexOf(state) < 0) { return }

      this.state = state
      this.button.classList.remove("up", "down", "disabled")
      this.button.classList.add(state)
    }
  }


  ///// AUDIOBUTTON // AUDIOBUTTON // AUDIOBUTTON // AUDIOBUTTON /////
 

  jazyx.classes.AudioButton = class AudioButton {
    constructor(player, button) {
      this.player = player
      this.button = button
      this.initialize()
    }


    initialize() {
      this.player.setCallback(this.playerCallback.bind(this))
      this.button.setCallback(this.buttonClicked.bind(this))
    }


    link(fileName, play) {
      this.player.link(fileName, !!play)
    }


    toggleEnabled(isEnabled) {
      this.button.toggleEnabled(isEnabled)
    }


    play() {
      this.player.play()
      // playerCallback will set button state
    }


    buttonClicked() {
      this.play()
    }


    playerCallback(action) {
      switch (action) {
        case "loaded":
          this.button.toggleEnabled(true)
        break
        case "error":
          this.button.toggleEnabled(false)
        break
        case "playing":
          this.button.showState("down")
        break
        case "ended":
          this.button.showState("up")
        break
      }
    }
  }

})(window)