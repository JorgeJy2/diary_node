console.log('hola');

const express=require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app=express();

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
 
app.use(require('./server/router.js'));

mongoose.connect('mongodb://localhost:27017/agenda',(err,res)=> {
    if(err)
        throw err;
    console.log('Base de datos online');
});

app.use(express.static(__dirname + '/public'));
console.log(__dirname);
const server=app.listen(3000, () => {
  console.log('Servidor web iniciado');     
});