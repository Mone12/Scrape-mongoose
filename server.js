var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// // Require all models
// var db = require("..Scrape-mongoose/models");

var PORT = process.env.PORT || 3000;

// Make public a static folder
app.use(express.static("public"));

//  Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser:true, useUnifiedTopology:true });

// require handlebars
  var exphbs = require("express-handlebars");
  app.engine("handlebars",exphbs({defaultLayout: "main"}));
  app.set("view engine", "handlebars");


  // Use morgan logger for logging requests
      app.use(logger("dev"));
  // Parse request body as JSON
      app.use(express.urlencoded({ extended: true }));
      app.use(express.json());




//  Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  
  // First, we grab the body of the html with axios
  axios.get("https://phys.org/space-news/").then(function(response) {
    
  // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
      // scrape articles
    $(".sorted-article").each(function(i, element) {
      
      // Save an empty result object
      var result = [];
     
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
      .children("h3")
      .text();
        
      result.link = $(this)
        .children("a")
        .attr("href");

        result.description = $(this)
        .children("p")
        .text();
      
    // Create a new Article using the `result` object built from scraping
      db.spaceArticle.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    })
    res.send("Scrape Complete");
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

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});