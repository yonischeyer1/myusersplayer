import { APP_CWD, isWindows, getRandomArbitrary, APP_DOCKER_META_PATH, ExtractFrames } from "./general";
const { spawn } = require("child_process");
import config from '../config'

 function runLocalCMD(cmd, condToReturn, onExit, onData) {
    try {
        return new Promise((resolve, reject)=>{
                console.log("cmd", cmd)
                const someCMD = spawn(cmd, { shell: true})
                if(!onExit) {
                    if(typeof onData === "function") {
                        someCMD.stdout.pipe(new ExtractFrames("FFD8FF")).on("data", async (data) => {
                            onData(data);
                        })
                    } else {
                        someCMD.stdout.on("data", async (data) => {
                            data = data.toString()
                            console.log("data",data)
                            if(typeof condToReturn !== "function") {
                                console.log(`someCMD.stdout condToReturn !== function`)
                                someCMD.kill()
                                resolve(data);
                            } else if(typeof condToReturn === "function" && condToReturn(data)) {
                                console.log(`someCMD.stdout condToReturn !== function && condToReturn(data)`)
                                someCMD.kill()
                                resolve(data)
                            }
                        })
                    }
                    someCMD.stderr.on("data", (err) => {
                        console.log(`someCMD.stderr ${err.toString()}`)
                        if(typeof onData !== "function"){
                            someCMD.kill()
                            resolve({err:err.toString()})
                        }
                    })
                } 
                someCMD.on("exit", (data) => {
                    if(data) {
                        data = data.toString()
                    }
                    console.log(`exit `,data)
                    someCMD.kill()
                    resolve({exit:true});
                })
        })
    } catch (err) {

    }
}

 async function runDockerImage(ports, containerName ,imageName, devPort) {
    const cmd = `docker run --log-driver none --shm-size=1g --name ${containerName} -d -p ${ports.vnc}:${config.CONTAINER_VNC_PORT} -p ${ports.hands}:${config.CONTAINER_IOCORE_PORT} -p ${ports.eyes}:${config.CONTAINER_VIDEO_ANALYZER_PORT} -p ${ports.devCustom}:${config.CONTAINER_DEV_CUSTOM_PORT} ${imageName} `
    const response = await runLocalCMD(cmd);
    return response;
}


 async function copyFileToContainer(containerId, fileLocalOSPath) {
    const cotainerIoFilePath = `${containerId}:/usr/src/app`
    const outputIoFilePathInHostMachine = fileLocalOSPath;
    const command = isWindows() ? `${APP_CWD}\\dockerMeta\\pollIoFile.bat ${outputIoFilePathInHostMachine} ${cotainerIoFilePath}` : `${APP_CWD}/dockerMeta/pollIoFile.sh ${outputIoFilePathInHostMachine} ${cotainerIoFilePath}`
    const response = await runLocalCMD(command, (response) => {
        return response.indexOf("waited") === -1 && response.indexOf(containerId) === -1
    });
}

 async function removeContainerByName(containerName) {
    const command = `docker rm -f ${containerName}`
    await runLocalCMD(command);
    const command2 = " docker system prune -a --volumes --filter label=repo=ioroboto --filter label=repo=amd64/debian -f"
    const response = await runLocalCMD(command2);
    return response;
}

 async function getDockerContainerIdByName(containerName) {
    const command = `docker ps -aqf "name=${containerName}"`;
    const response = await runLocalCMD(command);
    return response;
}


 async function isPortUsed(port) {
    const command = isWindows() ? `netstat -ano | findStr "${port}" `  : `lsof -Pi :${port} -sTCP:LISTEN -t`;
    const response = await runLocalCMD(command);
    return response['exit'] ? false : true;
}



 async function genaratePortNumber() {
    const port = getRandomArbitrary(5000, 6000)
    const isPortUsedFlag = await isPortUsed(port)

    if(isPortUsedFlag) {
        return genaratePortNumber();
    } else {
        return port;
    }
}

 async function removeUserSessionFolder(userSessionFolderPath) {
    const cmd = `rm -rf ${userSessionFolderPath}`;
    await runLocalCMD(cmd);
    return;
}

module.exports = {genaratePortNumber, runDockerImage, getDockerContainerIdByName, copyFileToContainer, removeContainerByName}