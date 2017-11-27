const express = require('express');
// const mongoose = require('mongoose');
const app = express();

app.get('/', function (req,res) {
    res.send('It Works!');
})

const port = process.env.port || 5300;

app.listen(port, function(){
console.info("Server has started on http://localhost:"+port+"/");
})