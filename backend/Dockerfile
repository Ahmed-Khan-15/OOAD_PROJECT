FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./pom.xml
COPY .mvn ./.mvn
COPY mvnw ./mvnw
COPY src ./src
RUN chmod +x ./mvnw && ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/global-health-explorer-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "exec java -jar /app/app.jar --server.port=${PORT:-8081}"]
