# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY BackEnd/Core/Core.csproj                       BackEnd/Core/
COPY BackEnd/Application/Application.csproj         BackEnd/Application/
COPY BackEnd/Infrastructure/Infrastructure.csproj   BackEnd/Infrastructure/
COPY BackEnd/API/API.csproj                         BackEnd/API/

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore BackEnd/API/API.csproj

COPY BackEnd/ ./BackEnd/

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish BackEnd/API/API.csproj \
        -c Release \
        -o /app/publish \
        --no-restore \
        --no-self-contained

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app


RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && mkdir -p /root/.aspnet/https \
    && openssl req -x509 -newkey rsa:4096 \
        -keyout /root/.aspnet/https/key.pem \
        -out    /root/.aspnet/https/cert.pem \
        -days 730 -nodes \
        -subj "/CN=localhost/O=MesaDigna/C=DO" \
    && openssl pkcs12 -export \
        -out    /root/.aspnet/https/aspnetapp.pfx \
        -inkey  /root/.aspnet/https/key.pem \
        -in     /root/.aspnet/https/cert.pem \
        -legacy \
        -passout pass:MesaDigna2024! \
    && rm -f /root/.aspnet/https/key.pem /root/.aspnet/https/cert.pem

COPY --from=build --link /app/publish .
COPY --link BackEnd/API/.env .

EXPOSE 7001

ENV ASPNETCORE_URLS=https://+:7001 \
    ASPNETCORE_Kestrel__Certificates__Default__Path=/root/.aspnet/https/aspnetapp.pfx \
    ASPNETCORE_Kestrel__Certificates__Default__Password=MesaDigna2024! \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_GCConserveMemory=4

ENTRYPOINT ["dotnet", "API.dll"]