const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const PORT = 8000

let BASE_PATH  = "https://delplyment-pipline-clone.s3.us-east-1.amazonaws.com/__outputs"

const proxy = httpProxy.createProxyServer();

app.use((req,res)=>{
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];

    const resolvesTo = `${BASE_PATH}/${subdomain}`

    return proxy.web(req,res , {target:resolvesTo , changeOrigin:true});
})

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if(url === "/"){
        proxyReq.path += "index.html"
    }
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})
