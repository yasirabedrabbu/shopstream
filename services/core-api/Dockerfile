FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package && \
    find target -maxdepth 1 -name "*.jar" ! -name "*.original" -exec cp {} /app/app.jar \;

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/app.jar app.jar
ENV JAVA_TOOL_OPTIONS="-Xmx300m"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]