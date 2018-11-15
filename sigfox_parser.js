//  sigfox_parser is a thethings.io Cloud Function that is called when the
//  Sigfox Backend delivers a sensor device message to thethings.io (via HTTP callback).

//  Message looks like 0038028012709870:
//  Message ID: 0038 (running sequence number, starting at 0)
//  Temperature: 028.0 (degrees Celsius)
//  Light Level: 127.0
//  Acceleration: 987.0

//  This function returns the sensor values as:
//  [ { key: 'mid', value: 38 },
//    { key: 'tmp', value: 28.0 },
//    { key: 'lig', value: 127.0 },
//    { key: 'acl', value: 987.0 } ]

//  This should match the list of sensors in the microbit Setup Sigfox function call.
const sensors = ["tmp", "lig", "acl"];

function main(params, callback){
  console.log(JSON.stringify(params)); ////
  //  Parse the 12-byte payload in the Sigfox message to get the sensor values.
  //  Upon completion, callback will be passed an array of { key, value } sensor values.
  if (!params) return callback(null, []);  //  Nothing to parse, quit.
  let data = params.data;
  
  //  Convert sensor values from text into an array of { key, values }.
  const sensorValues = [];
  const sensorsWithMessageID = ["mid"].concat(sensors);
  sensorsWithMessageID.forEach(sensor => {
    //  data looks like "0038028012709870". We decode the data 4 digits at a time.
    if (data.length < 4) { return; }  //  If no more digits to decode, we stop.
    const scaledValueText = data.substr(0, 4);  //  Get the next 4 digits to decode.
    const scaledValue = parseInt(scaledValueText, 10);  //  Convert the 4 digits into a number.
    const value = scaledValue / 10.0;  //  Divide by 10.
    sensorValues.push({ key: sensor, value: value });  //  Add the field to the decoded result.
    data = data.substr(4);  //  Continue decoding the next 4 digits.
  });
  //  Return the sensor value array to thethings.io.
  callback(null, sensorValues);

  /*
  const sensorValues = {};
  const custom = params.custom;
  if (custom) {
    //  If custom sensor values are produced by the Sigfox Backend message parser,
    //  return the custom values. So params.custom.tmp becomes tmp.
    Object.assign(sensorValues, custom);
  }
  if (data && data.length >= 2 && data.length <= 16) {  //  Ignore Structured Messages.
    //  If payload data contains one or more bytes, return each byte as a sensor value
    //  data looks like "0038028012709870".  We break into fields of 4 digits each, divide hmd, lig, acl by 10:
    //  mid=38, tmp=28.0, lig=127.0, acl=987.0.
    if (data.length >= 4) sensorValues.mid = parseInt(data.substr(0, 4), 10);
    if (data.length >= 8) sensorValues.tmp = parseInt(data.substr(4, 4), 10) / 10.0;
    if (data.length >= 12) sensorValues.lig = parseInt(data.substr(8, 4), 10) / 10.0;
    if (data.length >= 16) sensorValues.acl = parseInt(data.substr(12, 4), 10) / 10.0;
  }
  */
}
