const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");

// parsers
app.use(express.json());
app.use(cors());

// DB URI
const uri =
  "mongodb+srv://ratulcse1:QEdnpEF6Uh1JsXKn@cluster0.ey8cr7h.mongodb.net/localTourGuide?retryWrites=true&w=majority";

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

    // bookings
    app.post("/api/v1/create-bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
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

const port = 5000;

app.get("/", (req, res) => {
  res.send("Local tour and guide server is running...");
});

app.listen(port, () => {
  console.log(`Local tour and guide server is running on port ${port}`);
});
