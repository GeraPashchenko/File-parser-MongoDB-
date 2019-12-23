var express = require("express");
var fs = require("fs");
var jsonToCsv = require('convert-json-to-csv');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";
const csvtojson = require("csvtojson");
var csvData = [];//data from users.csv
var jsonData = [];//data from db

//app settings
var app = express();
app.use(express.static(__dirname));
app.listen(8081);

// constructor for element of the list of users
function user(UserName, FirstName, LastName, Age) {
  this.UserName = UserName;
  this.FirstName = FirstName;
  this.LastName = LastName;
  this.Age = Age;
}

//connection to DB
MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
  if (err) throw err;
  client.db("test").collection("users").find().toArray(function (err, results) {

    results.forEach(function (el) {
      jsonData.push(new user(el.UserName, el.FirstName, el.LastName, el.Age));
    });
    
    //if we need our data to store in the file
   //fs.writeFileSync("users.json",JSON.stringify(jsonData,null,4)); 

    fs.writeFile("usersFromDB.csv", jsonToCsv.convertArrayOfObjects(jsonData, ["UserName", "FirstName", "LastName", "Age"]), function (err) {//data from MongoDB to csv
      if (err) throw err;
    });
    client.close();
  });
});

//app routing
app.get("/", function (req, res) {
  res.sendFile("index.html");
});

app.get("/download", function (req, res) {
  fs.readFile("usersFromDB.csv", function (err, data) {
    res.set({ "Content-Disposition": "attachment; filename=\"usersFromDB.csv\"" });
    res.send(data);
  });
});

// ///////////////Code to insert csv users from self-created csv file to MongoDb////////////
// csvtojson()
//   .fromFile("usersToDB.csv")
//   .then(data => {
//     csvData = data;
//     MongoClient.connect(
//         url,
//         { useNewUrlParser: true, useUnifiedTopology: true },
//         (err, client) => {
//           if (err) throw err;

//           client
//             .db("test")
//             .collection("users")
//             .insertMany(csvData, (err, res) => {
//               if (err) throw err;

//               console.log(`Inserted: ${res.insertedCount} rows`);
//               client.close();
//             });
//         }
//       );
//     });
