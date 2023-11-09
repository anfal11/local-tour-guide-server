const express = require("express");
const cors = require("cors")
// const jwt = require("jsonwebtoken")
// const cookirParser = require("cookie-parser")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

// parsers
app.use(express.json());
app.use(cors({
  origin: ["https://local-tours-guide-client.vercel.app" ,  "http://localhost:5173"],
  credentials: true,
}));
// app.use(cookirParser())

//middlewares
// const logger = async (req, res, next) => {
//   next();
// }


// const jwtSecret = process.env.ACCESS_TOKEN_SECRET

// const verifyToken = async (req, res, next) => {
//   const token = req.cookies?.token;
//   if(!token) {
//     return res.status(401).send('Unauthorized access')
//   }
  
//    jwt.verify(token, jwtSecret, (error, decoded) => {
//     if(error) {
//       return res.status(403).send({
//         message: 'Forbidden access',
//       })
//     }
//     req.decoded = decoded
//     next();
//    })
//   }
    
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
    // await client.connect();

    // connect collection
    const servicesCollection = client
      .db("localTourGuide")
      .collection("services");
    const bookingCollection = client
      .db("localTourGuide")
      .collection("bookings");

      // verify token and grant access
      // const gateman = (req, res) => {
      //     const token = req.cookies
      // }

      // auth related apis
      // app.post('/api/v1/auth/access-token', (req, res) => {
      //   const user = req.body
      //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      //     expiresIn: '1h',
      //   })
      //   res
      //     .cookie('token', {
      //       httpOnly: true,
      //       secure: true,
      //       sameSite: 'none',
      //     })
      //     .send({ status: true })
      // })
      
      // app.post('/logout', async (req, res) => {
      //   const user = req.body
      //   res.clearCookie('token', { maxAge: 0 }).send({ success: true })
      // })

    // services
    // app.get("/api/v1/services", async (req, res) => {
    //   const cursor = servicesCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });
    app.get("/api/v1/services", async (req, res) => {
      const filter = req.query;
      console.log(filter); 
      const query = {
        serviceName: { $regex: filter.search, $options: "i" },
      }
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    
    app.post("/api/v1/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    // update service by id

    app.get("/api/v1/update-services/:serviceName", async (req, res) => {
      const serviceName = req.params.serviceName;
        const query = { serviceName: serviceName };
        const result = await servicesCollection.findOne(query);
        res.send(result);
    });

    app.put("/api/v1/services/:serviceName", async (req, res) => {
      const serviceName = req.params.serviceName;
      const updatedService = req.body;
      const filter = { serviceName: serviceName };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          serviceImage: updatedService.serviceImage,
          serviceName: updatedService.serviceName,
          serviceDescription: updatedService.serviceDescription,
          servicePrice: updatedService.servicePrice,
          name: updatedService.name,
          email: updatedService.email,
          image: updatedService.image,
          aboutProvider: updatedService.aboutProvider,
        },
      };
      const result = await servicesCollection.updateOne(
        filter,
        updateDoc,
        options
      );
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
    app.get("/api/v1/create-bookings",  async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/api/v1/create-bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    app.delete("/api/v1/services/:serviceName", async (req, res) => {
      const serviceName= req.params.serviceName;
      const query = { serviceName: serviceName};
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });

    // Back-End Logic for fetching bookings by other users
app.get('/api/v1/create-bookings', async (req, res) => {
  const { userEmail, status } = req.query; 

  try {
    const query = {};

    // If userEmail is provided, filter bookings for a specific user
    if (userEmail) {
      query.userEmail = userEmail;
    }

    if (status) {
      query.status = status;
    }

    // Find bookings that match the query
    const bookings = await bookingCollection.find(query).toArray();

    res.send(bookings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
