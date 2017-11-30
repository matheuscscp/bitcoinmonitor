'use strict'

// libs
const request = require('request')
const TelegramBot = require('telegram-bot-api')

// constants
const chatId = process.env.CHAT_ID
const url = 'https://api.bitvalor.com/v1/ticker.json'
const getValueMins = 5

// globals
let threshold = 2000
let currentValue = 0
let baseValue = 0
let waitingInput = null

// bot
const bot = new TelegramBot({ token: process.env.BOT_TOKEN, updates: { enabled: true } })
const botMessage = (text) => { bot.sendMessage({ chat_id: chatId, text }) }
bot.on('update', (update) => {
  if (!update.message || update.message.chat.id != chatId) return
  if (waitingInput == update.message.from.id) {
    const val = Number(update.message.text)
    if (isNaN(val)) {
      botMessage('nao saquei, fala um numero')
    } else {
      threshold = val
      waitingInput = null
      botMessage('ok')
    }
  } else if (update.message.text == '/healthcheck@bitcoinmonitor_bot') {
    let msg = 'to vivao\n'
    msg += `threshold: ${threshold}\n`
    msg += `currentValue: ${currentValue}\n`
    msg += `baseValue: ${baseValue}\n`
    msg += `${url}`
    botMessage(msg)
  } else if (update.message.text == '/threshold@bitcoinmonitor_bot') {
    waitingInput = update.message.from.id
    botMessage('qual o novo threshold?')
  }
})

const fetchValue = () => {
  setTimeout(fetchValue, getValueMins*60*1000) // loop
  request({ url, json: true }, (error, response, body) => {
    const previousValue = currentValue
    currentValue = body.ticker_24h.total.last
    if (baseValue == 0) baseValue = currentValue
    else if (Math.abs(currentValue - baseValue) > threshold) {
      let msg = 'dectectei uma diferenca grande!\n'
      msg += `threshold: ${threshold}\n`
      msg += `previousValue (${getValueMins} minutes ago): ${previousValue}\n`
      msg += `baseValue: ${baseValue}\n`
      msg += `newValue: ${currentValue}\n`
      msg += `${url}`
      baseValue = currentValue
      botMessage(msg)
    }
  })
}

// main
fetchValue()
