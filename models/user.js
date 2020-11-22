var mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

// User Schema
var UserSchema = mongoose.Schema({
  password: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    index: true,
  },
  firstName: String,
  lastName: String,
  profilePic: {
    type: String,
    default: "defult-profile-pic.jpg",
  },
});

var User = (module.exports = mongoose.model("User", UserSchema));

module.exports.getUserByEmail = function (email, callback) {
  query = { email: email };
  User.findOne(query, callback);
};

module.exports.getName = function (userId, callback) {
  User.findOne({ _id: userId })
    .lean()
    .exec(function (err, usr) {
      callback(err, usr.name);
    });
};

module.exports.comparePassword = function (password, hash, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) throw err;
      console.log(hash);
    });
  });

  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.addUser = function (newuser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(newuser.password, salt, function (err, hash) {
      if (err) throw err;
      newuser.password = hash;
      newuser.save().then((user) => {
        delete user["password"];
        callback(user);
      });
    });
  });
};

module.exports.changePassword = function (newPass, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(newPass, salt, function (err, hash) {
      if (err) callback(err, null);
      callback(null, hash);
    });
  });
};
