exports.myHandler = function(event, context, callback) {
    const AWS = require('aws-sdk');

    AWS.config.update({
      region: "eu-west-1"});

    var docClient = new AWS.DynamoDB.DocumentClient();
    var rawTable = "rawQuoteData";
    var aggTable = "aggQuoteData";
    // move the list of pairs to a dDB table
    var pairs = ['EURUSD','GBPUSD'];
    // query current data compare update if necessary.
    // do we scan all data? at once, or for each pair? what is the size of the data
    // I think its best to query each pair.

    // Today's date at 0000, to figure out daily high/low
    var d = new Date();
    d.setHours(0,0,0,0);


    function findMinMax(arr) {
        let min = arr[0].price, max = arr[0].price;

        for (let i = 1, len=arr.length; i < len; i++) {
            let v = arr[i].price;
            min = (v < min) ? v : min;
            max = (v > max) ? v : max;
        }
        return {"min":min, "max":max};
    }

    for (let i = 0, len=pairs.length; i < len; i++) {
        var params = {
            TableName : rawTable,
            KeyConditionExpression: "pair = :pair and #ts >= :timestamp",
            ExpressionAttributeNames: {
                "#ts": "timestamp"
            },
            ExpressionAttributeValues: {
                ":pair": pairs[i],
                ":timestamp": d.getTime()/1000
            }
        };

        docClient.query(params, function(err, data) {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                console.log("Query succeeded.");
                // console.log(data.Items);
                // update the daily session pair. create it if it doesn't exist.
                var params = {
                    TableName: aggTable,
                    Key: {
                        "session": "daily",
                        "pair": pairs[i],
                    },
                    UpdateExpression: "SET price = :price",
                    ExpressionAttributeValues:{
                        ":price": findMinMax(data.Items)
                    },
                    ReturnValues:"UPDATED_NEW"
                };

                docClient.update(params, function(err, data) {
                    if (err) {
                        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                    }
                });
            }
        });
    }
    callback(null, "some success message");
       // or
       // callback("some error type");
}
