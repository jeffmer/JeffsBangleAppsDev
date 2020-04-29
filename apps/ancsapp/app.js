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

var state = {
    gatt:null,
    ancs:null,
    ignore:true,
    notuid:0,
    com:new Uint8Array([0,0,0,0,0,1,32,0,3,64,0]),
    buf:new Uint8Array(108),
    vw :Dataview(this.buf),
    inp:0,
    store:function(b){
        var i = this.inp;
        if (i<107){
            this.buf.set(this,i);
            this.inp+=b.length;
        }
    },
    gotmsg:function(){
        var n = this.inp;
        if (n<8) return false;
        var tn=this.vw.getUint16(6,true);
        if (n<(tn+8)) return false;
        var mn=this.vw.getUint16(9+tn,true);
        if (n<(mn+tn+11)) return false;
        return true;  
    }
};   

NRF.on('connect',function(addr){
    var gatt;6
    console.log("**= Red ",addr);
    NRF.connect(addr,{minInterval:100,maxInterval:1000}).then(function(g) {
    gatt = g;
    gatt.device.on('gattserverdisconnected', function(reason) {
       console.log("*** Grey ",reason);
    });  
    NRF.setSecurity({passkey:"123456",mitm:1,display:1});
    return gatt.startBonding();
    }).then(function(){
      var ival = setInterval(function(){
          var sec = gatt.getSecurityStatus();
          console.log(sec);
          if (!sec.connected) {clearInterval(ival); return;}
          if (sec.connected && sec.encrypted){
            clearInterval(ival);  
            state.gatt=gatt;
            console.log("*** Orange");
            do_ancs(); 
            return;
          }
      },2000);
    }).catch(function(e){
      console.log("ERROR",e);
    });
});

function do_ancs() {
  var ancs = {primary:null, notify:null, control:null, data:null};
  state.gatt.getPrimaryService("7905F431-B5CE-4E99-A40F-4B1E122D00D0").then(function(s) {
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
    state.ancs=ancs;
    console.log("Got Services");
    ancs.notify.on('characteristicvaluechanged', function(ev) {
      printnotify(ev.target.value);
    });
    ancs.data.on('characteristicvaluechanged', function(e) {
      console.log(e.target.value);
      state.store(e.target.value.buffer);
      if (state.gotmsg()) console.log("Got the entire message");        
    });
    state.ignore=true;
    ancs.notify.startNotifications().then(function(){
      setTimeout(function(){
         state.ignore=false;
         ancs.data.startNotifications().then(function(){
            console.log("*** Green");
         });  
      },5000);
    });
  }).catch(function() {
     console.log("Something's broken.");
  });
}

const category = ["Other","Call ","Missd","Vmail","Msg  ","Sched","Email","News ","Fitn ","Busn ","Locn ","Entn "];

function printnotify(d){
  var eid = d.getUint8(0);
  var cat = d.getUint8(2);
  var uid = d.getUint32(4,true);
  Serial1.println("Eid: "+eid+" "+category[cat]+" "+uid);
}

function getnotify(d){
  if (state.ignore) return;
  var eid = d.getUint8(0);
  if (eid!=0) return;
  var cat = d.getUint8(2);
  if(cat!=2) return; 
  state.notuid = d.getUint32(4,true);
  var v = DataView(state.com.buffer);
  v.setUint32(1,state.notuid,true);
  state.ancs.control.writeValue(state.com).then(function(){
    setTimeout(function(){
       console.log(state.buf);
       //state.inp=0;
    }, 2000);
  });
}

function get(uid){
  var v = DataView(state.com.buffer);
  v.setUint32(1,uid,true);
  state.ancs.control.writeValue(state.com).then(function(){
     console.log("Requested",uid);
  });
}