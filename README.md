# Node.js D-Bus

[![][ci-badge]][ci-link] [![][version-badge]][version-link]
[![][license-badge]][license-link] [![][types-badge]][types-link]

[ci-badge]: https://github.com/clebert/node-d-bus/workflows/CI/badge.svg
[ci-link]: https://github.com/clebert/node-d-bus
[version-badge]: https://badgen.net/npm/v/@clebert/node-d-bus
[version-link]: https://www.npmjs.com/package/@clebert/node-d-bus
[license-badge]: https://badgen.net/npm/license/@clebert/node-d-bus
[license-link]: https://github.com/clebert/node-d-bus/blob/master/LICENSE
[types-badge]: https://badgen.net/npm/types/@clebert/node-d-bus
[types-link]: https://github.com/clebert/node-d-bus

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
- Tested with Node.js 14 on Raspberry Pi OS Lite.

## Usage example

### Call the `org.freedesktop.DBus.Hello` method

```js
import {MessageType} from 'd-bus-message-protocol';
import {SystemDBus} from '@clebert/node-d-bus';

(async () => {
  const dBus = new SystemDBus();

  await dBus.connectAsExternal();

  try {
    const helloReturnMessage = await dBus.callMethod({
      messageType: MessageType.MethodCall,
      objectPath: '/org/freedesktop/DBus',
      interfaceName: 'org.freedesktop.DBus',
      memberName: 'Hello',
      serial: 1,
      destination: 'org.freedesktop.DBus',
    });

    console.log(JSON.stringify(helloReturnMessage));
  } finally {
    dBus.disconnect();
  }
})().catch(console.error.bind(console));
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

---

Copyright (c) 2021, Clemens Akens. Released under the terms of the
[MIT License](https://github.com/clebert/node-d-bus/blob/master/LICENSE).
