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
  buf.setFont("Vector",50);
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

var widgetVis = {
  saved:null,
  hide:()=>{
    if (!Bangle.isLCDOn() || this.saved) return;
    this.saved = [];
    for (var wd of WIDGETS) {
      this.saved.push(wd.draw); 
      wd.draw=()=>{};
    }
    g.setColor(0,0,0);
    g.fillRect(0,0,239,23);
  },
  reveal:()=>{
    if (!Bangle.isLCDOn() || !this.saved) return;
    for (var wd of WIDGETS) wd.draw = this.saved.shift();
    Bangle.drawWidgets(); 
    saved=null;
  },
  setup:()=>{
    setWatch(this.hide, BTN4, {repeat:true,edge:"rising"});
    setWatch(this.reveal, BTN5, {repeat:true,edge:"rising"});
  }
};

function setButtons(){
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(function(){load("bigclock.app.js");}, BTN1, {repeat:false,edge:"rising"});
  setWatch(function(){load("anaclock.app.js");}, BTN3, {repeat:false,edge:"rising"});
  widgetVis.setup();
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