module.exports = {
  apps : [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 35, 36, 37, 38, 40].map(pin => ({
	name: 'app' + pin,
	script: '.',
	args: '' + pin,
	cwd: '/root/paul'
  })).concat([{
    name: 'rpio',
    script: 'rpio',
    cwd: '/root/paul'
  }])x
}

