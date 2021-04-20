// @ts-check

const {MessageType} = require('d-bus-message-protocol');
const {SystemDBus} = require('./lib/cjs');

(async () => {
  const dBus = new SystemDBus();

  await dBus.connectAsExternal();

  try {
    const helloReturnMessage = await dBus.callMethod({
      messageType: MessageType.MethodCall,
      path: '/org/freedesktop/DBus',
      interface: 'org.freedesktop.DBus',
      member: 'Hello',
      serial: 1,
      destination: 'org.freedesktop.DBus',
    });

    console.log(JSON.stringify(helloReturnMessage));
  } finally {
    dBus.disconnect();
  }
})().catch(console.error.bind(console));
