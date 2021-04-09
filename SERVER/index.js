const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { playTestSuite } = require('./player');

const config = {
    name: 'ioroboto-player-server',
    port: 3000,
    host: '0.0.0.0',
};

const app = express();

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cors());
app.post('/sendEmail', (req, res) => {
    (async()=>{
        const resp = await playTestSuite();
        console.log("resp",resp)
        res.send(resp)
    })()
})


const startServer = async function () {

    app.listen(config.port, config.host, (e)=> {
        if(e) {
            throw new Error('Internal Server Error');
        }
        console.log(`${config.name} running on ${config.host}:${config.port}`);
    });
}
startServer()
module.exports = startServer;