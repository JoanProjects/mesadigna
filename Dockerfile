FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY BackEnd/ ./BackEnd/

RUN dotnet restore BackEnd/API/API.csproj

RUN dotnet publish BackEnd/API/API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.aspnet/https && \
    openssl req -x509 -newkey rsa:4096 \
        -keyout /root/.aspnet/https/key.pem \
        -out    /root/.aspnet/https/cert.pem \
        -days 730 -nodes \
        -subj "/CN=localhost/O=MesaDigna/C=DO" \
    && openssl pkcs12 -export \
        -out    /root/.aspnet/https/aspnetapp.pfx \
        -inkey  /root/.aspnet/https/key.pem \
        -in     /root/.aspnet/https/cert.pem \
        -legacy \
        -passout pass:MesaDigna2024!

COPY --from=build /app/publish .

COPY BackEnd/API/.env .

EXPOSE 7001

ENV ASPNETCORE_URLS=https://+:7001
ENV ASPNETCORE_Kestrel__Certificates__Default__Path=/root/.aspnet/https/aspnetapp.pfx
ENV ASPNETCORE_Kestrel__Certificates__Default__Password=MesaDigna2024!

ENTRYPOINT ["dotnet", "API.dll"]