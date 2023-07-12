#!/usr/bin/env node
import rpio from 'rpio'
import App from 'fastify'
// pins 1-40, 28 IO pins
const gpioPins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 35, 36, 37, 38, 40]
rpio.init({ gpiomem: true, mapping: 'physical', close_on_exit: true })
const states = {}
for (const pin of gpioPins) {
   rpio.open(pin, rpio.OUTPUT, rpio.LOW) // rpio.HIGH
   states[pin] = false
}

const app = App()

const updatePin = (pin, on) => {
   if (gpioPins.includes(pin)) {
      rpio.write(pin, on ? rpio.HIGH : rpio.LOW)
      states[pin] = on
   }
   return {[pin]: states[pin]}
}

app.get('/:pin/:on', req => {
   const pin = parseInt(req.params.pin)
   const on = parseInt(req.params.on)
   return updatePin(pin, on)
})

app.get('/:pin', req => {
   const pin = parseInt(req.params.pin)
   const on = !states[pin]
   return updatePin(pin, on)
})

await app.listen({ port: 80, host: '0.0.0.0' })

