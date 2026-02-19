# 变更日志

[English](../en-US/CHANGELOG.md) | 中文 (Chinese)

本文档记录 @dreamer/service 的所有重要变更。格式基于
[Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本遵循
[Semantic Versioning](https://semver.org/lang/zh-CN/)。

---

## [1.0.2] - 2026-02-19

### 变更

- **i18n**：初始化改为在加载 i18n 模块时自动执行。入口文件（`mod.ts`）不再
  导入或调用 `initServiceI18n`；请从你的代码中移除相关用法。

---

## [1.0.1] - 2026-02-19

### 变更

- **i18n**：翻译方法由 `$t` 重命名为 `$tr`，避免与全局 `$t`
  冲突。请将现有代码中本包消息改为使用 `$tr`。
- **文档**：文档结构调整为 `docs/en-US/`（CHANGELOG、TEST_REPORT）与
  `docs/zh-CN/`（README、CHANGELOG、TEST_REPORT 全文中文）。根目录
  CHANGELOG、TEST_REPORT 已移除，根目录 README 精简并链接至 docs。
- **许可证**：在 `deno.json` 及文档中明确为 Apache-2.0。

---

## [1.0.0] - 2026-02-06

### 新增

首个稳定版。兼容 Deno 与 Bun 的服务容器（依赖注入）库。纯
TypeScript，无外部依赖。

#### 服务生命周期

- **单例（Singleton）**：整个应用生命周期内单一实例
- **多例（Transient）**：每次 get 创建新实例
- **作用域（Scoped）**：同一作用域内单例，不同作用域相互独立
- **工厂（Factory）**：通过带参数的工厂函数动态创建

#### ServiceContainer

- **注册**：`registerSingleton`、`registerTransient`、`registerScoped`、`registerFactory`
- **获取**：`get`、`tryGet`（安全不抛错）、`getOrDefault`（带默认值）
- **管理**：`has`、`remove`（按名称或别名）、`clear`、`replace`
- **发现**：`getRegisteredServices`、`getServiceInfo`、`getAllServiceInfo`、`getServicesByLifetime`
- **作用域**：`createScope()` 创建作用域，支持嵌套
- **别名**：服务别名，便于灵活查找

#### 错误处理

- 工厂错误包装服务名便于调试
- 支持工厂返回 undefined、null、0 或空字符串
- NOT_CREATED Symbol 表示单例未创建状态

#### IServiceScope

- `get`、`has`、`dispose` 管理作用域生命周期
- dispose 时清理作用域内实例

#### 工具

- `createServiceContainer()` 工厂函数

#### 类型导出

- `ServiceLifetime`、`ServiceInfo`、`IServiceScope`
