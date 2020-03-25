var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});
const tableName = "PTRDocs-37cc5vbppngc5hzz6znwmsp3yq-test";

var dbHelper = function () { };
var docClient = new AWS.DynamoDB.DocumentClient();

 dbHelper.prototype.addDocument = (title, id, description, expDate, remDate) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
              'title' : title,
              'id': id,
              'description': description,
              'expDate': expDate, 
              'remDate': remDate
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
} 

dbHelper.prototype.getDocuments = (userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName            
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.getDocumentsByTitle = (document, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName ,
            FilterExpression: " contains (#title, :document)",
            ExpressionAttributeNames: {
                "#title": "title",
            },
            ExpressionAttributeValues: {
                ":document": document
            }           
        }
        docClient.scan(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            resolve(data.Items)
            
        })
    });
}

/* dbHelper.prototype.removeDocument = (document, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                "userId": userID,
                "movieTitle": movie
            },
            ConditionExpression: "attribute_exists(movieTitle)"
        }
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log(JSON.stringify(err));
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            resolve()
        })
    }); 
}*/

module.exports = new dbHelper();