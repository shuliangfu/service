# @dreamer/service 测试报告

[English](../en-US/TEST_REPORT.md) | 中文 (Chinese)

## 📋 测试概览

| 项         | 值                                 |
| ---------- | ---------------------------------- |
| 测试库版本 | @dreamer/test@^1.2.3               |
| 测试框架   | @dreamer/test                      |
| 测试日期   | 2026-07-22                         |
| 测试环境   | Deno 2.9+ / Bun 1.3+ / Node.js 22+ |

## ✅ 测试结果

### 总体统计

| 指标     | 值                                         |
| -------- | ------------------------------------------ |
| 测试总数 | 57（Deno）/ 56（Bun）/ 56（Node）          |
| 通过     | 57 / 56 / 56                               |
| 失败     | 0 / 0 / 0                                  |
| 通过率   | 100%                                       |
| 执行时间 | ~5ms（Deno）/ ~33ms（Bun）/ ~418ms（Node） |

### 测试文件统计

| 测试文件    | 用例数 | 状态        |
| ----------- | ------ | ----------- |
| mod.test.ts | 56     | ✅ 全部通过 |

## 🧪 功能测试详情

### 1. ServiceContainer 基础 - 28 用例

#### registerSingleton（2 用例）

| 场景            | 状态 |
| --------------- | ---- |
| ✅ 注册单例服务 | 通过 |
| ✅ 支持服务别名 | 通过 |

#### registerTransient（1 用例）

| 场景            | 状态 |
| --------------- | ---- |
| ✅ 注册多例服务 | 通过 |

#### registerScoped（2 用例）

| 场景            | 状态 |
| --------------- | ---- |
| ✅ 作用域内单例 | 通过 |
| ✅ 跨作用域独立 | 通过 |

#### registerFactory（1 用例）

| 场景            | 状态 |
| --------------- | ---- |
| ✅ 注册工厂服务 | 通过 |

#### get（2 用例）

| 场景                    | 状态 |
| ----------------------- | ---- |
| ✅ 获取已注册服务       | 通过 |
| ✅ 服务未注册时抛出异常 | 通过 |

#### has（1 用例）

| 场景                | 状态 |
| ------------------- | ---- |
| ✅ 检查服务是否存在 | 通过 |

#### remove（4 用例）

| 场景              | 状态 |
| ----------------- | ---- |
| ✅ 移除服务       | 通过 |
| ✅ 清除单例实例   | 通过 |
| ✅ 清除别名       | 通过 |
| ✅ 清除作用域实例 | 通过 |

#### createScope（2 用例）

| 场景              | 状态 |
| ----------------- | ---- |
| ✅ 创建作用域     | 通过 |
| ✅ 支持嵌套作用域 | 通过 |

#### clear（1 用例）

| 场景            | 状态 |
| --------------- | ---- |
| ✅ 清除所有服务 | 通过 |

#### getRegisteredServices（3 用例）

| 场景                                   | 状态 |
| -------------------------------------- | ---- |
| ✅ Return all registered service names | 通过 |
| ✅ Include aliases                     | 通过 |
| ✅ Return empty array when no services | 通过 |

#### replace（3 用例）

| 场景                                   | 状态 |
| -------------------------------------- | ---- |
| ✅ Replace existing service            | 通过 |
| ✅ Replace different lifetime services | 通过 |
| ✅ Replace aliased service             | 通过 |

#### 错误处理（3 用例）

| 场景                                             | 状态 |
| ------------------------------------------------ | ---- |
| ✅ Prevent duplicate registration                | 通过 |
| ✅ Prevent alias conflict                        | 通过 |
| ✅ Throw when using scoped service outside scope | 通过 |

#### IServiceScope（2 用例）

| 场景                                 | 状态 |
| ------------------------------------ | ---- |
| ✅ Support dispose for scope cleanup | 通过 |
| ✅ Support scope has method          | 通过 |

### 2. createServiceContainer 工厂 - 1 用例

| 场景                                 | 状态 |
| ------------------------------------ | ---- |
| ✅ Create service container instance | 通过 |

### 3. 单例 undefined/null 支持 - 3 用例

| 场景                                           | 状态 |
| ---------------------------------------------- | ---- |
| ✅ Support factory returning undefined         | 通过 |
| ✅ Support factory returning null              | 通过 |
| ✅ Support factory returning 0 or empty string | 通过 |

### 4. tryGet 方法 - 4 用例

| 场景                                    | 状态 |
| --------------------------------------- | ---- |
| ✅ Return service when exists           | 通过 |
| ✅ Return undefined when not exists     | 通过 |
| ✅ Return undefined when factory throws | 通过 |
| ✅ Support factory service parameters   | 通过 |

### 5. getOrDefault 方法 - 3 用例

| 场景                                  | 状态 |
| ------------------------------------- | ---- |
| ✅ Return service when exists         | 通过 |
| ✅ Return default when not exists     | 通过 |
| ✅ Return default when factory throws | 通过 |

### 6. getServiceInfo 方法 - 5 用例

