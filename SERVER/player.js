async function playTestSuite (testSuite)  { 
    //decompress file and play testSuite.json file
    for(const test of testSuite.suite) {
       await this.playTest(test)
       testIdx++;
    }
}

async function playTest (test, testSuiteId) {
    const playingContainerInstance = new Container();
    await playingContainerInstance.init(test.action.startUrl, test.userId);
    const testResp = await (await playingContainerInstance.play(true, test.action)).json()
    return testResp.success;
}