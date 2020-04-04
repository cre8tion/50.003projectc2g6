var express = require("express");
var app = express();


app.use('/', express.static('src'));


var port= 8012
app.listen(port, ()=>{
    console.log('Listening on ' + port);
});

