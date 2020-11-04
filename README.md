#### Installation
> backend

`npm init`

`npm install express mongoose node env cors`

`npm install`

*note:* 

`env: for environment variables`

`cors: connect/express middleware to enable CORS with various options`

<hr/>

#### Set Up

> server.js

```js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
// environment variables:
//  why: you don't want other people to have access to your db, so you store the uri in an .env

const app = express();
app.use(cors());
app.use(express.json());
// for parsing json

const uri = process.env.ATLAS_URI;
// unique key to access the database
// user: admin, password: ohnsg5G3KrCWl8tu

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
// start connection

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB connected!");
});
// connection started

// add routes here:
const UserRouter = require("./routes/user");
// directory: routes/user.js
app.use("/user", UserRouter);
// all routes defined in UserRouter will start with /user/*

const PORT = 5000;
// port it will run on locally

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
```

> .env

```
ATLAS_URI=mongodb+srv://admin:ohnsg5G3KrCWl8tu@cluster0.bmjdt.mongodb.net/tutorial?retryWrites=true&w=majority
```

`connect -> connect your application` 



> models/user.js

```js
// schema for a user

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

*note*: for simplicity, we'll be only working with username



> routes/user.js

```js
const router = require("express").Router();
let User = require("../models/user")
// get the schema from models/user
// think of it as an object class

router.route('/').post((req, res) => {
  // request, response
  const {username} = req.body;

  const newUser = new User({
    username
  })

  // here is where we communicate with the db. 
  newUser.save()
  .then(() => res.json("user added!")) // note: must have the () or it won't wait for a response before excecuting
  .catch(err => res.status(400).json("error: " + err)) // status: commonly, 200 is OK, 404 not found, 400 user error, 500 server error
})


module.exports = router;
```

<hr/>

##### Sanity Check!!

`npm start`

> test with insomnia



<hr/>

#### CRUD Operations: 

##### Create, Read, Update, Delete

> routes/user.js

*change POST to send back the new user id*

```js
// POST add new user
router.route("/").post((req, res) => {
  // request, response
  const { username } = req.body;
  console.log(username);
  const newUser = new User({
    username,
  });

  // here is where we communicate with the db.
  newUser
    .save()
    .then((user) => res.json("user added! " + user._id)) // have the database send back the user id
    // note: must have the () or it won't wait for a response before excecuting
    .catch((err) => res.status(400).json("error: " + err)); // status: commonly, 200 is OK, 404 not found, 400 user error, 500 server error
});
```

> GET user route

```js
// GET exisitng user
router.route("/:id").get((req, res) => {
  // :id refers to the url. see insomnia
  User.findById(req.params.id) // if you want to query another field, use find
    .then((user) => res.json(user)) // user is the response from the database, if it finds a user
    .catch((err) => res.status(400).json("error: " + err));
});
```

> DELETE user route

```js
// DELETE exisitng user
router.route('/:id').delete((req, res) => {
  User.findById(req.params.id)
  .then(() => res.json("user deleted!"))
  .catch(err => res.status(400).json("error: " + err))
})
```

> UPDATE user route

```js
// UPDATE existing user
router.route('/update/:id').post((req, res) =>{
  User.findById(req.params.id)
  .then(user =>{
    user.username = req.body.username
    // get the response from the database, and overwrite the old data with the new data

    user
      .save()
      .then(() => res.json("user updated!"))
      .catch((err) => res.status(400).json("error: " + err));
  })
})
```

> GET all users

```js
// GET all users
router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("error: " + err));
});
```



<hr/>

#### Connecting with Frontend
> frontend

`npx create-react-app my-app`

`npm i axios`

`npm start`

> App.js

```js
import React, { useEffect, useState } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [users, setUsers] = useState(['']);
  useEffect(() => {
    axios.get("http://localhost:5000/user/").then((res) => setUsers(res.data));
    // get all users
  });

  return (
    <div className="App">
      <header className="App-header">
        {users.map((u) => (
          <p>{u.username}</p>
        ))}
      </header>
    </div>
  );
}

export default App;
```




<hr/>

#### Uploading Files
> backend

`npm i gridfs-stream`

`npm i crypto`

`npm i multer`

`npm i multer-gridfs-storage`

> routes/files

```js
const router = require("express").Router();
// no need for a model

//connecting to db, init. gridstorage and creating a storage
const multer = require("multer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage");

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

// .env
require("dotenv").config();
const uri = process.env.ATLAS_URI;

// connection
const conn = mongoose.createConnection(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads", // name of the bucket
  });
});


// init storage
const storage = new GridFsStorage({
  url: uri,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage: storage });

// POST add a document
router.post("/upload", upload.array("documents", 1), (req, res) => { // documents refer to json
  if(req.files[0].id === undefined){
    return res.status(400).json("error: ", req)
  }
  res.json("success: " + req.files[0].id)
});

module.exports = router
```

> server.js

add:

```js
const FilesRouter = require("./routes/files")
app.use("/files", FilesRouter)
```



<hr/>

#### Basic File Operations

> GET a document

```js
// GET a document
router.get("/:id", (req, res) => {
  gfs
    .find({
      _id: mongoose.Types.ObjectId(req.params.id),
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist",
        });
      }
      gfs.openDownloadStream(mongoose.Types.ObjectId(req.params.id)).pipe(res);
    });
});
```

> DELETE a document

```js
// POST a document
router.post("/delete/:id", (req, res) => {
  gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) return res.status(404).json({ err: err.message });
    res.json("document deleted");
  });
});
```

