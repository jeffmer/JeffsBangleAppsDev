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

// Change the name that's advertised
NRF.setAdvertising({}, {name:"gps"});


function update(d){
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
  E.showMessage("Connected "+d,"GPS Server");
});

E.showMessage("Running ","GPS Server");

Bangle.setGPSPower(1,"gpsserver");
Bangle.on("GPS",update);

