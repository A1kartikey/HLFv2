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
const MakeQRCode = require ('qrcode');
  


class AssetTransfer extends Contract {
   

async addproduct(ctx,req){

    try {

        var args =  JSON.parse(req);
        console.log("111111111111111",args);

         args.doctype = "rawmaterial";
         const txID = ctx.stub.getTxID();
         args.hash = txID;
     
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
const txID = ctx.stub.getTxID();
 let keyvalue = "PO_" + args.keyvalue
        console.log("idvalue", keyvalue)
 let g = {
    rawMaterialCollection: total,
    productDetails: args,
    DocType: "productProcessing",
    productTotalUnits: "600",
    hash: txID
    //bydefault make it empty will update once QR Code is generated
    

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

async getProductShippingUnitInTransist(ctx, args) {
    console.log("hitting function --------------------------")
    let queryString = {};
    queryString.selector = {};
    queryString.selector.DocType = "productProcessing";
    queryString.selector.productDetails = {status: "IN_TRANSIST"};
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
detailsjson.productDetails.productQRCode = args.productQRCode;

//productQRCode

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
    //console.log("ctxdddddddddddddddddd",ctx)
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
        ProductJson.productDetails.status = "IN_TRANSIST";
        await ctx.stub.putState(_productIds[a].productId, Buffer.from(stringify(sortKeysRecursive(ProductJson))));

             //console.log("fffffffffffffffff",f);
             productDetails.push(ProductJson); 
             console.log("total",productDetails);
    }
let keyvalue = "CRT_" + args.keyvalue
//let keyvalue = "CRT_100";
    //console.log("idvalue", keyvalue)
    console.log("testinggggggggggggggggggg")
    console.log("sdfffffffffffffffffffffffff",ctx.stub.getTxID())
// const txid = ctx.getTxID();
// console.log("txiddddddddddddddd",txid)
// 'htpp://localhost:3000/FetchCartonDetails?cartoonid='+keyvalue
    const response = await MakeQRCode.toDataURL('http://20.96.181.1:6984/_utils/#database/mychannel_supplychain/'+keyvalue);
    console.log("response 1 :", response);
   const customResponse=encodeURI(response);
   console.log("222222222222",customResponse);
   const txID = ctx.stub.getTxID();
let g = {
productCollection: productDetails,
cartonDetails: args,
DocType: "cartoonCreation",
totalUnits : totalunits,
Status: args.status,
cartonQRCode: customResponse,
hash: txID
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

async addDistributorsAndRetailer(ctx,req){

    try {

        var args =  JSON.parse(req);
        console.log("Args: ",args)

        try {  
            const exists = await this.LandExists(ctx, args.key);
    console.log("checking")
            if (exists) {
                const txID = ctx.stub.getTxID();
                args.hash = txID;
            
                var  result =  await ctx.stub.putState(args.key, Buffer.from(stringify(sortKeysRecursive(args))));
                console.log("result: ",result);
                
            }else{
                const txID = ctx.stub.getTxID();
                args.hash = txID;
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
        console.log("Hello") ;
        return JSON.stringify(message);

    } catch (error){ 

        throw new Error(`error in registring land: ${error} `);
    }


}

async getDistributor(ctx) {
   

    let queryString = {};
    queryString.selector = {};

    queryString.selector.stakeholder = "Distributor";
     console.log("selector: ",queryString)
    let a = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
     console.log("a: ",a);
    
     return a ;
}

async getRetailer(ctx) {
   

    let queryString = {};
    queryString.selector = {};

    queryString.selector.stakeholder = "Retailer";
    return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
}

async getRawmaterialIdAndfarmer(ctx) {
   

    let queryString = {};
    queryString.selector = {};

    queryString.selector.doctype = "rawmaterial";
    
   let g = []
    g = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    console.log("Kartikey",g) ;
   


   return g //shim.success(queryResults);
}

async moveShippingToDistributor(ctx,req) {
   
    var args =  JSON.parse(req);
    console.log("args: ",args);
    //var args =  JSON.parse(req);
     let ids = args.carton;
     for (let i = 0; i< ids.length; i++){
        console.log(ids[i])
        let carton = await ctx.stub.getState(ids[i]); 
    
        let cartonJson =  JSON.parse(carton.toString());
        console.log("main",cartonJson)
        
        let product = cartonJson.productCollection;
        for (let a in product){
            product[a].shipingToDistributorDetails= args;
        //     product[a].distributor_location= args.distributor_location;
        // product[a].vehicle_type= args.vehicle_type;
        // product[a].distance= args.distance;
        }
        
        cartonJson.shipingToDistributorDetails= args
        // cartonJson.distributor_location= args.distributor_location;
        // cartonJson.vehicle_type= args.vehicle_type;
        // cartonJson.distance= args.distance;
        let int =  parseFloat(args.calculateEmmision) 
       
        cartonJson.TotalCarbon = int 
        //console.log("final",cartonJson)
        var result = await ctx.stub.putState(ids[i], Buffer.from(stringify(sortKeysRecursive(cartonJson))));
     }
    //  const txID = ctx.stub.getTxID();
    //  args.hash = txID;
     let  g = {
        result: "success"
     }
   return g //shim.success(queryResults);
}

async moveDistributorToRetailor(ctx,req) {
   
    var args =  JSON.parse(req);
    console.log("args: ",args);
    //var args =  JSON.parse(req);
     let ids = args.carton;
     for (let i = 0; i< ids.length; i++){
        console.log(ids[i])
        let carton = await ctx.stub.getState(ids[i]); 
    
        let cartonJson =  JSON.parse(carton.toString());
        console.log("main",cartonJson)
        
        let product = cartonJson.productCollection;
        for (let a in product){
            product[a].distributorToRetailorDetails = args;
        //     product[a].distributor_location= args.distributor_location;
        // product[a].vehicle_type= args.vehicle_type;
        // product[a].distance= args.distance;
        }
        
        cartonJson.distributorToRetailorDetails = args
        // cartonJson.distributor_location= args.distributor_location;
        // cartonJson.vehicle_type= args.vehicle_type;
        // cartonJson.distance= args.distance;


        let int =  parseFloat(args.calculateEmmision) 
        console.log("carbon from dist: ",int )
        cartonJson.TotalCarbon += int 
        //console.log("final",cartonJson)
        var result = await ctx.stub.putState(ids[i], Buffer.from(stringify(sortKeysRecursive(cartonJson))));
     }
    //  const txID = ctx.stub.getTxID();
    //  args.hash = txID;
     let  g = {
        result: "success"
     }
   return g //shim.success(queryResults);
}

async getCartoonDetails(ctx,req) {
   console.log("req: ",req);
    
   
    //var args =  JSON.parse(req);
     
     
        let carton = await ctx.stub.getState(req); 
    
        let cartonJson =  JSON.parse(carton.toString());
        console.log("main: ",cartonJson)
        
        
        
        
    //  const txID = ctx.stub.getTxID();
    //  args.hash = txID;
     let  g = {
        result: cartonJson
     }
   return g //shim.success(queryResults);
}



}

module.exports = AssetTransfer;
