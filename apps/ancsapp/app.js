Serial1.setConsole(true);
console.log("Starting ANCS test prog");


function advert(){
console.log("Starting Advertising");
NRF.setAdvertising([
    0x02, //length
    0x01, //flags
    0x06, //
    0x11, //length
    0x15, //solicited Service UUID
    0xD0,0x00,0x2D,0x12,0x1E,0x4B,
    0x0F,0xA4,
    0x99,0x4E,
    0xCE,0xB5,
    0x31,0xF4,0x05,0x79],{});
}
  
  var gatt;

  NRF.on('connect',function(addr){
    console.log("connect from ",addr);
    NRF.connect(addr).then(function(g) {
    gatt = g;
    gatt.device.on('gattserverdisconnected', function(reason) {
       console.log("Disconnected ",reason);
    });  
    NRF.setSecurity({passkey:"123456",mitm:1,display:1});
    return gatt.startBonding();
    }).then(function(){
      var ival = setInterval(function(){
          var sec = gatt.getSecurityStatus();
          console.log(sec);
          if (!sec.connected) {clearInterval(ival); return;}
          if (!sec.connected) {clearInterval(ival); return;}
          if (sec.connected && sec.encrypted){clearInterval(ival);  do_ancs(); return;}
      },2000);
    }).catch(function(e){
      console.log("ERROR",e);
    });
  });

const category = ["Other","Call ","Missd","Vmail","Msg  ","Sched","Email","News ","Fitn ","Busn ","Locn ","Entn "];
const eventID  = ["New ","Mod ","Old "];

var ancs = {primary:null, notify:null, control:null, data:null};

var notification;

function print_notify(v){
  notification = v;
  Serial1.print(eventID[v[0]]+category[v[2]]);
  Serial1.println(" Count "+v[3]+" Uid "+v[4]);
 }

function do_ancs() {
  gatt.getPrimaryService("7905F431-B5CE-4E99-A40F-4B1E122D00D0").then(function(s) {
    ancs.primary=s;
    return s.getCharacteristic("9FBF120D-6301-42D9-8C58-25E699A21DBD");
  }).then(function(c) {
    ancs.notify=c;
    return ancs.primary.getCharacteristic("69D1D8F3-45E1-49A8-9821-9BBDFDAAD9D9");      
  }).then(function(c) {
    ancs.control=c;
    return ancs.primary.getCharacteristic("22EAC6E9-24D6-4BB5-BE44-B36ACE7C7BFB");
  }).then(function(c) {
    ancs.data =c;
    console.log("Got services");
  }).catch(function() {
     console.log("Something's broken.");
  });
}

function start(){
  ancs.notify.on('characteristicvaluechanged', function(event) {
    print_notify(event.target.value.buffer);
  });
  ancs.notify.startNotifications().then(function(){
     console.log("Waiting Notifications");
  });
}  

function cmd1(id,atr){
  var v = notification;
  var com = new Uint8Array(7);
  com[0]=0;
  com[1]=id;
  com[5]=0;
  com[6]=atr;
  return ancs.control.writeValue(com);
}
function cmd2(id,atr){
  var v = notification;
  var com = new Uint8Array(9);
  com[0]=0;
  com[1]=id;
  com[5]=0;
  com[6]=atr;
  com[7]=64;
  return ancs.control.writeValue(com);
}

function cmd5(id,atr){
  var v = notification;
  var com = new Uint8Array(12);
  com[0]=0;
  com[1]=id;
  com[5]=0;
  com[6]=1;
  com[7]=16;
  com[9]=3;
  com[10]=32;
  return ancs.control.writeValue(com);
}

function print_data(b){
  var txt = "";
  for (var i=0; i<b.length; ++i){
    txt+=String.fromCharCode(b[i]);
  }
 console.log(txt); 
}

function getdetails(){
  ancs.data.on('characteristicvaluechanged', function(event) {
    console.log(event.target.value);
    print_data(event.target.value.buffer);
  });
  ancs.data.startNotifications().then(function(){
     console.log("ready for command");
  });  
}