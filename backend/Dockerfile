# Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Proje dosyasını kopyala ve bağımlılıkları yükle
COPY *.csproj ./
RUN dotnet restore

# Tüm kaynak kodları kopyala
COPY . ./

# Uygulamayı derle
RUN dotnet publish -c Release -o /app/publish

# Runtime aşaması
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Build aşamasından derlenmiş dosyaları kopyala
COPY --from=build /app/publish .

# Port'u aç
EXPOSE 5000

# Uygulamayı başlat
ENTRYPOINT ["dotnet", "GraduationProjectManagement.dll"]