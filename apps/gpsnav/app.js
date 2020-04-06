
var pal2color = new Uint16Array([0x0000,0xffff],0,2);
var buf = Graphics.createArrayBuffer(240,50,1,{msb:true});

function flip(b,y) {
 g.drawImage({width:240,height:50,bpp:1,buffer:b.buffer, palette:pal2color},0,y);
 b.clear();
}

var labels = ["N","NE","E","SE","S","SW","W","NW"];

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
  flip(buf,78);
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

var gpsfix;
var course =0;
var speed = 0;
var satellites = 0;

function drawN(){
  buf.setColor(1);
  buf.setFont("Vector",48);
  var cs = course.toString();
  cs = course<10?"00"+cs : course<100 ?"0"+cs : cs;
  buf.drawString(cs,10,0);
  var txt = (speed<10) ? speed.toFixed(1) : Math.round(speed);
  buf.drawString(txt,140,0);
  flip(buf,170);
  g.setFont("6x8",2);
  g.setColor(0,0,0);
  g.fillRect(25,25,100,35);
  g.setColor(1,1,1);
  g.drawString("Sats " + satellites.toString(),25,25);     
}

function onGPS(fix) {
  gpsfix = fix;
  if (gpsfix!==undefined){
    course = isNaN(fix.course) ? course : Math.round(fix.course);
    speed  = isNaN(fix.speed) ? speed : fix.speed;
    satellites = fix.satellites;
  }
  if (Bangle.isLCDOn()) drawN();
}

var intervalRef;

function clearTimers() {
  if(intervalRef) {clearInterval(intervalRef);}
}

function startTimers() {
  intervalRefSec = setInterval(function() {
    newHeading(course,heading);
    if (course!=heading) drawCompass(heading);
  },200);
}

Bangle.on('lcdPower',function(on) {
  if (on) {
    g.clear();
    Bangle.drawWidgets();
    startTimers();
    drawAll();
  }else {
    clearTimers();
  }
});

function drawAll(){
  g.setColor(1,0.5,0.5);
  g.fillRect(118,150,122,165);
  g.fillPoly([120,130,110,150,130,150]);
  g.setColor(1,1,1);
  drawN();
  drawCompass(heading);
}

g.clear();
Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
// load widgets can turn off GPS
Bangle.setGPSPower(1);
drawAll();
startTimers();
Bangle.on('GPS', onGPS);
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

