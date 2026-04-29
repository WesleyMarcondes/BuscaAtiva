# Usa uma imagem oficial do Node.js
FROM node:18

# Cria a pasta do app dentro do servidor
WORKDIR /usr/src/app

# Copia os arquivos de configuração
COPY package*.json ./

# Instala as bibliotecas do seu projeto
RUN npm install

# Copia o restante dos arquivos do seu projeto
COPY . .

# Informa a porta que o Google Cloud usa
EXPOSE 8080

# Comando para ligar o servidor
CMD [ "npm", "start" ]