import {MessageType} from 'd-bus-message-protocol';
import {SystemDBus} from './lib/index.js';

const dBus = new SystemDBus();

await dBus.connectAsExternal();

try {
  const helloReturnMessage = await dBus.callMethod({
    messageType: MessageType.MethodCall,
    objectPath: `/org/freedesktop/DBus`,
    interfaceName: `org.freedesktop.DBus`,
    memberName: `Hello`,
    serial: dBus.nextSerial,
    destination: `org.freedesktop.DBus`,
  });

  console.log(JSON.stringify(helloReturnMessage));
} finally {
  dBus.disconnect();
}
