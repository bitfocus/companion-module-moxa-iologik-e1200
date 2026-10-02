## Moxa ioLogik E1200 Series Control

DIO Control for the Moxa ioLogik E1210, E1211, E1212, E1213 and E1214 using the RESTful API.

### Setup

- Enable the RESTful API in the device web console (**RESTful API Setting** > **Enable Restful API**). This requires firmware v2.4 or later.
- Select the device firmware in the module config. Firmware v4.0 and later expects a different `Accept` header to earlier versions.
- On the E1212 and E1213 the DIO channels are set to DI or DO by jumpers. The module uses the channels reported by the device.
- On the E1214 the DO actions, feedbacks and variables control the relays.
- DI/DO mode and pulse widths can't be set through the RESTful API, use the device web console.

### Actions

- **Get DI Status, Mode & Count**
- **Reset DI Count**
- **Set DI Count Start**
- **Get DO Status, Mode & Pulse**
- **Set DO Pulse**
- **Set DO Pulse Count**
- **Set DO Status**

All set actions can be performed against multiple DIs/DOs at once.

### Feedbacks

- **DI Counter**
- **DI Mode**
- **DI Status**
- **DO Mode**
- **DO Pulse**
- **DO Status**

### Variables

- **DI Counter**
- **DO Pulse Count**
- **DO Pulse Width High**
- **DO Pulse Width Low**
- **Device Name**
- **Firmware Version**
- **IP Address**
- **MAC Address**
- **Model**
- **Up Time**
