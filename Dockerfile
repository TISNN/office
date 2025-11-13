# 使用 Alpine Linux 版本的 Node.js
FROM node:16-alpine

# 修改 Alpine 的软件源为阿里云
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# 安装构建依赖
RUN apk add --no-cache python3 make g++

# 设置工作目录
WORKDIR /app

# 设置 npm 相关配置
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set disturl https://npmmirror.com/dist \
    && npm config set sass_binary_site https://npmmirror.com/mirrors/node-sass \
    && npm config set sharp_dist_base_url https://npmmirror.com/mirrors/sharp-libvips \
    && npm config set electron_mirror https://npmmirror.com/mirrors/electron/ \
    && npm config set puppeteer_download_host https://npmmirror.com/mirrors \
    && npm config set chromedriver_cdnurl https://npmmirror.com/mirrors/chromedriver \
    && npm config set operadriver_cdnurl https://npmmirror.com/mirrors/operadriver \
    && npm config set phantomjs_cdnurl https://npmmirror.com/mirrors/phantomjs \
    && npm config set selenium_cdnurl https://npmmirror.com/mirrors/selenium \
    && npm config set node_inspector_cdnurl https://npmmirror.com/mirrors/node-inspector \
    && yarn config set registry https://registry.npmmirror.com

# 复制 package.json 和 yarn.lock
COPY package*.json yarn.lock ./

# 安装依赖
RUN yarn install --network-timeout 600000

# 复制 types 目录并安装依赖
COPY types ./types
RUN cd types && yarn install --network-timeout 600000

# 复制 client 目录并安装依赖
COPY client ./client
RUN cd client && yarn install --network-timeout 600000

# 复制 server 目录并安装依赖
COPY server ./server
RUN cd server && yarn install --network-timeout 600000

# 构建客户端
RUN cd client && yarn build

# 暴露端口
EXPOSE 2567 3000

# 启动命令
CMD ["yarn", "start"] 