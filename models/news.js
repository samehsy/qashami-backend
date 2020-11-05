var mongoose = require('mongoose');
  


var NewsSchema = mongoose.Schema({
    title: {
        type: String,
    },
    content:{
        type:String
    },
    arName: {
        type: String,
    },
    enName: {
        type: String,
    }
}
);

module.exports = mongoose.model('news', NewsSchema);