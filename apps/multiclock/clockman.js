



var FACES = [];
var curface = 0;
require("Storage").list(/\.face\.js$/).forEach(face=>FACES.push(eval(require("Storage").read(face))));
var face = FACES[curface]();
var intervalRefSec;

function stopdraw() {
  if(intervalRefSec) {clearInterval(intervalRefSec);}
}

function startdraw() {
  g.clear();
  g.reset();
  Bangle.drawWidgets();
  face.init();
  intervalRefSec = setInterval(face.update,1000);
}

function getFace(inc){
    curface+=inc;
    curface = curface>2?0:curface<0?2:curface;
    stopdraw();
    face = faces[curface]();
    startdraw();
 }

function setButtons(){
  function getFace(inc){
    var n = FACES.length-1;
    curface+=inc;
    curface = curface>n?0:curface<0?n:curface;
    stopdraw();
    face = FACES[curface]();
    startdraw();
  }
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(function(){getFace(1);}, BTN1, {repeat:true,edge:"rising"});
  setWatch(function(){getFace(-1);}, BTN3, {repeat:true,edge:"rising"});
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

g.clear();
Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
startdraw();
setButtons();

