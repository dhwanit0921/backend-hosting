const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const port = 3000;

const { MongoClient } = require('mongodb');

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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
