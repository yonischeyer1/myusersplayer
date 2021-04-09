async function playTestSuite (testSuite, testSuiteIdx)  { 
    //await this.disableUserActionsDropDown(testSuite, true);
    let testIdx = 0;
    for(const test of testSuite.suite) {
       await this.playTest(test, testSuite.id, testIdx, testSuiteIdx)
       testIdx++;
    }
    //await this.disableUserActionsDropDown(testSuite, false);
}