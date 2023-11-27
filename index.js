const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgznyse.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();


        const subscriberCollection = client.db("vectorGymDB").collection('subscriber');
        const trainerInfoCollection = client.db('vectorGymDB').collection('trainerInfo');
        // const trainerApplicationCollection = client.db("vectorGymDB").collection('trainerApplication');
        const photoCollection = client.db("vectorGymDB").collection('photo');


        // post method added for subscriber
        app.post('/subscriber', async (req, res) => {
            const subscriber = req.body;
            const result = await subscriberCollection.insertOne(subscriber);
            res.send(result)
        })
        // post method added for trainer
        // app.post('/trainerApplication', async (req, res) => {
        //     const trainer = req.body;
        //     const result = await trainerApplicationCollection.insertOne(trainer);
        //     res.send(result)
        // })

        // get method added for subscriber
        app.get("/subscriber", async (req, res) => {
            const result = await subscriberCollection.find().toArray();
            res.send(result);
        });

        // get method added for trainerInfo
        app.get("/trainerInfo", async (req, res) => {
            const result = await trainerInfoCollection.find().toArray();
            res.send(result);
        });

        // get method added for trainer application
        // app.get('/trainerApplication', async (req, res) => {
        //     console.log(req.query.role);

        //     let query = {}
        //     if (req.query?.role) {
        //         query = { role: req.query.role }
        //     }
        //     const result = await trainerApplicationCollection.find(query).toArray();
        //     res.send(result)
        // })

        // get method added for gallery
        app.get('/photo', async (req, res) => {
            const result = await photoCollection.find().toArray();
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Your server is ready !')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})