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
    constructor() {
      this.storageName = "data"
      this.storage = window.localStorage
      
      let dataString = this.storage.getItem(this.storageName)

      // { cardSets: {
      //    <sethash>: {
      //       audio: <relative path to audio folder>
      //       cards: [{
      //           audio: "<integer>.mp3"
      //         , en:    <HTML string>
      //         , index: <integer>
      //         , ru:    <HTML string>
      //         }
      //       , ...]
      //       customKeys: [
      //         
      //       ]
      //       hash:       <integer>
      //       icon:       <relative path to icon for this set>
      //       name:       <string>
      //       phrases:    <relative path to phrases.txt>
      //       svg:        <may be SVG string for displaying icon>
      //       timestamp:  <integer>
      //     }
      //   , ...
      //   }
      // , usersInfo:
      //   { default: <user name>
      //   , mode: "#AutoloadDefault"
      //   , users:
      //     { <user name>:
      //       { customSets: []
      //       , name: <user name>
      //       , statistics: {
      //           <sethash>: {
      //             ratios: {
      //               raw:     <float>
      //             , percent: "<integer>%"
      //             , rounded: "<integer>%"
      //             }
      //           , <HTML in Russian>: {
      //                known: <boolean>
      //              , recent: [
      //                  
      //                ]
      //              , repeats: <integer>
      //              }
      //             , ...
      //             }
      //           }
      //         , ...
      //         }
      //       , timestamp: <integer>
      //       }
      //     }
      //   }
      // }

      if (dataString) {
        try {
          this.data = JSON.parse(dataString)
          // TODO? Check integrity of this.data
          console.log("storage data:", this.data)
          return

        } catch (error) {
          // dataString was unreadable. Re-initialize.
        }
      }

      // If we get here, there's no stored data, or it's corrupt
      this.data = {}
      this.data.cardSets = {}
      this.data.usersInfo = { users: {}, default: 0, mode: 0 }
    }


    getTimeStamp(cardSetHash) {
      let timeStamp = 0

      let cardSetInfo = this.data[cardSetHash]
      if (cardSetInfo) {
        timeStamp = cardSetInfo.timestamp
      }

      return timeStamp
    }


    /**
     * Called by Flash.getCardSetsFromLocalStorage()
     *
     * @param   {string}  username  The username
     * 
     * @return  {string}  The array of card sets visible to this user
     */
    getCardSets(username) {
      // TODO: Filter by customKeys for the given user
      let cardSetHashArray = Object.keys(this.data.cardSets)
      let cardSets = Array(cardSetHashArray.length)
      
      cardSetHashArray.forEach((hash, index) => {
        cardSets[index] = this.data.cardSets[hash]
      })

      return cardSets
    }


    ///// NO LONGER USED
    // getCardSet(cardSetHash) {      
    //   return this.data.cardSets[cardSetHash] // may be undefined
    // }


    includeCardSet(cardSetInfo) {
      // { name:       <string>
      // , hash:       <integer>
      // , timestamp:  <integer>
      // , icon:       <url string>
      // , svg:        <svg string | 0>
      // , customKeys: [<string key>, ...]
      // , audio:      <relative url to audio folder>
      // , phrases:    <relative url to phrases.txt>
      // , cards:      [ {...}, ... ]
      // }

      this.data.cardSets[cardSetInfo.hash] = cardSetInfo
      // If a modified phrase.txt has just been merged with an
      // existing card set, then this line is redundant.

      this.save()
    }


    getUsersInfo() {
      // return JSON.parse(JSON.stringify(
      return this.data.usersInfo
        // ))
    }


    //////// NOT NEEDED. JUST CALL save()
    // rememberCard(username, cardSetHash, cardIndex, state) {
    //   let userData = this.data.usersInfo.users[username]
    //   let cardSetStatistics = userData.statistics[set]
    //   let cardSet = this.data[cardSetHash]

    //   if (!cardSet) {
    //     cardSet = {}
    //   }
    //   cardSet[cardIndex].known = state
    //   this.save()
    // }


    ///// NOW HANDLED BY User
    // getUserStatistics(username, cardSetHash) {
    //   let userData = this.data.usersInfo.users[username]
    //   // { pass: password
    //   // , customSets: []
    //   // , timestamp: + new Date()
    //   // 
    //   // , statistics: {
    //   //     <cardSetHash>: {
    //   //       <cardId>: {
    //   //         known: <boolean>
    //   //       , repeats: <integer>
    //   //       , recent: [ <boolean> ... ]
    //   //       }
    //   //     , ...
    //   //     }
    //   //   , ...
    //   //   }
    //   //   
    //   // , name: userName
    //   // }

    //   let statistics = userData.statistics[cardSetHash]
    //   if (!statistics) {
    //     statistics = {}
    //     userData.statistics[cardSetHash] = statistics
    //   }

    //   return statistics
    // }

    ///// NOT NEEDED. JUST CALL save()
    // saveUserStatistics(username, cardSetHash, statistics) {    
    //   let userData = this.data.usersInfo.users[username]
    //   // { pass: password
    //   // , customSets: []
    //   // , timestamp: + new Date()
    //   // , statistics: {}
    //   // , name: userName
    //   // }

    //   userData.statistics[cardSetHash] = statistics
    //   this.save()
    // }


    ///// NOT NEEDED. JUST CALL save()
    // setUsers(usersInfo) {
    //   this.data.usersInfo = JSON.parse(JSON.stringify(usersInfo))
    //   this.save()
    // }


    save() {
      let dataString = JSON.stringify(this.data)
      this.storage.setItem(this.storageName, dataString)
    }
  }

})(window)