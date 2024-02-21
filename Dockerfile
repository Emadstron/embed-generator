FROM node:slim
WORKDIR /root/
COPY . .

# Build frontend
RUN cd frontend && npm install --legacy-peer-deps && npm run build && cd ..
RUN apt-get remove nodejs
RUN nvm install 16.15.1 

# Build backend
RUN apt-get update
RUN apt-get install -y build-essential curl
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH=/root/.cargo/bin:$PATH
RUN cd backend && cargo build --release && cd ..

FROM debian:bullseye-slim
WORKDIR /root/
COPY --from=0 /root/backend/target/release/embed-generator ./
EXPOSE 8080
CMD ["./embed-generator"]
