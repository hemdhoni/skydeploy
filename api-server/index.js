const express = require('express');
const { generateSlug} = require('random-word-slugs')
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const dotenv = require("dotenv")
dotenv.config()
const app = express();
const PORT = 9000

const ecsClient = new ECSClient({
    region:process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey:process.env.SECRETACCESSKEY
    }
});

const config = {
    CLUSTER:process.env.CLUSTER,
    TASK:process.env.TASK
}
app.use(express.json());

app.post("/project" , async (req,res)=>{
    const { gitUrl } = req.body;
    const projectSlug = generateSlug();

    // Spin the container
    const command = new RunTaskCommand({
        cluster:config.CLUSTER,
        taskDefinition:config.TASK,
        launchType:"FARGATE",
        count:1,
        networkConfiguration:{
            awsvpcConfiguration:{
                assignPublicIp:"ENABLED",
                subnets:["subnet-09124b0e1d6d35312" , "subnet-05407826d040e5d4e" , "subnet-0f31833010ac531ec" , "subnet-02fac247c5fcebebb" , "subnet-0c02a0a6f4fed5250" , "subnet-0e7e4d1203e5d0793"],
                securityGroups:["sg-0771a34a19fca30e7"]
            }
       },
       overrides:{
          containerOverrides:[
            {
                name:"builder-server-image",
                environment:[
                    {
                        name:"GIT_REPOSITORY_URL",
                        value:gitUrl
                    },
                    {
                        name:"PROJECT_ID",
                        value:projectSlug
                    }
                ]
            }
          ]
       }
    })
    await ecsClient.send(command);
    res.json({status:"queued" , data: {projectSlug ,  url:`http://${projectSlug}.localhost:8000`}});
})


app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
} )