const express = require("express");

const bodyParser = require("body-parser");

const fs = require("fs");

const { exec } = require("child_process");

const path = require("path");

const multer = require("multer");

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

const app = express();

app.set('view engine','ejs')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))

const PORT = process.env.PORT || 9000;

app.use(express.static("public"));


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  const videoFilter = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".mp4" &&
      ext !== ".avi" &&
      ext !== ".flv" &&
      ext !== ".wmv" &&
      ext !== ".mov" &&
      ext !== ".mkv" &&
      ext !== ".gif" &&
      ext !== ".m4v"
    ) {
      return callback("This Extension is not supported");
    }
    callback(null, true);
  };

  
var maxSize = 200 * 1024 * 1024

var videotomp3upload = multer({ storage: storage,limits:{fileSize:maxSize},fileFilter: videoFilter });

app.get('/privacypolicy',(req,res) => {
    res.render('privacypolicy',{title:"Official Privacy Policy Page - MergeVideosOnline.com"})
})

app.get('/contactus',(req,res) => {
    res.render('contactus',{title:"Official Contact Us Page - MergeVideosOnline.com"})
})

app.get("/", (req, res) => {
    res.render("mergevideos",{title:"Merge Multiple Videos Mp4 Online For Free 2020"});
});

app.post("/mergevideos", videotomp3upload.array("file", 100), (req, res) => {
    var list = ""
    var listFilePath = "public/uploads/" + Date.now() + "list.txt";
  
  var outputFilePath = Date.now() + "output.mp4";
    if (req.files) {
      req.files.forEach((file) => {
        list += `file ${file.filename}`;
        list += "\n";
      });
  
      var writeStream = fs.createWriteStream(listFilePath);
  
      writeStream.write(list);
  
      writeStream.end();
  
      exec(
        `ffmpeg -safe 0 -f concat -i ${listFilePath} -c copy ${outputFilePath}`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            req.files.forEach((file) => {
              fs.unlinkSync(file.path);
            });
  
            fs.unlinkSync(listFilePath);
            fs.unlinkSync(outputFilePath);
            return;
          } else {
            console.log("audio are successfully merged");
            res.download(outputFilePath, (err) => {
              if (err) {
                req.files.forEach((file) => {
                  fs.unlinkSync(file.path);
                });
    
                fs.unlinkSync(listFilePath);
                fs.unlinkSync(outputFilePath);
  
                res.send("Some error takes place in merging audio")
              }
  
              req.files.forEach((file) => {
                fs.unlinkSync(file.path);
              });
  
              fs.unlinkSync(listFilePath);
              fs.unlinkSync(outputFilePath);
            });
          }
        }
      );
    }
  });
  

app.listen(PORT, () => {
    console.log(`App is listening on Port ${PORT}`);
});