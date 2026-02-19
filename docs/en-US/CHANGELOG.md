# Changelog

[English](./CHANGELOG.md) | [中文 (Chinese)](../zh-CN/CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.1] - 2026-02-19

### Changed

- **i18n**: Renamed translation method from `$t` to `$tr` to avoid conflict with
  global `$t`. Update existing code to use `$tr` for package messages.
- **Docs**: Reorganized documentation into `docs/en-US/` (CHANGELOG,
  TEST_REPORT) and `docs/zh-CN/` (README, CHANGELOG, TEST_REPORT with full
  Chinese translations). Removed root CHANGELOG and TEST_REPORT. Root README
  shortened with links to docs.
- **License**: Explicitly Apache-2.0 in `deno.json` and documentation.

---

## [1.0.0] - 2026-02-06

### Added

First stable release. Service container (dependency injection) library
compatible with Deno and Bun. Pure TypeScript, no external dependencies.

#### Service Lifetimes

- **Singleton**: One instance for the entire application lifecycle
- **Transient**: New instance on each get
- **Scoped**: Singleton within scope, independent across scopes
- **Factory**: Dynamic creation via factory function with parameters

#### ServiceContainer

- **Registration**: `registerSingleton`, `registerTransient`, `registerScoped`,
  `registerFactory`
- **Retrieval**: `get`, `tryGet` (safe, no throw), `getOrDefault` (with default)
- **Management**: `has`, `remove` (by name or alias), `clear`, `replace`
- **Discovery**: `getRegisteredServices`, `getServiceInfo`, `getAllServiceInfo`,
  `getServicesByLifetime`
- **Scopes**: `createScope()` for scoped services, nested scopes supported
- **Aliases**: Service aliases for flexible lookup

#### Error Handling

- Factory error wrapping with service name for debugging
- Support for factory returning undefined, null, 0, or empty string
- NOT_CREATED Symbol for uncreated singleton state

#### IServiceScope

- `get`, `has`, `dispose` for scope lifecycle
- Scoped instances cleaned on dispose

#### Helper

- `createServiceContainer()` factory function

#### Type Exports

- `ServiceLifetime`, `ServiceInfo`, `IServiceScope`
