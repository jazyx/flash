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
  }
  /// HARD-CODED >>>



  class Flash {
    constructor(classes, data) {
      this.classes = classes
      // User
      // Storage
      // Ajax
      // GetJSON
      // Select
      // AudioPlayer
      // PlayButton
      // AudioButton
      // (Flash)

      this.data = data
      // { php:      "php/sets.php"
      // , phrases:  "phrases.txt"
      // , audio:    "audio/"
      // , audioButton: "[href='#audio']"
      // , stats:    "#stats" }

      this.initialize()
      // creates the properties:
      // 
      // this.sections = {...}
      // this.text = div element
      // this.cardSet = CardSet object
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
      this.storage = new this.classes.Storage()
      this.users = new this.classes.Users(this.storage)
      this.user = this.users.getCurrentUser()

      // console.log(this.user)

      let player = new this.classes.AudioPlayer()
      let button = new this.classes.PlayButton(this.data.audioButton)
      this.audioButton = new this.classes.AudioButton(player, button)

      this.getCardSetJSON()
      this.jsonDone = false
      this.timeOut = setTimeout(this.hideSplash.bind(this), delay)

      let callback = this.updateStats.bind(this)
      this.stats = new this.classes.ListView("#stats", callback)
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
      let parameters = ""

      parameters += "&user=" + encodeURIComponent(this.user.name)
      parameters = "?" + parameters.substring(1)

      let url = this.data.php + parameters
      new this.classes.GetJSON(url, callback)
    }


    /**
     * Gets the card set icons.
     *
     * @param   {<type>}  error    null | string "JSON.parse — ..."
     * @param   {<type>}  dataMap  undefined (if error) | {
     *                               user: { name: <string> }
     *                             , sets: [ {
       *                                 url:        <string>
       *                               , timestamp:  <integer>
       *                               , customKeys: []
       *                               , svgString:  <string | missing>
     *                               }
     *                               , ...
     *                               ]
     *                             }
     *                               , ...
     *                               ]
     *                             }
     * @return  {<type>}  The card set icons.
     */
    getCardSetIcons(error, dataMap) {
      let cardSetData
      let username

      if (error) {
        // We might be offline. Use stored cardsets as fallback.
        // console.log("local")
        username = this.user.name
        cardSetData = this.getCardSetsFromLocalStorage(username)

        if (!cardSetData) {
          return console.log(
            `Ajax call to ${this.data.php} returned error\n${error}`
          )
        }

      } else {
        // console.log("remote")
        username = dataMap.user.name
        cardSetData = this.createCardSets(dataMap.sets, username)
      }

      // console.log(cardSetData)
      // console.log("***")

      cardSetData.sort((cardSet1, cardSet2) => {
        return (cardSet1.icon > cardSet2.icon) * 2 - 1
      })

      let section = this.sections.selector
      let callback = this.callbackFromSelector.bind(this)
      this.selector = new this.classes.Select(
        section
      , this.data
      , cardSetData
      , callback
      )

      this.jsonDone = true
      this.hideSplash(true)
    }


    getCardSetsFromLocalStorage(username) {
      let localCardSetsArray = this.storage.getCardSets(username)
      let cardSetInfo

      if (!localCardSetsArray.length) {
        return false
      }

      localCardSetsArray.forEach((cardSetInfo, index) => {
        localCardSetsArray[index] = this.createCardSet(cardSetInfo)
      })

      return localCardSetsArray
    }


    /**
     * Called by getCardSetsFromLocalStorage
     *
     * @param  {<type>}  cardSets  The card sets
     */
    createCardSet(cardSetInfo) {
      let CardSet = this.classes.CardSet
      let options = {
        zero:     0
      // , Ajax:     this.classes.Ajax
      , storage:   this.storage
      , callback:  this.callbackFromCardset.bind(this)
      , info:      cardSetInfo
      , user:      this.user
      // , data:     data
      /// <<< HARD-CODED
      , vo:        "ru"
      , default:   "en"
      /// HARD-CODED >>>
      }

      return new CardSet(options)
    }


    /**
     * Called by getCardSetIcons
     *
     * @param  {<type>}  cardSets  The card sets
     */
    createCardSets(cardSetsArray, userName) {
      let CardSet = this.classes.CardSet
      let options = {
        Ajax:     this.classes.Ajax
      , storage:  this.storage
      , callback: this.callbackFromCardset.bind(this)
      , data:     data
      , user:     this.user
      /// <<< HARD-CODED
      , vo:       "ru"
      , default:  "en"
      /// HARD-CODED >>>
      //, info: TO BE SET IN forEach LOOP
      }

      cardSetsArray.forEach((cardSetInfo, index) => {
        options.info = cardSetInfo
        cardSetsArray[index] = new CardSet(options)
      })

      return cardSetsArray
    }


    callbackFromCardset(action) {
      let data = [...arguments]
      data.shift() // removes the `action` argument

      if (typeof this[action] === "function") {
        this[action].apply(this, data)
      }
    }


    /**
     * { function_description }
     *
     * @param  {object}  cardSetData  { name:    "Set"
     *                                , phrases: "data/set/phrases.txt"
     *                                , audio:   "data/set/audio/"
     *                                , hash:    <number>
     *                                , icon:    "data/set/icon.svg"
     *                                }
     * @param  {string}  action       < "showStats"
     *                                | "showCards"
     *                                | "percentKnown"
     *                                >
     * @return {number | undefined}   If action is "percentKnown"
     *                                returns a number 0.0 - 100.0
     */
    callbackFromSelector(action, cardSet) {
      this.showList = (action === "showList")

      this.cardSet = cardSet

      switch (action) {
        case "showCards":
          let callback = this.showCards.bind(this)
          cardSet.lightsUp(callback)
        break

        case "showList":

      }
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


    display(cardData) {
      let showList = this.showList
      this.showList = false

      if (showList) {
        this.showList(cardData)
      } else {
        this.showCards(cardData)
      }
    }


    showCards(cardSet, percent) {
      this.cardSet = cardSet
      this.audioButton.setFolder(cardSet.info.audio)
      this.showItem("card", this.sections)
      this.showProgress(percent)
      this.showNext()
    }


    showList(cardData) {
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
      switch (id) {
        case "selector":
          this.selector.refresh()
        break
      }

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


    updateStats(action, index, state) {
      console.log("updateStats called. Not obsolete yet?")
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
      this.response.innerHTML = `
        <p>Congratulations!<br>
        You've learnt all the cards.</p>
      `
      this.complete = true
      document.body.classList.add("complete")
    }
  }



  jazyx.flash = new Flash(jazyx.classes, data)

})(window)