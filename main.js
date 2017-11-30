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
let value = 0
let waitingInput = null

// bot
const bot = new TelegramBot({ token: process.env.BOT_TOKEN, updates: { enabled: true } })
const botMessage = (text) => { bot.sendMessage({ chat_id: chatId, text }) }
bot.on('update', (update) => {
  if (!update.message || update.message.chat.id != chatId) return
  if (waitingInput != null && waitingInput == update.message.from.id) {
    const val = Number(update.message.text)
    if (isNaN(val)) {
      botMessage('nao saquei, fala um numero')
    } else {
      threshold = val
      waitingInput = null
      botMessage('ok')
    }
  } else if (update.message.text == '/healthcheck@bitcoinmonitor_bot') {
    botMessage('to vivao')
  } else if (update.message.text == '/threshold@bitcoinmonitor_bot') {
    waitingInput = update.message.from.id
    botMessage('qual o novo threshold?')
  }
})

const getValue = () => {
  setTimeout(getValue, getValueMins*60*1000) // loop
  request({ url, json: true }, (error, response, body) => {
    const val = body.ticker_24h.total.last
    const diff = val - value
    if (value != 0 && Math.abs(diff) > threshold) {
      value = val
      botMessage('dectectei uma diferenca grande!')
    }
  })
}

// main
getValue()
