/** users.js **
 *
 * Users will be stored in localStorage in the __users__ object, and
 * on the server, for registered users.
 * 
 * localStorage.data.__users__ = {
 *   mode: <"#AutoloadDefault", then : priority user loaded by default |
 *          "#SortByRecency#":  choose from time-sensitive list |
 *          "#Alphabetical#":   choose from alphabetical list
 * , default: <user name>
 * , users: [
 *     { name:       <string>
 *     , pass:       <string | undefined>
 *     , customSets: [ <set name>, ... ]
 *     , timestamp:  <integer> 
 *     , statistics: {
 *         <set name>: {
 *           timestamp: <integer>
 *         , <card id>: {
 *             known:   <boolean>
 *           , repeats: <integer>
 *           }
 *         , ... more cards
 *         }
 *       , ... more sets
 *       }
 *     }
 *   ]
 * }
 * 
 * If __users__.mode is not defined, then an arbitrary userName will
 * be created, and "#AutoloadDefault" mode will be adopted for that
 * user. 
 * 
 * If __users__.mode is not "#AutoloadDefault", then a user login/
 * registration page will be shown, with the options of:
 * - Logging in as a registered user
 * - Playing anonymously (data will not be saved)
 * - Changing the login mode
 * 
 * The login/registration page will also be accessible through the
 * menu.
 * 
**/



