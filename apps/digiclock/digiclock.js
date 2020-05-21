// Offscreen buffer
var buf = Graphics.createArrayBuffer(240,92,1,{msb:true});
function flip() {
  g.setColor(1,1,1);
  g.drawImage({width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer},0,77);
}

/* Draw a transition between lastText and thisText.
 'n' is the amount - 0..1 */
function drawTime() {
  buf.clear();
  buf.setColor(1);
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4];
  buf.setFont("Vector",48);
  buf.setFontAlign(0,-1);
  buf.drawString(time,buf.getWidth()/2,0);
  buf.setFont("Vector",18);
  buf.setFontAlign(0,-1);
  var date = d.toString().substr(0,15);
  buf.drawString(date, buf.getWidth()/2, 70);
  flip();
}

var intervalRef = null;

function startdraw(){
  Bangle.drawWidgets();
  intervalRef = setInterval(drawTime, 1000);
  drawTime();  
}

function stopdraw(){
  clearInterval(intervalRef);
}

function setButtons(){
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(function(){load("bigclock.app.js");}, BTN1, {repeat:false,edge:"rising"});
  setWatch(function(){load("anaclock.app.js");}, BTN3, {repeat:false,edge:"rising"});
};

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
} 
 
Bangle.on('lcdPower',function(on) {
  if (!SCREENACCESS.withApp) return;
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});

g.clear();
Bangle.loadWidgets();
startdraw();
setButtons();