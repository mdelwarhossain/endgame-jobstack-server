const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
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
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

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
    }
    finally {
    }
}
run().catch(console.log);

app.get("/", async (req, res) => {
    res.send("jobStack server is running");
});

app.listen(port, () => console.log(`jobStack running on ${port}`));
