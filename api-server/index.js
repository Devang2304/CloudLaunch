const express = require('express');
const { generateSlug } = require('random-word-slugs');
const {ECSClient,RunTaskCommand} = require('@aws-sdk/client-ecs');
const Redis = require('ioredis');
const { Server } = require('socket.io');
const cors = require('cors');



const subscriber=new Redis('');

const io = new Server({cors:'*'});

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)
    })
})

io.listen(9002,()=>{
    console.log('Socket Server 9002')
})

const app = express();
const port = 9000;

app.use(cors());

const ecsClient = new ECSClient({
    region:'',
    credentials:{
        accessKeyId:'',
        secretAccessKey:''
    }
});

const config = {
    CLUSTER:'',
    TASK:''
}

app.use(express.json());

app.post('/project', async (req,res)=>{
    const {gitURL,slug} =req.body;
    const projectSlug = slug? slug :generateSlug();

    const command = new RunTaskCommand({
        cluster:config.CLUSTER,
        taskDefinition:config.TASK,
        launchType:'FARGATE',
        count:1,
        networkConfiguration:{
            awsvpcConfiguration:{
                assignPublicIp:'ENABLED',
                subnets:[''],
                securityGroups:['']
            }
        },
        overrides:{
            containerOverrides:[    
                {
                    name:'build-image',
                    environment: [
                        {name: 'GIT_REPOSITORY_URL', value: gitURL},
                        {name: 'PROJECT_ID', value: projectSlug}
                    ]
                }
            ]
        }
    })
    await ecsClient.send(command);

    return res.json({status :'queued', data:{projectSlug, url:`http://${projectSlug}.localhost:8000`}});
})

const initRedisSubscribe = () =>{
    console.log('Subscribed to logs....')
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message) => {
        io.to(channel).emit('message', message)
    })
}

initRedisSubscribe();

app.listen(port, () => {
    console.log(`API server running...${port}`);
});