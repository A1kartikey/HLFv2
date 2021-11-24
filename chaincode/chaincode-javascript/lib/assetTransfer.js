/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    // registerLand creats a new land to the world state with given details.
    async registerLand(ctx, req) {
        try {

            var args =  JSON.parse(req);
            const exists = await this.LandExists(ctx, args.surveyNumber);
    
            if (exists) {
                throw new Error(`The land ${args.surveyNumber} already exists`);
            }
    
            const land = {
                surveyNumber: args.surveyNumber,
                state: args.state,
                district: args.district,
                village: args.village,
                currentOwner: args.currentOwner,
                marketValue: args.marketValue
            };


            console.log("check land: ",land);
            try {   
            
                var  result =  await ctx.stub.putState(args.surveyNumber, Buffer.from(stringify(sortKeysRecursive(land))));
                console.log("result: ",result);
            
            } catch(error) {

                throw new Error(`error in putstate land: ${error} `);

            }

            var message = {
                    registeredLandDetails : land ,
                    successResult : result
            }
            return JSON.stringify(message);

        } catch (error){ 

            throw new Error(`error in registring land: ${error} `);
        }

    }

    // getLandDetails returns the land stored in the world state with given id.
    async getLandDetails(ctx, args) {
        console.log("args: ",args) ;
        try {        const assetJSON = await ctx.stub.getState(args); // get the land from chaincode state
            if (!assetJSON || assetJSON.length === 0) {
                throw new Error(`The asset ${id} does not exist`);
            }
            return assetJSON.toString();
        } catch(error){

            throw new Error(`error in get state: ${error}`);
        }

    }

    // UpdateLand record updates an existing land in the world state with provided parameters.
    async UpdateLand(ctx, req) {

        var args =  JSON.parse(req);
        try {            const landinString = await this.getLandDetails(ctx, args.surveyNumber);
            console.log("landstring: ",landinString)
        } catch(error) {
            throw new Error(`error in getting details of existing land record: ${error} `);

        }
            const landinString = await this.getLandDetails(ctx, args.surveyNumber);
            console.log("landstring: ",landinString)
       

        const landinJSON = JSON.parse(landinString);
        landinJSON.state = args.state;
        landinJSON.district = args.district ;
        landinJSON.village = args.village ;
        landinJSON.marketValue = args.marketValue ;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(args.surveyNumber, Buffer.from(stringify(sortKeysRecursive(landinJSON))));

        
    }

    // Delete land record deletes from the world state.
    async DeleteAsset(ctx, id) {

        try {
            const exists = await this.LandExists(ctx, id);
            if (!exists) {
                throw new Error(`The asset ${id} does not exist`);
            }
            return ctx.stub.deleteState(id);
    
        }catch(error) {

            throw new Error(`error in get state: ${error}`);
        }
    }

    // LandExists returns true when asset with given ID exists in world state.
    async LandExists(ctx, id) {
        try{
        const assetJSON = await ctx.stub.getState(id); 
        return assetJSON && assetJSON.length > 0;
            }
         catch (error){
            throw new Error(`error in getting land: ${error} `);
        }
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferLand(ctx, req) {

            var args =  JSON.parse(req);
        try {            const landinString = await this.getLandDetails(ctx, args.surveyNumber);
            console.log("landstring: ",landinString)
        } catch(error) {
            throw new Error(`error in getting details of existing land record: ${error} `);

        }
            const landinString = await this.getLandDetails(ctx, args.surveyNumber);
            console.log("landstring: ",landinString)
       

        const landinJSON = JSON.parse(landinString);
        landinJSON.currentOwner = args.newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(args.surveyNumber, Buffer.from(stringify(sortKeysRecursive(landinJSON))));
    }

    // GetAllland returns all land found in the world state.
    async GetAllland(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
