const AdmZip = require('adm-zip');
const { APP_CWD } = require('./utils/general');
const fs = require('fs')
const {Container} = require('./services/container.service')
const util = require('util')

async function playTestSuite ()  { 
    const results = []
    return new Promise((resolve, reject)=>{
    (async()=>{
        //await decompress()
        const testSuite = JSON.parse(JSON.parse(fs.readFileSync(`${APP_CWD}/output/harif.json`)))
        for(const test of testSuite) {
           console.log("test",test.id)
           results.push(await playTest(test))
        }
        resolve(results)
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
    resolve(testResp);
})()
})
}
 
async function decompress() {
    return new Promise((resolve, reject)=>{
        console.log("`${APP_CWD}testFiles/harif.zip`",`${APP_CWD}testFiles/harif.zip`)
        var zip = new AdmZip(`${APP_CWD}SERVER/testFiles/harif.zip`);
        zip.extractAllTo("output", /*overwrite*/true);
        //TODO: move extracted sessions folders from zip to sessions folder
        resolve();
    })
}

module.exports = {playTestSuite}