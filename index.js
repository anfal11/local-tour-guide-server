const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

// parsers
app.use(express.json());
app.use(cors());

// DB URI
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ey8cr7h.mongodb.net/localTourGuide?retryWrites=true&w=majority`;

// Mongodb CONNECTION
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // connect collection
    const servicesCollection = client
      .db("localTourGuide")
      .collection("services");
    const bookingCollection = client
      .db("localTourGuide")
      .collection("bookings");

    // services
    app.get("/api/v1/services", async (req, res) => {
      const cursor = servicesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/api/v1/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    // single service by service name
    app.get("/api/v1/services/:serviceName", async (req, res) => {
        const serviceName = req.params.serviceName;
        const query = { serviceName: serviceName };
        const result = await servicesCollection.findOne(query);
        res.send(result);
    });

    // bookings
    app.post("/api/v1/user/create-bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.delete("/api/v1/user/delete-bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Local tour and guide server is running...");
});

app.listen(port, () => {
  console.log(`Local tour and guide server is running on port ${port}`);
});
