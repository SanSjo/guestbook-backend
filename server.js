import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import crypto from 'crypto'

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost/guestbook';
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;
mongoose.set('useCreateIndex', true);


const User = mongoose.model('User', {
  name: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
});

const Guestbook = mongoose.model('Guestbook', {
  id: {
    type: Number
  },
  message: {
    type: String
  }
})

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(bodyParser.json())

const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      accessToken: req.header('Authorization'),
    });
    user.password = undefined;
    if (user) {
      req.user = user;
      next();
    } else {
      res
        .status(401)
        .json({loggedOut: true, message: 'Please try logging in again'})
    }
  } catch(err) {
      res 
        .status(403)
        .json({message: 'access token missing or wrong', errors: err.message})
  }
};

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hello world')
})

app.post('/signup', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = new User({name, password: bcrypt.hashSync(password)});
    const saved = await user.save();

    res.status(201).json(saved);
  } catch(err) {
    res
      .status(400)
      .json({message: 'Error! Could not create user', error: err.message});
  }
})

app.get('/users/:id', authenticateUser);
app.get('/users/:id', (req,res) => {
  try {
    res.status(201).json(req.user);
  }
  catch(err) {
    res
      .status(400)
      .json({message: 'Could not save user', error: err.message})
  }
})

app.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({name});
    if(user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({userId: user._id, accessToken: user.accessToken})
    } else {
      res.json({message: 'Wrong username or password'});
    }
  }
  catch (err) {
    res.status(400).json({errors: err.errors})
  }
});

app.get('/messages', async (req, res) => {
  const message = await Guestbook.find();
  res.send(message)
});

app.post('/messages', async (req, res) => {
 try {
  const messages = new Guestbook({
    id: req.body.id,
    message: req.body.message
  });
  await messages.save();
  res.status(200).json(messages);
 } catch(err) {
   res.status(400).json({errors: err.errors});
 }
});

app.put('/messages/:id', async (req, res) => {
  try {
    const messages = await Guestbook.findOne({ _id: req.params.id});
    if (req.body.message) {
        messages.message = req.body.message;
    }
    await messages.save();
    res.status(200).json(message);
  } catch {
    res.json({errors: 'Message does not exist'});
  }
});

app.delete('/messages/:id', async (req, res) => {
  try {
    await Guestbook.deleteOne({ _id: req.params.id});
    res.status(204).send();
  } catch {
    res.status(400).json({errors: 'Message does not exist'});
  }
})
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
