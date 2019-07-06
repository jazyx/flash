/** storage.js **
 *
 * 
**/



;(function storageLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  jazyx.classes.Storage = class Storage {
    constructor(username = "Default") {
      this.username = username
      this.storage = window.localStorage
      
      let dataString = this.storage.getItem(username)

      if (dataString) {
        this.data = JSON.parse(dataString)
      } else {
        this.data = {}
        this.data.__icons__ = []
      }
    }


    getCardSetIcons() {
      return this.data.__icons__.sort()
    }


    getCardSet(setName) {
      // Return a clone, so that the main app can remove items
      let cardSetData = this.data[setName]
      cardSetData = JSON.parse(JSON.stringify(cardSetData))

      return cardSetData
    }


    addCardSet(cardSet) {
      this.data[cardSet.data.name] = cardSet
      this.data.__icons__.push(cardSet.data.icon)
      this.data.__icons__.sort()
      this.save()
    }


    rememberCard(setName, cardIndex, state) {
      let cardSet = this.data[setName]
      cardSet[cardIndex].known = state
      this.save()
    }


    save() {
      let dataString = JSON.stringify(this.data)
      this.storage.setItem(this.username, dataString)
    }
  }

})(window)