let host = "http://127.0.0.1";
let apiPort = 3001;
let clientPort = 3000;

let adress = `${host}:${apiPort}`;

export const headers = {
    Origin: "http://localhost:3000",
    "Content-Type": "application/x-www-form-urlencoded; Charset=UTF-8",
    Accept: "application/json"
}
export const links = {
    api: `${adress}/api`,
    cdn: `${adress}/cdn`,
    origin: `${host}:${clientPort}`
}
