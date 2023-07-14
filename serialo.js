#!/usr/bin/env node
import App from 'fastify'
import { SerialPort } from 'serialport'

const ports = [
   new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 }),
   new SerialPort({ path: '/dev/ttyUSB1', baudRate: 9600 })
]

const PRE = 'A0'
const OPEN = '01A2'
const CLOSE = '00A1'
const OUTS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '0A', '0B', '0C', '0D', '0E', '0F', '10']
const n = OUTS.length

const states = {}

const all = on => {
   for (let pin = 0; pin < n * 2; pin++) {
      const port = parseInt(pin / n)
      ports[port].write(Buffer.from(PRE + OUTS[pin % n] + (on ? OPEN : CLOSE), 'hex'))
      states[pin] = false
   }
   return states
}
all('on')

const app = App()

const updatePin = (pin, on) => {
   if (pin >= 0 && pin < n * 2) {
      const port = parseInt(pin / n)
      ports[port].write(Buffer.from(
         PRE + OUTS[pin % n] + (on ? OPEN : CLOSE),
	 'hex'
      ))
      states[pin] = on
   }
   return {[pin]: states[pin]}
}

app.get('/', () => states)
app.get('/all/:on', req => all(parseInt(req.params.on)))
app.get('/state/:pin', req => states[parseInt(req.params.pin)])
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

