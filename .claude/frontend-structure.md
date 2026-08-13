# Estructura de frontend (Next.js App Router)

Convención de organización de código para cualquier proyecto Next.js con
App Router. No es específica de este repo — aplica igual a cualquier
proyecto que use `app/` + componentes colocados.

## 🎯 Principio

`page.tsx` **solo** define la estructura general de la página y compone
componentes. No contiene lógica de negocio, fetching directo, ni estado
complejo. Toda esa lógica vive dentro de los componentes que `page.tsx`
invoca.

## 📁 Estructura de páginas

```
app/
└── users/
    ├── page.tsx        # Estructura de la página
    ├── layout.tsx       # Layout de la página (si aplica)
    └── components/      # Componentes propios de esta página
```

## 📁 Estructura de un componente

Cada componente tiene su propia carpeta, con archivos "hermanos" que
separan responsabilidades. Ejemplo con `CreateUserForm`:

```
components/
└── create-user-form/
    ├── CreateUserForm.tsx              # Implementación del componente
    ├── create-user-form.api.ts         # Requests a la API
    ├── create-user-form.dto.ts         # DTOs / builders
    ├── create-user-form.provider.tsx   # CreateUserFormProvider
    ├── create-user-form.context.ts     # Definición del CreateUserFormContext
    ├── use-create-user-form.ts         # Hook useCreateUserForm
    └── components/                     # Componentes hijos (si los hay)
        └── ...
```

### Convención de nombres de archivo

| Archivo | Responsabilidad |
|---|---|
| `ComponentName.tsx` | Implementación visual/estructural del componente |
| `component-name.api.ts` | Llamadas a la API relacionadas a este componente |
| `component-name.dto.ts` | Clases de datos (patrón builder), modelos, mappers |
| `component-name.service.ts` | Lógica de negocio pura (sin React, sin llamadas a API): reglas derivadas sobre datos que el componente/hook ya tiene, testeables sin renderizar nada |
| `component-name.provider.tsx` | Implementación del `ComponentNameProvider` |
| `component-name.context.ts` | Creación del `ComponentNameContext` (`createContext`) |
| `use-component-name.ts` | Hook custom para consumir el contexto (`useComponentName`) |
| `components/` | Componentes hijos, cada uno con esta misma estructura |

**Regla de profundidad:** si un componente tiene componentes hijos, estos
van dentro de su propia carpeta `components/`, y cada hijo repite
exactamente esta misma estructura, anidada tantos niveles como haga falta.

**Archivo solo si hace falta:** una unidad (componente, o cualquier cosa
dentro de `common/`, ver más abajo) solo tiene los archivos hermanos que su
responsabilidad realmente requiere. Un componente que no llama API no
tiene `.api.ts`. Uno que no comparte estado no tiene `.provider.tsx` ni
`.context.ts`. No se crean por convención automática ni "por las dudas".

## 🔀 Reglas de paso de datos

1. **Props:** solo se usan para pasar datos de un componente a su **hijo
   directo**.
2. **Context (padre → nieto):** si un dato necesita llegar a un
   descendiente que **no** es hijo directo (nieto, bisnieto, etc.), no se
   pasa por props en cadena. Se usa Context.
3. **Context (hijo → padre):** si un componente necesita enviar datos
   hacia un ancestro que no es su padre directo, también se usa Context.

En resumen: **props únicamente para relación padre-hijo directa.**
Cualquier otro intercambio (hacia arriba, o hacia abajo saltando niveles)
se resuelve con Context.

## 🧩 Reglas de uso de Provider

- Un componente **solo** tiene su propio `Provider` cuando efectivamente
  necesita intercambiar datos con un ancestro o un descendiente no
  directo. No se crea un Provider "por las dudas".
- El `Provider` siempre envuelve al **primer ancestro común** entre el
  emisor y el receptor del dato — el nivel más alto necesario para que
  ambos queden dentro de su árbol.
- **Convención de lectura:** la presencia de `provider`/`context` en una
  carpeta es señal explícita de que ahí hay intercambio de datos no
  directo. Si no hay ese intercambio, esos archivos no deberían existir.
- Cuando haya más de un `Provider` anidado en el mismo árbol, memoizar el
  `value` del Context (`useMemo`) para no generar renders en cascada en
  cada componente que se agrega.

## 🌐 Carpeta `common/` — código compartido entre páginas

`common/` es **hermana de `app/`**, no vive adentro. Guarda todo lo que no
pertenece a una sola página: api clients, dtos, contexts, hooks o
componentes de UI reutilizados por más de una feature.

```
app/
common/
├── users-api/
│   └── users-api.api.ts
├── auth-context/
│   ├── auth-context.provider.tsx
│   ├── auth-context.context.ts
│   └── use-auth-context.ts
├── use-debounce/
│   └── use-debounce.ts
└── button/
    └── Button.tsx
```

**Misma regla que `components/`:** cada unidad tiene su propia carpeta
kebab-case, con los mismos archivos hermanos (`.tsx`, `.api.ts`,
`.dto.ts`, `.service.ts`, `.provider.tsx`, `.context.ts`, `use-*.ts`),
usando solo los que su responsabilidad requiere. No hay una estructura distinta para
"lo compartido" — es la misma regla, en otro nivel del árbol.

### Regla de promoción (cuándo algo pasa a `common/`)

1. Todo nace **local**, dentro de `components/` de la página o del
   componente que lo necesita por primera vez.
2. Se promueve a `common/` recién cuando aparece un **segundo
   consumidor** que no comparte el mismo subárbol — otra página, u otro
   componente fuera del árbol del primero.
3. Nunca se crea algo directamente en `common/` "por las dudas" o
   anticipando reuso futuro. Si hoy lo usa un solo componente, vive ahí.

### Import

Se importa siempre con el alias absoluto del proyecto
(`@/common/auth-context/...`), nunca con rutas relativas largas
(`../../../common/...`).

## 📌 Resumen de reglas

- `page.tsx` = estructura + composición, sin lógica.
- Cada unidad (componente o pieza de `common/`) vive en su propia carpeta
  con archivos hermanos por responsabilidad, creando solo los que
  necesita.
- Props → solo padre-hijo directo.
- Context → padre-a-nieto o hijo-a-padre (cualquier salto de nivel).
- Provider → solo donde realmente hay intercambio de datos, envolviendo
  el ancestro común más alto necesario; memoizar su `value` si hay varios
  anidados.
- `common/` → misma regla que `components/`, aplicada a lo que usan 2+
  páginas o subárboles distintos. Nace local, se promueve recién cuando
  aparece el segundo consumidor.
