
const mongoose = require('mongoose');


let Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');
 

let eventShema = new Schema ({
    title: {
        type: String,
        required: [true,'El nombre es necesario']
    },
    start: {
        type: Date,
        required: [true, 'La fecha es necesario']
    },
    end: {
        type: Date,
        required: [false, 'La fecha es necesario']
    }, 
    allDay: {
        type: Boolean,
        default: true
    }

});

let userSchema = new Schema({
    name: {
        type: String,
        required: [true,'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true,'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'El password es necesario']
    },
    fecha_nacimiento: {
        type: Date,
        required: [true, 'La fecha es necesario']
    },
    events: [eventShema]
});


userSchema.plugin(uniqueValidator, {message: '{PATH} debe ser único'});

module.exports = mongoose.model('User', userSchema);