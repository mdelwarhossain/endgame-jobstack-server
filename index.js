const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://jobstack:yDpXnq0bUjaKatUw@cluster0.ziqz1ow.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// verify jwt
// function verifyJWT(req, res, next) {

//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }

//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     })

// }

async function run() {
  try {
    const usersCollection = client.db("jobStack").collection("users");
    const postsCollection = client.db("jobStack").collection("posts");
    const friendsCollection = client.db("jobStack").collection("friends");
    const commentsCollection = client.db("jobStack").collection("comments");

    //get the posts from Createpost components
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });

    //get all the posts from database. show it in {NewsFeedposts} Component
    app.get("/allposts", async (req, res) => {
      const query = {};
      const cursor = postsCollection.find(query).sort({ _id: -1 });
      const posts = await cursor.toArray();
      res.send(posts);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get all the users
    app.get("/users", async (req, res) => {
      const query = {};
      const friends = await usersCollection.find(query).toArray();
      res.send(friends);
    });

    // get friends users
    app.get("/friends/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        email: email,
      };
      const friends = await friendsCollection.find(query).toArray();
      res.send(friends);
    });

    // save friends
    app.post("/connection", async (req, res) => {
      const friend = req.body;
      const result = await friendsCollection.insertOne(friend);
      res.send(result);
    });

    app.put("/updatelike/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const like = req.body;
      console.log(like);
      const option = { upsert: true };
      const updatedlike = {
        $set: {
          likes: like.like,
        },
      };
      const result = await postsCollection.updateOne(
        filter,
        updatedlike,
        option
      );
      res.send(result);
    });

    //comepoents collection
    app.post("/comments", async (req, res) => {
      const comment = req.body;
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    //show cooments on front end
    app.get("/comment", async (req, res) => {
      const post_id = req.query.post_id;
      const query = { post_id: post_id };

      const comment = await commentsCollection.find(query).toArray();
      res.send(comment);
    });

     //add a job to db
     app.post("/addajob", async (req, res) => {
        const job = req.body;
        const result = await jobsCollection.insertOne(job);
        res.send(result);
    });

     // get all the jobs
     app.get('/jobs', async (req, res) => {
        const query = {};
        const jobs = await jobsCollection.find(query).toArray();
        res.send(jobs);
    });

     // get a specific job
     app.get('/job/:id', async (req, res) => {
        const id = req.params.id; 
        console.log(id);
        const query = {_id: ObjectId(id)};
        const job = await jobsCollection.findOne(query);
        res.send(job);
    });
    
    // generate jwt
    // app.get('/jwt', async (req, res) => {
    //     const email = req.query.email;
    //     const query = { email: email };
    //     const user = await usersCollection.findOne(query);
    //     if (user) {
    //         const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
    //         return res.send({ accessToken: token });
    //     }
    //     res.status(403).send({ accessToken: '' })
    // });
    app.get("/userimg", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const about = await usersCollection.find(query).toArray();
      res.send(about);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("jobStack server is running");
});

app.listen(port, () => console.log(`jobStack running on ${port}`));
