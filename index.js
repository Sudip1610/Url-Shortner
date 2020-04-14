
var express = require('express');
var bodyParser = require('body-parser');
var dns = require('dns');
var cors = require('cors');
const mongoose=require('mongoose');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

app.use(cors());

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);

mongoose.connect('mongodb://sudip123:sudip123@cluster0-shard-00-00-ilzjo.mongodb.net:27017,cluster0-shard-00-01-ilzjo.mongodb.net:27017,cluster0-shard-00-02-ilzjo.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(() => console.log("DB Connected!"))
  .catch(err => {
    console.log(`DB Connection Error: ${err.message}`);
  });;


/** this project needs to parse POST bodies **/
// you should mount the body-parser here

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected');
});

var urlSchema = new mongoose.Schema({
    originalURL: String,
    shortenedURL:String
});

var Model=mongoose.model('Model',urlSchema);

  
// your first API endpoint... 
app.post('/api/shorturl/new', (req, res, next) => {
    const originalURL = req.body.url;
    const urlObject = new URL(originalURL);
    dns.lookup(urlObject.hostname, (err, address, family) => {
      if (err) {
        res.json({
          originalURL: originalURL,
          shortenedURL: "Invalid URL"
        });
      } else {
        let shortenedURL = Math.floor(Math.random()*100000).toString();
        
        // create an object(document) and save it on the DB
        let data = new Model({
          originalURL: originalURL,
          shortenedURL: shortenedURL
          });
      
        data.save((err, data) => {
          if (err) {
            console.error(err);
                   }
        });
      
        res.json({
          originalURL: originalURL,
          shortenedURL: shortenedURL
        })
      };
    });
  });


  app.get('/api/shorturl/new/:url',(req,res)=>{

  var query = Model.find({shortenedURL:req.params.url});

// selecting the `name` and `occupation` fields
query.select('originalURL -_id');

// execute the query at a later time
query.exec(function (err, person) {
  if (err || !person.length)
  {
    res.json({'error':'Invalid Url'});
  } 
  // Prints "Space Ghost is a talk show host."
  else
  {
    res.redirect(person[0].originalURL);
  }
  
});
});
    
app.listen(port, function () {
  console.log('Node.js listening ...');
});
