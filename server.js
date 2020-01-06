//Initialize the dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
let path = require('path');
var multer = require('multer');
var xlstojson = require('xls-to-json-lc');
var xlsxtojson = require('xlsx-to-json-lc');
let fs = require('fs-extra');
let logger = require('morgan');
var _ = require('lodash');
const portNumber = process.env.PORT || 3000;
const camelcaseKeys = require('camelcase-keys');

let UPLOAD_LOCATION = path.join(__dirname, 'uploads');
fs.mkdirsSync(UPLOAD_LOCATION);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

var filesToStore = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, callback) {
        callback(null, UPLOAD_LOCATION);
    },
    filename: function (req, file, callback) {
        console.log(file.originalname);
        callback(null, file.originalname);
    }
});

var upload = multer({ //multer settings
    storage: filesToStore,
    fileFilter: function (req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');

/** API path that will upload the files */
app.post('/movements', function (req, res) {
    var exceltojson; //Initialization
    upload(req, res, function (err) {

        if (err) {
            res.json({ error_code: 1, err_desc: err });
            return;
        }

        /** Multer gives us file info in req.file object */
        if (!req.file) {
            res.json({ error_code: 1, err_desc: "No file passed" });
            return;
        }

        //start convert process
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        const jsonPromise = new Promise((resolve, reject) => {
            exceltojson({
                input: req.file.path, //the same path where we uploaded our file
                output: null, //since we don't need output.json
                lowerCaseHeaders: true
            }, function (err, result) {
                if (err) {
                    return res.json({ payload: null });
                }
                result = camelcaseKeys(result)
                fs.readFile('./output.json', function (err, data) {
                    if (err) throw err

                    var targetArray = JSON.parse(data)
                    var sourceArray = result;
                    var finalArray = [...targetArray, ...sourceArray];
                    fs.writeFileSync('./output.json', JSON.stringify(finalArray), (err) => {
                        // throws an error, you could also catch it here
                        if (err) throw err;
                        console.log('result saved!');
                    });
                    resolve(finalArray);
                })

            })

        });

        jsonPromise.then((shippingJson) => {
            res.redirect('/result')
            console.log('4)resolved render....')
        }).catch(e => {
            res.json({ error_code: 1, err_desc: "Corrupted excel file" });
        })
    });
});

app.get('/home', function (req, res) {
    res.render('home')
});

app.get('/', function (req, res) {
    var shippingJson = require('./output.json')
    res.render('movementsTable', { shippingLists: shippingJson })
});

app.listen(portNumber, function () {
    console.log(`Now running on Port ${portNumber}...`);
});