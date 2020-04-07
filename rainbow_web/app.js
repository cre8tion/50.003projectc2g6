// var express = require("express");
// var app = express();


// app.use('./src/en', express.static('./src/en'));
app.use(express.static('./src/en'));


var port= 8017
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
