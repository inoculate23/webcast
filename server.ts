import { WHIPEndpoint, Broadcaster } from "@eyevinn/whip-endpoint";

let iceServers = null;
if (process.env.ICE_SERVERS) {
  iceServers = [];
  process.env.ICE_SERVERS.split(",").forEach(server => {
    // turn:<username>:<password>@turn.eyevinn.technology:3478
    const m = server.match(/^turn:(\S+):(\S+)@(\S+):(\d+)/);
    if (m) {
      const [ _, username, credential, host, port ] = m;
      iceServers.push({ urls: "turn:" + host + ":" + port, username: username, credential: credential });
    }
  });
}
if (iceServers) {
  console.log("Using ICE servers:");
  iceServers.forEach(server => {
    console.log(server);
  });
}

const broadcaster = new Broadcaster({
  port: parseInt(process.env.BROADCAST_PORT || "8001"),
  hostname: process.env.BROADCAST_HOSTNAME,
  prefix: process.env.BROADCAST_PREFIX,
  iceServers: iceServers,
});
broadcaster.listen();

const endpoint = new WHIPEndpoint({ 
  port: parseInt(process.env.PORT || "8000"), 
  iceServers: iceServers,
  hostname: process.env.WHIP_ENDPOINT_HOSTNAME,
  enabledWrtcPlugins: [ "broadcaster" ],
});
endpoint.registerBroadcaster(broadcaster);
endpoint.listen();
