#!/usr/bin/env node
import { CommissioningServer, MatterServer } from '@project-chip/matter-node.js'
import { Time } from '@project-chip/matter-node.js/time'
import { OnOffLightDevice, DeviceTypes } from '@project-chip/matter-node.js/device'
import { VendorId } from '@project-chip/matter-node.js/datatype'
import { StorageManager, StorageBackendDisk } from '@project-chip/matter-node.js/storage'
import { Logger, Level } from '@project-chip/matter-node.js/log'
import fetch from 'node-fetch'
const pin = parseInt(process.argv[2])
const gpioPins = [3, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33, 35, 36, 37, 38, 40]
if (!gpioPins.includes(pin)) throw new Error(`Pin ${pin} does not exist`)
Logger.defaultLogLevel = Level.INFO
const storage = new StorageBackendDisk('storage/' + pin)
class BridgedDevice {
    async start() {
        const storageManager = new StorageManager(storage)
        await storageManager.initialize()
        const deviceStorage = storageManager.createContext('Device')
        const passcode = deviceStorage.get('passcode', 20202021)
        const discriminator = deviceStorage.get('discriminator', 3840)
        const vendorId = new VendorId(deviceStorage.get('vendorid', 0xFFF1))
        const productId = deviceStorage.get('productid', 0x8000)
        const isSocket = deviceStorage.get('isSocket', false)
        deviceStorage.set('passcode', passcode)
        deviceStorage.set('discriminator', discriminator)
        deviceStorage.set('vendorid', vendorId.id)
        deviceStorage.set('productid', productId)
        deviceStorage.set('isSocket', isSocket)
        const matterServer = new MatterServer(storageManager)
        const commissioningServer = new CommissioningServer({
            port: 5540 + pin,
            deviceName: 'Paul Smart Home',
            deviceType: DeviceTypes.ON_OFF_LIGHT.code,
            passcode,
            discriminator,
            basicInformation: {
                vendorName: 'Marin Bivol',
                vendorId,
                productName: 'PB-Lights',
                productId,
                serialNumber: `node-matter-${Time.nowMs()}`,
            }
        })
        const onOffDevice = new OnOffLightDevice()
        onOffDevice.addOnOffListener(on => fetch(`http://127.0.0.1/${pin}/${on ? 1 : 0}`))
        onOffDevice.addCommandHandler('identify', async ({ request: { identifyTime } }) => console.log(`Identify called for OnOffDevice: ${identifyTime}`))
        commissioningServer.addDevice(onOffDevice)
        matterServer.addCommissioningServer(commissioningServer)
        await matterServer.start()
        if (!commissioningServer.isCommissioned()) {
            const { qrCode, qrPairingCode, manualPairingCode } = commissioningServer.getPairingCode()
            console.log(qrCode)
            console.log(`QR Code URL: https://project-chip.github.io/connectedhomeip/qrcode.html?data=${qrPairingCode}`)
            console.log(`Manual pairing code: ${manualPairingCode}`)
        } else {
            console.log('Device is already commissioned. Waiting for controllers to connect ...')
        }
    }
}

new BridgedDevice().start().then(() => { /* done */ }).catch(err => console.error(err))
process.on('SIGINT', () => storage.close().then(() => process.exit(0)).catch(err => console.error(err)))
