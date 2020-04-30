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

var SCREENACCESS = {
      withApp:true,
      requested:function(){
        withApp=false;
        clearInterval(intervalRef);
      },
      released:function(){
        withApp=true;
        g.clear();
        Bangle.drawWidgets();
        intervalRef = setInterval(drawTime,60*1000);
        drawTime();
      }
} 

Bangle.on('lcdPower',function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    SCREENACCESS.released();
  } else {
    SCREENACCESS.requested();
  }
});

Bangle.setLCDBrightness(1);
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawTime();
intervalRef = setInterval(drawTime,60*1000);
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
// change watch
setWatch(function(){
    load("anaclock.app.js");
}, BTN1, {repeat:false,edge:"rising"});
setWatch(function(){
    load("digiclock.app.js");
}, BTN3, {repeat:false,edge:"rising"});
