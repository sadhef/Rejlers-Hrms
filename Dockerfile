FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN node -e 'const url = new URL(process.env.VITE_API_URL); if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password) { throw new Error("VITE_API_URL must be an HTTPS backend origin"); }'
RUN npm run build

FROM nginx:stable-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html/rejlershrms

RUN nginx -t

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
