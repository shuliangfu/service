# @dreamer/service

> Service container (dependency injection) library compatible with Deno and Bun. Provides singleton, transient, scoped, and factory service management.

English | [中文 (Chinese)](./README-zh.md)

[![JSR](https://jsr.io/badges/@dreamer/service)](https://jsr.io/@dreamer/service)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests: 56 passed](https://img.shields.io/badge/Tests-56%20passed-brightgreen)](./TEST_REPORT.md)

## 🎯 Features

Service container (dependency injection) library for managing application services and dependencies.

---

## ✨ Capabilities

- **Registration and retrieval**:
  - **Singleton**: One instance for the entire application lifecycle
  - **Transient**: New instance on each get
  - **Scoped**: Singleton within a scope, independent across scopes
  - **Factory**: Dynamic creation via factory function with parameters
- **Lifecycle management**:
  - singleton, transient, scoped, factory
- **Service management**:
  - Register, get, alias, replace, remove, clear
  - Service discovery (getRegisteredServices)
  - Service metadata (getServiceInfo)
  - Filter by lifetime (getServicesByLifetime)
- **Safe retrieval**:
  - tryGet: Get without throwing
  - getOrDefault: Get with default value
- **Error handling**:
  - Factory error wrapping for debugging
  - Support for factory returning undefined/null/0/empty string
- **Dependency injection**:
  - Manual registration and injection
  - Manage dependencies between services
  - Lazy loading (create on demand)

---

## 🎨 Design Principles

**All @dreamer/_ libraries follow these principles**:

- **Main package (@dreamer/xxx)**: Server-side (Deno and Bun)
- **Client subpackage (@dreamer/xxx/client)**: Client-side (browser)

Benefits:

- Clear separation of server and client code
- Avoid client-side server dependencies
- Better type safety and IntelliSense
- Better tree-shaking

---

## 🎯 Use Cases

- Dependency management in large apps
- Modular architecture
- Service decoupling
- Mock replacement in tests

---

## 📖 Service Type Guide

### @dreamer Library Recommendations

| Library | Recommended | Manager Class | Notes |
|---------|-------------|---------------|-------|
| `@dreamer/config` | **Singleton** | ConfigManager | Config shared globally |
| `@dreamer/session` | **Singleton** | SessionManager | Session manager shared |
| `@dreamer/lifecycle` | **Singleton** | LifecycleManager | Single lifecycle manager |
| `@dreamer/stream` | **Singleton** | StreamManager | Stream manager shared |
| `@dreamer/logger` | **Singleton** | LoggerManager | Logger manager shared |
| `@dreamer/storage` | **Singleton** | StorageManager | Storage manager shared |
| `@dreamer/email` | **Singleton** | EmailManager | Email manager shared |
| `@dreamer/webrtc` | **Singleton** | WebRTCManager | WebRTC manager shared |
| `@dreamer/web3` | **Singleton** | Web3Manager | Web3 manager shared |
| `@dreamer/router` | **Singleton** | - | Router single instance |

### Typical Scenarios

| Scenario | Type | Reason |
|----------|------|--------|
| Database connection pool | Singleton | Share pool, avoid duplicate connections |
| Config service | Singleton | Load once at startup, share globally |
| Cache service | Singleton | Cache must be shared |
| HTTP request handling | Transient | Each request isolated |
| Request context | Scoped | Shared within request, isolated across |
| Database transaction | Scoped | Shared within transaction |
| User session data | Scoped | Shared within request |
| Dynamic DB adapter | Factory | Create by config params |
| Strategy pattern | Factory | Select strategy by params |

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

## 🌍 Environment Compatibility

- **Runtime**: Deno 2.6+ or Bun 1.3.5
- **Server**: ✅ Supported (Deno and Bun)
- **Client**: ❌ Not supported (service container is server-side)
- **Dependencies**: None (pure TypeScript)

---

## 🚀 Quick Start

### Basic usage

```typescript
import { ServiceContainer } from "jsr:@dreamer/service";

const container = new ServiceContainer();

container.registerSingleton("userService", () => new UserService());

container.registerTransient("logger", () => new Logger());

container.registerSingleton("userController", () => {
  const userService = container.get("userService");
  const logger = container.get("logger");
  return new UserController(userService, logger);
});

const userService = container.get("userService");
const controller = container.get("userController");

if (container.has("userService")) {
  // Service registered
}

container.remove("userService");
```

### Service Type Quick Reference

| Type | Instances | Created | Use Case | Example |
|------|-----------|---------|----------|---------|
| **Singleton** | 1 global | First get | Shared state | DB, config, cache |
| **Transient** | New each time | Each get | Stateless, isolated | HTTP client |
| **Scoped** | 1 per scope | First get in scope | Request-level | Request context, transaction |
| **Factory** | On demand | Dynamic | Params, conditional | Dynamic config, strategy |

### Choosing Service Type

```
Need shared across entire app?
        │
        ├───────────── Yes ─────────────┐
        │                               │
        │              Need params?     │
        │              ├─ Yes → Factory │
        │              └─ No  → Singleton
        │
        └───────────── No ──────────────┐
                                       │
                    Shared within scope?
                    ├─ Yes → Scoped
                    └─ No  → Transient
```

### Service Lifecycle Details

#### 1. Singleton

One instance for the entire application lifecycle.

```typescript
container.registerSingleton("database", () => new Database());

const db1 = container.get("database");
const db2 = container.get("database");
console.log(db1 === db2); // true
```

#### 2. Transient

New instance on each get.

```typescript
container.registerTransient("logger", () => new Logger());

const logger1 = container.get("logger");
const logger2 = container.get("logger");
console.log(logger1 === logger2); // false
```

**Singleton vs Transient**:

```typescript
// Singleton: shared state
container.registerSingleton("counter", () => ({ count: 0 }));
const c1 = container.get("counter");
const c2 = container.get("counter");
c1.count++;
console.log(c2.count); // 1

// Transient: isolated state
container.registerTransient("counter", () => ({ count: 0 }));
const c1 = container.get("counter");
const c2 = container.get("counter");
c1.count++;
console.log(c2.count); // 0
```

#### 3. Scoped

Singleton within scope, independent across scopes.

```typescript
container.registerScoped("requestContext", () => new RequestContext());

const scope1 = container.createScope();
const ctx1 = scope1.get("requestContext");
const ctx2 = scope1.get("requestContext");
console.log(ctx1 === ctx2); // true

const scope2 = container.createScope();
const ctx3 = scope2.get("requestContext");
console.log(ctx1 === ctx3); // false
```

### Factory Pattern

```typescript
// Simple factory
container.registerFactory("logger", () => {
  const env = process.env.DENO_ENV || "dev";
  return env === "prod" ? new FileLogger("./logs/app.log") : new ConsoleLogger();
});

// With parameters
container.registerFactory("httpClient", (baseURL: string) => {
  return new HttpClient({ baseURL });
});

const logger = container.get("logger");
const client = container.get("httpClient", "https://api.example.com");
```

---

## 📚 API Reference

### ServiceContainer

#### Constructor

```typescript
new ServiceContainer();
```

#### Methods

##### `registerSingleton<T>(name: string, factory: () => T, aliases?: string[]): void`

Register singleton service.

##### `registerTransient<T>(name: string, factory: () => T, aliases?: string[]): void`

Register transient service.

##### `registerScoped<T>(name: string, factory: () => T, aliases?: string[]): void`

Register scoped service.

##### `registerFactory<T, TArgs>(name: string, factory: (...args: TArgs) => T, aliases?: string[]): void`

Register factory service.

##### `get<T>(name: string, ...args: unknown[]): T`

Get service instance.

##### `has(name: string): boolean`

Check if service exists.

##### `remove(name: string): boolean`

Remove service (by name or alias).

##### `tryGet<T>(name: string, ...args: unknown[]): T | undefined`

Safe get without throwing.

##### `getOrDefault<T>(name: string, defaultValue: T, ...args: unknown[]): T`

Get service or default value.

##### `getServiceInfo(name: string): ServiceInfo | undefined`

Get service metadata.

##### `getAllServiceInfo(): ServiceInfo[]`

Get all service metadata.

##### `getServicesByLifetime(lifetime: ServiceLifetime): string[]`

Get service names by lifetime.

##### `createScope(): IServiceScope`

Create scope.

##### `clear(): void`

Clear all services.

##### `getRegisteredServices(): string[]`

Get all registered service names.

##### `replace<T>(name: string, lifetime: ServiceLifetime, factory: (...args: unknown[]) => T, aliases?: string[]): void`

Replace service.

### IServiceScope

- `get<T>(name: string, ...args: unknown[]): T`
- `has(name: string): boolean`
- `dispose(): void`

### Types

#### ServiceLifetime

```typescript
type ServiceLifetime = "singleton" | "transient" | "scoped" | "factory";
```

#### ServiceInfo

```typescript
interface ServiceInfo {
  name: string;
  lifetime: ServiceLifetime;
  aliases: string[];
  hasInstance: boolean;
}
```

### Helper

#### `createServiceContainer(): ServiceContainer`

Create service container instance.

## 📊 Test Report

| Metric | Value |
|--------|-------|
| Total tests | 56 |
| Passed | 56 |
| Failed | 0 |
| Pass rate | 100% |
| Test date | 2026-01-30 |

See [TEST_REPORT.md](./TEST_REPORT.md) for details.

---

## 📝 Notes

- **Server-only**: Service container is a server-side pattern
- **Unified API**: Consistent dependency injection API
- **Type safety**: Full TypeScript support
- **No external deps**: Pure TypeScript
- **Foundation**: Other libraries may depend on it for DI

---

## 🤝 Contributing

Issues and Pull Requests are welcome.

---

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
