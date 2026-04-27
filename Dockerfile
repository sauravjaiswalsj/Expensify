# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY src ./src

# Build executable Spring Boot jar
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:17-jre
WORKDIR /app

# Render injects PORT at runtime; default to 8080 for local runs
ENV PORT=8080

COPY --from=build /workspace/target/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar /app/app.jar"]

