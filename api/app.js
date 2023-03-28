"use strict";
const log4js = require("log4js");
const logger = log4js.getLogger("BasicNetwork");
const bodyParser = require("body-parser");
const http = require("http");
const util = require("util");
const express = require("express");
const app = express();
const expressJWT = require("express-jwt");
const jwt = require("jsonwebtoken");
const bearerToken = require("express-bearer-token");
const cors = require("cors");
const constants = require("./config/constants.json");

const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;

const helper = require("./app/helper");
const invoke = require("./app/invoke");
const qscc = require("./app/qscc");
const query = require("./app/query");

app.options("*", cors());
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
    parameterLimit: 1000000,
    limit: "50mb",
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

// set secret variable
app.set("secret", "thisismysecret");
app.use(
  expressJWT({
    secret: "thisismysecret",
  }).unless({
    path: ["/users", "/users/login", "/register"],
  })
);
app.use(bearerToken());

logger.level = "debug";

app.use((req, res, next) => {
  logger.debug("New req for %s", req.originalUrl);
  if (
    req.originalUrl.indexOf("/users") >= 0 ||
    req.originalUrl.indexOf("/users/login") >= 0 ||
    req.originalUrl.indexOf("/register") >= 0
  ) {
    return next();
  }
  var token = req.token;
  jwt.verify(token, app.get("secret"), (err, decoded) => {
    if (err) {

      res.send({
        success: false,
        message:
          "Failed to authenticate token. Make sure to include the " +
          "token returned from /users call in the authorization header " +
          " as a Bearer token",
      });
      return;
    } else {
      req.username = decoded.username;
      req.orgname = decoded.orgName;
      logger.debug(
        util.format(
          "Decoded from JWT token: username - %s, orgname - %s",
          decoded.username,
          decoded.orgName
        )
      );
      return next();
    }
  });
});

var server = http.createServer(app).listen(port, function () {
  console.log(`Server started on ${port}`);
});
logger.info("****************** SERVER STARTED ************************");
logger.info("***************  http://%s:%s  ******************", host, port);
server.timeout = 240000;

function getErrorMessage(field) {
  var response = {
    success: false,
    message: field + " field is missing or Invalid in the request",
  };
  return response;
}

// Register and enroll user
app.post("/users", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;
  logger.debug("End point : /users");
  logger.debug("User name : " + username);
  logger.debug("Org name  : " + orgName);
  if (!username) {
    res.json(getErrorMessage("'username'"));
    return;
  }
  if (!orgName) {
    res.json(getErrorMessage("'orgName'"));
    return;
  }

  var token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
      username: username,
      orgName: orgName,
    },
    app.get("secret")
  );

  let response = await helper.getRegisteredUser(username, orgName, true);

  logger.debug(
    "-- returned from registering the username %s for organization %s",
    username,
    orgName
  );
  if (response && typeof response !== "string") {
    logger.debug(
      "Successfully registered the username %s for organization %s",
      username,
      orgName
    );
    response.token = token;
    res.json(response);
  } else {
    logger.debug(
      "Failed to register the username %s for organization %s with::%s",
      username,
      orgName,
      response
    );
    res.json({ success: false, message: response });
  }
});

// Register and enroll user
app.post("/register", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;
  logger.debug("End point : /users");
  logger.debug("User name : " + username);
  logger.debug("Org name  : " + orgName);
  if (!username) {
    res.json(getErrorMessage("'username'"));
    return;
  }
  if (!orgName) {
    res.json(getErrorMessage("'orgName'"));
    return;
  }

  var token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
      username: username,
      orgName: orgName,
    },
    app.get("secret")
  );



  let response = await helper.registerAndGerSecret(username, orgName);

  logger.debug(
    "-- returned from registering the username %s for organization %s",
    username,
    orgName
  );
  if (response && typeof response !== "string") {
    logger.debug(
      "Successfully registered the username %s for organization %s",
      username,
      orgName
    );
    response.token = token;
    res.json(response);
  } else {
    logger.debug(
      "Failed to register the username %s for organization %s with::%s",
      username,
      orgName,
      response
    );
    res.json({ success: false, message: response });
  }
});

