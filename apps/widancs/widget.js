(() => {

  function advert(){
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
      current:{cat:0,uid:0},
      com:new Uint8Array([0,0,0,0,0,1,20,0,3,64,0]),
      buf:new Uint8Array(96),
      inp:0,
      store:function(b){
          var i = this.inp;
          if (i+b.length<=96){
              this.buf.set(b,i);
              this.inp+=b.length;
          }
      },
      gotmsg:function(){
          var n = this.inp;
          var vw = DataView(this.buf.buffer);
          if (n<8) return null;
          var tn=vw.getUint16(6,true);
          if (n<(tn+8)) return null;
          var mn=vw.getUint16(9+tn,true);
          if (n<(mn+tn+11)) return null;
          return {msg:true, tlen:tn, mlen:mn}; 
      }
  };   
  
  if (typeof SCREENACCESS!='undefined') 
  NRF.on('connect',function(addr){
      var gatt;
      drawIcon(1); //connect from iPhone
      NRF.connect(addr,{minInterval:30,maxInterval:200}).then(function(g) {
      gatt = g;
      gatt.device.on('gattserverdisconnected', function(reason) {
         drawIcon(0); //disconnect from iPhone
      });
      E.on("kill",function(){
        gatt.disconnect().then(function(){NRF.disconnect();});
      });      
      NRF.setSecurity({passkey:"123456",mitm:1,display:1});
      return gatt.startBonding();
      }).then(function(){
        var ival = setInterval(function(){
            var sec = gatt.getSecurityStatus();
            if (!sec.connected) {clearInterval(ival); return;}
            if (sec.connected && sec.encrypted){
              clearInterval(ival);  
              state.gatt=gatt;
              drawIcon(2); //bonded to iPhone
              do_ancs(); 
              return;
            }
        },2000);
      }).catch(function(e){
        Terminal.println("ERROR "+e);
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
      drawIcon(3);//got remote services
      ancs.notify.on('characteristicvaluechanged', function(ev) {
        getnotify(ev.target.value);
      });
      ancs.data.on('characteristicvaluechanged', function(e) {
        state.store(e.target.value.buffer);
        var inds = state.gotmsg();
        if (inds) printmsg(state.buf,inds);        
      });
      state.ignore=true;
      ancs.notify.startNotifications().then(function(){
        setTimeout(function(){
           state.ignore=false;
           ancs.data.startNotifications().then(function(){
              drawIcon(4); //ready for messages
           });  
        },1000);
      });
    }).catch(function(e){
        Terminal.println("ERROR "+e);
    });
  }
  
  function printmsg(buf,inds){
    var title="";
    for (var i=8;i<8+inds.tlen; ++i) title+=String.fromCharCode(buf[i]);
    var message = "";
    var lines = 1;
    for (var j=8+inds.tlen;j<11+inds.tlen+inds.mlen;++j) { 
      message+=String.fromCharCode(buf[j]);
      if (j>18*lines) {++lines; message+="\n";}
    } 
    Bangle.buzz(500);
    SCREENACCESS.request();
    Bangle.setLCDPower(true);
    if (state.current.cat!=1){
      E.showAlert(message,title).then (
        function () { setTimeout(() => { SCREENACCESS.release(); }, 1000); }
      );
    } else {
      E.showPrompt(message,{title:title,buttons:{"Accept":true,"Cancel":false}}).then
        (function(tf){
          var bb = new Uint8Array(6);
          var v = DataView(bb.buffer);
          v.setUint8(0,2);
          v.setUint32(1,state.current.uid,true);
          v.setUint8(5,tf?0:1 );
          state.ancs.control.writeValue(bb).then(
            function(){
            SCREENACCESS.release();
            });        
        });
    }
  }
  
  //const category = ["Other","Call ","Missd","Vmail","Msg  ","Sched","Email","News ","Fitn ","Busn ","Locn ","Entn "];
  
  function getnotify(d){
    var eid = d.getUint8(0);
    var cat = d.getUint8(2);
    var uid = d.getUint32(4,true);
  //  Terminal.println("Eid: "+eid+" "+category[cat]+" "+uid +" "+state.ignore);
    if (state.ignore) return;
    if (eid!=0) return;
    if(cat!=1 && cat!=2 && cat!=4) return; //calls & messages only
    state.current.cat=cat;
    state.current.uid=uid;
    var v = DataView(state.com.buffer);
    v.setUint32(1,uid,true);
    state.inp=0;
    state.ancs.control.writeValue(state.com).then(function(){
   // Terminal.println("Requested"+uid);
    });
  }
    
  var stage = 5;
    
  //grey, red, lightblue, yellow, green
  function draw(){
    var colors = new Uint16Array([0xc618,0xf800,0x3ff,0xffe0,0x07e0,0x0000]);
    var img = E.toArrayBuffer(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"));
    g.setColor(colors[stage]);
    g.drawImage(img,this.x,this.y);
  }
    
  WIDGETS["ancs"] ={area:"tl", width:24,draw:draw};
    
  function drawIcon(id){
    stage = id;
    WIDGETS["ancs"].draw();
  }
  
  if (typeof SCREENACCESS!='undefined') {
    stage = 0;
    NRF.disconnect();
    advert();
  }
  
  })();
  
  
  