# HLFv2


==================== To Start Network  ========================

cd HLFv2

./01.start.sh

==================== To create Channel ========================

./02.createChannel.sh

==================== To deploy chaincode =======================

./03.deployChaincode.sh

==================== To run node server  ========================

cd api/config   
./generate-ccp.sh

rm -rf org1-wallet/

cd  ..
npm  i 

node app.js 

=================== Import Postman Collection  ===================

https://api.postman.com/collections/3380735-37cbba41-f744-4535-804c-33c232d6e3f2?access_key=PMAT-01GMZDPRS6W3H805M57ZE9S290



===============================================================


step1:
cd HLFv2/

step2:
./01.start.sh

step3:
./02.createChannel.sh 

step4:
./03.deployChaincode.sh

step5:
cd api/config/

step6:
./generate-ccp.sh 

step7: 
cd ..

step8:
node app.js


