const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
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
        const trainerApplicationCollection = client.db("vectorGymDB").collection('trainerApplication');
        const photoCollection = client.db("vectorGymDB").collection('photo');
        const usersCollection = client.db("vectorGymDB").collection('users');
        const forumCollection = client.db("vectorGymDB").collection('forum');
        const classesCollection = client.db("vectorGymDB").collection('classes');


        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // middlewares 
        const verifyToken = (req, res, next) => {
            console.log('inside verify token', req.headers.authorization);
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' });
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                next();
            })
        }

        // use verify admin after verifyToken
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }

        // use verify admin after verifyToken
        // const verifyTrainer = async (req, res, next) => {
        //     const email = req.decoded.email;
        //     const query = { email: email };
        //     const user = await trainerApplicationCollection.findOne(query);
        //     const isTrainer = user?.role === 'trainer';
        //     if (!isTrainer) {
        //         return res.status(403).send({ message: 'forbidden access' });
        //     }
        //     next();
        // }


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin';
            }
            res.send({ admin });
        })


        app.get('/trainerApplication/trainer/:email', async (req, res) => {
            const email = req.params.email;

            // if (email !== req.decoded.email) {
            //     return res.status(403).send({ message: 'forbidden access' })
            // }

            const query = { email: email };
            const user = await trainerApplicationCollection.findOne(query);
            let trainer = false;
            if (user) {
                trainer = user?.role === 'trainer';
            }
            res.send({ trainer });
        })


        // post method added for subscriber
        app.post('/subscriber', async (req, res) => {
            const subscriber = req.body;
            const result = await subscriberCollection.insertOne(subscriber);
            res.send(result)
        })

        // post method added for forum
        app.post('/forum', async (req, res) => {
            const forum = req.body;
            const result = await forumCollection.insertOne(forum);
            res.send(result)
        })

        // post method added for forum
        app.post('/classes', async (req, res) => {
            const classes = req.body;
            const result = await classesCollection.insertOne(classes);
            res.send(result)
        })

        // post method added for trainer
        app.post('/trainerApplication', async (req, res) => {
            const trainer = req.body;
            const result = await trainerApplicationCollection.insertOne(trainer);
            res.send(result)
        })

        // post method added for user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })

        // get method added for subscriber
        app.get("/subscriber", async (req, res) => {
            const result = await subscriberCollection.find().toArray();
            res.send(result);
        });

        // get method added for forum
        app.get("/forum", async (req, res) => {
            const result = await forumCollection.find().toArray();
            res.send(result);
        });

        // get method added for classes
        app.get("/classes", async (req, res) => {
            const result = await classesCollection.find().toArray();
            res.send(result);
        });

        // get method added for trainerInfo
        // app.get("/trainerInfo", async (req, res) => {
        //     const result = await trainerInfoCollection.find().toArray();
        //     res.send(result);
        // });

        // get method added for trainer application
        // app.get("/trainerApplication", async (req, res) => {
        //     const result = await trainerApplicationCollection.find().toArray();
        //     res.send(result);
        // });

        app.get('/trainerApplication', async (req, res) => {
            // console.log(req.query.role);

            let query = {}
            if (req.query?.role) {
                query = { role: req.query.role }
            }
            const result = await trainerApplicationCollection.find(query).toArray();
            res.send(result)
        })

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

        app.get('/users', async (req, res) => {
            // console.log(req.query.role);

            let query = {}
            if (req.query?.role) {
                query = { role: req.query.role }
            }
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        })

        // get method to get all users from database
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // create admin
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }

            // delete method to delete user
            app.delete('/users/:id', async (req, res) => {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await usersCollection.deleteOne(query);
                res.send(result);
            })

            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.patch('/trainerApplication/trainer/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'trainer'
                }
            }
        })

        app.patch('/trainerApplication/:id', (req, res) => {
            // console.log(req.body);
            trainerApplicationCollection.updateOne({ _id: new ObjectId(req.params.id) },
                {
                    $set: { role: req.body.role }
                })
                .then(result => {
                    // res.send("updated successfully!!!")
                    res.send(result.modifiedCount > 0)
                })
        })

        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const data = req.body;
            // console.log("id", id, data);
            const filter = { email: email };
            const options = { upsert: true };
            const updatedUSer = {
                $set: {
                    name: data.name,
                    photo: data.photo
                    // password: data.password,
                },
            };
            const result = await usersCollection.updateOne(
                filter,
                updatedUSer,
                options
            );
            res.send(result);
        });


        app.delete("/trainerApplication/:id", async (req, res) => {
            const id = req.params.id;
            console.log("delete", id);
            const query = {
                _id: new ObjectId(id),
            };
            const result = await trainerApplicationCollection.deleteOne(query);
            // console.log(result);
            res.send(result);
        });


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