# ================================================
# STAGE 1: Builder - Instala dependências e compila
# ================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copia os arquivos de manifesto de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Compila o projeto Next.js para produção (gera a pasta .next/standalone)
RUN npm run build

# ================================================
# STAGE 2: Runner - Imagem final leve para produção
# ================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copia o servidor standalone gerado pelo Next.js (modo output: standalone)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# O Cloud Run exige que a aplicação ouça na porta da variável PORT
EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Usa o servidor standalone otimizado do Next.js
CMD ["node", "server.js"]