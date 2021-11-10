const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.ehdi4.mongodb.net:27017,cluster0-shard-00-01.ehdi4.mongodb.net:27017,cluster0-shard-00-02.ehdi4.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-a8zpg9-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try{
        await client.connect();
        console.log('db connected');

        const database = client.db('car_shop');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');

        app.get('/products', async(req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        app.get('/reviews', async(req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Niche-server-running')
})

app.listen(port, () => {
    console.log('listening to port: ',port);
})