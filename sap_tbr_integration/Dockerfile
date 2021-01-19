#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
ENV ASPNETCORE_ENVIRONMENT Production
WORKDIR /src
COPY ["DG.SAP.TBRIntegration/DG.SAP.TBRIntegration.csproj", "DG.SAP.TBRIntegration/"]
RUN dotnet restore "DG.SAP.TBRIntegration/DG.SAP.TBRIntegration.csproj"
COPY . .
WORKDIR "/src/DG.SAP.TBRIntegration"
RUN dotnet build "DG.SAP.TBRIntegration.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DG.SAP.TBRIntegration.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "DG.SAP.TBRIntegration.dll"]