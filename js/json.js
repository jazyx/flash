/** json.js **
 *
 * 
**/



;(function jsonLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.ParseText = class ParseText {
    constructor(url, callback) {
      this.callback = callback

      let xobj = this.xobj = new XMLHttpRequest()
      xobj.overrideMimeType("application/json")

      xobj.open('GET', url, true)

      xobj.onreadystatechange = this.treatStateChange.bind(this)

      xobj.send()
    }



    treatStateChange () {
      let status = this.xobj.status
      let state = this.xobj.readyState

      if (state == 4) {
        if (status == "200") {
          // Required use of an anonymous callback as .open will NOT
          // return a value but simply returns undefined in
          // asynchronous mode
          
          let response = this.parseText(this.xobj.responseText)
          this.callback(response)

        } else {
          this.callback(null, status)
        }
      }
    }



    parseText(result, error) {
      if (error) {
        return
      }

      // // result is expected to be a string with a format like:
      // 01
      // ru  Как вас зовут?
      // en  What is your f name?
      // fr  Quel est votre nom?
      //
      // 02  Меня зовут...
      // en  My name is...
      // fr  Je m'appelle...
      //
      // 03  Извините
      //     Excuse f me
      // 04  Как тебя зовут?
      // What is your inf name?

      /// <<< HARD-CODED Define which languages we expect to find
      let defaultCode = "en"
      let languageCodes = [ defaultCode, "ru", "fr" ]
      /// HARD-CODED >>>

      // Prepare a regex to detect either the file name|number or the
      // language code
      let chunkRegex = "\n*(\\d+"
      languageCodes.forEach(code => {
        chunkRegex += `|${code}`
      })
      chunkRegex += ")\\s+"
      chunkRegex = new RegExp(chunkRegex)

      // Regex to break result up at numbered file names
      let phraseRegex = /^|\n(?=\d+\s+)/

      // Regex to break card data into languages
      let dataRegex = /\n+/



      let cardArray = result.split(phraseRegex)

      cardArray.forEach((cardString, index) => {
        let cardData = {}
        let languageChunks = cardString.split(dataRegex)
                                     .filter(chunk => chunk !== "")

        languageChunks.forEach(chunk => {
          let bits = chunk.split(chunkRegex)
                          .filter(bit => bit !== "")

          if (bits.length > 1) {
            if (!isNaN(bits[0])) {
              cardData.audio = bits[0] + ".mp3"
              cardData.ru = bits[1]
            } else {
              cardData[bits[0]] = bits[1]
            }
          } else {
            if (!isNaN(bits[0])) {
              cardData.audio = bits[0] + ".mp3"
            } else {
              cardData[defaultCode] = bits[0].trim(/\s/)
            }
          }

          // ["03", "Извините"]
          // ["en", "Excuse f me"]
          // ["fr", "Pardonnez-moi !"]
        })

        cardArray[index] = cardData
      })

      return cardArray
    }
  }

})(window)