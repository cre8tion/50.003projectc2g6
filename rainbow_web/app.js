var express = require("express");
var app = express();


// app.use('./src/en', express.static('./src/en'));
app.use(express.static('./src/en'));


var port= 8017
app.listen(port, ()=>{
    console.log('Listening on ' + port);
});

