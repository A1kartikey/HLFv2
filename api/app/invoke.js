const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')

const helper = require('./helper')

const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));

        // load the network configuration
        // const ccpPath =path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        // const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
        const ccp = await helper.getCCP(org_name) //JSON.parse(ccpJSON);

        // Create a new file system based wallet for managing identities.
        const walletPath = await helper.getWalletPath(org_name) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        

        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
            // transaction: {
            //     strategy: createTransactionEventhandler()
            // }
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);
        //const ord = await network.getCommitters(["ordererMSP"])
        //console.log("444444444444",ord)
//console.log("222222222222",network)
        const contract = network.getContract(chaincodeName);
        console.log("contrtactcccccccccccccccccccccccccccc",contract)
//console.log("33333333333",contract)
        let result
        let message;
         if (fcn === "registerLand" ||fcn === "addproduct" ||fcn === "updateProduct" ||fcn ===  "processingProduct" ||fcn ===  "processing" || fcn === "qrCreate" || fcn === "shippingUnitCarton"
         || fcn === "addDistributorsAndRetailer"  ) {
            result = await contract.submitTransaction(fcn, args);
            console.log("result of invoke file ",result);
            //const a = JSON.parse(result.toString());
            //console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa",a)

            message = `Successfully added product with key`
        } else if ( fcn === "TransferLand" || fcn === "UpdateLand") {
            result = await contract.submitTransaction(fcn,args);
            message = `Successfully transfered land record.`
        } else if (fcn === "DeleteAsset" || fcn === "TransferLand" ||fcn === "deleteProduct" ) {
            result = await contract.submitTransaction(fcn,args);
            message = `Successfully deleted product record.`
        } 
        else {
            return `Invocation require either registerLand or TransferLand or DeleteAsset  as function but got ${fcn}`
        }

        await gateway.disconnect();

        result = JSON.parse(result.toString());

        let response = {
            message: message,
            result
        }

        return response;


    } catch (error) {

        console.log(`Getting error: ${error}`)
        return error.message

    }
}

exports.invokeTransaction = invokeTransaction;
