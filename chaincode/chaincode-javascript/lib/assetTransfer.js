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
    // async registerLand(ctx, req) {
    //     try {

    //         var args =  JSON.parse(req);
    //         const exists = await this.LandExists(ctx, args.surveyNumber);
    
    //         if (exists) {
    //             throw new Error(`The land ${args.surveyNumber} already exists`);
    //         }
    
    //         const land = {
    //             surveyNumber: args.surveyNumber,
    //             state: args.state,
    //             district: args.district,
    //             village: args.village,
    //             currentOwner: args.currentOwner,
    //             marketValue: args.marketValue
    //         };


    //         console.log("check land: ",land);
    //         try {   
            
    //             var  result =  await ctx.stub.putState(args.surveyNumber, Buffer.from(stringify(sortKeysRecursive(land))));
    //             console.log("result: ",result);
            
    //         } catch(error) {

    //             throw new Error(`error in putstate land: ${error} `);

    //         }

    //         var message = {
    //                 productDetails : land ,
    //                 successResult : result
    //         }
    //         return JSON.stringify(message);

    //     } catch (error){ 

    //         throw new Error(`error in registring land: ${error} `);
    //     }

    // }

async addproduct(ctx,req){

    try {

        var args =  JSON.parse(req);
        console.log("111111111111111",args)

        try {  
            const exists = await this.LandExists(ctx, args.key);
    console.log("checking")
            if (exists) {
                var  result =  await ctx.stub.putState(args.key, Buffer.from(stringify(sortKeysRecursive(args))));
                console.log("result: ",result);
                
            }else{
            var  result =  await ctx.stub.putState(args.key, Buffer.from(stringify(sortKeysRecursive(args))));
        console.log("result: ",result);
            }
        } catch(error) {

            throw new Error(`error in putstate land: ${error} `);

        }

        var message = {
                registeredLandDetails : args ,
                successResult : result
        }
        return JSON.stringify(message);

    } catch (error){ 

        throw new Error(`error in registring land: ${error} `);
    }


}


    // getLandDetails returns the land stored in the world state with given id.
    // async getLandDetails(ctx, args) {
    //     console.log("args: ",args) ;
    //     try {        const assetJSON = await ctx.stub.getState(args); // get the land from chaincode state
    //         if (!assetJSON || assetJSON.length === 0) {
    //             throw new Error(`The asset does not exist`);
    //         }
    //         return assetJSON.toString();
    //     } catch(error){

    //         throw new Error(`error in get state: ${error}`);
    //     }

    // }

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
            const d =  ctx.stub.deleteState(id);
    
            var message = {
                productDetails : d ,
                successResult : "scucessfully deleted product"
        }
        return JSON.stringify(message);

        }catch(error) {

            throw new Error(`error in get state: ${error}`);
        }
    }

    // LandExists returns true when asset with given ID exists in world state.
    async LandExists(ctx, key) {
        try{
        const assetJSON = await ctx.stub.getState(key); 
        return assetJSON && assetJSON.length > 0;
            }
         catch (error){
            throw new Error(`error in getting land: ${error} `);
        }
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    // async TransferLand(ctx, req) {

    //         var args =  JSON.parse(req);
    //     try {            const landinString = await this.getLandDetails(ctx, args.surveyNumber);
    //         console.log("landstring: ",landinString)
    //     } catch(error) {
    //         throw new Error(`error in getting details of existing land record: ${error} `);

    //     }
    //         const landinString = await this.getLandDetails(ctx, args.surveyNumber);
    //         console.log("landstring: ",landinString)
       

    //     const landinJSON = JSON.parse(landinString);
    //     landinJSON.currentOwner = args.newOwner;
    //     // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    //     return ctx.stub.putState(args.surveyNumber, Buffer.from(stringify(sortKeysRecursive(landinJSON))));
    // }

    // // GetAllland returns all land found in the world state.
    // async GetAllland(ctx) {
    //     const allResults = [];
    //     // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    //     const iterator = await ctx.stub.getStateByRange('', '');
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             console.log(err);
    //             record = strValue;
    //         }
    //         allResults.push(record);
    //         result = await iterator.next();
    //     }
    //     return JSON.stringify(allResults);
    // }


    async getmilk(ctx) {
		let queryString = {};
		queryString.selector = {};
		queryString.selector.productType = "Milk";
		return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
	}
    async getProduct(ctx, args) {
		console.log("hitting function --------------------------")
        let queryString = {};
		queryString.selector = {};
		queryString.selector.productType = args;
		return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
	}

    async GetQueryResultForQueryString(ctx, queryString) {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this._GetAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}

	// internal function to fetch all results
	async _GetAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.txId;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}

    async deleteProduct(ctx, req) {

        try {
            var args =  JSON.parse(req);
            const exists = await this.LandExists(ctx, args.key);
            if (!exists) {
                throw new Error(`The asset ${args.key} does not exist`);
            }
            return ctx.stub.deleteState(args.key);
    
        }catch(error) {

            throw new Error(`error in get state: ${error}`);
        }
    }
    
//   async processingProduct (ctx,req){


//     try {
//         var args =  JSON.parse(req);
//         var total = [];
//        console.log("args key:",args)
//         //console.log("1111111",args)
//  let d = args.key;
//  //console.log("args",d)

//         for(let e of d){
//             //console.log("i value: ",e)
//             let a = await ctx.stub.getState(e); 
//              let f =  JSON.parse(a.toString())
//             //console.log("222222222",a.toString())
// //console.log("bbbbbbbbbbbbb",f)
//    total.push(f) 

