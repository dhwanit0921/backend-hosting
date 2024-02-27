const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: '1a5b67c8e9f0d2a3b4c5d6e7f8a9b0c1', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
}));

const dbName = 'testdb';
const mongoUrl = "mongodb+srv://patelparam1306:EuOuUCX9zezVN3JF@cluster0.2pcbuho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const collectionName = 'col-test';

async function createUserInDB(fName, fUsername,fEmail, fHashedPassword) {
    const uri = "mongodb+srv://patelparam1306:EuOuUCX9zezVN3JF@cluster0.2pcbuho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);
    const dbname = 'testdb';
    console.log('Inside func');
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbname);
        const collection = db.collection('col-test');
        await collection.createIndex({username : 1}, {unique : true});
        const document = {
            name : fName,
            username : fUsername,
            email : fEmail,
            password : fHashedPassword,
        };
        const result = await collection.insertOne(document);
        return 'account created';
    } catch (err) {
        if (err.code === 11000){
            return 'existing username';
        }
    } finally {
        await client.close();
    }
}

app.post('/create', async (req, res) => {
    console.log(req.body);
    const name = String(req.body.name);
    const email = String(req.body.email);
    const username = String(req.body.username);
    const password = String(req.body.password);
    const message =  await createUserInDB(fName = name, fUsername = username, fEmail = email, fHashedPassword = password);
    return res.send({'status' : message});
});

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
};

app.get('/', isAuthenticated, (req, res) => {
  res.json({ message: `Hello, ${req.session.user.username}!`, userLogin : true });
});  

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });
    try {
      await client.connect();
      const db = client.db(dbName);
      const usersCollection = db.collection(collectionName);
  
      const user = await usersCollection.findOne({ username, password });
  
      if (user) {
        req.session.user = user;
        res.json({ message: 'Login successful', user });
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await client.close();
    }
});
  
app.post('/logout', (req, res) => {
  if (req.body.message == 'logout'){
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    return res.status(200).json({ message: 'logout successful' });
  });
}
});
  

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
