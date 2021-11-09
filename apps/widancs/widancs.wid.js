
(() => {

  var STOR = require("Storage");
  var s = STOR.readJSON("widancs.json",1)||{settings:{enabled:false, category:[1,2,4]}};
  var notifyqueue = STOR.readJSON("widancs.data.json") || [];
  STOR.erase("widancs.data.json"); // make sure no stale nitification references

  var ENABLED = s.settings.enabled;
  var CATEGORY = s.settings.category;
  var CANDISP = typeof SCREENACCESS!='undefined';

  var current;
  var msgTO = null;
    
  var screentimeout;
  var inalert = false;

  function release_screen(){
    screentimeout= setTimeout(() => { 
        SCREENACCESS.release(); 
        screentimeout = undefined; 
        inalert=false; 
        next_notify();
    }, 500);
  } 

  function displaymsg(m){
    if (msgTO) clearTimeout(msgTO); 
    //we may already be displaying a prompt, so clear it
    E.showAlert();
    if (screentimeout) clearTimeout(screentimeout);
    SCREENACCESS.request();
    Bangle.buzz().then(()=>{
      Bangle.setLCDPower(true);
      if (current.cat!=1){
        E.showAlert(m.message,m.title).then(()=>{
          NRF.ancsAction(current.uid,0);
          release_screen();
        });
      } else {
        E.showPrompt(m.message,{title:m.title,buttons:{"Accept":true,"Cancel":false}}).then((r)=>{
          NRF.ancsAction(current.uid,r);
          release_screen();
        });
      }
    });
  }

  var notifyTO;
  function getnotify(d){
    if (d.event!="add") return;
    if (notifyTO) clearTimeout(notifyTO);
    if(!CATEGORY.includes(d.category)) return; 
    var len = notifyqueue.length;
    if (d.category == 1) { // it's a call so pre-empt
        if (inalert) {notifyqueue.push(current); inalert=false;}
        notifyqueue.push({cat:d.category, uid:d.uid});
    } else if (len<32)
        notifyqueue[len] = {cat:d.category, uid:d.uid};
    if (CANDISP){
        notifyTO = setTimeout(next_notify,1000);
    } else {
        ready_switch();
    }
  }

  function next_notify(){
      if(notifyqueue.length==0 || inalert) return;
      inalert=true;
      current = notifyqueue.pop();
      NRF.ancsGetNotificationInfo(current.uid).then(
        (m)=>{displaymsg(m);}
      ).catch(function(e){
        inalert = false;
        next_notify();require("notify").show({title:"Test", body:"Hello"});
        Terminal.println("ANCS: "+e);
      });
  }

  var stage = 0;    
  //grey, pink, lightblue, yellow, green
  function draw(){
    var colors = new Uint16Array([0xc618,0xff00,0x3ff,0xffe0,0x07e0,0x0000]);
    var img = E.toArrayBuffer(atob("GBgBAAAABAAADgAAHwAAPwAAf4AAP4AAP4AAP4AAHwAAH4AAD8AAB+AAA/AAAfgAAf3gAH/4AD/8AB/+AA/8AAf4AAHwAAAgAAAA"));
    g.setColor(colors[stage]);
    g.drawImage(img,this.x,this.y);
  }

  WIDGETS["ancs"] ={area:"tl", width:24,draw:draw};
  
  function changed(){
    stage = NRF.getSecurityStatus().connected ? 4 : 3;
    WIDGETS["ancs"].draw();
  }

  function do_switch(){
    STOR.writeJSON("widancs.data.json",notifyqueue);
    load("multiclock.app.js");
  }

  var readied = false;
  function ready_switch() {
    if (readied) return;
    Bangle.buzz().then(()=>{
      Bangle.setLCDPower(true);
      setInterval(function (){
        stage = stage==4? 1:4;
        WIDGETS["ancs"].draw();
      }, 1000);
      setWatch(do_switch, BTN2, {repeat:false,edge:"falling"});
    });
  }
  
  if (ENABLED) {
    E.on("ANCS", getnotify);
    NRF.on('connect',changed);
    NRF.on('disconnect',changed);
    NRF.setServices({},{ancs:true});
    stage = NRF.getSecurityStatus().connected ? 4 : 3;
    notifyTO = setTimeout(next_notify,1000);
  }
  
  })();
