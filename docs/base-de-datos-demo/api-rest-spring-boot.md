---
title: "API REST con Spring Boot y PostgreSQL"
sidebar_position: 2
slug: api-rest-spring-boot
tags: [database, demo]
---
# API REST con Spring Boot y PostgreSQL

Esta guía muestra cómo construir el servicio que conecta la documentación almacenada en PostgreSQL con Docusaurus.

## Arquitectura

El flujo de datos es el siguiente:

```
PostgreSQL → Spring Boot API → Genera archivos .md → Docusaurus build → Sitio estático
```

## Dependencias Maven

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

## Modelo de datos

```java
@Entity
@Table(name = "documents", schema = "documentacion")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String slug;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "sidebar_position")
    private Integer sidebarPosition;
}
```

## Endpoint del controlador

```java
@RestController
@RequestMapping("/api/docs")
public class DocumentController {

    @Autowired
    private DocumentRepository repository;

    @GetMapping
    public List<Document> getAllDocuments() {
        return repository.findAll();
    }

    @GetMapping("/category/{category}")
    public List<Document> getByCategory(@PathVariable String category) {
        return repository.findByCategory(category);
    }
}
```

## Configuración de conexión

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/docusaurus_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        default_schema: documentacion
```

:::info
Este es un mock que simula el comportamiento. En producción, Spring Boot leería de PostgreSQL y generaría los archivos `.md` que Docusaurus consume durante el build.
:::

:::tip
Para el pipeline CI/CD, el paso de generación de documentación debe ejecutarse **antes** del build de Docusaurus.
:::