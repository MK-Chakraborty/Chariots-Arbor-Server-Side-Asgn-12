const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.ehdi4.mongodb.net:27017,cluster0-shard-00-01.ehdi4.mongodb.net:27017,cluster0-shard-00-02.ehdi4.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-a8zpg9-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('db connected');

        // Database and Collections
        const database = client.db('car_shop');
        const productsCollection = database.collection('products');
        const reviewsCollection = database.collection('reviews');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        // get all products from products collection
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // get specific product from products collection
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });

        // insert new product in product collection
        app.post('/products', async(req, res) => {
            const productInfo = req.body;
            const result = await productsCollection.insertOne(productInfo);
            res.json(result);
        });

        // delete a specefic product from product collection
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        // get all reviews from review collection
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // insert new review in review collection
        app.post('/reviews', async (req, res) => {
            const revewMsg = req.body;
            const result = await reviewsCollection.insertOne(revewMsg);
            res.json(result);
        });

        // get all orders form orders collection
        app.get('/order', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        });

        // get filtered by email orders form order collection
        app.get('/myOrder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // insert a new order in order collection
        app.post('/order', async (req, res) => {
            const orderInfo = req.body;
            console.log(orderInfo);
            const result = await ordersCollection.insertOne(orderInfo);
            res.json(result);
        });

        // delete a specific order from orders collection
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // get specific user filtering by email and check for admin role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // insert a new user in users collection
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // update a user's role from general user to admin
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
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
    console.log('listening to port: ', port);
})