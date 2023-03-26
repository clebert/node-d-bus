# Node.js D-Bus

> A Node.js implementation of D-Bus with native TypeScript support.

## Installation

```
npm install @clebert/node-d-bus d-bus-message-protocol d-bus-type-system
```

## Features

- Designed from the ground up with TypeScript.
- Depends only on
  [d-bus-message-protocol](https://github.com/clebert/d-bus-message-protocol)
  and [d-bus-type-system](https://github.com/clebert/d-bus-type-system).
- Built-in support for the system message bus connected via Unix domain socket
  path.
  - The default path (`unix:path=/var/run/dbus/system_bus_socket`) can be
    overwritten with the environment variable `DBUS_SYSTEM_BUS_ADDRESS`.
- Built-in support for authentication as external.

## Usage example

### Call the `org.freedesktop.DBus.Hello` method

```js
import {SystemDBus} from '@clebert/node-d-bus';
import {MessageType} from 'd-bus-message-protocol';

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
```

```json
{
  "messageType": 2,
  "replySerial": 1,
  "serial": 1,
  "noReplyExpected": true,
  "noAutoStart": false,
  "allowInteractiveAuthorization": false,
  "destination": ":1.811",
  "sender": "org.freedesktop.DBus",
  "type": {"typeCode": "s", "bytePadding": 4},
  "body": ":1.811"
}
```

Note: The preceding message can also be conveniently sent using the
`await dBus.hello()` method.
