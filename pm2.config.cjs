const cwd = '/root/home' 
const pins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 35, 36, 37, 38, 40]
module.exports = {
  apps : pins.map(pin => ({
	name: 'app' + pin,
	script: 'index.cjs',
	args: '' + pin,
	cwd
  })).concat([{ name: 'rpio', script: 'rpio.js', cwd }])
}


