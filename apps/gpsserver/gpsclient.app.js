var gatt,characteristic;

NRF.requestDevice({ filters: [{ name: 'gps' }] }).then(function(device) {
  console.log("Found");
  return device.gatt.connect();
}).then(function(g) {
  console.log("Connected");
  gatt = g;
  return gatt.getPrimaryService(
    "974e0001-1b9a-4468-a83d-7f811b3dbaff");
}).then(function(service) {
  return service.getCharacteristic(
    "974e0002-1b9a-4468-a83d-7f811b3dbaff");
}).then(function (c) {
  console.log("Got Characteristic");
  characteristic = c;
});

function unpack(v){
    return {
      lat:v.getFloat32(0),
      long:v.getFloat32(4),
      alt:v.getFloat32(8),
      speed:v.getFloat32(12),
      course:v.getFloat32(16),
      time:new Date(v.getFloat64(20)),
      satellites:v.getInt8(28),
      fix:v.getInt8(29),
      hdop:v.getFloat32(30),
    }
}
function readMsg() {
    characteristic.readValue().then(function(d) {
        console.log("Got:", unpack(d));
      });
}