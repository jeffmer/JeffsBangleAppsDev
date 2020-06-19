function getDigital(){

    var buf = Graphics.createArrayBuffer(240,92,1,{msb:true});
    function flip() {
      g.setColor(1,1,1);
      g.drawImage({width:buf.getWidth(),height:buf.getHeight(),buffer:buf.buffer},0,85);
    }
    
    function drawTime() {
      buf.clear();
      buf.setColor(1);
      var d = new Date();
      var da = d.toString().split(" ");
      var time = da[4];
      buf.setFont("Vector",42);
      buf.setFontAlign(0,-1);
      buf.drawString(time,buf.getWidth()/2,0);
      buf.setFont("6x8",2);
      buf.setFontAlign(0,-1);
      var date = d.toString().substr(0,15);
      buf.drawString(date, buf.getWidth()/2, 70);
      flip();
    }  
    return {init:drawTime, update:drawTime};
}

function getBig(){

    function drawTime(d) {
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

    function onSecond(){
       var t = new Date();
       if (t.getSeconds() === 0) drawTime(t);
    }

    function drawAll(){
       drawTime(new Date());
    }

    return {init:drawAll, update:onSecond};
}

function getAnalogue(){

    const p = Math.PI/2;
    const PRad = Math.PI/180;

    function seconds(angle, r) {
        const a = angle*PRad;
        const x = 120+Math.sin(a)*r;
        const y = 134-Math.cos(a)*r;
        if (angle % 90 == 0) {
            g.setColor(0,1,1);
            g.fillRect(x-6,y-6,x+6,y+6);
        } else if (angle % 30 == 0){
            g.setColor(0,1,1);
            g.fillRect(x-4,y-4,x+4,y+4);
        } else {
            g.setColor(1,1,1);
            g.fillRect(x-1,y-1,x+1,y+1);
        }
    }

    function hand(angle, r1,r2, r3) {
        const a = angle*PRad;
        g.fillPoly([
            120+Math.sin(a)*r1,
            134-Math.cos(a)*r1,
            120+Math.sin(a+p)*r3,
            134-Math.cos(a+p)*r3,
            120+Math.sin(a)*r2,
            134-Math.cos(a)*r2,
            120+Math.sin(a-p)*r3,
            134-Math.cos(a-p)*r3]);
    }

    var minuteDate;
    var secondDate;

    function onSecond() {
        g.setColor(0,0,0);
        hand(360*secondDate.getSeconds()/60, -5, 90, 3);
        if (secondDate.getSeconds() === 0) {
            hand(360*(minuteDate.getHours() + (minuteDate.getMinutes()/60))/12, -16, 60, 7);
            hand(360*minuteDate.getMinutes()/60, -16, 86, 7);
            minuteDate = new Date();
        }
        g.setColor(1,1,1);
        hand(360*(minuteDate.getHours() + (minuteDate.getMinutes()/60))/12, -16, 60, 7);
        hand(360*minuteDate.getMinutes()/60, -16, 86, 7);
        g.setColor(0,1,1);
        secondDate = new Date();
        hand(360*secondDate.getSeconds()/60, -5, 90, 3);
        g.setColor(0,0,0);
        g.fillCircle(120,134,2);
    }

    function drawAll() {
        secondDate = minuteDate = new Date();
        // draw seconds
        g.setColor(1,1,1);
        for (let i=0;i<60;i++)
            seconds(360*i/60, 100);
        onSecond();
    }

    return {init:drawAll, update:onSecond};
}

var curface = 0;
var faces = [getBig, getAnalogue, getDigital];
var face = faces[curface]();
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

function setButtons(){
  function getFace(inc){
     curface+=inc;
     curface = curface>2?0:curface<0?2:curface;
     stopdraw();
     face = faces[curface]();
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

