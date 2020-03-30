var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");


// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Require models
var db = require("./models");

// // Require all models
// var db = require("..Scrape-mongoose/models");

var PORT = process.env.PORT || 3000;

// Make public a static folder
app.use(express.static("public"));
// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

//  Connect to the Mongo DB
mongoose.connect("mongodb://localhost/articledb", { useNewUrlParser:true, useUnifiedTopology:true });


// require handlebars
  var exphbs = require("express-handlebars");
  // app.engine("handlebars",exphbs({defaultLayout: "main"}));
  // app.set("view engine", "handlebars");


  




//  Routes

// A GET route for scraping the echoJS website

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/scrape", function(req, res) {
  db.Article.find({
    saved:false

  }) .remove()

  // First, we grab the body of the html with axios
  axios.get("https://phys.org/space-news/").then(async function(response) {
    
  // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
      // scrape articles
     await $(".sorted-article-content").each(function(i, element) {
      
      // console.log("element", element);
      // Save an empty result object
      var result = {};
     
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
     .children("h3")
     .children("a")
      .text();
        
      result.link = $(this)
      .children("h3")
      .children("a")
      .attr("href");

        result.note = $(this)
        .children("p")
        .text();
       
        // console.log(result);
 
        // Create a new Article using the `result` object built from scraping
        if (result.title && result.link && result.note) {
          db.Article.create(result)
          .then(function(dbArticle) {})
          .catch(function(err) {
            // If an error occurred, log it
                 console.log(err);
               });
        }
      })
    })
  });
      

  
         
       

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({}).exec(function(err, found) {
    if (err) {
      console.log(err);
    } else {
      res.json(found);
    }
  });
});

// Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});
     
// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");

  })
