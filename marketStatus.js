exports.myHandler = function(event, context, callback) {
    const ForexDataClient = require("forex-quotes");

    let client = new ForexDataClient('<API_KEY>');
    client.marketStatus().then(response => {
        console.log(response);
    });
    callback(null, "some success message");
       // or
       // callback("some error type");
}
