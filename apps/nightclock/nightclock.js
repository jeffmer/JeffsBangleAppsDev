var FACES = [];
var iface = 0;
require("Storage").list(/\.face\.js$/).forEach(face=>FACES.push(eval(require("Storage").read(face))));
var face = FACES[iface]();
var intervalRefSec;

function stopdraw() {
  if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
}

function startdraw() {
  g.clear();
  g.reset();
  face.init();
  intervalRefSec = setInterval(face.tick,1000);
}

function setButtons(){
  function newFace(inc){
    var n = FACES.length-1;
    iface+=inc;
    iface = iface>n?0:iface<0?n:iface;
    stopdraw();
    face = FACES[iface]();
    startdraw();
  }
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(newFace.bind(null,1), BTN1, {repeat:true,edge:"rising"});
  setWatch(newFace.bind(null,-1), BTN3, {repeat:true,edge:"rising"});
}


Bangle.on('lcdPower',function(on) {
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});

var bright=1;
Bangle.on('swipe',(dir)=>{
    bright=dir<0?0.1:1;
    Bangle.setLCDBrightness(bright);
});  

g.clear();
startdraw();
setButtons();

