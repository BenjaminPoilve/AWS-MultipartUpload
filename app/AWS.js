/////////REQUIRE
var AWS=require('aws-sdk');
var fs = require('fs');
var appConstants = require('./constants.js');
var child_process=require('child_process');


/////////AWS PARAMETERS
global.ACCESSKEYID=''
global.SECRETACCESSKEY='';
global.INPUTBUCKET='';

//////////////NOTE
//////////////CORS FOR INPUT bucket
/*
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
*/

/////////AWS SETUP

AWS.config.region = 'eu-west-1';

//the bucket for upload
var inbucket = new AWS.S3(
  options = {
    accessKeyId : ACCESSKEYID,
    secretAccessKey: SECRETACCESSKEY,
    params: {Bucket: INPUTBUCKET}
});


/////////PUBLIC FUNCTION
var signUploadChunk = function signUploadChunk(req,res,chunkID,filepath){
  if(appConstants.uploadData[filepath]==null){
      res.write('-1')
      return res.end();
  }else{
    var params = {
      Key: filepath,
      PartNumber: chunkID, /* required */
      UploadId:  appConstants.uploadData[filepath].ID /* required */
  };
  inbucket.getSignedUrl('uploadPart', params, function(err, data){
      if(err){
          console.log('error', err);
      }
      else{
          console.log('data', data);
          var return_data = {
              signed_request: data,
              url: 'https://'+INPUTBUCKET+'.s3.amazonaws.com/'+filepath,
              chunk: chunkID
          };
          console.log("chunk N*", chunkID)
          res.write(JSON.stringify(return_data));
          return res.end();
      }
  });
}
}
exports.signUploadChunk=signUploadChunk;

var initUpload= function initUpload(req,res, size ,chunkSize, filepath){
  if(appConstants.uploadData[filepath]!=null){
    res.write('-1')
    return res.end();
  }else{
    var params = {
      Key: filepath, /* required */
   };
  inbucket.createMultipartUpload(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else{
      appConstants.uploadData[filepath]={};
      appConstants.uploadData[filepath].fileSize=size;
      appConstants.uploadData[filepath].chunkSize=chunkSize;
      appConstants.uploadData[filepath].actualSize=0;
      appConstants.uploadData[filepath].ready=true;
      appConstants.uploadData[filepath].ID=data.UploadId;
      console.log("string id is ", data.UploadId);
      res.write('1')
      return res.end();
    }
  });
  }
}
exports.initUpload=initUpload;

var finishUpload= function finishUpload(req,res,filepath){
  if(appConstants.uploadData[filepath]==null){
      res.write('-1')
      return res.end();
  }else{
    if(appConstants.uploadData[filepath].actualSize!=appConstants.uploadData[filepath].fileSize){
      res.write('0')
      //delete file here
      return res.end();
    }else{
      appConstants.uploadData[filepath].over=true;
      appConstants.uploadData[filepath].ready=false;
      res.write('1')
      return res.end();
    }
  }
}
exports.initUpload=initUpload;
