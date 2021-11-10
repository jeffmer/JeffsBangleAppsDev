/* GPS message format
{ "lat": number,      // Latitude in degrees
  "lon": number,      // Longitude in degrees
  "alt": number,      // altitude in M
  "speed": number,    // Speed in kph
  "course": number,   // Course in degrees
  "time": Date,       // Current Time (or undefined if not known)
  "satellites": 7,    // Number of satellites
  "fix": 1            // NMEA Fix state - 0 is no fix
  "hdop": number,     // Horizontal Dilution of Precision
}
*/

var W = g.getWidth();
var H = g.getHeight();

var satellites=0;
var fix=0;
var client = false;

function drawIcon(fix,x,y){
    if (!fix) {
      g.drawImage(require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/ACO63QGLF8YpDAoowoF1QwEF1aMsL+S/uFQowRsoACF6oGLABGJF4YxVACetF4wxnF5Iwl1utF5AwEhIACFzgvKGIQuDGDYvCGBdeF8bBCr9eAANdrtXq1WF8lXFAQAFq8zF8WtrwnBq9dMIVeNAQwDd7qRFAA5qBrwuaF4zyKF4VlGFbDBr4vjGA7KCAoQviGAwvFGEbzFF4NdA4hgiMIgvhGBtdq1eTAovjGAVXF8IwLxIvIGDWJGBWCq4uGF7U7r5hLxIvhnU7MRYyBF7tlr4wCsowLMgWJLzJKBGAQxCMZgubAAQxDnVf/wthF4wxDAAImbF54yDF91lF8gA/AH4A/AH4AWA")),x,y,{scale:2});
    } else {
      g.drawImage(require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/ABWJAAQvvGNoyFSuAw/GH4nPGEzsJF6dlAAQxTGC2JF4YxUF6mtFwoxRF65fGGE4vKGAkJAAQva1oABF5IxCFwYwGF65gKsteF5QAUF4RgDr9eAANdrtXq1WF8eJq4oCAAtXmYvi1teE4NXrphCrxoCGAYuZF4ryLNQNeFzQvGGBQvCsowhxIvIYYNfF8QwIZQQFCF8IwHF4owpF4NdA4gvhGAovhGBtdq1eTAoviGAdXF8IwKGIIvIGE1eq4uGF7U7neJMJT2EF7s6GBb2EF7dlr4wCr4xMAAReZJQIwCGJ2tFzYACGIYyBfA4sZF44xDAAIncF5wyDF91lF8gA/AH4A/AH4AXA")),x,y,{scale:2});
    }
}

function drawAll(){
  g.clearRect(0,24,W-1,H-1);
  drawIcon(fix,0,24);
  g.setColor(-1);
  g.setFont("Vector",32).setFontAlign(1,-1);
  g.drawString("GPS\nServer",W-20,60);
  g.setFont("Vector",24).setFontAlign(-1,-1);;
  g.drawString("Satellites: "+satellites,10,150);
  g.drawString(client?"Connected":"",10,174);
  Bangle.drawWidgets();
}

var buf = new ArrayBuffer(34);
var view = new DataView(buf);

function pack(d){
    function ck(v){ return isNaN(v)?-1:v; }
    view.setFloat32(0,ck(d.lat));
    view.setFloat32(4,ck(d.lon));
    view.setFloat32(8,ck(d.alt));
    view.setFloat32(12,ck(d.speed));
    view.setFloat32(16,ck(d.course));
    view.setFloat64(20,d.time?d.time.getTime():0);
    view.setInt8(28,d.satellites);
    view.setInt8(29,d.fix);
    view.setFloat32(30,ck(d.hdop));
}

NRF.setServices({
  "974e0001-1b9a-4468-a83d-7f811b3dbaff": {
    "974e0002-1b9a-4468-a83d-7f811b3dbaff": {
      value : buf,
      readable : true,
    }
  }
}, { uart : false });

function update(d){
    satellites= d.satellites;
    fix = d.fix;
    pack(d);
    NRF.updateServices({
        "974e0001-1b9a-4468-a83d-7f811b3dbaff": {
          "974e0002-1b9a-4468-a83d-7f811b3dbaff": {
            value : buf,
            readable : true,
          }
        }
      });
}

NRF.on("connect",(d)=>{
  client=true; Bangle.setLCDPower(1);
});

NRF.on("disconnect",(d)=>{
  client=false; Bangle.setLCDPower(1);
});


// Change the name that's advertised
NRF.setAdvertising({}, {name:"gps"});

Bangle.setGPSPower(1,"gpsserver");
Bangle.on("GPS",update);

Bangle.on('lcdPower',function(on) {
  if (on) drawAll();
});

setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

g.clear();
Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
drawAll();


