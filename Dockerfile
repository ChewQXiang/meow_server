# Dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    bash \
    vim \
    findutils \
    coreutils \
    net-tools \
    iproute2 \
    && apt-get clean

# 建立一個模擬的 web 目錄
RUN mkdir -p /var/www/html

# 做一個乾淨的首頁檔案（正確狀態）
RUN echo "Welcome to Meow Server" > /var/www/html/index.html

# 預設進入 shell（我們會用 docker exec 進去）
CMD ["sleep", "infinity"]
