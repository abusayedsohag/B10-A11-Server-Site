require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6ksrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Insert Operation
    const itemsData = client.db('whereisit-itemsDB').collection('items')

    app.get('/items', async (req, res) => {
      const cursor = itemsData.find();
      const result = await cursor.toArray(cursor);
      res.send(result);
    })

    app.get('/item', async (req, res) => {
      const cursor = itemsData.find().sort({createdateTime: -1}).limit(6);
      const result = await cursor.toArray(cursor);
      res.send(result);
    })

    app.get('/host_items', async (req, res) => {
      const email = req.query.email;
      const query = { hostemail: email }
      const cursor = itemsData.find(query);
      const result = await cursor.toArray(cursor);
      res.send(result);
    })

    app.get('/host_items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await itemsData.findOne(query);
      res.send(result)
    })

    app.post('/items', async (req, res) => {
      const itemsInfo = req.body;
      const result = await itemsData.insertOne(itemsInfo);
      res.send(result)
    })

    app.put('/host_items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const update = req.body;
      const options = { upsert: true }
      const updateInfo = {
        $set: {
          type: update.type,
          image: update.image,
          title: update.title,
          category: update.category,
          location: update.location,
          date: update.date,
          description: update.description,
        }
      };
      const result = await itemsData.updateOne(query, updateInfo, options)
      res.send(result)
    })

    app.delete('/host_items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await itemsData.deleteOne(query)
      res.send(result)
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("This is server side web")
})

app.listen(port, () => {
  console.log("Connect")
})