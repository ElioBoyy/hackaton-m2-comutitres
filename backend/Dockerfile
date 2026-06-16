# --- Stage 1 : build ---------------------------------------------------
# JDK complet pour compiler le projet multi-module (domain -> application ->
# infrastructure -> bootstrap).
FROM eclipse-temurin:25-jdk AS build
WORKDIR /build

# Copie des seuls pom.xml d'abord : cette layer ne change que si les
# dependances changent, ce qui permet a Docker de la mettre en cache et
# d'eviter de re-telecharger tout Maven a chaque modif de code source.
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY domain/pom.xml domain/
COPY application/pom.xml application/
COPY infrastructure/pom.xml infrastructure/
COPY bootstrap/pom.xml bootstrap/
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# Code source ensuite : seule cette layer est invalidee quand on modifie le code.
COPY domain domain
COPY application application
COPY infrastructure infrastructure
COPY bootstrap bootstrap
RUN ./mvnw -B -pl bootstrap -am package -DskipTests

# --- Stage 2 : runtime ---------------------------------------------------
# JRE seul (pas besoin du JDK/Maven complet) pour une image finale legere.
FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
WORKDIR /app
COPY --from=build /build/bootstrap/target/*.jar app.jar
USER spring
EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
