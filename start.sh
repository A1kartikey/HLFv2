cd artifacts/channel
./01.create-artifacts.sh

cd ../

docker-compose -f docker-compose.yaml up -d

cd ../

sleep 5
./createChannel.sh

sleep 2

./deployChaincode.sh
