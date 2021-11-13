const express = require('express')

//to connect to database
const { MongoClient } = require('mongodb');


const ObjectId = require('mongodb').ObjectId;



const cors = require('cors')
require('dotenv').config();



const app = express()
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());

//database uri name and pass
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hkgq0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


//main function start

async function run() {
    try {
        //connect server with database
        await client.connect();
        const database = client.db('droneShop');
        const serviceCollection = database.collection('services')

        const UsersCollection = database.collection('users')

        const ratingCollection = database.collection('ratings')

        const bookingCollection = database.collection('bookings')
        console.log('connected to database ya la la hoo ..!!');



        //geting the user for limiting usage
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await UsersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })



        //add user API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await UsersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })

        //add user APi for google
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await UsersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await UsersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })












        //post rating API
        app.post('/ratings', async (req, res) => {
            const service = req.body;
            console.log('hit the post', service);
            const result = await ratingCollection.insertOne(service);
            // console.log(result);
            res.json(result)
        })

        //get rating API
        app.get('/ratings', async (req, res) => {
            const cursor = ratingCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })




        //get API
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })



        //get single services
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific id');
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.json(service);
        })


        //post api
        app.post('/services', async (req, res) => {
            const service = req.body;
            // console.log('hit the post', service);
            const result = await serviceCollection.insertOne(service);
            // console.log(result);
            res.json(result)
        })






        // booking single  get API
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific id');
            const query = { _id: ObjectId(id) };
            const booking = await bookingCollection.deleteOne(query);
            res.json(booking);
        })



        //get my order specific order by email
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            if (email) {
                const query = { email: email }
                // console.log(query);
                const cursor = bookingCollection.find(query);
                const services = await cursor.toArray();
                res.send(services);
            }
            else {
                const cursor = bookingCollection.find({});
                const result = await cursor.toArray();
                res.send(result);
            }

        })


        //booking get API
        app.post('/bookings', async (req, res) => {
            const order = req.body;
            const result = await bookingCollection.insertOne(order);
            // console.log('order', order);
            res.json(result);
        })











    }


    finally {
        //await cliant.close
    }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('Drone World is loading....!!!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})