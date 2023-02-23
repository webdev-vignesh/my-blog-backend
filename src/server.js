const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

var cors = require('cors')
const app = express(); 
const dotenv = require("dotenv");
dotenv.config();

app.use(bodyParser.json());
app.use(cors());

const withDB = async (operations, res) => {
    try{
        const client = await MongoClient.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8obb8ag.mongodb.net/?retryWrites=true&w=majority`,
        {useUnifiedTopology: true},
        {useNewUrlParse: true});
        const db = client.db('my-blog');
        await operations(db);
        client.close();
    }
    catch(error){
        res.status(500).json({message: 'Error connecting to db', error});
    }
};

app.get('/api/articles/:name', async (req,res) => {
    withDB(async (db) => {
        const articleName = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articlesInfo);
    }, res);
});


app.get('/', (req,res) => {
    res.send("working");
})
app.post('/articles/:name', (req,res) => {
    res.send(`working ${req.params.name}`);
})


app.post('/api/articles/:name/add-comments', (req,res) => {
    const {username, text} = req.body;
    const articleName = req.params.name;

    withDB(async(db) => {

        const articlesInfo = await db.collection("articles").findOne({name: articleName});
        await db.collection("articles").updateOne(
            { name: articleName },
            {
                $set: {
                    comments: articlesInfo.comments.concat({ username, text }),
                },
            }
        ); 
        const updateArticleInfo = await db.collection("articles").findOne({ name: articleName });
        res.status(200).json(updateArticleInfo);
    }, res);
});



