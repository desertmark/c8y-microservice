require("dotenv").config();
const { Client, FetchClient, BasicAuth } = require('@c8y/client');
const express = require("express");
const app = express();
const mqtt = require("mqtt");

const event = {
  "channel": "/managedobjects/23133664",
  "id": "152365241",
  "data": {
    "data": {
      "additionParents": {
        "references": [],
        "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/additionParents"
      },
      "owner": "device_fga-ubuntu-laptop",
      "childDevices": {
        "references": [],
        "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/childDevices"
      },
      "childAssets": {
        "references": [],
        "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/childAssets"
      },
      "creationTime": "2023-10-26T15:39:26.678Z",
      "type": "thin-edge.io",
      "lastUpdated": "2023-10-26T15:39:37.556Z",
      "childAdditions": {
        "references": [
          {
            "managedObject": {
              "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/8296123",
              "id": "8296123"
            },
            "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/childAdditions/8296123"
          }
        ],
        "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/childAdditions"
      },
      "name": "fga-ubuntu-laptop",
      "deviceParents": {
        "references": [],
        "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/deviceParents"
      },
      "assetParents": {
        "references": [],
        "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664/assetParents"
      },
      "self": "http://t1782218530.eu-latest.cumulocity.com/inventory/managedObjects/23133664",
      "id": "23133664",
      "com_cumulocity_model_Agent": {},
      "c8y_IsDevice": {}
    },
    "realtimeAction": "UPDATE"
  }
}

// Application endpoints
const routes = require("./routes");
routes(app);

// Server listening on port 80
app.use(express.json());

subscribeEvent();
// mqttSubscribe();
app.listen(process.env.PORT);
console.log(
  `${process.env.APPLICATION_NAME} started on port ${process.env.PORT}`
);

async function mqttSubscribe()  {
  console.log("Subscribing mqtt")
  const client = mqtt.connect('tcp://mqtt.cumulocity.com', {
    usename: '',
    password: '',
    clientId: 'my_mqtt_js_client',
  });
  client.on("close", (e) => console.log("MQTT closed", e));
  client.on("end", (e) => console.log("MQTT End", e));

  client.on("error", (error) => {
    console.log("MQTT error: " + error);
  });

  client.on("connect", () => {
    console.log("MQTT connected")

    client.subscribeAsync("*");

    client.on("message", (topic, message) => {  
      console.log("Message received. Topic: " + topic + " Message: " + JSON.stringify(message, null,2));
    });
  });
}

async function subscribeEvent() {
  const baseUrl = process.env.C8Y_BASEURL || 'https://abb-robotics-spain.eu-latest.cumulocity.com';
  console.log("Subscribing events on " + baseUrl);
  const client = await Client.authenticate({ tenant: "", user: "", password: "" }, baseUrl);
  const devices = await client.inventory.detail(64133666)
  console.log(JSON.stringify(devices.data.name))
  client.realtime.subscribe('/managedobjects/*', (event) => {
    const isDeviceCreated = event.data.data.name.startsWith("device_");
    if (isDeviceCreated) {
      console.log("Device created", event);
    }
  });

  console.log("Subscribed events");
}