//         }

//         //let keyvalue = Math.floor(1000 + Math.random() * 9000);

        
//  let j = args.keyvalue;
//  console.log("jjjjjjjjjjjj",j)
//             let g = {
//                 rawMaterialCollection : total,
//                 Milk_Type: args.Milk_Type,
//                 Animal_Type: args.Animal_Type,
//                 Milk_Quantity: args.Milk_Quantity,
//                 Product_Quantity: args.Product_Quantity,
//                 Temperature: args.Temperature,
//                 allmond: args.allmond
//             }
//             console.log("ggggggggggg",g)
            

//         var result = await ctx.stub.putState(j, Buffer.from(stringify(sortKeysRecursive(g))));
// //console.log("total",total)
//         // const b = {
//         //     ...a
//         // }
//         //console.log("3333333",b)
//         var message = {
//             productDetails : g ,
//             successResult : result
//     }
//     return JSON.stringify(message);


//     }catch(error) {

//         throw new Error(`error in get state: ${error}`);
//     }

//   }

  async processing(ctx,req){
    try {
        console.log("reqqq",req)
        var args =  JSON.parse(req);
        //var total = [];
       console.log("args key:",args)
        //console.log("1111111",args)
 var total = [];
 //var history = [];

 //let id = 0;
 let first = args.details;

        for ( let a in first ){
            //console.log("aaaaaaaaaaaaaaaaaaaaaaaaa",args[a]);
            //   history.push(first[a]);
            //   console.log("historyssss",history)
            let c = first[a].key;
        console.log("11111111111",c);         
    for (let t in c){
    //console.log("ccccccccccccc",c[i]);

     //id =  id + c[i];
   
console.log("getstate key",c[t])
    let firstvalue = await ctx.stub.getState(c[t]); 
             let f =  JSON.parse(firstvalue.toString());
             //console.log("fffffffffffffffff",f);
             total.push(f); 
             console.log("total",total);


        }}
        //let idvalue = "POS"+ id;
console.log("fiestssssssssssss")
        
 let keyvalue = "PO_" + args.keyvalue
        console.log("idvalue", keyvalue)
 let g = {
    rawMaterialCollection: total,
    productDetails: args,
    DocType: "productProcessing",
    productTotalUnits: "600"
    

 }
 

 var result = await ctx.stub.putState(keyvalue, Buffer.from(stringify(sortKeysRecursive(g))));
        var message = {
            productDetails : g ,
            successResult : result
    }
    return JSON.stringify(message);


    }catch(error) {

        throw new Error(`error in get state: ${error}`);
    }
  }


  async getProductProcessing(ctx, args) {
    console.log("hitting function --------------------------")
    let queryString = {};
    queryString.selector = {};
    queryString.selector.DocType = "productProcessing";
    
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
}


async getProductShippingUnit(ctx, args) {
    console.log("hitting function --------------------------")
    let queryString = {};
    queryString.selector = {};
    queryString.selector.DocType = "productProcessing";
    queryString.selector.productDetails = {status: "CREATED"};
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
}
 async qrCreate(ctx, req){
console.log("22222222222222222222222",req)
    var args =  JSON.parse(req);
    try {            
        const details = await ctx.stub.getState(args.key)
        console.log("!1111111111111111: ",details)
       // let f =  JSON.parse(a.toString())
//console.log("3333333333333",f)

const detailsjson = JSON.parse(details);
detailsjson.productDetails.status = args.status;

// we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
const result = ctx.stub.putState(args.key, Buffer.from(stringify(sortKeysRecursive(detailsjson))));


var message = {
    productDetails : detailsjson ,
    successResult : result
}
return JSON.stringify(message);

    } catch(error) {
        throw new Error(`error in getting details of existing product record: ${error} `);

    }
 }

 async shippingUnitCarton (ctx, req){
    console.log("reqqq",req)
    var args =  JSON.parse(req);
    //console.log("1111111111",req);
    console.log("2222222222",args)
    var _productIds= args.details;
 var productDetails = [];
 var totalunits = 0
    for(let a in _productIds){
        console.log("3333333333333333",_productIds[a].productId);
        console.log("44444444444444",_productIds[a].productId)
        console.log("work")
        totalunits = totalunits + _productIds[a].productUnits
        let Product = await ctx.stub.getState(_productIds[a].productId); 
    
        let ProductJson =  JSON.parse(Product.toString());

             //console.log("fffffffffffffffff",f);
             productDetails.push(ProductJson); 
             console.log("total",productDetails);
    }
let keyvalue = "CRT_" + args.keyvalue
//let keyvalue = "CRT_100";
    console.log("idvalue", keyvalue)
let g = {
productCollection: productDetails,
cartonDetails: args,
DocType: "cartoonCreation",
totalUnits : totalunits,
Status: "CARTON_CREATED"
}
console.log("G: ",g) ;
var result = await ctx.stub.putState(keyvalue, Buffer.from(stringify(sortKeysRecursive(g))));
var message = {
    cartonDetails : g ,
    successResult : result
}
return JSON.stringify(message);

 }

 async getCartoonList(ctx, args) {
    console.log("hitting function --------------------------")
    let queryString = {};
    queryString.selector = {};
    queryString.selector.DocType = "cartoonCreation";
    
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
}
}

module.exports = AssetTransfer;
