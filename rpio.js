#!/usr/bin/env node
import rpio from 'rpio'
import App from 'fastify'
const gpioPins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 35, 36, 37, 38, 40]
rpio.init({ gpiomem: true, mapping: 'physical', close_on_exit: true }) // pins 1-40, 28 lights
for (const pin of gpioPins) {
   rpio.open(pin, rpio.OUTPUT, rpio.LOW) // rpio.HIGH
}

const app = App()

app.get('/:pin/:on', req => {
   const pin = parseInt(req.params.pin)
   const on = parseInt(req.params.on)
   gpioPins.includes(pin) && rpio.write(pin, on ? rpio.HIGH : rpio.LOW)
   return 'ok'
})

await app.listen({ port: 80, host: '0.0.0.0' })