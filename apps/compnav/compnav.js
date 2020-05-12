
const Yoff = 80;
var pal2color = new Uint16Array([0x0000,0xffff,0x07ff,0xC618],0,2);
var buf = Graphics.createArrayBuffer(240,50,2,{msb:true});
var candraw = true;

function flip(b,y) {
 g.drawImage({width:240,height:50,bpp:2,buffer:b.buffer, palette:pal2color},0,y);
 b.clear();
}

const labels = ["N","NE","E","SE","S","SW","W","NW"];

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
  flip(buf,Yoff);
}

var heading = 0;

function newHeading(m,h){
    var s = Math.abs(m - h);
    var delta = 1;
    if (s<2) return h;
    if (m > h){
        if (s >= 180) { delta = -1; s = 360 - s;}
    } else if (m <= h){
        if (s < 180) delta = -1; 
        else s = 360 -s;
    }
    delta = delta * (1 + Math.round(s/15));
    heading+=delta;
    if (heading<0) heading += 360;
    if (heading>360) heading -= 360;
    return heading;
}

var candraw = false;

Bangle.on('mag', function(m) {
  if (!candraw) return;
  if (isNaN(m.heading)) return;
  newHeading(m.heading,heading);
  drawCompass(heading);
  buf.setColor(1);
  buf.setFont("6x8",2);
  buf.drawString("o",170,0);
  buf.setFont("Vector",40);
  var course = Math.round(heading);
  var cs = course.toString();
  cs = course<10?"00"+cs : course<100 ?"0"+cs : cs;
  buf.drawString(cs,80,0);
  flip(buf,Yoff+80);
});

function startdraw(){
  g.clear();
  g.setColor(1,0.5,0.5);
  g.fillPoly([120,Yoff+50,110,Yoff+70,130,Yoff+70]);
  g.setColor(1,1,1);
  Bangle.drawWidgets();
  candraw = true;
}

function stopdraw(){
   candraw=false;
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

Bangle.loadWidgets();
startdraw();
Bangle.setCompassPower(1);
