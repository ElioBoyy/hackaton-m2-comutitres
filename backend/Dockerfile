# --- Build : JDK 25 + Maven wrapper, build du jar executable (module bootstrap) ---
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copie d'abord les pom pour profiter du cache de couches Docker sur les dependances.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY domain/pom.xml domain/
COPY application/pom.xml application/
COPY infrastructure/pom.xml infrastructure/
COPY bootstrap/pom.xml bootstrap/
RUN ./mvnw -B -q dependency:go-offline -DskipTests || true

# Puis le code source et le package.
COPY . .
RUN ./mvnw -B -DskipTests clean package

# --- Runtime : JRE 25 seul ---
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/bootstrap/target/jegeremacartenavigo-backend.jar app.jar
EXPOSE 8080
# Le profil docker-compose (dev) est inerte ici : la dependance est 'optional'
# et absente du jar repackage. La datasource est surchargee par les vars SPRING_*.
ENTRYPOINT ["java", "-jar", "app.jar"]
