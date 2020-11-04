const router = require("express").Router();
let User = require("../models/user");
// get the schema from models/user
// think of it as an object class

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

// GET exisitng user
router.route("/:id").get((req, res) => {
  // :id refers to the url. see insomnia
  User.findById(req.params.id) // if you want to query another field, use find
    .then((user) => res.json(user)) // user is the response from the database, if it finds a user
    .catch((err) => res.status(400).json("error: " + err));
});

// DELETE exisitng user
router.route('/:id').delete((req, res) => {
  User.findById(req.params.id)
  .then(() => res.json("user deleted!"))
  .catch(err => res.status(400).json("error: " + err))
})

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

// GET all users
router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("error: " + err));
});

module.exports = router;
