const express  = require('express');
const Queue  =   require('bull');

const server  = express();
server.use(express.json());

const PORT  = process.env.PORT  || 9000;


const muqueue   = new Queue("myfiurstqueue",{
    redis :{
        port : 6379 ,
        host: "localhost"
    },
    limiter :{
        max: 1000 ,
        duration : 5000
    }
})

muqueue.isReady().then(()=>{
    console.log("Connection is established between with redis ");
})

muqueue.on("global:completed", (job , res)=>{
    console.log("The queue task is completed = ", job.data, res);
})

muqueue.process(function (job ,done){
    try {
        console.log("Job running on  the server ");
        done(job.data)
    }
    catch(error){
        console.log(error);
    }
})

server.get("/name",async (req, res)=>{
    try {
        const qres = await muqueue.add({name :"akash vhotkar "});
        return res.status(200).json({ data: qres.data});
    }
    catch(error){
        console.log(error);
        return  res.status(500).json({message : "Request failed with status code 500"})
    }
})

server.listen(PORT ,  ()=>{
    console.log("the server is running on port ", PORT)
})

