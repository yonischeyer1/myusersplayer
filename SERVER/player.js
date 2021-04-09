const AdmZip = require('adm-zip');
const { APP_CWD } = require('./utils/general');
const fs = require('fs')
const {Container} = require('./services/container.service')
const util = require('util')

async function playTestSuite ()  { 
    return new Promise((resolve, reject)=>{
    (async()=>{
        await decompress()
        const testSuite = JSON.parse(JSON.parse(fs.readFileSync(`${APP_CWD}/output/harif.json`)))
        for(const test of testSuite) {
           console.log("test",test.id)
           await playTest(test)
        }
        resolve()
    })()
})
}

async function playTest (test) {
    return new Promise((resolve, reject)=>{
        (async()=>{
    const playingContainerInstance = new Container();
    console.log("test id",test.action.startUrl)
    await playingContainerInstance.init(test.action.startUrl, test.userId);
    const testResp = await (await playingContainerInstance.play(true, test.action)).json()
    resolve(testResp.success);
})()
})
}
 
async function decompress() {
    return new Promise((resolve, reject)=>{
        var zip = new AdmZip("./testFiles/harif.zip");
        zip.extractAllTo("output", /*overwrite*/true);
        //TODO: move extracted sessions folders from zip to sessions folder
        resolve();
    })
}

module.exports = {playTestSuite}