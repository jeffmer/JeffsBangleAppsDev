
var buf = Graphics.createArrayBuffer(128,128,2,{msb:true});
var pal4color = new Uint16Array([0x0000,0x07ff,0xffff,0xffff],0,4);
function flip() {
 g.drawImage({width:128,height:128,bpp:2,buffer:buf.buffer, palette:pal4color},56,66);
 buf.clear();
}

function arrow(r,c) {
  r=r*Math.PI/180;
  var p = Math.PI/2;
  buf.setColor(c);
  buf.fillPoly([
    64+64*Math.sin(r), 64-64*Math.cos(r),
    64+10*Math.sin(r+p), 64-10*Math.cos(r+p),
    64+10*Math.sin(r+-p), 64-10*Math.cos(r-p),
    ]);
}

//displayed heading
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
  g.setFont("6x8",3);
  g.setColor(0);
  g.fillRect(70,0,170,24);
  g.setColor(0xffff);
  g.setFontAlign(0,0);
  g.drawString(Math.round(heading),120,12);
  arrow(heading,1);
  arrow(heading+180,2);
  flip();
});

function startdraw(){
  g.clear();
  g.setColor(0,1,1);
  g.fillCircle(120,130,100);
  g.setColor(0,0,0);
  g.fillCircle(120,130,90);
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
