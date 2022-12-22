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

cd  ..
npm  i 

node app.js 

