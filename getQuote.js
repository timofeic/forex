const ForexDataClient = require('forex-quotes');
const AWS = require('aws-sdk');
AWS.config.update({ region: "eu-west-1"});

const encrypted = process.env['forexAPIKey'];
let decrypted;

function getQuotes(event, context, callback) {
    let client = new ForexDataClient(decrypted);

    var docClient = new AWS.DynamoDB.DocumentClient();
    var table = "rawQuoteData";

    // probably a better way of doing this. response isn't available outside the scope
    // of this function.
    client.getQuotes(['GBPUSD', 'EURUSD']).then(response => {
      response.forEach(function(item) {
        var params = {
          TableName:table,
          Item:{
            "pair": item.symbol,
            "price": item.price,
            "timestamp": item.timestamp,
            "expiry": item.timestamp + 86400
          }
        };
        docClient.put(params, function(err, data) {
          if (err) {
            console.error("Error JSON:", JSON.stringify(err, null, 2));
          } else {
            console.log("PutItem succeeded:", params.Item.pair, "at", params.Item.timestamp);
          }
        });
      });
    });
    callback(null, "getQuotes success.");
}

exports.myHandler = function(event, context, callback) {
    if (decrypted) {
        getQuotes(event, context, callback);
    } else {
        // Decrypt code should run once and variables stored outside of the function
        // handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            decrypted = data.Plaintext.toString('ascii');
            getQuotes(event, context, callback);
        });
    }
    callback(null, "some success message");
}
