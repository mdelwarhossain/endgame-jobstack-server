const express = require("express");
const cors = require("cors");
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  CURSOR_FLAGS,
} = require("mongodb");
const { query } = require("express");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
// app.use(cors());
app.use(express.json());

// app.use(cors({
//   origin:"*",
//   methods:["GET","POST","PUT","DELETE"]

// }))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600'); // Set to 1 hour
  next();
});





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
    const CourseCollection = client.db("jobStack").collection("Course");
    const messageCollection = client.db("jobStack").collection("messages");
    const resumeCollection = client.db("jobStack").collection("resume");

    //get the posts from Createpost components
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });

    //myPostDetails

     app.get('/postDetails/:id',async(req,res) =>{
       const id = req.params.id;
       const query = { _id: ObjectId(id) };
       const collection = await postsCollection.findOne(query);
       res.send(collection) 
        
    })

    //get all the posts from database. show it in {NewsFeedposts} Component
    app.get("/allposts", async (req, res) => {
      const query = {};
      const cursor = postsCollection.find(query).sort({ _id: -1 });
      const posts = await cursor.toArray();
      res.send(posts);
    });

    //get all the posts from database for a specific user to show it in friend request candidate components
    app.get("/posts/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email)
      const query = {
        email,
      };
      const cursor = postsCollection.find(query).sort({ _id: -1 });
      const posts = await cursor.toArray();
      res.send(posts);
    });

    // add an user to the userscollection
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

    //resume collection

    // app.post("/createResume", async (req,res) =>{
    //   const resumeCreatorEmail = req.body;
    //   const result = await resumeCollection.insertOne(resumeCreatorEmail);
    //   res.send(result)
    // })

    app.post("/createResume", async (req, res) => {
      const resumeData = req.body;
      const resumeQuery = { email: resumeData.email };
      
      // Search for a document with the same email
      const existingResume = await resumeCollection.findOne(resumeQuery);
      
      if (existingResume) {
        // If a document with the same email already exists, return an error
        return res.status(409).send("Resume with the same email already exists.");
      } else {
        // If a document with the same email does not exist, insert the new document
        const result = await resumeCollection.insertOne(resumeData);
        res.send(result);
      }
    });





    //get resumeDetails

    app.get("/resumeDetails/:email", async (req,res) =>{
      const email = req.params.email;
      const query = {email}
      const result = await resumeCollection.findOne(query);
      res.send(result) 
    })
    

    app.put("/resumeDetails/:email", async (req, res) => {
      const emailQuery = req.params.email;
      const query = { email: emailQuery };
      const post = req.body;
      const jobDetails = req.body;
      console.log(jobDetails)
      const option = { upsert: true };


  



       if (post.school || post.university) {
        const updatedPost = {
          $set: {
            school: post.school,
            university: post.university,
          },
        };
        const result = await resumeCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.skills) {
        const updatedPost = {
          $set: {
            skills: post.skills,
          },
        };
        const result = await resumeCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

   if(post.Organization && post.Role) {
     const updatedPost = {
    $addToSet: {
      Job: { $each: [jobDetails] }
    }
  };

  const result = await resumeCollection.updateOne(
    query,
    updatedPost,
    option
  );

  res.send(result);
   }

   if(post.projectName && post.projectLink && post.projectDescription) {
     const updatedPost = {
    $addToSet: {
      Projects: { $each: [post] }
    }
  };

  const result = await resumeCollection.updateOne(
    query,
    updatedPost,
    option
  );

  res.send(result);
   }


    });


    //     if (post.school || post.university) {
  //       const updatedPost = {
  //         $set: {
  //           school: post.school,
  //           university: post.university,
  //         },
  //       };
  //       const result = await resumeCollection.updateOne(
  //         query,
  //         updatedPost,
  //         option
  //       );
  //       res.send(result);
  //     }

  //     if (post.skills) {
  //       const updatedPost = {
  //         $set: {
  //           skills: post.skills,
  //         },
  //       };
  //       const result = await resumeCollection.updateOne(
  //         query,
  //         updatedPost,
  //         option
  //       );
  //       res.send(result);
  //     }

  //   const updatedPost = {
  //   $addToSet: {
  //     Job: { $each: [jobDetails] }
  //   }
  // };

  // const result = await resumeCollection.updateOne(
  //   query,
  //   updatedPost,
  //   option
  // );

  // res.send(result);


  


    //message collection
    app.post("/messages", async (req, res) => {
      const message = req.body;
      const result = await messageCollection.insertOne(message);
      res.send(result);
    });

    // get all the users
    app.get("/users", async (req, res) => {
      const query = {};
      const friends = await usersCollection.find(query).toArray();
      res.send(friends);
    });

    app.get('/myPost/:email',async (req,res) =>{
      const email = req.params.email;
      const query={email}
      const posts = await postsCollection.find(query).toArray();
      res.send(posts)
    })


    // get all the recommended users
    app.get("/recommendedusers/:email", async (req, res) => {
      const email = req.params.email; 
      console.log(email);
      const query1 = {
        email
      }
      const user = await usersCollection.findOne(query1); 
      const query2 = {};
      const users = await usersCollection.find(query2).toArray();

      const data = users.filter(({email}) => email !== user.email)
      res.send(data)

      // if(user.friends?.length){
      //   const friendsEmail = user.friends.map(friend =>  friend.email); 
      //   console.log(friendsEmail);
      //   const data =  users.find(({email}) => friendsEmail.includes(!email) && email !== user.email
      //   )
      //   res.send(data)
      // }
      // else {
      //   users.filter(({email}) => {
      //     const data = email !== user.email
      //     res.send(data)
      //   })
      // }
      
    });

    //  // get all the recommended users
    //  app.get("/recommendedusers/:email", async (req, res) => {
    //   const email1 = req.params.email;
    //   // console.log(email);
    //   const query = {
    //     email: email1,
    //   };
    //   const user = await usersCollection.findOne(query);
    //   if (user?.friends?.length) {
    //     const users = await Promise.all(
    //       user.friends.map(async (frnd) => {
    //         // console.log(friend);
    //         const email = frnd.friend.email;
    //         // console.log(email);
    //         const query2 = { 
    //           email: !email
    //         };
    //         const data = await usersCollection.findOne(query2);
    //         // console.log(data);
    //         return data;
    //       })
    //     );
    //     // console.log(users);
    //     return res.send(users);
    //   } else {
    //     res.send("You have no connection");
    //   }
    // });

    //get messages
    app.get(
      "/messages/displayMessaages/:reciverId&:senderId",
      async (req, res) => {
        const receiverId = req.params.reciverId;
        const senderId = req.params.senderId;
        // console.log(receiverId,senderId)
        const query = {};
        const messages = await messageCollection.find(query).toArray();

        // okk

        const getMessages = messages.filter((m) => {
          return (
            (m.senderId === senderId && m.receiverId === receiverId) ||
            (m.receiverId === senderId && m.senderId === receiverId)
          );
        });

        res.send(getMessages);
      }
    );

    // get friends users
    app.get("/friends/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = {
        email: email,
      };
      const user = await usersCollection.findOne(query);
      if (user?.friends?.length) {
        const users = await Promise.all(
          user.friends.map(async (friend) => {
            // console.log(friend);
            const email = friend.email;
            // console.log(email);
            const query2 = {
              email: email,
            };
            const data = await usersCollection.findOne(query2);
            // console.log(data);
            return data;
          })
        );
        // console.log(users);
        return res.send(users);
      } else {
        res.send("You have no connection");
      }
    });

    //get projects
    app.get("/projects/:email", async (req, res) => {
      const emailQuery = req.params.email;
      const query = { email: emailQuery };
      const projects = await projectsCollection.find(query).toArray();
      res.send(projects);
    });

    app.get("/chatUser/:email", async (req, res) => {
      const email = req.params.email;
      const query = {};
      const allUsers = await usersCollection.find(query).toArray();
      const chatUsers = allUsers.filter((user) => user.email !== email);
      res.send(chatUsers);
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
    app.put("/connection", async (req, res) => {
      const email = req.body.filterEmail;
      const sentBy = req.body.filterEmail2; 
      console.log(sentBy);
      const filter = { email };
      const received = req.body.received;
      const option = { upsert: true };
      const updatedDoc = {
        $push: {
          requests: sentBy,
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
      // console.log(result1);
      res.send(result1);
    });

    // get the user to access who send friend request
    app.get("/friendrequest/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email);
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

    // sssssssss

    // accept friend request
    app.put("/friend/:email", async (req, res) => {
      const email = req.params.email;
      const friend1 = req.body;
      const frndEmail = req.body.email; 
      console.log('friend email',frndEmail);
      const filter = { email };
      const filter2 = { 
        email: frndEmail 
      };
      
      console.log(friend1);
      const option = { upsert: true };
      const user = await usersCollection.findOne(filter); 
      const friend2 = {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
      console.log(friend2);
      const updatedDoc = {
        $addToSet: {
          friends:  friend1 ,
        },
      };
      const updatedDoc2 = {
        $addToSet: {
          friends:  friend2 ,
        },
      };
      console.log(updatedDoc, updatedDoc2);
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      const result2 = await usersCollection.updateOne(
        filter2,
        updatedDoc2,
        option
      );
      res.send({result, result2});



    });

    //get a individual friend by id
    app.get("/myfriend/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    app.get('/limitCourse',async (req,res) =>{
      const query  = {};
      const course = await CourseCollection.find().limit(3).toArray();
      res.send(course)
    })

    // delete friend request
    app.put("/requestdeclined/:email", async (req, res) => {
      const email = req.params.email;
      const received = req.body;
      const filter = { email };
      // console.log(received);
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

    app.put("/user/:email", async (req, res) => {
      const emailQuery = req.params.email;
      const query = { email: emailQuery };
      const post = req.body;
      const option = { upsert: true };

      if (post.bannerImage) {
        const updatedPost = {
          $set: {
            bannerImage: post.bannerImage,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.profileImage) {
        const updatedPost = {
          $set: {
            profileImage: post.profileImage,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.name || post.headline) {
        const updatedPost = {
          $set: {
            name: post.name,
            headline: post.headline,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.city || post.country) {
        const updatedPost = {
          $set: {
            city: post.city,
            country: post.country,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.about) {
        const updatedPost = {
          $set: {
            about: post.about,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.school || post.university) {
        const updatedPost = {
          $set: {
            school: post.school,
            university: post.university,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
        res.send(result);
      }

      if (post.skills) {
        const updatedPost = {
          $set: {
            skills: post.skills,
          },
        };
        const result = await usersCollection.updateOne(
          query,
          updatedPost,
          option
        );
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

    //  app.get("/receivedrequest/:email", async (req, res) => {
    //       const email = req.params.email;
    //       console.log(email);
    //       const query = { email };
    //       const user = await usersCollection.findOne(query);
    //       res.send(user);
    //     });

    //     app.get("/usersQueryEmail/:email", async (req, res) => {
    //        const email = req.params.email;
    //       console.log(email);
    //       const query = { email };
    //       const user = await usersCollection.findOne(query);
    //       res.send(user);
    //     });

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
      // console.log(job);
      const result = await jobsCollection.insertOne(job);
      res.send(result);
    });

    // get all the jobs
    app.get("/jobs", async (req, res) => {
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
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      res.send(user);
    });

    //get a individual candidate by email in resume
    app.get("/candidateresume/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      // console.log(user);
      res.send(user);
    });

    //get a individual user by id
    app.get("/candidate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    //get a individual user by id in contact component
    app.get("/contact/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    // get a specific job by id
    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const job = await jobsCollection.findOne(query);
      res.send(job);
    });

    // get a specific job by email
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = {
        email: email,
      };
      const jobPost = await jobsCollection.find(query).toArray();
      res.send(jobPost);
    });

    // delete a post
    app.delete("/post/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await jobsCollection.deleteOne(filter);
      res.send(result);
    });

    // delete a user
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

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

    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          rol: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //for dashboard. find jobseekrs/recuriters seperatly
    app.get("/buyerseller/:id", async (req, res) => {
      let query = {};
      if (req.params.id) {
        query = { role: req.params.id };
      }

      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/deleteusers/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.rol === "admin" });
    });

    // Course route setup here
    app.get("/course", async (req, res) => {
      const query = {};
      const result = await CourseCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("jobStack server is running");
});

app.listen(port, () => console.log(`jobStack running on ${port}`));