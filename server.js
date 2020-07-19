const express = require('express');
const app = express();

const formidable = require('express-formidable');
app.use(formidable());

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

const http = require('http').createServer(app);
const bcrypt = require('bcrypt');
const fileSystem = require('fs');

const jwt = require('jsonwebtoken');
const accessTokenSecret = "mysecretaccessToken";

app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const socketIO = require("socket.io")(http);
let socketId = "";
const users = [];

const mainUrl = "http://localhost:3000";
socketIO.on("connection", (socket) => {
    console.log("User Connected", socket.id);
    socketId = socket.id
})

http.listen(3000, () => {
    console.log("server started");
    mongoClient.connect("mongodb+srv://sahilgargofficial:Y76daEMxuJ6gkta4@nature-instance-a0eqz.mongodb.net/test?authSource=admin&replicaSet=nature-instance-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true", (error, client) => {
        const database = client.db("my_social_network");
        console.log("database connected")

        app.get("/signup", (req, res) => {
            res.render("signup");
        })
        app.post("/signup", (req, result) => {
            const name = req.fields.name;
            const email = req.fields.email;
            const username = req.fields.username;
            const password = req.fields.password;
            const gender = req.fields.gender;

            database.collection("user").findOne({
                    $or: [
                        {"email": email},
                        {"username": username}
                    ]
                },
                function (error, user) {
                    if (user == null) {
                        bcrypt.hash(password, 10, function (err, hash) {
                            database.collection("user").insertOne({
                                "name": name,
                                "username": username,
                                "email": email,
                                "password": hash,
                                "gender": gender,
                                "profileImage": "",
                                "coverPhoto": "",
                                "dob": "",
                                "city": "",
                                "country": "",
                                "aboutMe": "",
                                "friends": [],
                                "pages": [],
                                "notifications": [],
                                "groups": [],
                                "posts": []
                            }, function (error, data) {
                                result.json({
                                    "status": "success",
                                    "message": "Signed Up successfully"
                                })
                            })
                        })
                    } else {
                        result.json({
                            "status": "error",
                            "message": "Username or Password Already Exist"
                        })
                    }
                });
        })
    })
})

