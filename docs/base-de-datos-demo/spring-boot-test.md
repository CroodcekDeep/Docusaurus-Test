---
title: "Spring Boot Test"
sidebar_position: 1
slug: spring-boot-test
tags: [database, demo]
---
# Testing en Spring Boot

Spring Boot proporciona un conjunto de herramientas para realizar pruebas de manera sencilla. Usaremos pruebas unitarias, pruebas de integración y pruebas de controladores para garantizar que nuestra aplicación funcione correctamente.

## 1. Dependencias necesarias

Primero, agrega las siguientes dependencias a tu archivo `pom.xml` o `build.gradle`.

### Para Maven:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
````

### Para Gradle:

```groovy
testImplementation 'org.springframework.boot:spring-boot-starter-test'
```

## 2. Pruebas unitarias

Para hacer pruebas unitarias, usamos `@SpringBootTest` junto con `@Test` de JUnit. Este es un ejemplo de una prueba unitaria simple:

```java
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class MiServicioTest {

    @Autowired
    private MiServicio miServicio;

    @Test
    void pruebaMiMetodo() {
        assertEquals("Hola Mundo", miServicio.saludar());
    }
}
```

## 3. Pruebas de integración

Las pruebas de integración verifican que los componentes de la aplicación funcionen correctamente juntos. Aquí se muestra un ejemplo con una base de datos en memoria:

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
public class RepositorioTest {

    @Autowired
    private MiRepositorio miRepositorio;

    @Test
    void pruebaGuardarEntidad() {
        MiEntidad entidad = new MiEntidad("Test");
        miRepositorio.save(entidad);
        assertNotNull(miRepositorio.findById(entidad.getId()));
    }
}
```

## 4. Pruebas de controladores

Spring Boot también facilita la prueba de controladores con `@WebMvcTest`:

```java
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MiControlador.class)
public class MiControladorTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void pruebaControlador() throws Exception {
        mockMvc.perform(get("/saludo"))
               .andExpect(status().isOk());
    }
}
```
# Conclusion
Este es para ver los cambios efectuados de forma de prueba y edicion, de forma consecutiva en la documentacion, hola mundo