// Login and get jwt
app.post("/users/login", async function (req, res) {
  var username = req.body.username;
  var orgName = req.body.orgName;
  logger.debug("End point : /users");
  logger.debug("User name : " + username);
  logger.debug("Org name  : " + orgName);
  if (!username) {
    res.json(getErrorMessage("'username'"));
    return;
  }
  if (!orgName) {
    res.json(getErrorMessage("'orgName'"));
    return;
  }

  var token = jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
      username: username,
      orgName: orgName,
    },
    app.get("secret")
  );

  let isUserRegistered = await helper.isUserRegistered(username, orgName);

  if (isUserRegistered) {
    res.json({ success: true, message: { token: token } });
  } else {
    res.json({
      success: false,
      message: `User with username ${username} is not registered with ${orgName}, Please register first.`,
    });
  }
});

// Invoke transaction on chaincode on target peers
app.post(
  "/channels/:channelName/chaincodes/:chaincodeName",
  async function (req, res) {
    try {
      logger.debug(
        "==================== INVOKE ON CHAINCODE =================="
      );
      var peers = req.body.peers;
      var chaincodeName = req.params.chaincodeName;
      var channelName = req.params.channelName;
      var fcn = req.body.fcn;
      var args = JSON.stringify(req.body.args);
      var transient = req.body.transient;

      logger.debug("channelName  : " + channelName);
      logger.debug("chaincodeName : " + chaincodeName);
      logger.debug("fcn  : " + fcn);
      logger.debug("args  : " + args);
      logger.debug("peers  : " + req.body.peers);
      if (!chaincodeName) {
        res.json(getErrorMessage("'chaincodeName'"));
        return;
      }
      if (!channelName) {
        res.json(getErrorMessage("'channelName'"));
        return;
      }
      if (!fcn) {
        res.json(getErrorMessage("'fcn'"));
        return;
      }
      if (!args) {
        res.json(getErrorMessage("'args'"));
        return;
      }

      let message = await invoke.invokeTransaction(
        channelName,
        chaincodeName,
        fcn,
        args,
        req.username,
        req.orgname,
        transient
      );


      const response_payload = {
        result: message,
        error: null,
        errorData: null,
      };
      res.send(response_payload);
    } catch (error) {
      const response_payload = {
        result: null,
        error: error.name,
        errorData: error.message,
      };
      res.send(response_payload);
    }
  }
);

app.get(
  "/channels/:channelName/chaincodes/:chaincodeName",
  async function (req, res) {
    try {
      logger.debug(
        "==================== QUERY BY CHAINCODE =================="
      );

      var channelName = req.params.channelName;
      var chaincodeName = req.params.chaincodeName;

      let args = req.query.args;
      let fcn = req.query.fcn;
      let peer = req.query.peer;

      logger.debug("channelName : " + channelName);
      logger.debug("chaincodeName : " + chaincodeName);
      logger.debug("fcn : " + fcn);
      logger.debug("args : " + args);

      if (!chaincodeName) {
        res.json(getErrorMessage("'chaincodeName'"));
        return;
      }
      if (!channelName) {
        res.json(getErrorMessage("'channelName'"));
        return;
      }
      if (!fcn) {
        res.json(getErrorMessage("'fcn'"));
        return;
      }
      if (!args) {
        res.json(getErrorMessage("'args'"));
        return;
      }
      //console.log("args==========", args);
      //args = args.replace(/'/g, '"');
      //args = JSON.parse(args);
      logger.debug(args);
      //console.log("444444444444444");
      let message = await query.query(
        channelName,
        chaincodeName,
        args,
        fcn,
        req.username,
        req.orgname
      );

      const response_payload = {
        result: message,
        error: null,
        errorData: null,
      };

      res.send(response_payload);
    } catch (error) {
      const response_payload = {
        result: null,
        error: error.name,
        errorData: error.message,
      };
      res.send(response_payload);
    }
  }
);

