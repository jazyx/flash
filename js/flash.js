/** flash.js **
 *
 *
**/



;(function flashLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }

  if (!(jazyx.classes)) {
    jazyx.classes = {}
  }




  jazyx.classes.Flash = class Flash {
    constructor(audioButton) {
      this.audioButton = audioButton
      this.initialize()
      // this.sections = {...}
      // this.text = div element
      // this.cards = [...]
      // this.card = 0
      // this.minCount = 10
      // this.cueCode = "en"

      this.hideSplash()
      this.showNext()
    }


    initialize() {
      let actions = [].slice.call(document.querySelectorAll(".action"))
      let listener = this.treatAction.bind(this)
      actions.forEach(actionLink => {
        actionLink.addEventListener("click", listener, false)
      })

      this.sections = this.getElements("section")
      this.buttons = document.querySelector(".buttons")

      this.frame = document.querySelector("div.frame")
      this.stimulus = document.querySelector("div.front")
      this.response = document.querySelector("div.back")
      this.progress = document.querySelector("div.done")

      this.cards = this.cards()
      this.total = this.cards.length
      this.card = 0
      this.minCount = 10
      this.cueCode = "en"
      this.cueIsRussian = (this.cueCode === "ru")

      this.complete = false
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


      hideSplash() {
        let delay = 1000

        setTimeout(this.showCard.bind(this), delay)
      }


      showCard() {
        this.showItem("card", this.sections)
      }


      showItem(id, group) {
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
        if (this.card) {
          if (!dontRepeat) {
            this.repeat(this.card)
          } else {
            this.showProgress()
          }
        }

        this.card = this.cards.shift()
        if (!this.card) {
          // All the cards have been learnt
          return this.finish()
        }

        this.showCue()

        this.turnBack()
      }


      showProgress() {
        let done = this.total - this.cards.length
        let ratio = done / this.total * 100
        this.progress.style = `width:${ratio}%`
      }

    // CUE // CUE // CUE // CUE // CUE // CUE // CUE // CUE // CUE //

      showCue() {
        let getHTML = (text => {
          text = text.replace(" f ", "<sup>(formal)</sup> ")
          text = text.replace(" inf ", "<sup>(informal)</sup> ")

          let index = text.indexOf("|")
          if (index < 0) {
          } else {
            text = text.substring(0, index)
                 + "<span>" + text.substring(index + 1) + "<span>"
          }

          return "<p>" + text + "</p>"
        })

        let stimulus
          , response 

        [stimulus, response] = this.cueIsRussian
                             ? [this.card.ru, this.card.en]
                             : [this.card.en, this.card.ru]

        this.stimulus.innerHTML = getHTML(stimulus)
        this.response.innerHTML = getHTML(response)
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


      repeat(card) {
        let index = Math.random() * (this.cards.length - this.minCount)
        if (index < this.minCount) {
          this.cards.push(card)
        } else {
          this.cards.splice(index, 0, card)
        }
      }


    cards() {
      return [
        { en: "What is your f name?"
        , ru: "Как вас зовут?"
        , audio: "01.mp3"
        }
      , { en: "My name is..."
        , ru: "Меня зовут..."
        , audio: "02.mp3"
        }
      , { en: "Excuse f me"
        , ru: "Извините"
        , audio: "03.mp3"
        }
      , { en: "What is your inf name?"
        , ru: "Как тебя зовут?"
        , audio: "04.mp3"
        }
      , { en: "I have..."
        , ru: "У меня есть..."
        , audio: "05.mp3"
        }
      , { en: "Excuse inf me"
        , ru: "Извини"
        , audio: "06.mp3"
        }
      , { en: "You f have..."
        , ru: "У вас есть..."
        , audio: "07.mp3"
        }
      , { en: "You inf have..."
        , ru: "У тебя есть..."
        , audio: "08.mp3"
        }
      , { en: "You inf have money "
        , ru: "У тебя есть деньги"
        , audio: "09.mp3"
        }
      , { en: "I have a job"
        , ru: "У меня есть работа"
        , audio: "10.mp3"
        }
      , { en: "to speak"
        , ru: "говорить"
        , audio: "11.mp3"
        }
      , { en: "Do you inf have any children?"
        , ru: "У вас есть дети?"
        , audio: "12.mp3"
        }
      , { en: "to work "
        , ru: "работать"
        , audio: "13.mp3"
        }
      , { en: "I speak Russian a little bit"
        , ru: "Я немного говорю по-русски"
        , audio: "14.mp3"
        }
      , { en: "to live"
        , ru: "жить"
        , audio: "15.mp3"
        }
      , { en: "I work in Moscow"
        , ru: "Я работаю в Москве."
        , audio: "16.mp3"
        }
      , { en: "to have lunch"
        , ru: "обедать"
        , audio: "17.mp3"
        }
      , { en: "I live in Russia"
        , ru: "Я живу в России"
        , audio: "18.mp3"
        }
      , { en: "to get up"
        , ru: "вставать"
        , audio: "19.mp3"
        }
      , { en: "I have lunch at one o'clock"
        , ru: "Я обедаю в час"
        , audio: "20.mp3"
        }
      , { en: "I get up at six in the morning"
        , ru: "Я встаю в шесть утра"
        , audio: "21.mp3"
        }
      , { en: "to have breakfast"
        , ru: "завтракать"
        , audio: "22.mp3"
        }
      , { en: "to drink"
        , ru: "пить"
        , audio: "23.mp3"
        }
      , { en: "I have breakfast at home"
        , ru: "Я завтракаю дома"
        , audio: "24.mp3"
        }
      , { en: "I speak with colleagues in English"
        , ru: "Я говорю с коллегами по-английски"
        , audio: "25.mp3"
        }
      , { en: "I like to drink coffee at work "
        , ru: "Я люблю пить кофе на работе"
        , audio: "26.mp3"
        }
      , { en: "I am reading a newspaper"
        , ru: "Я читаю газету"
        , audio: "27.mp3"
        }
      , { en: "to read"
        , ru: "читать"
        , audio: "28.mp3"
        }
      , { en: "I am writing a letter"
        , ru: "Я пишу письмо"
        , audio: "29.mp3"
        }
      , { en: "to write"
        , ru: "писать"
        , audio: "30.mp3"
        }
      , { en: "I have lunch at a cafe"
        , ru: "Я обедаю в кафе"
        , audio: "31.mp3"
        }
      , { en: "to have lunch"
        , ru: "обедать"
        , audio: "32.mp3"
        }
      , { en: "to play football"
        , ru: "играть в футбол"
        , audio: "33.mp3"
        }
      , { en: "to play "
        , ru: "играть"
        , audio: "34.mp3"
        }
      , { en: "Today I am having dinner at a restaurant"
        , ru: "Сегодня я ужинаю в ресторане"
        , audio: "35.mp3"
        }
      , { en: "to have dinner"
        , ru: "ужинать"
        , audio: "36.mp3"
        }
      , { en: "I am having a rest"
        , ru: "я отдыхаю"
        , audio: "37.mp3"
        }
      , { en: "to have a rest"
        , ru: "отдыхать"
        , audio: "38.mp3"
        }
      , { en: "In the evening I watch the news"
        , ru: "Вечером я смотрю новости"
        , audio: "39.mp3"
        }
      , { en: "to watch"
        , ru: "смотреть"
        , audio: "40.mp3"
        }
      , { en: "I listen to music in the car"
        , ru: "Я слушаю музыку в машине"
        , audio: "41.mp3"
        }
      , { en: "to listen"
        , ru: "слушать"
        , audio: "42.mp3"
        }
      , { en: "What does he do at work?"
        , ru: "Что он делает на работе?"
        , audio: "43.mp3"
        }
      , { en: "to do"
        , ru: "делать"
        , audio: "44.mp3"
        }
      , { en: "It was cold yesterday"
        , ru: "Вчера было холодно"
        , audio: "45.mp3"
        }
      , { en: "I talk with clients by phone"
        , ru: "Я говорю по телефону с клиентами"
        , audio: "46.mp3"
        }
      , { en: "It's warm today"
        , ru: "Сегодня тепло"
        , audio: "47.mp3"
        }
      , { en: "to be"
        , ru: "быть"
        , audio: "48.mp3"
        }
      , { en: "to cost "
        , ru: "стоить"
        , audio: "49.mp3"
        }
      , { en: "It will be hot tomorrow"
        , ru: "Завтра будет жарко"
        , audio: "50.mp3"
        }
      , { en: "At what time?"
        , ru: "Во сколько?"
        , audio: "51.mp3"
        }
      , { en: "How much does milk cost?"
        , ru: "Сколько стоит молоко?"
        , audio: "52.mp3"
        }
      , { en: "I buy groceries at a supermarket"
        , ru: "Я покупаю продукты в супермаркете"
        , audio: "53.mp3"
        }
      , { en: "to buy"
        , ru: "покупать"
        , audio: "54.mp3"
        }
      , { en: "to be situated|to be"
        , ru: "находиться"
        , audio: "55.mp3"
        }
      , { en: "Will you inf be in Moscow next week?"
        , ru: "Ты будешь в Москве на следующей неделе?"
        , audio: "56.mp3"
        }
      , { en: "What are you doing now? "
        , ru: "Что ты сейчас делаешь?"
        , audio: "57.mp3"
        }
      , { en: "Where is the Bolshoy Theatre?"
        , ru: "Где находится Большой театр?"
        , audio: "58.mp3"
        }
      , { en: "Four years ago I was working for a Russian company"
        , ru: "Четыре года назад я работал в русской компании"
        , audio: "59.mp3"
        }
      , { en: "Two years ago I was living in London"
        , ru: "Два года назад я жил в Лондоне"
        , audio: "60.mp3"
        }
      , { en: "Today I had dinner in a restaurant"
        , ru: "Сегодня я ужинал в ресторане"
        , audio: "61.mp3"
        }
      , { en: "Yesterday I had lunch in a cafe"
        , ru: "Вчера я обедал в кафе"
        , audio: "62.mp3"
        }
      , { en: "Two weeks ago I was in a museum"
        , ru: "Две недели назад я был на выставке"
        , audio: "63.mp3"
        }
      , { en: "Two days ago I was in Amsterdam"
        , ru: "Два дня назад я был в Амстердаме"
        , audio: "64.mp3"
        }
      , { en: "I go to work by car"
        , ru: "Я езжу на работу на машине"
        , audio: "65.mp3"
        }
      , { en: "to go |(by transport, regularly, in many directions)"
        , ru: "ездить"
        , audio: "66.mp3"
        }
      , { en: "I like to walk"
        , ru: "Мне нравится ходить пешком"
        , audio: "67.mp3"
        }
      , { en: "to go |(on foot, regularly, in many directions)"
        , ru: "ходить"
        , audio: "68.mp3"
        }
      , { en: "I like to go by taxi"
        , ru: "Я люблю ездить на такси"
        , audio: "69.mp3"
        }
      , { en: "Every week I go to the theatre"
        , ru: "Каждую неделю я хожу в театр"
        , audio: "70.mp3"
        }
      , { en: "I can"
        , ru: "я могу"
        , audio: "71.mp3"
        }
      , { en: "I must"
        , ru: "я должен"
        , audio: "72.mp3"
        }
      , { en: "I can work a lot"
        , ru: "Я могу много работать"
        , audio: "73.mp3"
        }
      , { en: "I must work"
        , ru: "Я должен работать"
        , audio: "74.mp3"
        }
      , { en: "In a month's time I will be working  in Moscow"
        , ru: "Через месяц я буду работать в Москве"
        , audio: "75.mp3"
        }
      , { en: "In a year's time I will be living in Italy "
        , ru: "Через год я буду жить в Италии"
        , audio: "76.mp3"
        }
      , { en: "to go|(by transport, not regularly, in one direction)"
        , ru: "ехать"
        , audio: "77.mp3"
        }
      , { en: "to go|(on foot, not regularly, in one direction)"
        , ru: "идти"
        , audio: "78.mp3"
        }
      , { en: "Tomorrow I will go at work by car"
        , ru: "Завтра я еду на работу на машине"
        , audio: "79.mp3"
        }
      , { en: "Today I am going to the theatre"
        , ru: "Сегодня я иду в театр"
        , audio: "80.mp3"
        }
      ]
    }
  }

  /// <<< HARD-CODED
  let player = new jazyx.classes.AudioPlayer("audio/")
  let button = new jazyx.classes.PlayButton("[href='#audio']")
  /// HARD-CODED >>>

  let audioButton = new jazyx.classes.AudioButton(player, button)

  jazyx.flash = new jazyx.classes.Flash(audioButton)

})(window)