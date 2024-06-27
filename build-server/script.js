const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const Redis = require('ioredis');

const publisher=new Redis('');


const s3Client= new S3Client({
    region:'',
    credentials:{
        accessKeyId:'',
        secretAccessKey:''
    }
})

const PROJECT_ID=process.env.PROJECT_ID;

const publishLog = (log) =>{
    publisher.publish(`logs:${PROJECT_ID}`,JSON.stringify({log}));
}

const init = async () =>{
    console.log('Executing script.js');
    publishLog('Build started...');
    const outDirPath=path.join(__dirname,'output');
    
    const p = exec(`cd ${outDirPath} && npm install && npm run build`);

    p.stdout.on('data', (data) => {
        console.log(data.toString());
        publishLog(data.toString());
    });

    p.stdout.on('error', (data) => {
        console.log('Error: ',data.toString());
        publishLog(`Error: ${data.toString()}`);
    });

    p.on('close',async ()=>{
        console.log('Build complete');
        publishLog('Build complete');

        const distFolderPath=path.join(__dirname,'output','dist');
        const distFolderContents = fs.readdirSync(distFolderPath,{recursive:true});

        publishLog('Starting to upload');
        for(const file of distFolderContents){
            const filePath=path.join(distFolderPath,file);
            if(fs.statSync(filePath).isDirectory()) continue;

            console.log("Uploading ",filePath);
            publishLog(`Uploading ${file}`);

            const command = new PutObjectCommand({
                Bucket:'',
                Key:`__outputs/${PROJECT_ID}/${file}`,
                Body:fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath)
            })
            await s3Client.send(command);
            publishLog(`Uploaded ${file}`);
            console.log("Uploaded ",filePath);
        }
        publishLog("Done...");
        console.log("Done...");
    })
}

init();