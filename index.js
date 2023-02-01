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
    const jobsCollection = client.db("jobStack").collection("jobs");
    const projectsCollection = client.db("jobStack").collection("projects");

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
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //post projects
    app.post("/projects", async (req, res) => {
      const projects = req.body;
      const result = await projectsCollection.insertOne(projects);
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



    //get projects
    app.get("/projects/", async (req, res) => {
      const emailQuery = req.query.email;
      const query = { email: emailQuery };
      const projects = await projectsCollection.find(query).toArray();
      res.send(projects);
    });




    // add comments

    //   app.put('/connection', async (req, res) => {
    //     const id = req.params.email;
    //     const requestEmail = req.body.requestEmail;
    //     const filter = {email };
    //     const options = { upsert: true };
    //     const updatedDoc = {
    //         $push: {
    //             requestSent: requestEmail,
    //         }
    //     }
    //     const result = await postsCollection.updateOne(filter, updatedDoc, options);
    //     res.send(result);
    // });

    // send friend request
    app.put('/connection', async (req, res) => {
      const email = req.body.filterEmail;
      const filter = { email };
      const received = req.body.received;
      const option = { upsert: true };
      const updatedDoc = {
        $push: {
          requestReceived: { received },
        },
      };
      const result1 = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      // const email2 = req.body.filterEmail2;
      // const filter2 = { email2 }
      // const sent = req.body.sent;
      // const updatedDoc2 = {
      //   $push: {
      //     requestSent: { sent },
      //   },
      // };
      // const result2 = await usersCollection.updateOne(
      //   filter2,
      //   updatedDoc2,
      //   option
      // );
      console.log(result1);
      res.send(result1);
    });




    // get the user to access who send friend request
    app.get("/friendrequest/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    // get the user from received request
    app.get("/receivedrequest/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });


    // delete friend request
    app.put('/requestdeclined/:email', async (req, res) => {
      const email = req.params.email;
      const received = req.body;
      const filter = { email };
      console.log(received);
      const option = { upsert: true };
      const updatedDoc = {
        $pull: {
          requestReceived: { received },
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    //  // delete a friend request
    //  app.delete('/requestdeclined/:email', async (req, res) => {
    //   const query = req.params.email;
    //   const email = req.body.email; 
    //   const filter = { query };
    //   const user = await usersCollection.findOne(filter);
    //   user.requestReceived.map(request => {
    //     if(request.received.email == email){
    //       const result = await usersCollection.deleteOne(filter2);

    //     }
    //   })
    //   res.send(result);
    // })

    //likes added to db
    app.put("/updatelike/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const like = req.body;
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


    //adding user's images


    app.put("/usersQueryEmail/", async (req, res) => {
      const emailQuery = req.query.email;
      const query = { email: emailQuery };
      const post = req.body;
      const option = { upsert: true };

      if (post.bannerImage) {

        const updatedPost = {
          $set: {
            bannerImage: post.bannerImage
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }

      if (post.profileImage) {

        const updatedPost = {
          $set: {
            profileImage: post.profileImage
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }

      if (post.firstName || post.lastName || post.headline) {
        const updatedPost = {
          $set: {
            firstName: post.firstName,
            lastName: post.lastName,
            headline: post.headline,
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }

      if (post.city || post.country) {
        const updatedPost = {
          $set: {
            city: post.city,
            country: post.country
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }

      if (post.about) {
        const updatedPost = {
          $set: {
            about: post.about
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }

      if (post.school || post.university) {
        const updatedPost = {
          $set: {
            school: post.school,
            university: post.university
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }

      if (post.skills) {
        const updatedPost = {
          $set: {
            skills: post.skills
          }
        }
        const result = await usersCollection.updateOne(query, updatedPost, option);
        res.send(result);
      }



    });

    //profile image 

    // app.put("/usersQueryEmail/", async (req, res) => {
    //   const emailQuery = req.query.email;
    //   const query = { email: emailQuery };
    //   const post = req.body;
    //   console.log(post)
    //   const option = { upsert: true };

    //   const updatedPost = {
    //     $set: {
    //       profileImage: post.bannerImage,
    //     },
    //   };
    //   const result = await usersCollection.updateOne(query, updatedPost, option);
    //   res.send(result);
    // });




    //get a individual user by email

    app.get("/usersQueryEmail/", async (req, res) => {
      const emailQuery = req.query.email;
      const query = { email: emailQuery };
      const user = await usersCollection.find(query).toArray();
      console.log(user);
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
      console.log(job);
      const result = await jobsCollection.insertOne(job);
      res.send(result);
    });

    // get all the jobs
    app.get('/jobs', async (req, res) => {
      const query = {};
      const jobs = await jobsCollection.find(query).toArray();
      res.send(jobs);
    });

    // get all the users in hire route
    app.get("/alluser", async (req, res) => {
      const query = {};
      const allUser = await usersCollection.find(query).toArray();
      res.send(allUser);
    });

    //get a individual user by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      res.send(user);
    });

    //get a individual user by id
    app.get("/candidate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    // get a specific job by id
    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const job = await jobsCollection.findOne(query);
      res.send(job);
    });

    // get a specific job by email
    app.get('/jobs/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = {
        email: email
      };
      const jobPost = await jobsCollection.find(query).toArray();
      res.send(jobPost);
    });

    // delete a post
    app.delete('/post/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await jobsCollection.deleteOne(filter);
      res.send(result);
    })










    // delete a post
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    })

    // update a post
    app.put("/editajob", async (req, res) => {
      const id = req.body.id;
      const filter = { _id: ObjectId(id) };
      const job = req.body;
      const option = { upsert: true };
      const updatedPost = {
        $set: {
          title: job.title,
          location: job.location,
          jobType: job.jobType,
          category: job.category,
          homeOffice: job.homeOffice,
          availability: job.availability,
          skills: job.skills,
          aboutUs: job.aboutUs,
          task: job.task,
          profile: job.profile,
          offer: job.offer,
          vacancy: job.vacancy,
          url: job.url,
          salary: job.salary,
        },
      };
      const result = await jobsCollection.updateOne(
        filter,
        updatedPost,
        option
      );
      res.send(result);
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
