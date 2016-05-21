

/////////REQUIRE
var fs = require('fs');
var url = require('url');
var path = require('path');
var zlib = require('zlib');
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded());

/////////API FUNCTIONS
var AWS=require('./app/AWS.js');
var appConstants = require('./app/constants.js');

/////////GLOBALS
PORT = 8001;

///////Testing
//AWS.uploadFile('test2.mov');

///////ROUTING


app.get('/sign_s3/:chunkID/:path(*)', function(req, res){
  AWS.signUploadChunk(req,res,req.params.chunkID, req.params.path);
});

app.post('/sign_s3/init/:sizeFile/:chunkSize/:path(*)', function(req, res){
  console.log(req.params.sizeFile);
  console.log(req.params.chunkSize);
  console.log(req.params.path);
  AWS.initUpload(req,res, req.params.sizeFile ,req.params.chunkSize,req.params.path);
});

app.get('/sign_s3/end/:path(*)', function(req, res){
  AWS.finishUpload(req,res, req.params.path);
});

app.listen(PORT, function () {
  console.log('video server listening');
});
