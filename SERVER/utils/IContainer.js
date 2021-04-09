
import { runContainerCMD } from "./IHost";
import { sleep } from "./general";

export async function convertVideoFile(containerId) {
    const command_to_exec = `ffmpeg -i output.avi output.mp4`
    const response = await runContainerCMD(containerId, command_to_exec, null, true);
    return response;
}

export async function stopContainerProcess(containerId, pid) {
    const command = `kill ${pid}`
    const response = await runContainerCMD(containerId, command,null, true);
    return response
}

export async function startVnc(containerId, rfbport, processName)  {
    const command = `x11vnc -rfbport 5945 -passwd TestVNC -display :1 -N -forever &  export DISPLAY=:1 `
    await runContainerCMD(containerId, command);
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function startIceweasel(containerId, processName, startUrl, userName = "users3")  {
    const command = `Xvfb :1 -screen 0 1024x768x24 </dev/null & export DISPLAY=:1 && iceweasel ${startUrl} -P ${userName} & export DISPLAY=:1`
    const response = await runContainerCMD(containerId, command, null, true);
    console.log("startChormium response",response)
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function startChormium(containerId, processName, startUrl, userName = "users3")  {
    const command = `Xvfb :1 -screen 0 1024x768x24 </dev/null & export DISPLAY=:1 && chromium ${startUrl} --user-data-dir=${userName} --window-size=1024,768 --no-sandbox --disable-extensions --disable-translate &  export DISPLAY=:1`
    const response = await runContainerCMD(containerId, command, null, true);
    console.log("startChormium response",response)
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function getModel() {
    
}

export async function compareImages(containerId, img1, img2)  {
    await createFile(containerId, "img1.txt", img1)
    await createFile(containerId, "img2.txt", img2)
    const command = `compare -metric PSNR inline:img1.txt inline:img2.txt d.png`
    const response = await runContainerCMD(containerId, command, null, false);
    console.log("compareImages command img1", img1)
    console.log("compareImages command img1", img2)
    return response
}

export async function createFile(containerId, fileName, content) {
    const command = `echo "${content}" > ${fileName}`
    const response = await runContainerCMD(containerId, command, null, false);
    return response;
}

export async function startVideoRecording(containerId, processName)  {
    const command = "ffmpeg -f x11grab -r 24 -s 1024x768 -i :1 -c:v rawvideo -pix_fmt yuv420p -s 1024x768 output.avi"
    await runContainerCMD(containerId, command);
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function startHandsSparkServer(containerId, processName)  {
    const command_to_exec = `export DISPLAY=:1 && java -jar iocore.jar `
    await runContainerCMD(containerId, command_to_exec);
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function startIORecording(containerId, processName)  {
    const command_to_exec = `export DISPLAY=:1 && java -jar iocore.jar `
    await runContainerCMD(containerId, command_to_exec);
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function startPlayingIoFile(containerId, processName)  {
    const command_to_exec = `export DISPLAY=:1 && java -jar iocore.jar -p`
    await runContainerCMD(containerId, command_to_exec);
    const pid = await getPidByName(containerId, processName);
    return pid
}

export async function removeFileFromContainer(containerId, fileName) {
    const command = `rm ${fileName}`
    const response = await runContainerCMD(containerId, command);
    return response
}

export async function getPidByName(containerId, processName) {
    const command_to_exec = `pidof ${processName}`
    const response = await runContainerCMD(containerId, command_to_exec);
    return response;
}

export async function checkIfProcessIsAlive(containerId, pid) {
    pid = pid.replace(/[^a-zA-Z0-9]/g, '');
    const command_to_exec = `kill -0 ${pid}`
    const response = await runContainerCMD(containerId, command_to_exec);
    console.log("checkIfProcessIsAlive",response)
    const finalResp = response.err ? response.err : (response.exit ? "a" : response)
    const resp = !(finalResp.indexOf('No such process') > -1);
    return resp
}


export async function waitUnitlCoreStops(containerId, pid)  {
    await sleep(1000)
    const isAlive = await checkIfProcessIsAlive(containerId, pid);
    if(isAlive) {
        return await waitUnitlCoreStops(containerId, pid);
    }
    return false;
}

export async function waitUnitlCoreStopsByProcessName(containerId, name)  {
    await sleep(1000)
    const isAlive = await getPidByName(containerId, name);
    if(isAlive) {
        return await waitUnitlCoreStopsByProcessName(containerId, name);
    }
    return false;
}

