let host = "http://127.0.0.1";
let apiPort = 3001;
let clientPort = 3000;

let adress = `${host}:${apiPort}`;

export default {
  api: `${adress}/api`,
  cdn: `${adress}/cdn`,
  origin: `${host}:${clientPort}`
};
