#!/bin/bash

# 服务器信息
SERVER_IP="124.222.88.179"
SERVER_USER="root"
DEPLOY_PATH="/home/skyoffice"

echo "开始上传文件..."

# 创建远程目录
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"

# 上传文件
scp Dockerfile docker-compose.yml nginx.conf ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

# 上传源代码
scp -r client server types package.json yarn.lock ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

echo "文件上传完成！" 