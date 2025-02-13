const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require('mime-types');
const dotenv  = require("dotenv")
dotenv.config()

const s3Client = new S3Client({ 
    region:process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey:process.env.SECRETACCESSKEY
    }
});

const PROJECT_ID = process.env.PROJECT_ID;
async function init(){
    console.log("execuiting init function");

    const outDirPath = path.join(__dirname, "output");

    const p = exec(`cd ${outDirPath} && npm install && npm run build`);

    p.stdout.on('data', (data) => {
        console.log(data.toString());
    });


    p.stdout.on('error', (data) => {
        console.log( "error", data.toString());
    });

    p.on('close', async () => {
        console.log(`Build Complete `);
        const distFolderPath = path.join(__dirname, "output", "dist");
        const distFolderContent = fs.readdirSync(distFolderPath ,  {recursive: true});
        for(const file of distFolderContent){
            let filePath  = path.join(distFolderPath, file);
            if(fs.lstatSync(filePath).isDirectory()) continue
            console.log("Uploading file", filePath);
            const command = new PutObjectCommand({
                Bucket:"delplyment-pipline-clone",
                Key:`__outputs/${PROJECT_ID}/${file}`,
                Body:fs.createReadStream(filePath),
                ContentType:mime.lookup(filePath)
            })
            
            await s3Client.send(command);
            console.log("Uploaded file", filePath);
        }

        console.log("Done......");
    });

}

init();