app.get(
  "/qscc/channels/:channelName/chaincodes/:chaincodeName",
  async function (req, res) {
    try {
      logger.debug(
        "==================== QUERY BY CHAINCODE =================="
      );

      var channelName = req.params.channelName;
      var chaincodeName = req.params.chaincodeName;
      //console.log(`chaincode name is :${chaincodeName}`);
      let args = req.query.args;
      let fcn = req.query.fcn;
      // let peer = req.query.peer;

      logger.debug("channelName : " + channelName);
      logger.debug("chaincodeName : " + chaincodeName);
      logger.debug("fcn : " + fcn);
      logger.debug("args : " + args);

      if (!chaincodeName) {
        res.json(getErrorMessage("'chaincodeName'"));
        return;
      }
      if (!channelName) {
        res.json(getErrorMessage("'channelName'"));
        return;
      }
      if (!fcn) {
        res.json(getErrorMessage("'fcn'"));
        return;
      }
      if (!args) {
        res.json(getErrorMessage("'args'"));
        return;
      }
      //console.log("args==========", args);
      args = args.replace(/'/g, '"');
      args = JSON.parse(args);
      logger.debug(args);

      let response_payload = await qscc.qscc(
        channelName,
        chaincodeName,
        args,
        fcn,
        req.username,
        req.orgname
      );

      // const response_payload = {
      //     result: message,
      //     error: null,
      //     errorData: null
      // }

      res.send(response_payload);
    } catch (error) {
      const response_payload = {
        result: null,
        error: error.name,
        errorData: error.message,
      };
      res.send(response_payload);
    }
  }
);

app.get("/totalquantiity", async function (req, res) {
  try {
    logger.debug("==================== QUERY BY CHAINCODE ==================");

    var channelName = "mychannel";
    var chaincodeName = "supplychain";
    //console.log(`chaincode name is :${chaincodeName}`)
    let args = req.query.args;
    let fcn = "getProduct";
    let peer = req.query.peer;

    logger.debug("channelName : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn : " + fcn);
    logger.debug("args : " + args);

    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    if (!args) {
      res.json(getErrorMessage("'args'"));
      return;
    }
    //console.log("args==========", args);
    //args = args.replace(/'/g, '"');
    //args = JSON.parse(args);
    logger.debug(args);
    //console.log("444444444444444");
    let message = await query.query(
      channelName,
      chaincodeName,
      args,
      fcn,
      req.username,
      req.orgname
    );
    //console.log(message[0])
    var total_amount = 0;
    var a = message;
    //console.log("result of a ", a);
    // console.log("asdasdasd",a[i].Record.quantity)
    for (let i = 0; i < a.length; i++) {
      let c = parseFloat(a[i].Record.quantity);
      // let d = c.round(4)
      total_amount = total_amount + c;
      //console.log("3333", a[i].Record.quantity);

      //console.log(a[i].amount )
      //console.log(total_amount);
    }

    let totalAmountProduct = total_amount.toFixed(2);

    const response_payload = {
      result: { totalAmountProduct },
      error: null,
      errorData: null,
    };

    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

// Invoke transaction on chaincode on target peers
app.post("/productProcessing", async function (req, res) {
  try {
    logger.debug("==================== INVOKE ON CHAINCODE ==================");
    //var peers = req.body.peers;
    var chaincodeName = "supplychain";
    var channelName = "mychannel";
    var fcn = "processing";
    //var args = JSON.stringify(req.body.args);
    var transient = req.body.transient;
    // console.log(`Transient data is ;${transient}`);
    logger.debug("channelName  : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn  : " + fcn);
    //logger.debug('args  : ' + args);
    logger.debug("peers  : " + req.body.peers);
    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    let p = req.body.input;

    let id = Math.floor(1000 + Math.random() * 9000);
    //const ids = "PO"+id
    let args = JSON.stringify({ keyvalue: id, ...p });
    console.log("args", args);

    let message = await invoke.invokeTransaction(
      channelName,
      chaincodeName,
      fcn,
      args,
      req.username,
      req.orgname,
      transient
    );
    //console.log(`message result is : ${message}`);
    let keys = "";
    const response_payload = {
      result: message,
      // keys : id,
      errorData: null,
    };
    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

app.post("/shippingUnitCarton", async function (req, res) {
  try {
    logger.debug("==================== INVOKE ON CHAINCODE ==================");
    //var peers = req.body.peers;
    var chaincodeName = "supplychain";
    var channelName = "mychannel";
    var fcn = "shippingUnitCarton";
    //var args = JSON.stringify(req.body.args);
    var transient = req.body.transient;
    console.log(`Transient data is ;${transient}`);
    logger.debug("channelName  : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn  : " + fcn);
    //logger.debug('args  : ' + args);
    logger.debug("peers  : " + req.body.peers);
    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    let p = req.body.args;

    let id = Math.floor(1000 + Math.random() * 9000);
    //const ids = "PO"+id
    let args = JSON.stringify({ keyvalue: id, ...p });
    console.log("args", args);

    let message = await invoke.invokeTransaction(
      channelName,
      chaincodeName,
      fcn,
      args,
      req.username,
      req.orgname,
      transient
    );
    //console.log(`message result is : ${message}`);
    let keys = "";
    const response_payload = {
      key: "CRT_" + id,
      result: message,

      errorData: null,
    };
    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

app.get("/allRawMaterialWithFarmerName", async function (req, res) {
  try {
    logger.debug("==================== QUERY BY CHAINCODE ==================");

    var channelName = "mychannel";
    var chaincodeName = "supplychain";
    //console.log(`chaincode name is :${chaincodeName}`)
    let args = req.query.args;
    let fcn = "getRawmaterialIdAndfarmer";
    let peer = req.query.peer;

    logger.debug("channelName : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn : " + fcn);
    logger.debug("args : " + args);

    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    if (!args) {
      res.json(getErrorMessage("'args'"));
      return;
    }
    console.log("args==========", args);
    //args = args.replace(/'/g, '"');
    //args = JSON.parse(args);
    logger.debug(args);
    let message = await query.query(
      channelName,
      chaincodeName,
      args,
      fcn,
      req.username,
      req.orgname
    );
    //console.log(message[0])
    //var total_amount = 0;
    var g = message;

    let d = [];
    for (let a = 0; a < g.length; a++) {
      // console.log("ffffffffffffffffffffffffff", g[a]);

      let data = {
        key: g[a].Key,
        farmer: g[a].Record.farmername,
        productType: g[a].Record.productType,
      };

      d.push(data);
    }

    //console.log("dataaaaaaaaaaaaaaaaa", d);
    const response_payload = {
      result: d,
      error: null,
      errorData: null,
    };

    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

app.get("/allCartoonList", async function (req, res) {
  try {
    logger.debug("==================== QUERY BY CHAINCODE ==================");

    var channelName = "mychannel";
    var chaincodeName = "supplychain";
    //console.log(`chaincode name is :${chaincodeName}`)
    let args = "milk";
    let fcn = "getCartoonList";
    let peer = req.query.peer;

    logger.debug("channelName : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn : " + fcn);
    logger.debug("args : " + args);

    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    if (!args) {
      res.json(getErrorMessage("'args'"));
      return;
    }
    console.log("args==========", args);
    //args = args.replace(/'/g, '"');
    //args = JSON.parse(args);
    logger.debug(args);
    let message = await query.query(
      channelName,
      chaincodeName,
      args,
      fcn,
      req.username,
      req.orgname
    );

    var finalObj = [];
    message.forEach((element) => {
      let cartonDetails = {};
      cartonDetails.key = element.Key;
      cartonDetails.distributorToRetailorDetails =
        element.Record.distributorToRetailorDetails;

      finalObj.push(cartonDetails);
    });
    //console.log("11111", finalObj);

    //console.log("message: ", message);

    const response_payload = {
      result: finalObj,
      error: null,
      errorData: null,
    };

    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

app.get("/CartonDistributorToRetailorList", async function (req, res) {
  try {
    logger.debug("==================== QUERY BY CHAINCODE ==================");

    var channelName = "mychannel";
    var chaincodeName = "supplychain";
    //console.log(`chaincode name is :${chaincodeName}`)
    let args = "milk";
    let fcn = "getCartoonList";
    let peer = req.query.peer;

    logger.debug("channelName : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn : " + fcn);
    logger.debug("args : " + args);

    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    if (!args) {
      res.json(getErrorMessage("'args'"));
      return;
    }
    console.log("args==========", args);
    //args = args.replace(/'/g, '"');
    //args = JSON.parse(args);
    logger.debug(args);
    let message = await query.query(
      channelName,
      chaincodeName,
      args,
      fcn,
      req.username,
      req.orgname
    );

    var finalObj = [];
    message.forEach((element) => {
      let cartonDetails = {};
      cartonDetails.key = element.Key;
      cartonDetails.shipingToDistributorDetails =
        element.Record.shipingToDistributorDetails;

      finalObj.push(cartonDetails);
    });
    //console.log("11111", finalObj);

    //console.log("message: ", message);

    const response_payload = {
      result: finalObj,
      error: null,
      errorData: null,
    };

    res.send(response_payload);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});

app.get("/getfarmToFork", async function (req, res) {
  try {
    logger.debug("==================== QUERY BY CHAINCODE ==================");

    var channelName = "mychannel";
    var chaincodeName = "supplychain";
    //console.log(`chaincode name is :${chaincodeName}`)
    let args = req.query.cartoonid;
    let fcn = "getCartoonDetails";
    let peer = req.query.peer;

    logger.debug("channelName : " + channelName);
    logger.debug("chaincodeName : " + chaincodeName);
    logger.debug("fcn : " + fcn);
    logger.debug("args : " + args);

    if (!chaincodeName) {
      res.json(getErrorMessage("'chaincodeName'"));
      return;
    }
    if (!channelName) {
      res.json(getErrorMessage("'channelName'"));
      return;
    }
    if (!fcn) {
      res.json(getErrorMessage("'fcn'"));
      return;
    }
    if (!args) {
      res.json(getErrorMessage("'args'"));
      return;
    }
    console.log("args==========", args);
    //args = args.replace(/'/g, '"');
    //args = JSON.parse(args);
    logger.debug(args);
    let message = await query.query(
      channelName,
      chaincodeName,
      args,
      fcn,
      req.username,
      req.orgname
    );

    let finalObj = {};

    if (message.result.distributorToRetailorDetails != undefined) {
      finalObj.distributorToRetailorDetails =
        message.result.distributorToRetailorDetails;
    } else {
      //console.log("final Obj1: ", finalObj);
    }
    if (message.result.shipingToDistributorDetails != undefined) {
      finalObj.shipingToDistributorDetails =
        message.result.shipingToDistributorDetails;
    } else {
      //console.log("final Obj2: ", finalObj);
    }

    if (message.result.TotalCarbon != undefined) {
      finalObj.TotalCarbon = message.result.TotalCarbon;
    } else {
      //console.log("final Obj3: ", finalObj);
    }

    if (message.result.productCollection != undefined) {
      finalObj.productCollection =
        message.result.productCollection[0].productDetails.details;

      //console.log("PoductCollection1 ", finalObj.productCollection);

      finalObj.productCollectionRawMaterial =
        message.result.productCollection[0].rawMaterialCollection;
    } else {
      console.log(
        "final Obj4: ",
        message.result.productCollection[0].productDetails
      );
    }

    // if ( message.result.) FOR IMAGE 
    if (message.result.productCollection[0].productDetails.productImage != undefined) {
      finalObj.productImg = message.result.productCollection[0].productDetails.productImage;
    } else {
      console.log("final Obj5: ", finalObj);
    }
    console.log(
      "Final Obj: ",
      message.result.productCollection[0].rawMaterialCollection
    );
    const response_payload = finalObj;
    res.send(finalObj);
  } catch (error) {
    const response_payload = {
      result: null,
      error: error.name,
      errorData: error.message,
    };
    res.send(response_payload);
  }
});
