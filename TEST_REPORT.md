# @dreamer/service Test Report

## 📋 Test Overview

| Item | Value |
|------|-------|
| Test Library Version | 1.0.0-beta.4 |
| Test Framework | @dreamer/test |
| Test Date | 2026-01-30 |
| Test Environment | Deno 2.x |

## ✅ Test Results

### Overall Statistics

| Metric | Value |
|--------|-------|
| Total Tests | 56 |
| Passed | 56 |
| Failed | 0 |
| Pass Rate | 100% |
| Execution Time | ~400ms |

### Test File Statistics

| Test File | Tests | Status |
|-----------|-------|--------|
| mod.test.ts | 56 | ✅ All passed |

## 🧪 Functional Test Details

### 1. ServiceContainer Basic - 28 tests

#### registerSingleton (2 tests)

| Scenario | Status |
|----------|--------|
| ✅ Register singleton service | Passed |
| ✅ Support service alias | Passed |

#### registerTransient (1 test)

| Scenario | Status |
|----------|--------|
| ✅ Register transient service | Passed |

#### registerScoped (2 tests)

| Scenario | Status |
|----------|--------|
| ✅ Singleton within scope | Passed |
| ✅ Independent across scopes | Passed |

#### registerFactory (1 test)

| Scenario | Status |
|----------|--------|
| ✅ Register factory service | Passed |

#### get (2 tests)

| Scenario | Status |
|----------|--------|
| ✅ Get registered service | Passed |
| ✅ Throw when service not registered | Passed |

#### has (1 test)

| Scenario | Status |
|----------|--------|
| ✅ Check if service exists | Passed |

#### remove (4 tests)

| Scenario | Status |
|----------|--------|
| ✅ Remove service | Passed |
| ✅ Clear singleton instance | Passed |
| ✅ Clear alias | Passed |
| ✅ Clear scoped instance | Passed |

#### createScope (2 tests)

| Scenario | Status |
|----------|--------|
| ✅ Create scope | Passed |
| ✅ Support nested scopes | Passed |

#### clear (1 test)

| Scenario | Status |
|----------|--------|
| ✅ Clear all services | Passed |

#### getRegisteredServices (3 tests)

| Scenario | Status |
|----------|--------|
| ✅ Return all registered service names | Passed |
| ✅ Include aliases | Passed |
| ✅ Return empty array when no services | Passed |

#### replace (3 tests)

| Scenario | Status |
|----------|--------|
| ✅ Replace existing service | Passed |
| ✅ Replace different lifetime services | Passed |
| ✅ Replace aliased service | Passed |

#### Error Handling (3 tests)

| Scenario | Status |
|----------|--------|
| ✅ Prevent duplicate registration | Passed |
| ✅ Prevent alias conflict | Passed |
| ✅ Throw when using scoped service outside scope | Passed |

#### IServiceScope (2 tests)

| Scenario | Status |
|----------|--------|
| ✅ Support dispose for scope cleanup | Passed |
| ✅ Support scope has method | Passed |

### 2. createServiceContainer Factory - 1 test

| Scenario | Status |
|----------|--------|
| ✅ Create service container instance | Passed |

### 3. Singleton undefined/null Support - 3 tests

| Scenario | Status |
|----------|--------|
| ✅ Support factory returning undefined | Passed |
| ✅ Support factory returning null | Passed |
| ✅ Support factory returning 0 or empty string | Passed |

### 4. tryGet Method - 4 tests

| Scenario | Status |
|----------|--------|
| ✅ Return service when exists | Passed |
| ✅ Return undefined when not exists | Passed |
| ✅ Return undefined when factory throws | Passed |
| ✅ Support factory service parameters | Passed |

### 5. getOrDefault Method - 3 tests

| Scenario | Status |
|----------|--------|
| ✅ Return service when exists | Passed |
| ✅ Return default when not exists | Passed |
| ✅ Return default when factory throws | Passed |

### 6. getServiceInfo Method - 5 tests

| Scenario | Status |
|----------|--------|
| ✅ Return singleton service metadata | Passed |
| ✅ Update hasInstance after get | Passed |
| ✅ Get service info via alias | Passed |
| ✅ Return undefined when not exists | Passed |
| ✅ Return correct info for different lifetimes | Passed |

### 7. getAllServiceInfo Method - 3 tests

