

function drawTime() {
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  g.setColor(1,1,1);
  g.setFont("Vector",100);
  g.drawString(hours,50,24,true);
  g.drawString(minutes,50,135,true);
}

Bangle.on('lcdPower',function(on) {
  if (on) {
    g.clear();
    Bangle.drawWidgets();
    drawTime();
  }
});

Bangle.setLCDBrightness(1);
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawTime();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
// change watch
setWatch(function(){
    load("anaclock.app.js");
}, BTN4, {repeat:false,edge:"rising"});
setWatch(function(){
    load("digiclock.app.js");
}, BTN5, {repeat:false,edge:"rising"});
