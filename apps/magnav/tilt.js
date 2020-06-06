
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

var O;

function reading(){
    var m = Bangle.getCompass();
    var g = Bangle.getAccel();
    buf.setFont('6x8',2);
    m.dx =m.x-O.x; m.dy=m.y-O.y; m.dz=m.z-O.z;
    buf.drawString("X:  "+m.y,20,0);buf.drawString("X:  "+Math.floor(g.y*1000),120,0);
    buf.drawString("Y:  "+m.x,20,20);buf.drawString("Y:  "+Math.floor(-g.x*1000),120,20);
    buf.drawString("Z:  "+m.z,20,40);buf.drawString("Z:  "+Math.floor(-g.z*1000),120,40);
    buf.drawString("DX: "+m.dx,20,60);
    buf.drawString("DY: "+m.dy,20,80);
    buf.drawString("DZ: "+m.dz,20,100);
    var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
    d = d<0?d+360:d>=360?d-360:d;
    buf.drawString("HC: "+Math.floor(d),20,140);
    flip();
}

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});

g.clear();
g.setColor(1,1,1);
Bangle.setCompassPower(1);
buf.setFont('6x8',2);
buf.drawString("Calibrate",20,40);
flip();
calibrate().then((f)=>{
    O=f;
    console.log(O);
    setInterval(reading,200);
});

