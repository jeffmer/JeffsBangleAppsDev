function drawTime() {
  if (!Bangle.isLCDOn()) return;
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  g.clearRect(0,24,239,239);
  g.setColor(1,1,1);
  g.setFont("Vector",100);
  g.drawString(hours,50,24,true);
  g.drawString(minutes,50,135,true);
}

intervalRef = null;

function startdraw(){
  g.reset();
  g.clear();
  intervalRef = setInterval(drawTime,60*1000);
  drawTime(); 
  Bangle.drawWidgets(); 
}

function stopdraw(){
  clearInterval(intervalRef);
}

function setButtons(){
  function myload(clockapp){
     if (require("Storage").read(clockapp)) load(clockapp);
  }
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(function(){myload("anaclock.app.js");}, BTN1, {repeat:false,edge:"rising"});
  setWatch(function(){myload("digiclock.app.js");}, BTN3, {repeat:false,edge:"rising"});
}

var SCREENACCESS = {
      withApp:true,
      request:function(){
        this.withApp=false;
        stopdraw();
        clearWatch();
      },
      release:function(){
        this.withApp=true;
        startdraw(); 
        setButtons();
      }
}; 

Bangle.on('lcdPower',function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});


Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
startdraw();
setButtons();
