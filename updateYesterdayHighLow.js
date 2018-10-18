exports.myHandler = function(event, context, callback) {
    const AWS = require('aws-sdk');

    AWS.config.update({
      region: "eu-west-1"});

    var docClient = new AWS.DynamoDB.DocumentClient();
    var aggTable = "aggQuoteData";

    var params = {
        TableName : aggTable,
        KeyConditionExpression: "#sess = :session",
        ExpressionAttributeNames: {
            "#sess": "session"
        },
        ExpressionAttributeValues: {
            ":session": "daily"
        }
    };

    docClient.query(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
        } else {
            console.log("Query succeeded.");
            // console.log(pairs[i]);
            console.log(data.Items);

            for (let i = 0, len=data.Items.length; i < len; i++) {
                // update the daily session pair. create it if it doesn't exist.
                var params = {
                    TableName: aggTable,
                    Key: {
                        "session": "yesterday",
                        "pair": data.Items[i].pair,
                    },
                    UpdateExpression: "SET price = :price",
                    ExpressionAttributeValues:{
                        ":price": data.Items[i].price
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
        }
    });
    callback(null, "some success message");
       // or
       // callback("some error type");
}
