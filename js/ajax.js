/** ajax.js **
 *
 * Create a new Ajax object using a URL and a callback, to be informed
 * when the Ajax operation has completed.
 * 
 * Create a new GetJSON object to have a JSON object returned instead
 * of a raw string.
**/



;(function ajaxLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }



  let Ajax = jazyx.classes.Ajax = class Ajax {
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
          this.callback(null, this.xobj.responseText)

        } else {
          this.callback(status)
        }
      }
    }
  }




  jazyx.classes.GetJSON = class GetJSON {  
    constructor(url, callback) {
      this.callback = callback

      new Ajax(url, this.getJSON.bind(this))
    }


    getJSON(error, result) {
      let output

      if (!error) {
        try {
          output = JSON.parse(result)
        } catch (caughtError) {
          error = "JSON.parse — " + caughtError
          console.log("JSON.parse() ERROR")
          console.log(result)
        }
      }
      
      this.callback(error, output)
    }
  }

})(window)