;(function usersLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  class User {
    constructor(userData, selector, save) {
      this.selector = selector 
      this.save  = save
      this.data = userData
      // { name:       <string>
      // , pass:       <string | undefined>
      // , customSets: [ <set name>, ... ]
      // , timestamp:  <integer> 
      // , statistics: {
      //     <set name>: {
      //       timestamp: <integer>
      //     , ratios: {
      //         raw: <float>
      //       , percent: "<float>%"
      //       , rounded: "<integer>%"
      //       }
      //     , <card id>: {
      //         known:   <boolean>
      //       , repeats: <integer>
      //       }
      //     , ... more cards
      //     }
      //   , ... more sets
      //   }
      // }
      
      this.statistics = userData.statistics
    }


    /**
     * Called by CardSet.rememberCard()
     *
     * @param  {integer}  cardSetHash  The card set hash
     * @param  {string}   voPhrase     The vo phrase
     * @param  {boolean}  state        true if card is now known
     */
    setKnownState(cardSetHash, voPhrase, state) {
      let cardSetStats = this.statistics[cardSetHash]
      let ratios = cardSetStats.ratios
      let phraseData = cardSetStats[voPhrase]

      if (!phraseData) {
        phraseData = { repeats: 0, recent: [] }
        cardSetStats[voPhrase] = phraseData
      }

      phraseData.known = state

      this.setRatios(cardSetHash, ratios, (state ? 1 : -1)) // ±1

      this.save()

      return ratios.raw
    }


    getPercentKnown(cardSetHash) {
      let cardSetStats = this.statistics[cardSetHash]

      if (cardSetStats) {
        let ratios = cardSetStats.ratios

        this.selector.updatePercent(cardSetHash, ratios)

        return ratios.raw
      }
    }


    getKnownState(cardSetHash, voPhrase) {
      let cardSetStats = this.statistics[cardSetHash]
      let phraseData = cardSetStats[voPhrase]
      let known = phraseData.known

      return known
    }


    setRatios(cardSetHash, ratios, deltaKnown) {
      ratios.known  += deltaKnown
      let raw        = ratios.raw = ratios.known * 100 / ratios.total
      ratios.percent = raw + "%"
      ratios.rounded = Math.floor(raw) + "%"

      this.selector.updatePercent(cardSetHash, ratios)
    }


    // getRatios(cardSetHash) {
    //   let cardSetStats = this.statistics[cardSetHash]
    //   let ratios = {}
    //   let total = 1
    
    //   let known = 0

    //   if (!cardSetStats) {
    //     // This set has not been loaded yet. It has not been started.

    //   } else {
    //     let keys = Object.keys(cardSetStats)
    //     let total = keys.length ? keys.length : 1
    //     let phraseData

    //     keys.forEach(phrase => {
    //       phraseData = cardSetStats[phrase]
    //       // { known: <boolean>
    //       // , repeats: <integer>
    //       // , recent: [ ... ]
    //       // }
          
    //       known += !!phraseData.known
    //     })
    //   }

    //   known = known * 100 / total // now its %

    //   ratios.raw     = known
    //   ratios.percent = known + "%"
    //   ratios.rounded = Math.round(known) + "%"

    //   // this.save()

    //   return ratios
    // }


    /**
     * Called by CardSet.raiseTheCurtain()
     *
     * @param {integer} cardSetHash 
     * @param {<type>}  cardSetArray [{ ru:    "<p>некоторый текст</p>"
     *                                , en:    "<p>some text</p>"
     *                                , audio: "XX.mp3"                                 , audio: "XX.mp3"
     *                                , index: <integer>
     *                                }
     *                               , ...
     *                               ]  
     * @param  {<type>}  voCode      "ru" or other language code
     */
    syncStatistics(cardSetHash, cardSetArray, voCode) {
      let total = cardSetArray.length
      let known = 0
      let cardSetStats = this.statistics[cardSetHash]
      let ratios = {}
      let raw

      if (!cardSetStats) {
        cardSetStats = {}
        this.statistics[cardSetHash] = cardSetStats
      }

      cardSetArray.forEach(cardInfo => {
        let phrase = cardInfo[voCode]
        let phraseData = cardSetStats[phrase]

        if (phraseData) {
          known += phraseData.known

        } else {
          // This card hasn't been seen yet
          phraseData = { known: 0, repeats: 0, recent: [] }
          cardSetStats[phrase] = phraseData
        } 
      })

      ratios.known = known
      ratios.total = total
      this.setRatios(cardSetHash, ratios, 0)
      
      cardSetStats.ratios = ratios

      this.save()
    }
  }



  jazyx.classes.Users = class Users {
    constructor(storage, selector) {
      this.usersInfo = storage.getUsersInfo()
      this.save      = storage.save.bind(storage)
      this.selector  = selector

      // Get pointers to the various parts of usersInfo
      this.mode    = this.usersInfo.mode    // may be undefined
      this.default = this.usersInfo.default // may be undefined
      this.users   = this.usersInfo.users   // { "username": { ... }}

      // this.usersArray = [ ... ]
      // this.user

      this.setUser()
    }


    setUser() {
      let sortFunction

      switch (this.mode) {
        default: // "#AutoloadDefault" | first launch
          return this.loadUser(this.default)

        case "#SortByRecency#":
          sortFunction = (user1, user2) => {
            return user1.timestamp - user2.timestamp
          }
        break
        case "#Alphabetical#":
          sortFunction = (user1, user2) => {
            return user1.name - user2.name
          }
      }

      this.usersArray = Object.keys(this.users)
      this.usersArray.sort(sortFunction)

      // TODO: Show user selection / registration screen, which
      // will call back to loadUser()
      
    }


    loadUser(userName, anonymous) {
      if (!userName) {
        // No users have been defined yet. Create one with a random
        // name, and load it by default
        userName = this.randomName()
        this.addUser(userName, undefined, "default")
      }

      this.user = new User(
        this.users[userName]
      , this.selector
      , this.save
      )

      if (!anonymous) {
        this.updateUser()
      }
    }


    /**
     * Adds an user.
     *
     * @param   {<type>}   userName   String, assumed to be unique
     * @param   {<type>}   password   undefined or a plain text string
     * @param   {boolean}  isDefault  true or falsy
     */
    addUser(userName, password, isDefault) {
      let user = {
        pass: password
      , customSets: []
      , timestamp: + new Date()
      , statistics: {}
      , name: userName
      }

      this.users[userName] = user
      if (isDefault) {
        this.default = this.usersInfo.default = userName
        this.setMode("#AutoloadDefault")
      }

      this.save()
    }


    updateUser() {
      this.user.timestamp = + new Date()
      this.save()
    }


    setMode(mode) { // UNTESTED
      this.mode = this.usersInfo.mode = mode
      this.save()
    }


    getCurrentUser() {
      return this.user
    }


    randomName() {
      let consonant = "bcdfgklmnprstvy"
      let vowel = "aeiou"
      let getRandom = string => {
        return string[Math.floor(Math.random() * string.length)]
      }

      let name = getRandom(vowel).toUpperCase()

      for ( let ii = 0; ii < 2; ii += 1 ) {
        name += getRandom(consonant)
        name += getRandom(vowel)
      }

      name += " " + getRandom(consonant).toUpperCase()

      for ( let ii = 0; ii < 2; ii += 1 ) {
        name += getRandom(vowel)
        name += getRandom(consonant)
      }

      name += ("" + Math.abs(name.hashCode())).substring(0,3)

      return name
    }
  }

})(window)