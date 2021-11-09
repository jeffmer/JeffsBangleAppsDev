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

var gpsdata = {lat:23.1234,long:-4.1234,alt:0,speed:67.3,course:160.0,time:Date.now(),satellites:4,fix:1,hdop:42.7};

var buf = new ArrayBuffer(34);
var view = new DataView(buf);

function pack(d){
    function ck(v){ return isNaN(v)?0:v; }
    view.setFloat32(0,ck(d.lat));
    view.setFloat32(4,ck(d.long));
    view.setFloat32(8,ck(d.alt));
    view.setFloat32(12,ck(d.speed));
    view.setFloat32(16,ck(d.course));
    view.setFloat64(20,d.time?d.time.getTime():0);
    view.setInt8(28,d.satellites);
    view.setInt8(29,d.fix);
    view.setFloat32(30,ck(d.hdop));
}

pack(gpsdata);

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


count = 0;

setInterval(function(){
    ++count;
    gpsdata.time=Date.now();
    gpsdata.satellites=count;
    pack(gpsdata);
    NRF.updateServices({
        "974e0001-1b9a-4468-a83d-7f811b3dbaff": {
          "974e0002-1b9a-4468-a83d-7f811b3dbaff": {
            value : buf,
            readable : true,
          }
        }
      });
      E.showMessage("Running "+count,"GPS Server");
},3000);


E.showMessage("Running "+count,"GPS Server");



