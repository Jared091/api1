const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const sequelize = new Sequelize('uniutvts_bartender', 'uniutvts_admin', 'Holahola!1212', {
  host: '50.6.138.106',
  dialect: 'mysql',
});

const User = sequelize.define('usuarios', {
  Nombre_Usuario: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  App: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  Apm: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  Edad: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
});

sequelize.sync()
  .then(() => {
    console.log('Modelo sincronizado con la base de datos');
  })
  .catch((error) => {
    console.error('Error al sincronizar el modelo:', error);
  });

app.get('/login', (req, res) => {
  res.send('Página de inicio de sesión');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      attributes: ['id', 'email', 'password'],
      where: {
        email,
        password,
      },
    });

    if (user) {
      res.status(200).json({ success: true, message: 'Autenticación exitosa' });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post('/register', async (req, res) => {
  const { Nombre_Usuario, App, Apm, Edad, email, password } = req.body;

  try {
    const newUser = await User.create({
      Nombre_Usuario,
      App,
      Apm,
      Edad,
      email,
      password,
    });
    res.status(201).json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

const Producto = sequelize.define('productos', {
  ID_Producto: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  Nom_Bebida: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  Precio: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  Stock: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
});

app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.findAll({
      attributes: ['ID_Producto', 'Nom_Bebida', 'Precio', 'Stock'], 
    });
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.post('/pedido', async (req, res) => {
  const { ID_Producto } = req.body;
  
  try {
    const producto = await Producto.findByPk(ID_Producto);

    if (!producto || producto.Stock <= 0) {
      res.status(400).json({ success: false, message: 'La bebida seleccionada no está disponible' });
      return;
    }

    await Producto.update({ Stock: producto.Stock - 1 }, { where: { ID_Producto } });
    res.status(200).json({ success: true, message: 'Pedido realizado exitosamente' });
  } catch (error) {
    console.error('Error al realizar el pedido:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.get('/usuario', async (req, res) => {
  const { email } = req.query;

  console.log('Valor del correo electrónico recibido:', email);

  if (!email || email.trim() === '') {
    console.log('El correo electrónico está vacío');
    return res.status(400).json({ success: false, message: 'El correo electrónico es requerido' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      res.status(200).json({ nombre: user.Nombre_Usuario });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

app.listen(port);
