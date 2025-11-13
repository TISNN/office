#!/bin/bash

# 服务器信息
SERVER_IP="124.222.88.179"
SERVER_USER="root"
DEPLOY_PATH="/home/skyoffice"
DOMAIN="skyoffice.studylandsedu.com"

echo "开始部署..."

# 在服务器上执行配置和启动
echo "配置服务器环境..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 修复 yum 源
    cd /etc/yum.repos.d/
    mkdir backup
    mv *.repo backup/
    curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo
    yum clean all
    yum makecache

    # 安装必要的系统工具
    yum install -y yum-utils device-mapper-persistent-data lvm2

    # 添加 Docker 仓库
    yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

    # 安装 Docker
    yum install -y docker-ce docker-ce-cli containerd.io

    # 配置 Docker 镜像源
    mkdir -p /etc/docker
    echo '{"registry-mirrors": ["https://mirror.ccs.tencentyun.com"]}' > /etc/docker/daemon.json
    systemctl daemon-reload
    systemctl restart docker

    # 启动 Docker
    systemctl start docker
    systemctl enable docker

    # 安装 Docker Compose
    yum install -y docker-compose-plugin
    ln -s /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose

    # 创建项目目录
    mkdir -p /home/skyoffice
    cd /home/skyoffice

    # 清理旧容器（如果存在）
    if command -v docker-compose &> /dev/null; then
        docker-compose down || true
    fi
    
    # 构建新镜像并启动容器
    docker-compose up --build -d

    echo "服务器配置完成！"
    echo "Docker 容器状态："
    docker ps
EOF

echo "部署完成！"
echo "请等待几分钟，然后访问 http://skyoffice.studylandsedu.com 查看应用" 