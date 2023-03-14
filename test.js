const tempObject1 =  {
    Id: "F101",
    FarmerName: "Yadav",
    RawMaterial: "Milk",
    Location: "Punjab",
  };

  const tempObject2 =  {
    Id: "F101",
    FarmerName: "Yadav",
    RawMaterial: "Milk",
    Location: "Punjab",
  };


  
  const GenerateQRCode = async () => {
 
    console.log("Create QR Code", tempObject);

    
    const data = JSON.stringify(tempObject);

   
    console.log("tempObject :: ", data);
   //need to format the data based on the output
//Example Conditions I have kept to check Id, FarmerName, RawMaterial etc
    var strBuilder = [];
    for (var key in tempObject) {
      if (tempObject.hasOwnProperty(key)) {
        if (key === "Id") {
          strBuilder.push(`Farmer Id is ${tempObject[key]} \n`);
        }
        if (key === "FarmerName") {
          strBuilder.push(`Farmer Name: ${tempObject[key]} \n`);
        }
        if (key === "RawMaterial") {
          strBuilder.push(`RawMaterial used: ${tempObject[key]} \n`);
        }
      }
    }
// Formatted string is used to generate the QRCode which can be read by QR Code
    // const response = await QRCode.toDataURL(strBuilder.toString());



    console.log("response ::", response);

}


