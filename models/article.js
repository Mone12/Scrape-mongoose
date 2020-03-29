var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
  // `title` is of type String
  title: {
    type: String,
    // required: true
  },

  // `body` is of type String
  link: {
    type: String,
    // required: true

  },

  note: {
    type: String,
  }

  // note: [{
  //   type: Schema.Types.ObjectId,
  //   ref:"Note"
  // }]
})

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Note model
module.exports = Article;