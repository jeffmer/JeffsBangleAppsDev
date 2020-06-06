
const Yoff = 80;
var pal2color = new Uint16Array([0x0000,0xffff,0x07ff,0xC618],0,2);
var buf = Graphics.createArrayBuffer(240,50,2,{msb:true});
Bangle.setLCDTimeout(30);

function flip(b,y) {
 g.drawImage({width:240,height:50,bpp:2,buffer:b.buffer, palette:pal2color},0,y);
 b.clear();
}

const labels = ["N","NE","E","SE","S","SW","W","NW"];
var brg=null;

function drawCompass(course) {
  buf.setColor(1);
  buf.setFont("Vector",16);
  var start = course-90;
  if (start<0) start+=360;
  buf.fillRect(28,45,212,49);
  var xpos = 30;
  var frag = 15 - start%15;
  if (frag<15) xpos+=frag; else frag = 0;
  for (var i=frag;i<=180-frag;i+=15){
    var res = start + i;
    if (res%90==0) {
      buf.drawString(labels[Math.floor(res/45)%8],xpos-8,0);
      buf.fillRect(xpos-2,25,xpos+2,45);
    } else if (res%45==0) {
      buf.drawString(labels[Math.floor(res/45)%8],xpos-12,0);
      buf.fillRect(xpos-2,30,xpos+2,45);
    } else if (res%15==0) {
      buf.fillRect(xpos,35,xpos+1,45);
    }
    xpos+=15;
  }
  if (brg) {
    var bpos = brg - course;
    if (bpos>180) bpos -=360;
    if (bpos<-180) bpos +=360;
    bpos+=120;
    if (bpos<30) bpos = 14;
    if (bpos>210) bpos = 226;
    buf.setColor(2);
    buf.fillCircle(bpos,40,8);
    }
  flip(buf,Yoff);
}

var heading = 0;
function newHeading(m,h){ 
    var s = Math.abs(m - h);
    var delta = (m>h)?1:-1;
    if (s>=180){s=360-s; delta = -delta;} 
    if (s<2) return h;
    var hd = h + delta*(1 + Math.round(s/5));
    if (hd<0) hd+=360;
    if (hd>360)hd-= 360;
    return hd;
}

var candraw = false;
// Note actual mag is 360-m, error in firmware
function reading() {
  var m = Bangle.getCompass();
  if (!candraw) return;
  if (isNaN(m.heading)) {
    buf.setColor(1);
    buf.setFont("Vector",24);
    buf.setFontAlign(0,-1);
    buf.drawString("Rotate to",120,0);
    buf.drawString("Calibrate",120,26);
    flip(buf,Yoff);
    return;
  }
  heading = newHeading(360-m.heading,heading);
  drawCompass(heading);
  buf.setColor(1);
  buf.setFont("6x8",2);
  buf.setFontAlign(-1,-1);
  buf.drawString("o",170,0);
  buf.setFont("Vector",40);
  var course = Math.round(heading);
  var cs = course.toString();
  cs = course<10?"00"+cs : course<100 ?"0"+cs : cs;
  buf.drawString(cs,70,10);
  flip(buf,Yoff+80);
};

Bangle.on('touch', function(b) { 
    if(!candraw) return;
    if(b==1) brg=heading;
    if(b==2) brg=null;
 });

var intervalRef;

function startdraw(){
  g.clear();
  g.setColor(1,0.5,0.5);
  g.fillPoly([120,Yoff+50,110,Yoff+70,130,Yoff+70]);
  g.setColor(1,1,1);
  Bangle.drawWidgets();
  candraw = true;
  intervalRef = setInterval(reading,200);

}

function stopdraw() {
  candraw=false;
  if(intervalRef) {clearInterval(intervalRef);}
}

var SCREENACCESS = {
      withApp:true,
      request:function(){
        this.withApp=false;
        stopdraw();
      },
      release:function(){
        this.withApp=true;
        startdraw(); 
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

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});

Bangle.loadWidgets();
startdraw();
Bangle.setCompassPower(1);
