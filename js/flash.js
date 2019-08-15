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
    // SERVER
    php:      "php/sets.php"
  , phrases:  "phrases.txt"
  , audio:    "audio/"
    // BROWSER
  , audioButton: "[href='#audio']"
  , card:        "#card"
  , list:        "#list"
  , selector:    "#selector"
  , delay:       1000
  }
  /// HARD-CODED >>>




  class Flash {
    constructor(classes, data) {
      this.classes = classes
      // User
      // Storage
      // Ajax
      // GetJSON
      // Navigation
      // Select
      // ListView
      // CardView
      // AudioPlayer
      // PlayButton
      // AudioButton
      // (Flash)

      this.data = data
      // { php:      "php/sets.php"
      // , phrases:  "phrases.txt"
      // , audio:    "audio/"
      // 
      // , audioButton: "[href='#audio']"
      // , list:        "#list"
      // , card:        "#card"
      // , selector:    "#selector"
      // , delay:       1000
      // }

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
      let data = this.data

      // TODO: Deal with registered users
      this.storage = new this.classes.Storage()
      this.users = new this.classes.Users(this.storage)
      this.user = this.users.getCurrentUser()
      this.navigation = new this.classes.Navigation()

      let player = new this.classes.AudioPlayer()
      let button = new this.classes.PlayButton(data.audioButton)
      let audioButton = new this.classes.AudioButton(player, button)
      this.cardView = new this.classes.CardView(data.card, audioButton)

      this.getCardSetJSON()
      this.jsonDone = false
      this.timeOut = setTimeout(this.hideSplash.bind(this),data.delay)

      let callback = this.updateList.bind(this)
      this.listView = new this.classes.ListView(data.list, callback)
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

      let callback = this.callbackFromSelector.bind(this)
      this.selector = new this.classes.Select(
        this.data
      , cardSetData
      , callback
      )

      this.jsonDone = true
      this.hideSplash(true)
    }


    hideSplash(selectorIsSet) {
      if (selectorIsSet) {
        if (this.timeOut) {
          return this.jsonDone = true
        }
      } else if (!this.jsonDone) {
        return this.timeOut = 0
      }

      this.navigation.showSection("selector")
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


    callbackFromCardset() {
      let data = [...arguments]
      let action = data.shift()

      if (typeof this[action] === "function") {
        this[action].apply(this, data)
      }
    }


    /**
     * Called by a click on a cardset list item at the Selector screen
     *
     * @param  {object}  cardSetData  { name:    "Set"
     *                                , phrases: "data/set/phrases.txt"
     *                                , audio:   "data/set/audio/"
     *                                , hash:    <number>
     *                                , icon:    "data/set/icon.svg"
     *                                }
     * @param  {string}  action       < "showList"
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
      this.cardView.adopt(cardSet, percent)
      this.navigation.showSection("card")
    }


    showList(cardData) {
      this.listView.show(cardData)
      this.navigation.showSection("list")
    }


    showProgress(percent) {
      this.cardView.showProgress(percent)
    }


    updateList(action, index, state) {
      alert("updateList called. Not obsolete yet?")

      let setName = this.cardSetData.name
      this.cardSetData.known = this.percentKnown()

      console.log(this.cardSetData)

      switch (action) {
        case "rememberCard":
          this.storage.rememberCard(setName, index, state)
          this.selector.updatePercentage(this.cardSetData)
      }
    }
  }



  jazyx.flash = new Flash(jazyx.classes, data)

})(window)