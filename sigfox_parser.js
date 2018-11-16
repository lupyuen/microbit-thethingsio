//  sigfox_parser is a thethings.io Cloud Function that is called when the
//  Sigfox Backend delivers a sensor device message to thethings.io 
//  (via HTTP callback).  We decode the message into individual sensor
//  values.

//  Message looks like "0038028012709870", which will be decoded as:
//  - Message ID: 0038 (running sequence number, starting at 0)
//  - Temperature: 028.0 (degrees Celsius)
//  - Light Level: 127.0
//  - Acceleration: 987.0
//  Each field is 4 digits, scaled by 10 except Message ID.

//  This function returns the decoded sensor values in thethings.io format:
//  [ { key: 'mid', value: 38 },
//    { key: 'tmp', value: 28.0 },
//    { key: 'lig', value: 127.0 },
//    { key: 'acl', value: 987.0 } ]

//  List of expected sensor fields.  If you change the sensors in the 
//  microbit "Setup Sigfox" function call, update this too.
const sensors = ["tmp", "lig", "acl"];

//  For convenience, insert the Message ID field before the sensor fields.
//  This produces ["mid", "tmp", "lig", "acl"]
const fields = ["mid"].concat(sensors);

function main(params, callback) {
  //  Parse the 12-byte payload in the Sigfox message to get the sensor values.
  //  Upon completion, callback will be passed an array of { key, value }
  //  sensor values.
  console.log(JSON.stringify(params));  //  Dump params to Developer Console.
  if (!params) return callback(null, []);  //  If nothing to parse, quit.
  let data = params.data;  //  We will parse "data", the Sigfox message.
  
  //  Decode sensor values in "data" into an array of { key, values }.
  const sensorValues = [];  //  Will contain array of { key, values }.
  //  Repeat for each field "mid", "tmp", "lig", "acl"...
  fields.forEach(sensor => {
    //  data looks like "0038028012709870"
    //  We decode the data 4 digits at a time.
    if (data.length < 4) { return; }  //  If no more digits to decode, we stop.
    const valueText = data.substr(0, 4);  //  Get the next 4 digits to decode.
    
    //  Convert the 4 digits into a number ("10" means decimal).
    let value = parseInt(valueText, 10);
    if (sensor !== "mid") {  //  If this is not the message ID...
    	value = value / 10.0;  //  Divide the value by 10.
    }
    
    //  Add the value to the decoded sensor values.
    //  Looks like: { key: 'tmp', value: 28.0 }
    sensorValues.push({ key: sensor, value: value });
    data = data.substr(4);  //  Continue decoding the next 4 digits.
  });
  
  //  We have finished decoding the sensor values "mid", "tmp", "lig", "acl".
  //  Return the decoded sensor values to thethings.io. Looks like:
  //  { key: 'mid', value: 38 }, { key: 'tmp', value: 28.0 }, ...
  callback(null, sensorValues);
}