| 场景                                           | 状态 |
| ---------------------------------------------- | ---- |
| ✅ Return singleton service metadata           | 通过 |
| ✅ Update hasInstance after get                | 通过 |
| ✅ Get service info via alias                  | 通过 |
| ✅ Return undefined when not exists            | 通过 |
| ✅ Return correct info for different lifetimes | 通过 |

### 7. getAllServiceInfo 方法 - 3 用例

| 场景                                   | 状态 |
| -------------------------------------- | ---- |
| ✅ Return all service metadata         | 通过 |
| ✅ Deduplicate (alias and main name)   | 通过 |
| ✅ Return empty array when no services | 通过 |

### 8. getServicesByLifetime 方法 - 2 用例

| 场景                                | 状态 |
| ----------------------------------- | ---- |
| ✅ Return services by lifetime      | 通过 |
| ✅ Return empty array when no match | 通过 |

### 9. 按别名 remove - 3 用例

| 场景                                       | 状态 |
| ------------------------------------------ | ---- |
| ✅ Remove service via alias                | 通过 |
| ✅ Return false when removing non-existent | 通过 |
| ✅ Return remove result                    | 通过 |

### 10. 工厂错误处理 - 5 用例

| 场景                               | 状态 |
| ---------------------------------- | ---- |
| ✅ Wrap factory error message      | 通过 |
| ✅ Handle non-Error throws         | 通过 |
| ✅ Wrap error in transient service | 通过 |
| ✅ Wrap error in scoped service    | 通过 |
| ✅ Wrap error in factory service   | 通过 |

## 📊 覆盖分析

### API 方法覆盖

| Method                  | Status     | Tests |
| ----------------------- | ---------- | ----- |
| `registerSingleton`     | ✅ Covered | 2     |
| `registerTransient`     | ✅ Covered | 1     |
| `registerScoped`        | ✅ Covered | 2     |
| `registerFactory`       | ✅ Covered | 1     |
| `get`                   | ✅ Covered | 2     |
| `tryGet`                | ✅ Covered | 4     |
| `getOrDefault`          | ✅ Covered | 3     |
| `has`                   | ✅ Covered | 1     |
| `remove`                | ✅ Covered | 7     |
| `clear`                 | ✅ Covered | 1     |
| `replace`               | ✅ Covered | 3     |
| `createScope`           | ✅ Covered | 2     |
| `getRegisteredServices` | ✅ Covered | 3     |
| `getServiceInfo`        | ✅ Covered | 5     |
| `getAllServiceInfo`     | ✅ Covered | 3     |
| `getServicesByLifetime` | ✅ Covered | 2     |

### 边界情况覆盖

| Edge Case                                        | Status  |
| ------------------------------------------------ | ------- |
| ✅ Throw when service not registered             | Covered |
| ✅ Throw on duplicate registration               | Covered |
| ✅ Throw on alias conflict                       | Covered |
| ✅ Throw when using scoped service outside scope | Covered |
| ✅ Factory returning undefined                   | Covered |
| ✅ Factory returning null                        | Covered |
| ✅ Factory returning 0 or empty string           | Covered |
| ✅ Return empty array when no services           | Covered |
| ✅ Remove non-existent service                   | Covered |

### 错误处理覆盖

| Error Scenario                      | Status  |
| ----------------------------------- | ------- |
| ✅ Service not registered           | Covered |
| ✅ Duplicate registration           | Covered |
| ✅ Alias conflict                   | Covered |
| ✅ Scoped service error             | Covered |
| ✅ Factory Error type               | Covered |
| ✅ Factory non-Error type           | Covered |
| ✅ Factory errors for all lifetimes | Covered |

## 🎯 新功能覆盖

### v1.0.0-beta.4 新增

| Feature                   | Description                                                           | Coverage   |
| ------------------------- | --------------------------------------------------------------------- | ---------- |
| NOT_CREATED Symbol        | Symbol for uncreated state, supports factory returning undefined/null | ✅ 3 tests |
| `tryGet()`                | Safe service get, no throw                                            | ✅ 4 tests |
| `getOrDefault()`          | Get with default value                                                | ✅ 3 tests |
| `getServiceInfo()`        | Get service metadata                                                  | ✅ 5 tests |
| `getAllServiceInfo()`     | Get all service metadata                                              | ✅ 3 tests |
| `getServicesByLifetime()` | Filter services by lifetime                                           | ✅ 2 tests |
| Alias remove improvement  | Remove via alias, return boolean                                      | ✅ 3 tests |
| Error wrapping            | Wrap factory errors for better debugging                              | ✅ 5 tests |

## ✨ 优点

1. **Full lifetime support**: singleton, transient, scoped, factory
2. **Alias system**: Service aliases for dependency injection
3. **Safe retrieval**: tryGet and getOrDefault avoid exceptions
4. **Rich metadata**: getServiceInfo for runtime service info
5. **Error handling**: Factory error wrapping for debugging
6. **Edge cases**: Factory can return undefined/null/0/empty string

## 📝 结论

@dreamer/service has comprehensive test coverage for all public APIs and new
features:

- ✅ All 56 tests passed
- ✅ 100% pass rate
- ✅ All lifetime types covered
- ✅ All public methods covered
- ✅ Edge cases and error handling covered
- ✅ All v1.0.0-beta.4 features covered

The library is feature-complete, stable, and suitable for production use.
