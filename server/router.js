const express = require('express');
const User = require('../server/models/user');
const app = express();
const bcrypt = require("bcrypt-nodejs");
const session = require("express-session");


app.use(session({
  secret: 'calendar-secret-random',
  resave: false,
  saveUninitialized: false
}));

app.post('/login', (req, res) => {

  let params = req.body;

  User.findOne({
    email: params.user
  }).exec((err, user) => {
    if (!user)
      return res.send('Usuario no encontrado');

    if (err)
      return res.send('Usuario no encontrado');

    bcrypt.compare(params.pass, user.password, (error, sonIguales) => {
      if (error)
        return res.send('Contraseña incorrecta');

      if (sonIguales) {
        req.session.idUser = user._id;
        res.send('Validado');
      } else {
        res.send('Contraseña incorrecta');
      }

    });
  });

});


app.post('/user/get', (req, res) => {

  User.find({})
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err
        });
      }
      res.json({
        ok: true,
        usuarios
      });
    });
});

let addUser = (user) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err)
        reject('No se pudo agregar semilla de encriptación');

      bcrypt.hash(user.password, salt, null, (error, result) => {
        if (error)
          reject('No se pudo encriptar la contraseña.');

        user['password'] = result;

        user.save((err, usuarioDB) => {
          if (err)
            reject('No se pudo guardar al usuario');

          resolve(usuarioDB);
        }); //Save in db
      });
    });
  });
}

//Agregar asyn..
app.post('/user/add', async (req, res) => {

  let newUser = [
    new User({
      name: 'Jorge Jacobo',
      email: 'jorge@gmail.com',
      password: 'password',
      fecha_nacimiento: '1998-11-31',
      events: []
    }),
    amanda = new User({
      name: 'Amanda Franco',
      email: 'amanda@gmail.com',
      password: 'password',
      fecha_nacimiento: '1998-06-13',
      events: []
    }),
    new User({
      name: 'Alma recendiz',
      email: 'alma@gmail.com',
      password: 'password',
      fecha_nacimiento: '1998-02-12',
      events: []
    })
  ];

  let userAdds = [];

  for (const user of newUser) {
    try {
      let userAdded = await addUser(user);
      userAdds.push(userAdded);
    } catch (error) {
      console.log(error);
    }
  }

  res.json({
    ok: true,
    userAdds
  });
}); //POST add user

app.post('/events/update', (req, res) => {
  const params = req.body;

  if (!req.session.idUser) {
    return res.status(400).json({
      ok: false,
      message: 'EL usuario no ha iniciado sesión.'
    });
  }

  User.findById(req.session.idUser)
    .exec((err, user) => {
      if (err)
        return res.status(400).json({
          ok: false,
          message: 'No se encontró al usuario'
        });
      let newData = {
        start: params.start
      };

      if (params.allDay === "false") {
        newData['end'] = params.end;
      } else {
        newData['end'] = params.start;

      }

      const event = user.events.id(params.id);
      event.set(newData);
      user.save((err) => {
        if (err)
          return res.status(400).json({
            ok: false,
            message: 'No se actualizó el evento.'
          });

        return res.json({
          ok: true,
          message: 'Evento actualizado'
        });
      });

    });


});

app.post('/events/delete/', (req, res) => {
  const params = req.body;
  const id = params.id;
  if (!req.session.idUser) {
    return res.status(400).json({
      ok: false,
      message: 'EL usuario no ha iniciado sesión.'
    });
  }
  User.findById(req.session.idUser)
    .exec((err, user) => {
      if (err)
        return res.status(400).json({
          ok: false,
          message: 'No se encontró al usuario'
        });

      user.events.id(id).remove();

      user.save((err) => {
        if (err)
          return res.status(400).json({
            ok: false,
            message: 'No se elimino el evento.'
          });

        return res.json({
          ok: true,
          message: 'Evento eliminado'
        });
      });
    });
});

app.post('/events/new', (req, res) => {

  const params = req.body;
  const title = params.title;
  const start = params.start;
  const end = params.end;
  const allDay = params.allDay;

  if (!req.session.idUser) {
    return res.send('Usuario no logeado');
  }


  User.findById(req.session.idUser)
    .exec((err, user) => {
      if (err)
        return res.send('Error al buscar al usuario');

      user.events.push({
        title,
        start,
        end,
        allDay
      });

      user.save(function (err) {
        if (err)
          res.send('Error al buscar al usuario');


        res.send('Evento guardado.');
      });

    });

});

app.get('/events/all', (req, res) => {
  if (!req.session.idUser) {
    return res.json({
      ok: false,
      msg: 'EL usuario no se logeo'
    });
  }

  User.findById(req.session.idUser).exec((err, user) => {
    if (!user)
      return res.json({
        ok: false,
        msg: 'Usuario no encontrado'
      });

    if (err)
      return res.status(400).json({
        ok: false,
        msg: err
      });

    res.json({
      ok: true,
      eventos: user.events,
      msg: "OK"
    });
  });

});


module.exports = app;