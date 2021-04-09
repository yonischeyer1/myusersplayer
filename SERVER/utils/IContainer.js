
const { runContainerCMD } = require("./IHost");

 async function startVnc(containerId, rfbport, processName)  {
    const command = `x11vnc -rfbport 5945 -passwd TestVNC -display :1 -N -forever &  export DISPLAY=:1 `
    await runContainerCMD(containerId, command);
    const pid = await getPidByName(containerId, processName);
    return pid
}

 async function startChormium(containerId, processName, startUrl, userName = "users3")  {
    const command = `Xvfb :1 -screen 0 1024x768x24 </dev/null & export DISPLAY=:1 && chromium ${startUrl} --user-data-dir=${userName} --window-size=1024,768 --no-sandbox --disable-extensions --disable-translate &  export DISPLAY=:1`
    const response = await runContainerCMD(containerId, command, null, true);
    console.log("startChormium response",response)
    const pid = await getPidByName(containerId, processName);
    return pid
}

 async function startHandsSparkServer(containerId, processName)  {
    const command_to_exec = `export DISPLAY=:1 && java -jar iocore.jar `
    await runContainerCMD(containerId, command_to_exec);
    const pid = await getPidByName(containerId, processName);
    return pid
}


 async function getPidByName(containerId, processName) {
    const command_to_exec = `pidof ${processName}`
    const response = await runContainerCMD(containerId, command_to_exec);
    return response;
}



module.exports = {startChormium, startVnc, startHandsSparkServer}
