/** cardSet.js **
 *
 * A card set is an array of cards, with the following format:
 * [ { audio: "XX.mp3"
 *   , en: "<p>some text</p>"
 *   , index: <integer>
 *   , known: <boolean>
 *   , repeats: <integer>
 *   , ru: "<p>некоторый текст</p>"
 *   }
 * , {...}
 * ...
 * ]
 * 
 * The cardSet data is downloaded from the server as a text file with
 * the format:
 * 
 * 01  некоторый текст
 * en  some text
 * 
 * 02  еще немного текста
 * en  some more text
 * ...
 * 
 * The numbers correspond to the names of the associated audio files.
 * They do not have to be in order or consecutive, but they should be
 * unique, since they will refer to different audio files.
**/



;(function cardSetLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.CardSet = class CardSet {
    constructor(options) {
      // { info:    { url:        <string icon url>
      //            , timestamp:  <timestamp>
      //            , svgString:  <icon SVG>
      //            , customKeys: []
      //            }
      //   OR
      //   info:    { name:       <string>
      //            , hash:       <integer>
      //            , timestamp:  <integer>
      //            , icon:       <url string>
      //            , svg:        <svg string | 0>
      //            , customKeys: []
      //            , audio:      <relative url to audio folder>
      //            , phrases:    <relative url to phrases.txt>
      //            , cards:      [
      //                { ru:       "<p>некоторый текст</p>"
      //                , en:       "<p>some text</p>"
      //                , audio:    "XX.mp3"
      //                , index:   <integer>
      //                }
      //              , ...
      //              ]
      //            }
      // 
      // , vo:        "ru"
      // , default:   "en"
      // , data:       { ...
      //               , phrases:  "phrases.txt"
      //               , audio:    "audio/"
      //               , ...
      //               }
      // , user:      <User instance>
      // , storage:   <Storage instance>
      // , Ajax :     <pointer to Ajax class>
      // , callback:  <function in Flash instance>
      // }

      /// <<< HARD-CODED
      this.vo = options.vo || "ru"
      this.default = options.default || "en"
      this.languageCodes = [ this.default, this.vo, "fr" ]
      /// HARD-CODED >>>

      this.callback = options.callback
      this.storage  = options.storage
      this.Ajax     = options.Ajax
      this.user     = options.user

      if (options.info.cards) {
        // There may be no Internet access, or PHP may have failed.
        // We'll have to use the most recent phrase lists, which may
        // be out of kilter with the audio file names. If the server
        // is not accessible, the audio will not play.

        this.info = options.info

      } else {
        // The server has provided information about available card
        // sets, including this one. If we previously downloaded the
        // phrases.txt for this card set, perhaps we need to update
        // it. The value of info[1] (the timestamp) will tell us.
        // If the phrases haven't been downloaded yet, they will be
        // now.
        
        this.syncWithServer(options.info, options.data)
      }

      this.cardArray = this.info.cards
      // May be repopulated in treatPhrases
      // this.total = this.cardArray.length

      this.setCardsToPractise()
      // this.cardsToPractise
      // this.counter : last card that has not yet been shown

      /// <<< HARD-CODED
      this.minIndex = 10
      /// HARD-CODED >>>

      // this.card
      // this.lightsUpCallback
    }


    syncWithServer(info, data) {
      let setInfo = this.info = this.unpackServerInfo(info, data)

      let timeStamp = this.storage.getTimeStamp(setInfo.hash)
      if (timeStamp) {
        if (timeStamp !== setInfo.timestamp) {
          // phrases.txt has already been downloaded, but it's changed
          this.getPhrases()
        } else {
          this.getPhrasesFromLocalStorage()
        }
      }
    }


    unpackServerInfo(info, data) {
      let iconURL    = info.url
      let timestamp  = info.timestamp
      let svgString  = info.svgString  || 0  // may be undefined
      let customKeys = info.customKeys || "" // may be undefined

      // TODO: Save svgString so we can show the icon offline

      let path = iconURL.split("/")
      path.pop() // split off icon filename
      let folder = path.join("/") + "/"
      let name = path.pop()

      // Replace _s with spaces, a terminal Q with ?, and Capitalize
      name = name.replace(/^\d+-/, "").replace(/Q$/, "?").replace(/_/g, " ")
      name = name[0].toUpperCase() + name.substring(1)

      let hash = iconURL.hashCode() // e.g. "-566766435"

      info = {
        name:       name
      , hash:       hash
      , timestamp:  timestamp
      , icon:       iconURL
      , svg:        svgString
      , customKeys: customKeys
      , audio:      folder + data.audio
      , phrases:    folder + data.phrases
      , cards:      []
      }

      return info
    }


    getPhrases() {
      let url = this.info.phrases
      let callback = this.treatPhrases.bind(this)
      new this.Ajax(url, callback)
    }


    treatPhrases(error, result) {    
      if (error) {
        return console.log(error)
      }

      let phraseArray = this.convertToPhraseArray(result)

      this.mergeWithExistingCardArray(phraseArray)

      this.info.cards = this.cardArray

      this.storage.includeCardSet(this.info)

      if (this.lightsUpCallback) {
        this.raiseTheCurtain(this.lightsUpCallback)
        this.lightsUpCallback = null
      }
    }


    /**
     * convertToPhraseArray takes a string with elements on separate
     * lines and converts it to an array of objects.
     *
     * @param  {string}  rawText is expected to be a string with a
     *                   format like:
     *                      
     *                   01
     *                   ru  Как вас зовут?
     *                   en  What is your f name?
     *                   fr  Quel est votre nom?
     *                   
     *                   02  Меня зовут...
     *                   en  My name is...
     *                   fr  Je m'appelle...
     *                   
     *                   03  Извините
     *                       Excuse f me
     *                   04  Как тебя зовут?
     *                   What is your inf name?
     *                   
     *                   05
     *                   У меня есть...
     *                   I have...
     *                   fr  J'ai
     *                   
     *                 > Each number starts a new entry. A string on
     *                 > line as a number is given the vo code by
     *                 > default. Any line with a string, but without
     *                 > a recognized code will be treated as the
     *                 > default translation, unless the string for
     *                 > the target language has not been defined yet,
     *                 > in which case, we'll assume that the target
     *                 > language was written first
     *                 >
     *                 > Entries which have an audio file number but
     *                 > not both a vo string and a default
     *                 > translation will be ignored.
     *                 
     * @return  {array}  Output is an array with the format:
     *          [ { audio: "01.mp3"
     *            , en: "<p>What is your <sup>formal</sup> name?</p>"
     *            , fr: "<p>Quel est votre nom?</p>"
     *            , index: 0
     *            , ru: "<p>Как вас зовут?</p>"
     *            }
     *          , ... 
     *          ]            
     */ 
    convertToPhraseArray(rawText) {
      // Prepare a regex to detect either the file name|number or the
      // language code
      let chunkRegex = this.languageCodes.reduce((regex, code) => {
        return regex += `|^\\s*${code}`
      }, "\n*(\\d+") + ")\\s+"
      chunkRegex = new RegExp(chunkRegex)

      // console.log(chunkRegex)

      // Regex to break rawText up at numbered file names
      let phraseRegex = /(?:^|\n+)\s*(?=\d+\s+)/

      // Regex to break card data into languages
      let dataRegex = /\n+/
      let filter = item => item.trim() !== ""

      let cardArray = rawText.split(phraseRegex)
                             .filter(filter)
      let getHTML = (text) => {
        text = text.trim()
                   .replace(" f ", "<sup>(formal)</sup> ")
                   .replace(" inf ", "<sup>(informal)</sup> ")

        let index = text.indexOf("|")
        if (index < 0) {
        } else {
          let precision = text.substring(index + 1).trim()
          text = text.substring(0, index).trim()
               + `<span class="precision">${precision}<span>`
        }

        return "<p>" + text + "</p>"
      }

      let treatCard = (cardString, index) => {
        let cardData = { index: index }
        let languageChunks = cardString.split(dataRegex)
                                       .filter(filter)
        let addBits = chunk => {
          let bits = chunk.split(chunkRegex)
                          .filter(filter)
          // ["01"]
          // ["Как вас зовут?"]
          // ["What is your f name?"]
          // 
          // ["03", "Извините"]
          // ["en", "Excuse f me"]
          // ["fr", "Pardonnez-moi !"]

          let firstBit = bits[0].trim()

          if (bits.length > 1) {
            // ["XX", "text"]
            if (!isNaN(firstBit)) {
              // "XX" is a number = audio file; "text" is in Russian
              cardData.audio = firstBit + ".mp3"
              cardData[this.vo] = getHTML(bits[1])

            } else {
              // "XX" is a language code
              cardData[firstBit] = getHTML(bits[1])
            }

          } else {
            if (!isNaN(firstBit)) {
              // The audio file number is on its own line
              cardData.audio = firstBit + ".mp3"

            } else if (!cardData[this.vo]) {
              // The first unidentified string on a separate line
              // after the audio file number will be in the target
              // language
              cardData[this.vo] = getHTML(firstBit)
            } else {
              // The target language is already defined, so we'll 
              // assume this is the interface language
              cardData[this.default] = getHTML(firstBit)
            }
          }

          cardArray[index] = cardData
        }

        languageChunks.forEach(addBits)
      }

      cardArray.forEach(treatCard)  

      cardArray = cardArray.filter(cardData => 
        !!(cardData[this.vo] && cardData[this.default])
      )
      return cardArray
    }


    /**
     * Replaces the current contents of this.cardArray with the
     * phrases from phraseArray, repspecting the order in phraseArray
     * Any Russian phrases that were in the original cardArray but
     * which are not found in phraseArray will be dropped.
     *      *
     * @param   {array}   phraseArray  Output of convertToPhraseArray
     */
    mergeWithExistingCardArray(phraseArray) {
      this.cardArray.length = 0
      // this.total = 
      this.cardArray.length = phraseArray.length
      
      phraseArray.forEach((phraseData, index) => {
        this.cardArray[index] = phraseData
      })

      this.user.syncStatistics(
        this.info.hash
      , this.cardArray
      , this.vo
      )

      this.setCardsToPractise()
    }


    getPhrasesFromLocalStorage() {
      let cardArray = this.storage.getCardArray(this.info.hash)
      this.info.cards = cardArray
    }


    /**
     * Creates an array of cards that the user has not marked as 
     * known.
     * 
     * TODO: Shuffle the cards if they have just been downloaded, and
     *       the phrases.txt file indicates that they can be shuffled
     * TODO: Show cards with few repeats first, then those with more
     *       repeats, interspersed with a few new cards.
     *
     * @return  {array}  A (carefully ordered) array of card objects
     */
    setCardsToPractise() {
      this.cardsToPractise = this.cardArray.filter(card => {
        let phrase = card[this.vo]
        let known  = this.user.getKnownState(this.info.hash, phrase)
        return !known
      })

      this.counter = this.cardsToPractise.length
    }


    /**
     * { function_description }
     *
     * @param      {Function}  callback  The callback
     */
    lightsUp(callback) {
      if (this.cardArray.length) {
        this.raiseTheCurtain(callback)

      } else {
        this.lightsUpCallback = callback
        this.getPhrases()
      }
    }
    

    raiseTheCurtain(callback) {
      let percent = this.user.getPercentKnown(this.info.hash)
      callback(this, percent)
    }


    getRatios() {
      return this.user.getRatios(this.info.hash)
    }


    getNext(dontRepeat) {
      if (this.card) {
        if (!dontRepeat) {
          this.repeat(this.card)
        } else {
          this.rememberCard(this.card)
        }
      }

      this.card = this.cardsToPractise.shift()
      this.counter-- // if it is < 0, then cards are being repeated

      return this.card
    }


    repeat(card) {
      let length   = this.cardsToPractise.length
      let minIndex = Math.floor(length / 2)
      minIndex     = Math.max( this.counter--
                             , Math.min(this.minIndex, minIndex))

      let index = Math.floor(Math.random() * (length - minIndex))
                + minIndex

      this.cardsToPractise.splice(index, 0, card)
    }


    rememberCard(card) {
      let hash = this.info.hash
      let voPhrase = this.card[this.vo]
      let percent = this.user.setKnownState(hash, voPhrase, true) 

      this.callback("showProgress", percent)
    }


    test() {
      let a = `01
        ru  Как вас зовут?
        en  What is your f name?
        fr  Quel est votre nom?

        02  Меня зовут...
        en  My name is...
        fr  Je m'appelle...

        03  Извините
        Excuse f me
        04  Как тебя зовут?
        What is your inf name?

        05
        некоторый текст
        some text`

      let b = `
        01
        ru  Как вас зовут?
        en  What is your f name?
        fr  Quel est votre nom?

        02  Тебя зовут...
        en  Your inf name is...
        fr  Tu t'appelles...

        03  Извините
        Excuse f me — This text has been changed

        05
        некоторый текст
        some text
        06
        Русский
        Russian`

      let c = this.convertToPhraseArray(a)
      this.mergeWithExistingCardArray(c)

      this.cardArray.forEach(cardData => {
        let random = Math.floor(Math.random() * 10)
        cardData.users = { "John": { known: false, repeats: random }}
      })

      console.log(JSON.stringify(this.cardArray))

      let d = this.convertToPhraseArray(b)
      this.mergeWithExistingCardArray(d)

      console.log(this.cardArray)
      console.log(this.cardArray.map(cardData => {
        return cardData.ru + JSON.stringify(cardData.users)
      }))
    }
  }

})(window)