# Multi-stage build for ASP.NET Core 10 Web API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for caching restore layer
COPY ["backend/WeatherApp.Api/WeatherApp.Api.csproj", "backend/WeatherApp.Api/"]
COPY ["backend/WeatherApp.Application/WeatherApp.Application.csproj", "backend/WeatherApp.Application/"]
COPY ["backend/WeatherApp.Domain/WeatherApp.Domain.csproj", "backend/WeatherApp.Domain/"]
COPY ["backend/WeatherApp.Infrastructure/WeatherApp.Infrastructure.csproj", "backend/WeatherApp.Infrastructure/"]

RUN dotnet restore "backend/WeatherApp.Api/WeatherApp.Api.csproj"

# Copy source code and build
COPY backend/ backend/
WORKDIR "/src/backend/WeatherApp.Api"
RUN dotnet publish "WeatherApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WeatherApp.Api.dll"]
