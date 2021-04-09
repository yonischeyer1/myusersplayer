import { genaratePortNumber, runDockerImage, getDockerContainerIdByName, copyFileToContainer, removeContainerByName } from "../utils/IHost";
import { startChormium, startVnc, startHandsSparkServer } from "../utils/IContainer";
import IHands from "../utils/Ihands";
import IEyes from "../utils/IEyes";
import { APP_CWD } from "../utils/general";
export const IMAGE_NAME = 'ioroboto'

class Container {
    constructor() {
       this._userId = null
       this.autoTaggerData = null
       this.startRecordTimeStamp = null
       this.ihands = null
       this.ieyes  = null
       this.ioActions = []
       this.startUrl = ""
       this.mode = 'player'
       this.containerId = ''
       this.port = 0
       this.containerName = ''
       this.containerProcess = {
           vnc:{name:'x11vnc', pid:null},
           video:{name:'ffmpeg', pid:null},
           browser:{name:'chromium', pid:null},
           hands:{name:'java', pid:null}
       }
       this._containerServicesPorts = {
           vnc:0,
           hands:0,
           eyes:0,
           devCustom:0
       }
       this.loadingFunction = null
    }
    async init(startUrl = null, userId = null) {
        try {
            let containerName;
            this._containerServicesPorts.vnc = await genaratePortNumber();
            this._containerServicesPorts.hands = await genaratePortNumber();
            this._containerServicesPorts.eyes = await genaratePortNumber();
            this._containerServicesPorts.devCustom = await genaratePortNumber();
            containerName = `${IMAGE_NAME}${this._mode}${this._containerServicesPorts.vnc}`

            await runDockerImage(this._containerServicesPorts, containerName, IMAGE_NAME); 

            let containerId = (await getDockerContainerIdByName(containerName)).toString().replace(/[^a-zA-Z0-9]/g, ''); //remove spiceal chars from id
            this.setState(this._containerServicesPorts.vnc, containerId, containerName)

            this._ihands = new IHands(this._containerServicesPorts.hands);
            this._ieyes = new IEyes(this._containerServicesPorts.eyes);
            
            const userSessionFolderPath = `${APP_CWD}sessions/${userId}`
            await copyFileToContainer(this._containerId, userSessionFolderPath)
            const browserPid = await startChormium(this._containerId, this._containerProcess.browser.name, startUrl, userId);
            this._containerProcess.browser.pid = browserPid;
            const vncPid = await startVnc(this._containerId, this._port,this._containerProcess.vnc.name);
            this._containerProcess.vnc.pid = vncPid;

        } catch(err) {

        }
    }
    setState(port, containerId, containerName) {
        this._containerId = containerId;
        this._containerName = containerName;
        this._port = port;
    }

    async play(noLivePreview = true, action) {
        return new Promise((resolve, reject)=>{
            (async()=>{
                    await startHandsSparkServer(this._containerId, this._containerProcess.hands.name)
                    setTimeout(()=>{
                        (async ()=>{ 
                            const resp = await this._ieyes.playAction(action)
                            await removeContainerByName(this._containerName);
                            resolve(resp)
                        })()
                    },5000)
            })()
        })
    //     return;
    }

    async startVnc() {
        const vncPid = await startVnc(this._containerId, this._port, this._containerProcess.vnc.name);
        this._containerProcess.vnc.pid = vncPid;
    }
}

module.exports = {Container}


