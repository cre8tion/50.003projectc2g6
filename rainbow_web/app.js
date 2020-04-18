var express = require("express");
var app = express();


app.use('/src', express.static('src'));
// app.use(express.static('./src'));


var port= 8019
app.listen(port, ()=>{
    console.log('Listening on ' + port);
});

// var request = require('request');
// var options = {
//   'method': 'PUT',
//   'url': 'https://sheltered-journey-07706.herokuapp.com/db/agent/5e57b8146c332176648fcaac/rating/3',
//   'headers': {
//   }
// };
// request(options, function (error, response) { 
//   if (error) throw new Error(error);
//   console.log(response.body);
// });
