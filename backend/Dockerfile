# Stage 1: Build JAR using Maven
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml first for layer caching of dependencies
COPY pom.xml .

# Pre-download ALL dependencies including PostgreSQL driver
# This layer busts when pom.xml changes
RUN mvn dependency:resolve -q

COPY src ./src
RUN mvn clean package -DskipTests -o

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
