# @dreamer/service

> A service container (dependency injection) library compatible with Deno and
> Bun, providing singleton, transient, scoped, and factory-based service
> management.

> [English](./README.md) (root) | [中文 (Chinese)](./docs/zh-CN/README.md)

[![JSR](https://jsr.io/badges/@dreamer/service)](https://jsr.io/@dreamer/service)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests: 56 passed](https://img.shields.io/badge/Tests-56%20passed-brightgreen)](./docs/en-US/TEST_REPORT.md)

**Changelog**: [English](./docs/en-US/CHANGELOG.md) |
[中文 (Chinese)](./docs/zh-CN/CHANGELOG.md)

### [1.0.1] - 2026-02-19

- **Changed**: i18n translation method `$t` → `$tr`; docs reorganized to
  `docs/en-US/` and `docs/zh-CN/`; license explicitly Apache-2.0.

---

## 🎯 Overview

Service container (dependency injection) library for managing services and their
dependencies within an application.

---

## ✨ Features

- **Service registration and resolution**:
  - **Singleton**: One instance for the entire application lifetime
  - **Transient**: A new instance every time it is resolved
  - **Scoped**: One instance per scope; different scopes are independent
  - **Factory**: Services created dynamically by a factory function, with
    support for arguments
- **Lifecycle management**:
  - **singleton**: Single instance shared globally
  - **transient**: New instance on each resolution
  - **scoped**: Single instance per scope
  - **factory**: Created dynamically
- **Service management**:
  - Register and resolve services
  - Service aliases
  - Replace and override services
  - Remove and clear services
  - Service discovery (list all registered services)
  - Service metadata (getServiceInfo)
  - Filter by lifetime (getServicesByLifetime)
- **Safe resolution**:
  - **tryGet**: Resolve without throwing if missing
  - **getOrDefault**: Resolve with a default value
- **Improved error handling**:
  - Factory errors are wrapped for better debugging
  - Factory may return undefined / null / 0 / empty string
- **Dependency injection**:
  - Manual service dependency injection
  - Managing dependencies between services
  - Lazy resolution (instances created on demand)

---

## 🎨 Design principles

All @dreamer/* packages follow these principles:

- **Main package (@dreamer/xxx)**: For server-side use (Deno and Bun compatible)
- **Client sub-package (@dreamer/xxx/client)**: For client-side use (browser)

This allows:

- Clear separation of server and client code
- Avoiding server-only dependencies in client code
- Better type safety and editor support
- Better tree-shaking

---

## 🎯 Use cases

- Dependency management in large applications
- Modular architecture
- Service decoupling
- Mock replacement in tests

---

## 📖 Service type guide

### Recommended service types for @dreamer packages

| Package              | Recommended type | Manager class    | Notes                                     |
| -------------------- | ---------------- | ---------------- | ----------------------------------------- |
| `@dreamer/config`    | **Singleton**    | ConfigManager    | Config shared globally across the app     |
| `@dreamer/session`   | **Singleton**    | SessionManager   | Session manager shared globally           |
| `@dreamer/lifecycle` | **Singleton**    | LifecycleManager | Single lifecycle manager                  |
| `@dreamer/stream`    | **Singleton**    | StreamManager    | Stream manager shared globally            |
| `@dreamer/logger`    | **Singleton**    | LoggerManager    | Logger manager shared globally            |
| `@dreamer/storage`   | **Singleton**    | StorageManager   | Storage manager shared globally           |
| `@dreamer/email`     | **Singleton**    | EmailManager     | Email manager shared globally             |
| `@dreamer/webrtc`    | **Singleton**    | WebRTCManager    | WebRTC manager shared globally            |
| `@dreamer/web3`      | **Singleton**    | Web3Manager      | Web3 manager shared globally, multi-chain |
| `@dreamer/router`    | **Singleton**    | -                | Router is unique; register as singleton   |

### Example scenarios

| Scenario                 | Service type | Reason                                               |
| ------------------------ | ------------ | ---------------------------------------------------- |
| Database connection pool | Singleton    | Pool should be shared to avoid duplicate connections |
| Config service           | Singleton    | Loaded once at startup, shared globally              |
| Cache service            | Singleton    | Cache must be shared to be useful                    |
| HTTP request handling    | Transient    | Each request independent, no shared state            |
| Request context          | Scoped       | Shared within one request, isolated between requests |
| Database transaction     | Scoped       | Shared connection per transaction, released after    |
| User session data        | Scoped       | Shared user info within one request                  |
| Dynamic DB adapter       | Factory      | Create different adapters by config                  |
| Strategy pattern         | Factory      | Choose implementation by parameter                   |

---

## 📦 Installation

### Deno

```bash
deno add jsr:@dreamer/service
```

### Bun

```bash
bunx jsr add @dreamer/service
```

---

## 🌍 Environment compatibility

- **Runtime**: Deno 2.6+ or Bun 1.3.5
- **Server**: ✅ Supported (service container / DI is a server-side concept)
- **Client**: ❌ Not supported (browser; service container / DI is server-side)
- **Dependencies**: None (pure TypeScript)

---

## 🚀 Quick start

### Basic usage

```typescript
import { ServiceContainer } from "jsr:@dreamer/service";

// Create service container
const container = new ServiceContainer();

// Register singleton
container.registerSingleton("userService", () => new UserService());

// Register transient (new instance each time)
container.registerTransient("logger", () => new Logger());

// Register service with dependencies (manual injection)
container.registerSingleton("userController", () => {
  const userService = container.get("userService");
  const logger = container.get("logger");
  return new UserController(userService, logger);
});

// Resolve services
const userService = container.get("userService");
const controller = container.get("userController");

// Check if registered
if (container.has("userService")) {
  // Service is registered
}

// Remove service
container.remove("userService");
```

### Service type quick reference

| Type          | Instance count | Created when     | Use case                   | Examples                              |
| ------------- | -------------- | ---------------- | -------------------------- | ------------------------------------- |
| **Singleton** | One globally   | First resolution | Shared state, global       | DB connection, config, cache          |
| **Transient** | New each time  | Every resolution | Stateless, isolated        | HTTP client, temp objects             |
| **Scoped**    | One per scope  | First in scope   | Request-level shared       | Request context, transaction, session |
| **Factory**   | On demand      | When called      | Parameterized, conditional | Dynamic config, strategies            |

### How to choose a service type?

```
                ┌─────────────────────────────────┐
                │  Shared across the whole app?   │
                └────────────────┬────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
               Yes                                No
                │                                 │
    ┌───────────┴───────────┐         ┌──────────┴──────────┐
    │ Need params to create? │         │  Shared in a scope?  │
    └───────────┬───────────┘         └──────────┬──────────┘
                │                                 │
      ┌─────────┴─────────┐             ┌─────────┴─────────┐
      ▼                   ▼             ▼                   ▼
     Yes                  No            Yes                  No
      │                   │             │                   │
┌─────┴─────┐      ┌─────┴─────┐   ┌────┴────┐        ┌─────┴─────┐
│  Factory  │      │ Singleton │   │ Scoped  │        │ Transient │
└───────────┘      └───────────┘   └─────────┘        └───────────┘
```

### Service lifetime details

---

### Service lifetime

#### 1. Singleton

One instance for the entire application; every resolution returns the same
instance.

```typescript
// Register singleton
container.registerSingleton("database", () => new Database());

// Multiple resolutions return the same instance
const db1 = container.get("database");
const db2 = container.get("database");
console.log(db1 === db2); // true

// Use cases:
// - Database connection
// - Config service
// - Cache service
// - Logger (singleton)
// - Services with shared state
```

#### 2. Transient

A new instance on every resolution; good for stateless or isolated usage.

```typescript
// Register transient
container.registerTransient("logger", () => new Logger());
container.registerTransient("httpClient", () => new HttpClient());

// Each resolution is a new instance
const logger1 = container.get("logger");
const logger2 = container.get("logger");
console.log(logger1 === logger2); // false

// Benefits:
// ✅ No shared state: each request gets its own instance
// ✅ Stateless: e.g. HTTP client, utilities
// ✅ Temporary objects: request context, one-off computation
// ✅ Isolation: concurrency, multi-tenant
// ✅ Memory: can be reclaimed when done

// Use cases:
// - HTTP client (new instance per request)
// - Request context (per request)
// - Temporary computation
// - Stateless utilities
// - Isolated concurrent work
```

**Singleton vs Transient**:

```typescript
// Singleton: shared state (can be problematic)
container.registerSingleton("counter", () => ({ count: 0 }));
const counter1 = container.get("counter");
const counter2 = container.get("counter");
counter1.count++; // same object
console.log(counter2.count); // 1

// Transient: independent state (safer)
container.registerTransient("counter", () => ({ count: 0 }));
const counter1 = container.get("counter");
const counter2 = container.get("counter");
counter1.count++; // only this instance
console.log(counter2.count); // 0
```

#### 3. Scoped

One instance per scope; different scopes have different instances.

```typescript
// Register scoped service
container.registerScoped("requestContext", () => new RequestContext());

// Same scope: same instance
const scope1 = container.createScope();
const ctx1 = scope1.get("requestContext");
const ctx2 = scope1.get("requestContext");
console.log(ctx1 === ctx2); // true

// Different scope: different instance
const scope2 = container.createScope();
const ctx3 = scope2.get("requestContext");
console.log(ctx1 === ctx3); // false

// Use cases:
// - Request context (one scope per request)
// - Transaction (one scope per transaction)
// - User session (one scope per user)
```

### Factory

Factory registration lets you create services dynamically with a function,
including parameters and conditional creation.

#### Basic factory

```typescript
// Option 1: Simple factory
container.registerFactory("logger", () => {
  const env = process.env.DENO_ENV || "dev";
  if (env === "prod") {
    return new FileLogger("./logs/app.log");
  } else {
    return new ConsoleLogger();
  }
});

// Option 2: Factory with parameters
container.registerFactory("httpClient", (baseURL: string) => {
  return new HttpClient({ baseURL });
});

// Resolve
const logger = container.get("logger"); // chosen by environment
const client = container.get("httpClient", "https://api.example.com");
```

#### Advanced factory

```typescript
// Create instance by config
container.registerFactory("database", (config: DatabaseConfig) => {
  switch (config.adapter) {
    case "postgresql":
      return new PostgreSQLAdapter(config);
    case "mysql":
      return new MySQLAdapter(config);
    case "mongodb":
      return new MongoDBAdapter(config);
    default:
      throw new Error(`Unsupported database adapter: ${config.adapter}`);
  }
});

// Different instances
const pgDb = container.get("database", {
  adapter: "postgresql",
  host: "localhost",
});
const mysqlDb = container.get("database", {
  adapter: "mysql",
  host: "localhost",
});
```

#### Factory with dependency injection

```typescript
// Factory can use the container to resolve other services
container.registerFactory("userService", (userId: string) => {
  const db = container.get("database");
  const logger = container.get("logger");
  return new UserService(db, logger, userId);
});

// Usage
const userService = container.get("userService", "user-123");
```

#### Benefits of factory

```typescript
// ✅ Dynamic: create different instances by parameter or condition
container.registerFactory("cache", (type: "memory" | "redis") => {
  if (type === "memory") {
    return new MemoryCache();
  } else {
    return new RedisCache();
  }
});

// ✅ Lazy: only created when get() is called
container.registerFactory("heavyService", () => {
  return new HeavyService(); // deferred init
});

// ✅ Parameterized: pass different arguments
container.registerFactory("apiClient", (baseURL: string, timeout: number) => {
  return new ApiClient({ baseURL, timeout });
});

const client1 = container.get("apiClient", "https://api1.com", 5000);
const client2 = container.get("apiClient", "https://api2.com", 10000);
```

---

## 📚 API documentation

### ServiceContainer class

Service container; provides dependency injection and service management.

#### Constructor

```typescript
new ServiceContainer();
```

Creates a new container instance.

#### Methods

##### `registerSingleton<T>(name: string, factory: () => T, aliases?: string[]): void`

Register a singleton. One instance for the whole application.

**Parameters**:

- `name: string` — Service name
- `factory: () => T` — Factory that creates the instance
- `aliases?: string[]` — Optional aliases

**Example**:

```typescript
container.registerSingleton("database", () => new Database());
```

##### `registerTransient<T>(name: string, factory: () => T, aliases?: string[]): void`

Register a transient. New instance on every resolution.

**Parameters**:

- `name: string` — Service name
- `factory: () => T` — Factory that creates the instance
- `aliases?: string[]` — Optional aliases

**Example**:

```typescript
container.registerTransient("logger", () => new Logger());
```

##### `registerScoped<T>(name: string, factory: () => T, aliases?: string[]): void`

Register a scoped service. One instance per scope.

**Parameters**:

- `name: string` — Service name
- `factory: () => T` — Factory that creates the instance
- `aliases?: string[]` — Optional aliases

**Example**:

```typescript
container.registerScoped("requestContext", () => new RequestContext());
```

##### `registerFactory<T, TArgs>(name: string, factory: (...args: TArgs) => T, aliases?: string[]): void`

Register a factory. The factory can take arguments.

**Parameters**:

- `name: string` — Service name
- `factory: (...args: TArgs) => T` — Factory (may take arguments)
- `aliases?: string[]` — Optional aliases

**Example**:

```typescript
container.registerFactory("httpClient", (baseURL: string) => {
  return new HttpClient({ baseURL });
});
```

##### `get<T>(name: string, ...args: unknown[]): T`

Resolve a service.

**Parameters**:

- `name: string` — Service name
- `...args: unknown[]` — Arguments for factory (factory only)

**Returns**: Service instance

**Example**:

```typescript
const userService = container.get("userService");
const client = container.get("httpClient", "https://api.example.com");
```

##### `has(name: string): boolean`

Check if a service is registered.

**Parameters**:

- `name: string` — Service name

**Returns**: Whether registered

**Example**:

```typescript
if (container.has("userService")) {
  // Service is registered
}
```

##### `remove(name: string): boolean`

Remove a service. Works by primary name or alias.

**Parameters**:

- `name: string` — Service name or alias

**Returns**: Whether removal succeeded

**Example**:

```typescript
const success = container.remove("userService");
console.log(success); // true

// Or remove by alias
container.remove("userServiceAlias");
```

##### `tryGet<T>(name: string, ...args: unknown[]): T | undefined`

Resolve without throwing. Returns undefined if not registered or creation fails.

**Parameters**:

- `name: string` — Service name
- `...args: unknown[]` — Arguments for factory (factory only)

**Returns**: Instance or undefined

**Example**:

```typescript
const service = container.tryGet("userService");
if (service) {
  // Service exists
}

// tryGet does not throw
const result = container.tryGet("nonexistent"); // undefined
```

##### `getOrDefault<T>(name: string, defaultValue: T, ...args: unknown[]): T`

Resolve, or return default if not registered.

**Parameters**:

- `name: string` — Service name
- `defaultValue: T` — Default value
- `...args: unknown[]` — Arguments for factory (factory only)

**Returns**: Instance or default

**Example**:

```typescript
const logger = container.getOrDefault("logger", new ConsoleLogger());
```

##### `getServiceInfo(name: string): ServiceInfo | undefined`

Get service metadata.

**Parameters**:

- `name: string` — Service name

**Returns**: Service info, or undefined

**Example**:

```typescript
const info = container.getServiceInfo("userService");
if (info) {
  console.log(info.name); // "userService"
  console.log(info.lifetime); // "singleton"
  console.log(info.aliases); // ["userSvc"]
  console.log(info.hasInstance); // true if instance created
}
```

##### `getAllServiceInfo(): ServiceInfo[]`

Get metadata for all registered services.

**Returns**: Array of service info

**Example**:

```typescript
const allInfo = container.getAllServiceInfo();
allInfo.forEach((info) => {
  console.log(`${info.name} (${info.lifetime})`);
});
```

##### `getServicesByLifetime(lifetime: ServiceLifetime): string[]`

Get all service names for a given lifetime.

**Parameters**:

- `lifetime: ServiceLifetime` — Lifetime type

**Returns**: Array of service names

**Example**:

```typescript
const singletons = container.getServicesByLifetime("singleton");
console.log(singletons); // ["database", "config", ...]
```

##### `createScope(): IServiceScope`

Create a scope for scoped services.

**Returns**: Scope instance

**Example**:

```typescript
const scope = container.createScope();
const ctx = scope.get("requestContext");
scope.dispose(); // dispose scoped instances
```

##### `clear(): void`

Remove all registrations.

**Example**:

```typescript
container.clear();
```

##### `getRegisteredServices(): string[]`

Get all registered service names.

**Returns**: Array of names

**Example**:

```typescript
const services = container.getRegisteredServices();
console.log(services); // ["userService", "logger", ...]
```

##### `replace<T>(name: string, lifetime: ServiceLifetime, factory: (...args: unknown[]) => T, aliases?: string[]): void`

Replace a service (remove then register).

**Parameters**:

- `name: string` — Service name
- `lifetime: ServiceLifetime` — Lifetime
- `factory: (...args: unknown[]) => T` — Factory
- `aliases?: string[]` — Optional aliases

**Example**:

```typescript
container.replace("userService", "singleton", () => new NewUserService());
```

### IServiceScope interface

Scope interface for managing scoped service lifetime.

#### Methods

##### `get<T>(name: string, ...args: unknown[]): T`

Resolve a service within the scope.

**Parameters**:

- `name: string` — Service name
- `...args: unknown[]` — Factory arguments

**Returns**: Service instance

##### `has(name: string): boolean`

Check if a service is registered.

**Parameters**:

- `name: string` — Service name

**Returns**: Whether registered

##### `dispose(): void`

Dispose the scope (dispose scoped instances).

### Type definitions

#### `ServiceLifetime`

```typescript
type ServiceLifetime = "singleton" | "transient" | "scoped" | "factory";
```

#### `ServiceInfo`

Service metadata.

```typescript
interface ServiceInfo {
  /** Service name */
  name: string;
  /** Lifetime */
  lifetime: ServiceLifetime;
  /** Aliases */
  aliases: string[];
  /** Whether an instance has been created (singleton only) */
  hasInstance: boolean;
}
```

#### `IServiceScope`

```typescript
interface IServiceScope {
  get<T = unknown>(name: string, ...args: unknown[]): T;
  has(name: string): boolean;
  dispose(): void;
}
```

### Helper

#### `createServiceContainer(): ServiceContainer`

Create a container instance.

**Returns**: ServiceContainer instance

**Example**:

```typescript
const container = createServiceContainer();
```

## 📊 Test report

| Item        | Value      |
| ----------- | ---------- |
| Total tests | 56         |
| Passed      | 56         |
| Failed      | 0          |
| Pass rate   | 100%       |
| Date        | 2026-01-30 |

Full test report: [TEST_REPORT.md](./docs/en-US/TEST_REPORT.md).

---

## 📝 Notes

- **Server-only**: Service container / DI is a server-side pattern; not for
  browser.
- **Unified API**: Single dependency-injection API for consistency.
- **Type safety**: Full TypeScript support.
- **No external deps**: Pure TypeScript.
- **Foundation**: Other packages may depend on it for DI and service management.

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 📄 License

Apache License 2.0 - see [LICENSE](./LICENSE)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
