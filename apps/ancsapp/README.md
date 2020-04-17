## iPhone notifications for Bangle.js

I have been working on an app to get Bangle.js to display notifications from an iPhone such as calls, emails etc on the Bangle using Apple's ANCS - Apple Notification Center Service. I have made some progress and hit an obstacle which I outline in the following in the hope that someone can suggest a way forward - other than buying an Android phone:-)

The first step is to get the IPhone to see the Bangle.js in Settings for bluetooth. To do this the advertising packet from Bangle.js needs to contain the UUID of the solicited ANCS service. This is published by Apple as:- `7905f431-b5ce-4e33-a455-4b1e122d00d0`.

The following code achieves this and allows the iPhone to connect to the watch.

~~~
Bangle.setLCDTimeout(0);
g.clear();
Terminal.println("Starting Advertising");

NRF.setAdvertising([
  0x02, //length
  0x01, //flags
  0x06, //
  0x11, //length
  0x15, //solicited Service type code
  0xD0,0x00,0x2D,0x12,0x1E,0x4B, //UUID
  0x0F,0xA4,
  0x99,0x4E,
  0xCE,0xB5,
  0x31,0xF4,0x05,0x79],{});

NRF.setSecurity({passkey:"123456",mitm:1,display:1});

NRF.on('connect',function(addr){
  Terminal.println("connect from ");
  Terminal.println(addr);
  Terminal.println("----------------------");
  var sec = NRF.getSecurityStatus();
  Terminal.println("connected: "+sec.connected);
  Terminal.println("encrypted: "+sec.encrypted);
  Terminal.println("mitm_protected: "+sec.mitm_protected);
  Terminal.println("bonded: "+sec.bonded);
});

NRF.on('disconnect',function(reason){
  Terminal.print("disconnect ");
  Terminal.println(reason);
});
~~~

When connected the watch can display the iPhones bluetooth address for the ANCS service. As can be seen from the screen photo this is a private resolvable address. Note that the watch does not start advertising until it is disconnected from the Web IDE - the first disconnect in the photo.

![](https://raw.githubusercontent.com/jeffmer/JeffsBangleAppsDev/master/apps/ancsapp/screendump.jpg)

Now for the problem. Bluetooth specifies both that a device may be Master/Central or Peripheral/Slave as well as whether it is a Client or Server. The Espruino examples all have the Master as Client and the Slave as Server. The Master initiates the connection and the Client accesses the data provided by the Server. The problem is that the ANCS has the Master as Server and the Client as Slave. In other words, the iPhone initiates the connection and also provide the ANCS service. The watch is the Slave which responds to the connection and then accesses the ANCS service as a client. The Espruino API as far as I can ascertain does not have  away to let you create a BluetoothDevice and then a BluetoothRemoteGATTServer to access the remote server for this Slave/Peripheral - Client combination. I tried an NRF.connect() to the private address, however, this immediately drops the connection. 

The Espruino Bluetooth API is a joy when compared with the complexity of the Nordic or Arduino APIs, so I do hope that I am wrong and there is a way of doing this or that it can be easily extended.