| Scenario | Status |
|----------|--------|
| ✅ Return all service metadata | Passed |
| ✅ Deduplicate (alias and main name) | Passed |
| ✅ Return empty array when no services | Passed |

### 8. getServicesByLifetime Method - 2 tests

| Scenario | Status |
|----------|--------|
| ✅ Return services by lifetime | Passed |
| ✅ Return empty array when no match | Passed |

### 9. remove by Alias - 3 tests

| Scenario | Status |
|----------|--------|
| ✅ Remove service via alias | Passed |
| ✅ Return false when removing non-existent | Passed |
| ✅ Return remove result | Passed |

### 10. Factory Error Handling - 5 tests

| Scenario | Status |
|----------|--------|
| ✅ Wrap factory error message | Passed |
| ✅ Handle non-Error throws | Passed |
| ✅ Wrap error in transient service | Passed |
| ✅ Wrap error in scoped service | Passed |
| ✅ Wrap error in factory service | Passed |

## 📊 Coverage Analysis

### API Method Coverage

| Method | Status | Tests |
|--------|--------|-------|
| `registerSingleton` | ✅ Covered | 2 |
| `registerTransient` | ✅ Covered | 1 |
| `registerScoped` | ✅ Covered | 2 |
| `registerFactory` | ✅ Covered | 1 |
| `get` | ✅ Covered | 2 |
| `tryGet` | ✅ Covered | 4 |
| `getOrDefault` | ✅ Covered | 3 |
| `has` | ✅ Covered | 1 |
| `remove` | ✅ Covered | 7 |
| `clear` | ✅ Covered | 1 |
| `replace` | ✅ Covered | 3 |
| `createScope` | ✅ Covered | 2 |
| `getRegisteredServices` | ✅ Covered | 3 |
| `getServiceInfo` | ✅ Covered | 5 |
| `getAllServiceInfo` | ✅ Covered | 3 |
| `getServicesByLifetime` | ✅ Covered | 2 |

### Edge Case Coverage

| Edge Case | Status |
|-----------|--------|
| ✅ Throw when service not registered | Covered |
| ✅ Throw on duplicate registration | Covered |
| ✅ Throw on alias conflict | Covered |
| ✅ Throw when using scoped service outside scope | Covered |
| ✅ Factory returning undefined | Covered |
| ✅ Factory returning null | Covered |
| ✅ Factory returning 0 or empty string | Covered |
| ✅ Return empty array when no services | Covered |
| ✅ Remove non-existent service | Covered |

### Error Handling Coverage

| Error Scenario | Status |
|----------------|--------|
| ✅ Service not registered | Covered |
| ✅ Duplicate registration | Covered |
| ✅ Alias conflict | Covered |
| ✅ Scoped service error | Covered |
| ✅ Factory Error type | Covered |
| ✅ Factory non-Error type | Covered |
| ✅ Factory errors for all lifetimes | Covered |

## 🎯 New Feature Coverage

### v1.0.0-beta.4 Additions

| Feature | Description | Coverage |
|---------|-------------|----------|
| NOT_CREATED Symbol | Symbol for uncreated state, supports factory returning undefined/null | ✅ 3 tests |
| `tryGet()` | Safe service get, no throw | ✅ 4 tests |
| `getOrDefault()` | Get with default value | ✅ 3 tests |
| `getServiceInfo()` | Get service metadata | ✅ 5 tests |
| `getAllServiceInfo()` | Get all service metadata | ✅ 3 tests |
| `getServicesByLifetime()` | Filter services by lifetime | ✅ 2 tests |
| Alias remove improvement | Remove via alias, return boolean | ✅ 3 tests |
| Error wrapping | Wrap factory errors for better debugging | ✅ 5 tests |

## ✨ Strengths

1. **Full lifetime support**: singleton, transient, scoped, factory
2. **Alias system**: Service aliases for dependency injection
3. **Safe retrieval**: tryGet and getOrDefault avoid exceptions
4. **Rich metadata**: getServiceInfo for runtime service info
5. **Error handling**: Factory error wrapping for debugging
6. **Edge cases**: Factory can return undefined/null/0/empty string

## 📝 Conclusion

@dreamer/service has comprehensive test coverage for all public APIs and new features:

- ✅ All 56 tests passed
- ✅ 100% pass rate
- ✅ All lifetime types covered
- ✅ All public methods covered
- ✅ Edge cases and error handling covered
- ✅ All v1.0.0-beta.4 features covered

The library is feature-complete, stable, and suitable for production use.
