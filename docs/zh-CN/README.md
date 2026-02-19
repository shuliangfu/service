# @dreamer/service

> 一个兼容 Deno 和 Bun
> 的服务容器（依赖注入）工具包，提供单例、多例、作用域、工厂模式等服务管理功能

> [English](../../README.md) | 中文 (Chinese)

[![JSR](https://jsr.io/badges/@dreamer/service)](https://jsr.io/@dreamer/service)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../../LICENSE)
[![Tests: 56 passed](https://img.shields.io/badge/Tests-56%20passed-brightgreen)](./TEST_REPORT.md)

## 🎯 功能

服务容器（依赖注入）工具包，用于管理应用中的服务和依赖关系。

---

## ✨ 特性

- **服务注册和获取**：
  - 单例服务（singleton）：整个应用生命周期中只有一个实例
  - 多例服务（transient）：每次获取时都创建新实例
  - 作用域服务（scoped）：在同一个作用域内是单例，不同作用域之间独立
  - 工厂服务（factory）：使用工厂函数动态创建服务，支持参数传入
- **生命周期管理**：
  - singleton：单例模式，全局共享一个实例
  - transient：多例模式，每次获取新实例
  - scoped：作用域模式，作用域内单例
  - factory：工厂模式，动态创建
- **服务管理**：
  - 服务注册和获取
  - 服务别名支持
  - 服务替换和覆盖
  - 服务移除和清空
  - 服务发现（获取所有已注册的服务）
  - 服务元数据获取（getServiceInfo）
  - 按生命周期筛选服务（getServicesByLifetime）
- **安全获取**：
  - tryGet：安全获取服务，不抛出错误
  - getOrDefault：带默认值的服务获取
- **改进的错误处理**：
  - 工厂函数错误包装，提供更好的调试信息
  - 支持工厂函数返回 undefined/null/0/空字符串
- **依赖注入**：
  - 手动服务依赖注入
  - 服务间依赖关系管理
  - 延迟加载（按需创建服务实例）

---

## 🎨 设计原则

__所有 @dreamer/_ 包都遵循以下原则_*：

- **主包（@dreamer/xxx）**：用于服务端（兼容 Deno 和 Bun 运行时）
- **客户端子包（@dreamer/xxx/client）**：用于客户端（浏览器环境）

这样可以：

- 明确区分服务端和客户端代码
- 避免在客户端代码中引入服务端依赖
- 提供更好的类型安全和代码提示
- 支持更好的 tree-shaking

---

## 🎯 使用场景

- 大型应用的依赖管理
- 模块化架构
- 服务解耦
- 测试时的 Mock 替换

---

## 📖 服务类型使用指南

### @dreamer 包推荐服务类型

| 包                   | 推荐类型      | Manager 类       | 说明                                 |
| -------------------- | ------------- | ---------------- | ------------------------------------ |
| `@dreamer/config`    | **Singleton** | ConfigManager    | 配置全局共享，整个应用使用同一份配置 |
| `@dreamer/session`   | **Singleton** | SessionManager   | 会话管理器全局共享，管理所有用户会话 |
| `@dreamer/lifecycle` | **Singleton** | LifecycleManager | 生命周期管理器全局唯一               |
| `@dreamer/stream`    | **Singleton** | StreamManager    | 流管理器全局共享                     |
| `@dreamer/logger`    | **Singleton** | LoggerManager    | 日志管理器全局共享，管理多个 logger  |
| `@dreamer/storage`   | **Singleton** | StorageManager   | 存储管理器全局共享                   |
| `@dreamer/email`     | **Singleton** | EmailManager     | 邮件管理器全局共享                   |
| `@dreamer/webrtc`    | **Singleton** | WebRTCManager    | WebRTC 管理器全局共享                |
| `@dreamer/web3`      | **Singleton** | Web3Manager      | Web3 管理器全局共享，管理多链客户端  |
| `@dreamer/router`    | **Singleton** | -                | 路由器全局唯一，直接注册为单例       |

### 典型场景示例

| 场景             | 服务类型  | 原因                                   |
| ---------------- | --------- | -------------------------------------- |
| 数据库连接池     | Singleton | 连接池应该全局共享，避免重复创建连接   |
| 配置服务         | Singleton | 配置在应用启动时加载一次，全局共享     |
| 缓存服务         | Singleton | 缓存需要全局共享才有意义               |
| HTTP 请求处理    | Transient | 每个请求独立，避免状态污染             |
| 请求上下文       | Scoped    | 同一请求内共享上下文，不同请求隔离     |
| 数据库事务       | Scoped    | 同一事务内共享连接，事务结束后释放     |
| 用户会话数据     | Scoped    | 同一请求内共享用户信息                 |
| 动态数据库适配器 | Factory   | 根据配置参数创建不同类型的数据库适配器 |
| 策略模式实现     | Factory   | 根据参数动态选择不同的策略实现         |

---

## 📦 安装

### Deno

```bash
deno add jsr:@dreamer/service
```

### Bun

```bash
bunx jsr add @dreamer/service
```

---

## 🌍 环境兼容性

- **运行时要求**：Deno 2.6+ 或 Bun 1.3.5
- **服务端**：✅ 支持（兼容 Deno 和 Bun 运行时，服务容器/依赖注入是服务端概念）
- **客户端**：❌
  不支持（浏览器环境，服务容器/依赖注入是服务端架构模式，客户端不需要）
- **依赖**：无外部依赖（纯 TypeScript 实现）

---

## 🚀 快速开始

### 基础用法

```typescript
import { ServiceContainer } from "jsr:@dreamer/service";

// 创建服务容器
const container = new ServiceContainer();

// 注册单例服务
container.registerSingleton("userService", () => new UserService());

// 注册多例服务（每次获取新实例）
container.registerTransient("logger", () => new Logger());

// 注册带依赖的服务（手动注入）
container.registerSingleton("userController", () => {
  const userService = container.get("userService");
  const logger = container.get("logger");
  return new UserController(userService, logger);
});

// 获取服务
const userService = container.get("userService");
const controller = container.get("userController");

// 检查服务是否存在
if (container.has("userService")) {
  // 服务已注册
}

// 移除服务
container.remove("userService");
```

### 服务类型速查表

| 类型          | 实例数        | 创建时机         | 适用场景           | 典型示例               |
| ------------- | ------------- | ---------------- | ------------------ | ---------------------- |
| **Singleton** | 全局 1 个     | 首次获取时       | 共享状态、全局资源 | 数据库连接、配置、缓存 |
| **Transient** | 每次新建      | 每次获取时       | 无状态、需要隔离   | HTTP 客户端、临时对象  |
| **Scoped**    | 作用域内 1 个 | 作用域内首次获取 | 请求级别共享       | 请求上下文、事务、会话 |
| **Factory**   | 按需创建      | 调用时动态创建   | 需要参数、条件创建 | 动态配置、策略模式     |

### 如何选择服务类型？

```
                ┌─────────────────────────────────┐
                │     需要在整个应用中共享吗？        │
                └────────────────┬────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
               是                                否
                │                                 │
    ┌───────────┴───────────┐         ┌──────────┴──────────┐
    │ 需要传入参数动态创建？    │         │  需要在作用域内共享？  │
    └───────────┬───────────┘         └──────────┬──────────┘
                │                                 │
      ┌─────────┴─────────┐             ┌─────────┴─────────┐
      ▼                   ▼             ▼                   ▼
     是                  否             是                   否
      │                   │             │                   │
┌─────┴─────┐      ┌─────┴─────┐   ┌────┴────┐        ┌─────┴─────┐
│  Factory  │      │ Singleton │   │ Scoped  │        │ Transient │
└───────────┘      └───────────┘   └─────────┘        └───────────┘
```

### 各服务类型详细说明

---

### 服务生命周期

#### 1. 单例（Singleton）

单例服务在整个应用生命周期中只有一个实例，所有获取请求都返回同一个实例。

```typescript
// 注册单例服务
container.registerSingleton("database", () => new Database());

// 多次获取，返回同一个实例
const db1 = container.get("database");
const db2 = container.get("database");
console.log(db1 === db2); // true，同一个实例

// 适用场景：
// - 数据库连接
// - 配置服务
// - 缓存服务
// - 日志服务（单例）
// - 需要共享状态的服务
```

#### 2. 多例（Transient）

多例服务每次获取时都会创建新实例，适合无状态服务或需要隔离的场景。

```typescript
// 注册多例服务
container.registerTransient("logger", () => new Logger());
container.registerTransient("httpClient", () => new HttpClient());

// 每次获取都是新实例
const logger1 = container.get("logger");
const logger2 = container.get("logger");
console.log(logger1 === logger2); // false，不同实例

// 多例的好处：
// ✅ 避免状态污染：每个请求使用独立的实例，不会相互影响
// ✅ 适合无状态服务：如 HTTP 客户端、工具类等
// ✅ 适合临时对象：如请求上下文、临时计算等
// ✅ 适合需要隔离的场景：如并发处理、多租户等
// ✅ 内存管理：使用完后可以自动回收，不需要手动管理

// 适用场景：
// - HTTP 客户端（每次请求使用新实例）
// - 请求上下文（每个请求独立）
// - 临时计算服务
// - 无状态的工具类
// - 需要隔离的并发处理
```

**单例 vs 多例对比**：

```typescript
// 单例：共享状态（可能有问题）
container.registerSingleton("counter", () => ({ count: 0 }));
const counter1 = container.get("counter");
const counter2 = container.get("counter");
counter1.count++; // 两个引用指向同一个对象
console.log(counter2.count); // 1（被影响了）

// 多例：独立状态（更安全）
container.registerTransient("counter", () => ({ count: 0 }));
const counter1 = container.get("counter");
const counter2 = container.get("counter");
counter1.count++; // 只影响自己的实例
console.log(counter2.count); // 0（不受影响）
```

#### 3. 作用域（Scoped）

作用域服务在同一个作用域内是单例，不同作用域之间是独立的。

```typescript
// 注册作用域服务
container.registerScoped("requestContext", () => new RequestContext());

// 在同一个作用域内，返回同一个实例
const scope1 = container.createScope();
const ctx1 = scope1.get("requestContext");
const ctx2 = scope1.get("requestContext");
console.log(ctx1 === ctx2); // true，同一个作用域

// 不同作用域，返回不同实例
const scope2 = container.createScope();
const ctx3 = scope2.get("requestContext");
console.log(ctx1 === ctx3); // false，不同作用域

// 适用场景：
// - 请求上下文（每个请求一个作用域）
// - 事务管理（每个事务一个作用域）
// - 用户会话（每个用户一个作用域）
```

### 工厂模式

工厂模式允许使用工厂函数动态创建服务，可以传入参数、根据条件返回不同实例等。

#### 基础工厂模式

```typescript
// 方式1：简单工厂函数
container.registerFactory("logger", () => {
  const env = process.env.DENO_ENV || "dev";
  if (env === "prod") {
    return new FileLogger("./logs/app.log");
  } else {
    return new ConsoleLogger();
  }
});

// 方式2：带参数的工厂函数
container.registerFactory("httpClient", (baseURL: string) => {
  return new HttpClient({ baseURL });
});

// 使用工厂创建服务
const logger = container.get("logger"); // 根据环境自动选择
const client = container.get("httpClient", "https://api.example.com");
```

#### 高级工厂模式

```typescript
// 动态创建服务实例
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

// 使用工厂创建不同实例
const pgDb = container.get("database", {
  adapter: "postgresql",
  host: "localhost",
});
const mysqlDb = container.get("database", {
  adapter: "mysql",
  host: "localhost",
});
```

#### 工厂模式结合依赖注入

```typescript
// 工厂函数可以访问容器，获取其他服务
container.registerFactory("userService", (userId: string) => {
  const db = container.get("database");
  const logger = container.get("logger");
  return new UserService(db, logger, userId);
});

// 使用
const userService = container.get("userService", "user-123");
```

#### 工厂模式的优势

```typescript
// ✅ 动态创建：根据参数或条件创建不同的实例
container.registerFactory("cache", (type: "memory" | "redis") => {
  if (type === "memory") {
    return new MemoryCache();
  } else {
    return new RedisCache();
  }
});

// ✅ 延迟创建：只有在需要时才创建实例
container.registerFactory("heavyService", () => {
  // 这个函数只有在调用 get() 时才会执行
  return new HeavyService(); // 延迟初始化
});

// ✅ 参数化创建：可以传入不同的参数
container.registerFactory("apiClient", (baseURL: string, timeout: number) => {
  return new ApiClient({ baseURL, timeout });
});

const client1 = container.get("apiClient", "https://api1.com", 5000);
const client2 = container.get("apiClient", "https://api2.com", 10000);
```

---

## 📚 API 文档

### ServiceContainer 类

服务容器类，提供依赖注入和服务管理功能。

#### 构造函数

```typescript
new ServiceContainer();
```

创建一个新的服务容器实例。

#### 方法

##### `registerSingleton<T>(name: string, factory: () => T, aliases?: string[]): void`

注册单例服务。在整个应用生命周期中只有一个实例。

**参数**：

- `name: string` - 服务名称
- `factory: () => T` - 工厂函数，用于创建服务实例
- `aliases?: string[]` - 服务别名（可选）

**示例**：

```typescript
container.registerSingleton("database", () => new Database());
```

##### `registerTransient<T>(name: string, factory: () => T, aliases?: string[]): void`

注册多例服务。每次获取时都会创建新实例。

**参数**：

- `name: string` - 服务名称
- `factory: () => T` - 工厂函数，用于创建服务实例
- `aliases?: string[]` - 服务别名（可选）

**示例**：

```typescript
container.registerTransient("logger", () => new Logger());
```

##### `registerScoped<T>(name: string, factory: () => T, aliases?: string[]): void`

注册作用域服务。在同一个作用域内是单例，不同作用域之间是独立的。

**参数**：

- `name: string` - 服务名称
- `factory: () => T` - 工厂函数，用于创建服务实例
- `aliases?: string[]` - 服务别名（可选）

**示例**：

```typescript
container.registerScoped("requestContext", () => new RequestContext());
```

##### `registerFactory<T, TArgs>(name: string, factory: (...args: TArgs) => T, aliases?: string[]): void`

注册工厂服务。允许使用工厂函数动态创建服务，可以传入参数。

**参数**：

- `name: string` - 服务名称
- `factory: (...args: TArgs) => T` - 工厂函数（可以接受参数）
- `aliases?: string[]` - 服务别名（可选）

**示例**：

```typescript
container.registerFactory("httpClient", (baseURL: string) => {
  return new HttpClient({ baseURL });
});
```

##### `get<T>(name: string, ...args: unknown[]): T`

获取服务实例。

**参数**：

- `name: string` - 服务名称
- `...args: unknown[]` - 工厂函数的参数（仅用于 factory 类型）

**返回**：服务实例

**示例**：

```typescript
const userService = container.get("userService");
const client = container.get("httpClient", "https://api.example.com");
```

##### `has(name: string): boolean`

检查服务是否存在。

**参数**：

- `name: string` - 服务名称

**返回**：是否存在

**示例**：

```typescript
if (container.has("userService")) {
  // 服务已注册
}
```

##### `remove(name: string): boolean`

移除服务。支持通过主名称或别名移除。

**参数**：

- `name: string` - 服务名称或别名

**返回**：是否成功移除

**示例**：

```typescript
const success = container.remove("userService");
console.log(success); // true

// 也可以通过别名移除
container.remove("userServiceAlias");
```

##### `tryGet<T>(name: string, ...args: unknown[]): T | undefined`

安全获取服务（不抛出错误）。如果服务不存在或创建失败，返回 undefined。

**参数**：

- `name: string` - 服务名称
- `...args: unknown[]` - 工厂函数的参数（仅用于 factory 类型）

**返回**：服务实例或 undefined

**示例**：

```typescript
const service = container.tryGet("userService");
if (service) {
  // 服务存在
}

// 对比 get()，tryGet 不会抛出错误
const result = container.tryGet("nonexistent"); // undefined
```

##### `getOrDefault<T>(name: string, defaultValue: T, ...args: unknown[]): T`

获取服务，如果不存在则返回默认值。

**参数**：

- `name: string` - 服务名称
- `defaultValue: T` - 默认值
- `...args: unknown[]` - 工厂函数的参数（仅用于 factory 类型）

**返回**：服务实例或默认值

**示例**：

```typescript
const logger = container.getOrDefault("logger", new ConsoleLogger());
```

##### `getServiceInfo(name: string): ServiceInfo | undefined`

获取服务元数据信息。

**参数**：

- `name: string` - 服务名称

**返回**：服务信息，如果服务不存在返回 undefined

**示例**：

```typescript
const info = container.getServiceInfo("userService");
if (info) {
  console.log(info.name); // "userService"
  console.log(info.lifetime); // "singleton"
  console.log(info.aliases); // ["userSvc"]
  console.log(info.hasInstance); // true（如果已创建实例）
}
```

##### `getAllServiceInfo(): ServiceInfo[]`

获取所有服务的元数据信息。

**返回**：服务信息数组

**示例**：

```typescript
const allInfo = container.getAllServiceInfo();
allInfo.forEach((info) => {
  console.log(`${info.name} (${info.lifetime})`);
});
```

##### `getServicesByLifetime(lifetime: ServiceLifetime): string[]`

获取指定生命周期类型的所有服务名称。

**参数**：

- `lifetime: ServiceLifetime` - 服务生命周期类型

**返回**：服务名称数组

**示例**：

```typescript
const singletons = container.getServicesByLifetime("singleton");
console.log(singletons); // ["database", "config", ...]
```

##### `createScope(): IServiceScope`

创建作用域。用于管理作用域服务的生命周期。

**返回**：作用域实例

**示例**：

```typescript
const scope = container.createScope();
const ctx = scope.get("requestContext");
scope.dispose(); // 清理作用域内的服务
```

##### `clear(): void`

清空所有服务。

**示例**：

```typescript
container.clear();
```

##### `getRegisteredServices(): string[]`

获取所有已注册的服务名称。

**返回**：服务名称数组

**示例**：

```typescript
const services = container.getRegisteredServices();
console.log(services); // ["userService", "logger", ...]
```

##### `replace<T>(name: string, lifetime: ServiceLifetime, factory: (...args: unknown[]) => T, aliases?: string[]): void`

替换服务（先移除再注册）。

**参数**：

- `name: string` - 服务名称
- `lifetime: ServiceLifetime` - 服务生命周期
- `factory: (...args: unknown[]) => T` - 工厂函数
- `aliases?: string[]` - 服务别名

**示例**：

```typescript
container.replace("userService", "singleton", () => new NewUserService());
```

### IServiceScope 接口

作用域接口，用于管理作用域服务的生命周期。

#### 方法

##### `get<T>(name: string, ...args: unknown[]): T`

在作用域内获取服务。

**参数**：

- `name: string` - 服务名称
- `...args: unknown[]` - 工厂函数的参数

**返回**：服务实例

##### `has(name: string): boolean`

检查服务是否存在。

**参数**：

- `name: string` - 服务名称

**返回**：是否存在

##### `dispose(): void`

销毁作用域（清理作用域内的服务）。

### 类型定义

#### `ServiceLifetime`

服务生命周期类型。

```typescript
type ServiceLifetime = "singleton" | "transient" | "scoped" | "factory";
```

#### `ServiceInfo`

服务信息接口（元数据）。

```typescript
interface ServiceInfo {
  /** 服务名称 */
  name: string;
  /** 服务生命周期 */
  lifetime: ServiceLifetime;
  /** 服务别名 */
  aliases: string[];
  /** 是否已创建实例（仅 singleton 有效） */
  hasInstance: boolean;
}
```

#### `IServiceScope`

作用域接口。

```typescript
interface IServiceScope {
  get<T = unknown>(name: string, ...args: unknown[]): T;
  has(name: string): boolean;
  dispose(): void;
}
```

### 辅助函数

#### `createServiceContainer(): ServiceContainer`

创建服务容器实例。

**返回**：服务容器实例

**示例**：

```typescript
const container = createServiceContainer();
```

## 📊 测试报告

| 项目     | 数值       |
| -------- | ---------- |
| 总测试数 | 56         |
| 通过     | 56         |
| 失败     | 0          |
| 通过率   | 100%       |
| 测试时间 | 2026-01-30 |

详细测试报告请查看 [TEST_REPORT.md](./TEST_REPORT.md)

---

## 📝 备注

- **服务端专用**：服务容器/依赖注入是服务端架构模式，客户端不需要
- **统一接口**：提供统一的依赖注入 API 接口，降低学习成本
- **类型安全**：完整的 TypeScript 类型支持
- **无外部依赖**：纯 TypeScript 实现
- **基础架构工具**：其他包可能会依赖它来实现依赖注入和服务管理

---

## 📋 变更日志

**v1.0.2** (2026-02-19) — 变更：i18n 在模块加载时自动初始化，入口不再调用
init。完整历史详见 [CHANGELOG.md](./CHANGELOG.md)。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

Apache License 2.0 - 详见 [LICENSE](./LICENSE)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
