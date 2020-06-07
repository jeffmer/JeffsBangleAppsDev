
var buf = Graphics.createArrayBuffer(240,160,1,{msb:true});
Bangle.setLCDTimeout(30);

function flip() {
 g.drawImage({width:240,height:160,bpp:1,buffer:buf.buffer},0,40);
 buf.clear();
}

function calibrate(){
    var max={x:-32000, y:-32000, z:-32000},
        min={x:32000, y:32000, z:32000};
    var ref = setInterval(()=>{
        var m = Bangle.getCompass();
        max.x = m.x>max.x?m.x:max.x;
        max.y = m.y>max.y?m.y:max.y;
        max.z = m.z>max.z?m.z:max.z;
        min.x = m.x<min.x?m.x:min.x;
        min.y = m.y<min.y?m.y:min.y;
        min.z = m.z<min.z?m.z:min.z;
    }, 100);
    return new Promise((resolve) => {
       setTimeout(()=>{
         if(ref) clearInterval(ref);
         resolve({x:(max.x+min.x)/2,y:(max.y+min.y)/2,z:(max.z+min.z)/2});
       },15000);
    });
}

var O = { x: -60, y: -14.5, z: 9 };

function reading(){
    var start = Date.now();
    var m = Bangle.getCompass();
    var g = Bangle.getAccel();
    m.dx =m.x-O.x; m.dy=m.y-O.y; m.dz=m.z-O.z;
    var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
    if (d<0) d+=360;
    var phi = Math.atan(-g.x/-g.z);
    var cosphi = Math.cos(phi), sinphi = Math.sin(phi);
    var theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
    var costheta = Math.cos(theta), sintheta = Math.sin(theta);
    var xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
    var yh = m.dz*sinphi - m.dx*cosphi;
    var psi = Math.atan2(yh,xh)*180/Math.PI;
    if (psi<0) psi+=360;
    // display
    buf.setFont('6x8',2);
    buf.drawString("BX: "+m.dy,20,0);buf.drawString("X: "+Math.floor(g.y*1000),120,0);
    buf.drawString("BY: "+m.dx,20,20);buf.drawString("Y: "+Math.floor(-g.x*1000),120,20);
    buf.drawString("BZ: "+m.dz,20,40);buf.drawString("Z: "+Math.floor(-g.z*1000),120,40);
    buf.drawString("HC: "+Math.floor(d),20,60);
    buf.drawString("Roll: "+Math.floor(phi*180/Math.PI),20,80);
    buf.drawString("Pitch: "+Math.floor(theta*180/Math.PI),20,100);
    buf.drawString("TC: "+Math.floor(psi),20,120);
    var duration = Date.now()-start;
    buf.drawString("Time: "+Math.floor(duration)+"ms",20,140);
    flip();
}

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});

g.clear();
g.setColor(1,1,1);
Bangle.setCompassPower(1);
setInterval(reading,330);
/*
buf.setFont('6x8',2);
buf.drawString("Calibrate",20,40);
flip();
calibrate().then((f)=>{
    O=f;
    console.log(O);
    setInterval(reading,200);
});
*/
