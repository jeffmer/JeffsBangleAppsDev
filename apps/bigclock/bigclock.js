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
    this.saved=null;
  },
  setup:()=>{
    setWatch(this.hide, BTN4, {repeat:true,edge:"rising"});
    setWatch(this.reveal, BTN5, {repeat:true,edge:"rising"});
  }
};

function setButtons(){
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(function(){load("anaclock.app.js");}, BTN1, {repeat:false,edge:"rising"});
  setWatch(function(){load("digiclock.app.js");}, BTN3, {repeat:false,edge:"rising"});
  widgetVis.setup();
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
