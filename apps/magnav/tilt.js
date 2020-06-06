
var buf = Graphics.createArrayBuffer(240,160,1,{msb:true});
Bangle.setLCDTimeout(30);

function flip() {
 g.drawImage({width:240,height:160,bpp:1,buffer:buf.buffer},0,40);
 buf.clear();
}

function reading(){
    var m = Bangle.getCompass();
    var g = Bangle.getAccel();
    buf.setFont('6x8',2);
    if (!isNaN(m.heading)){
        buf.drawString("X:  "+m.y,20,0);buf.drawString("X:  "+Math.floor(-g.y*1000),120,0);
        buf.drawString("Y:  "+m.x,20,20);buf.drawString("Y:  "+Math.floor(-g.x*1000),120,20);
        buf.drawString("Z:  "+m.z,20,40);buf.drawString("Z:  "+Math.floor(-g.z*1000),120,40);
        buf.drawString("DX: "+m.dx,20,60);
        buf.drawString("DY: "+m.dy,20,80);
        buf.drawString("DZ: "+m.dz,20,100);
        buf.drawString("H:  "+Math.floor(m.heading),20,120);
        var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
        d = d<0?d+360:d>=360?d-360:d;
        buf.drawString("HC: "+Math.floor(d),20,140);
    } else {
        buf.drawString("CALIBRATE",20,80);
    }
    flip();
}

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});

g.clear();
g.setColor(1,1,1);
setInterval(reading,300);
Bangle.setCompassPower(1);