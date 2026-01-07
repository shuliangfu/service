# @dreamer/service

一个用于 Deno 的单例服务管理工具（服务容器），提供依赖注入和服务管理功能。

## 功能

服务容器（依赖注入）工具库，用于管理应用中的服务和依赖关系。

## 特性

- **服务注册和获取**（单例、多例、工厂模式）
- 手动服务注册（无需装饰器）
- 服务生命周期管理（singleton、transient、scoped）
- 服务别名支持
- 延迟加载
- 服务替换和覆盖
- 服务发现和扫描
- 类型安全的服务获取
- 服务依赖手动注入

## 使用场景

- 大型应用的依赖管理
- 模块化架构
- 服务解耦
- 测试时的 Mock 替换

## 优先级

⭐⭐⭐⭐⭐

## 备注

这是基础架构工具，其他库可能会依赖它来实现依赖注入和服务管理。**保持单一职责，只负责服务容器功能，插件管理由 @dreamer/plugin 负责**

## 安装

```bash
deno add jsr:@dreamer/service
```

## 环境兼容性

- **Deno 版本**：要求 Deno 2.5 或更高版本
- **服务端**：✅ 支持（Deno 运行时，服务容器/依赖注入是服务端概念）
- **客户端**：❌ 不支持（浏览器环境，服务容器/依赖注入是服务端架构模式，客户端不需要）
- **依赖**：无外部依赖（纯 TypeScript 实现）

## 示例用法

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
  switch (config.type) {
    case "postgresql":
      return new PostgreSQLAdapter(config);
    case "mysql":
      return new MySQLAdapter(config);
    case "mongodb":
      return new MongoDBAdapter(config);
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
});

// 使用工厂创建不同实例
const pgDb = container.get("database", { type: "postgresql", host: "localhost" });
const mysqlDb = container.get("database", { type: "mysql", host: "localhost" });
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

### 完整示例

```typescript
import { ServiceContainer } from "jsr:@dreamer/service";

const container = new ServiceContainer();

// 1. 注册单例服务（数据库连接、配置等）
container.registerSingleton("database", () => {
  return new Database({
    host: "localhost",
    port: 5432,
    // ...
  });
});

// 2. 注册多例服务（HTTP 客户端、工具类等）
container.registerTransient("httpClient", () => {
  return new HttpClient({
    timeout: 5000,
  });
});

// 3. 注册工厂服务（根据参数动态创建）
container.registerFactory("cache", (type: "memory" | "redis") => {
  if (type === "memory") {
    return new MemoryCache();
  } else {
    return new RedisCache();
  }
});

// 4. 注册带依赖的服务
container.registerSingleton("userService", () => {
  const db = container.get("database");
  const logger = container.get("logger");
  return new UserService(db, logger);
});

// 使用服务
const db = container.get("database"); // 单例
const client1 = container.get("httpClient"); // 多例，新实例
const client2 = container.get("httpClient"); // 多例，新实例
const memoryCache = container.get("cache", "memory"); // 工厂，创建内存缓存
const redisCache = container.get("cache", "redis"); // 工厂，创建 Redis 缓存
const userService = container.get("userService"); // 单例，自动注入依赖
```
