var mongoose = require('mongoose');



var ServiceSchema = mongoose.Schema({
    arTitle: {
        type: String,
    },
    arContent: {
        type: [String]
    },
    enTitle: {
        type: String,
    },
    enContent: {
        type: [String]
    },
    image: {
        type: String
    },
    type:{
        type:String
    }

}
);


var AboutSchema = mongoose.Schema({

    arAbout: {
        type: String
    },

    enAbout: {
        type: String
    },

}
);


var SocialMediaSchema = mongoose.Schema({

    name: {
        type: String
    },

    value: {
        type: String
    },
    type :{
        type :String    
    }

}
);


var ContactUserSchema = mongoose.Schema({

    arFullName: {
        type: String
    },

    arJobTitle: {
        type: String
    },
    enFullName: {
        type: String
    },

    enJobTitle: {
        type: String
    },
    phone: {
        type: String
    },
    image: {
        type: String
    },

}
);



var Service = mongoose.model('service', ServiceSchema);
var About = mongoose.model('about', AboutSchema);
var ContactUser = mongoose.model('contact', ContactUserSchema);
var SocialMedia = mongoose.model('socialMedia', SocialMediaSchema);
module.exports = {
    Service: Service,
    About: About,
    ContactUser, ContactUser,
    SocialMedia: SocialMedia
}