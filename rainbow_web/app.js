var express = require("express");
var app = express();

app.set('view engine','ejs');
app.use('/assets', express.static('assets'));


app.get('/user', function(req,res){
    res.render('user');
});


app.listen(8003);