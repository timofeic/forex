//exports.myHandler = function(event, context, callback) {
    const ForexDataClient = require("forex-quotes");

    let client = new ForexDataClient('7azJarfThXHYEySeRRSBg7AilSWvsZQA');
    client.quota().then(response => {
        console.log(response);
    })
    //callback(null, "some success message");
       // or
       // callback("some error type");
//}
