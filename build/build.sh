#!/bin/bash -e
SERVER_DIR=server
SERVER_PUBLIC_DIR=app/public
SERVER_VIEW_DIR=app/view
CLIENT_DIR=client
CLIENT_BUILD_DIR=$CLIENT_DIR/static
TARGET_DIR=target/carhwap

echo "start build fe"

env=""
flag=0
if [ "$NODE_ENV" == "" ];then
    for arg in "$@"
    do
      if [ $flag = 1 ]
      then
        env=$arg
        break
      fi
      if [ "$arg" = "--env" ]
      then
        echo "reverse flag"
        flag=1
      fi
    done
fi

if [ "$env" != "" ];then
    NODE_ENV=$env
fi

echo "NODE_ENV=$NODE_ENV"

cd $CLIENT_DIR
echo "$(pwd)"
npm install --registry=https://registry.npm.taobao.org
echo "npm install done"
npm run build
echo "build fe done"
cd ..
echo "$(pwd)"



echo "create target dir"
mkdir -p $TARGET_DIR

echo "copy server files to target dir"
cp -rf $SERVER_DIR/* $TARGET_DIR

echo "copy fe dist files to server public dir"
cp -rf $CLIENT_BUILD_DIR/* $TARGET_DIR/$SERVER_PUBLIC_DIR

echo "copy fe dist files to server view dir"

cp -rf $CLIENT_BUILD_DIR/html/* $TARGET_DIR/$SERVER_VIEW_DIR


echo "build done"
