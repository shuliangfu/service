/**
 * @fileoverview ServiceContainer 测试
 */

import { describe, expect, it } from "@dreamer/test";
import { createServiceContainer, ServiceContainer } from "../src/mod.ts";

describe("ServiceContainer", () => {
  describe("registerSingleton", () => {
    it("应该注册单例服务", () => {
      const container = new ServiceContainer();
      let callCount = 0;

      container.registerSingleton("test", () => {
        callCount++;
        return { id: callCount };
      });

      const instance1 = container.get("test");
      const instance2 = container.get("test");

      expect(instance1).toEqual(instance2);
      expect(callCount).toBe(1); // 只创建一次
    });

    it("应该支持服务别名", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 123 }), [
        "alias1",
        "alias2",
      ]);

      expect(container.get("test")).toEqual({ value: 123 });
      expect(container.get("alias1")).toEqual({ value: 123 });
      expect(container.get("alias2")).toEqual({ value: 123 });
    });
  });

  describe("registerTransient", () => {
    it("应该注册多例服务", () => {
      const container = new ServiceContainer();
      let callCount = 0;

      container.registerTransient("test", () => {
        callCount++;
        return { id: callCount };
      });

      const instance1 = container.get("test");
      const instance2 = container.get("test");

      // 验证是不同的实例
      expect(instance1 === instance2).toBeFalsy();
      expect(callCount).toBe(2); // 每次创建新实例
    });
  });

  describe("registerScoped", () => {
    it("应该在作用域内是单例", () => {
      const container = new ServiceContainer();
      let callCount = 0;

      container.registerScoped("test", () => {
        callCount++;
        return { id: callCount };
      });

      const scope = container.createScope();
      const instance1 = scope.get("test");
      const instance2 = scope.get("test");

      expect(instance1).toEqual(instance2);
      expect(callCount).toBe(1);
    });

    it("应该在不同作用域间独立", () => {
      const container = new ServiceContainer();
      let callCount = 0;

      container.registerScoped("test", () => {
        callCount++;
        return { id: callCount };
      });

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const instance1 = scope1.get("test");
      const instance2 = scope2.get("test");

      // 验证是不同的实例
      expect(instance1 === instance2).toBeFalsy();
      expect(callCount).toBe(2);
    });
  });

  describe("registerFactory", () => {
    it("应该注册工厂服务", () => {
      const container = new ServiceContainer();
      container.registerFactory("test", (id: number, name: string) => ({
        id,
        name,
      }));

      const instance = container.get<{ id: number; name: string }>(
        "test",
        1,
        "Alice",
      );
      expect(instance.id).toBe(1);
      expect(instance.name).toBe("Alice");
    });
  });

  describe("get", () => {
    it("应该获取已注册的服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 123 }));

      const instance = container.get("test");
      expect(instance).toEqual({ value: 123 });
    });

    it("应该在服务未注册时抛出错误", () => {
      const container = new ServiceContainer();

      let error: Error | null = null;
      try {
        container.get("nonexistent");
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeTruthy();
      expect(error?.message).toContain("未注册");
    });
  });

  describe("has", () => {
    it("应该检查服务是否存在", () => {
      const container = new ServiceContainer();
      expect(container.has("test")).toBeFalsy();

      container.registerSingleton("test", () => ({ value: 123 }));
      expect(container.has("test")).toBeTruthy();
    });
  });

  describe("remove", () => {
    it("应该移除服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 123 }));

      expect(container.has("test")).toBeTruthy();
      container.remove("test");
      expect(container.has("test")).toBeFalsy();
    });
  });

  describe("createScope", () => {
    it("应该创建作用域", () => {
      const container = new ServiceContainer();
      const scope = container.createScope();

      expect(scope).toBeTruthy();
      expect(typeof scope.get).toBe("function");
      expect(typeof scope.has).toBe("function");
      expect(typeof scope.dispose).toBe("function");
    });

    it("应该支持嵌套作用域", () => {
      const container = new ServiceContainer();
      container.registerScoped("test", () => ({ value: 123 }));

      const scope1 = container.createScope();
      const scope2 = container.createScope();

      const instance1 = scope1.get("test");
      const instance2 = scope2.get("test");

      // 不同作用域应该有不同的实例（使用 toEqual 比较值）
      expect(instance1).toEqual({ value: 123 });
      expect(instance2).toEqual({ value: 123 });
      // 但它们是不同的对象实例
      expect(instance1 === instance2).toBeFalsy();
    });
  });

  describe("clear", () => {
    it("应该清空所有服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test1", () => ({ value: 1 }));
      container.registerSingleton("test2", () => ({ value: 2 }));

      expect(container.has("test1")).toBeTruthy();
      expect(container.has("test2")).toBeTruthy();

      container.clear();

      expect(container.has("test1")).toBeFalsy();
      expect(container.has("test2")).toBeFalsy();
    });
  });

  describe("getRegisteredServices", () => {
    it("应该返回所有已注册的服务名称", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test1", () => ({ value: 1 }));
      container.registerSingleton("test2", () => ({ value: 2 }), ["alias1"]);

      const services = container.getRegisteredServices();
      expect(services.length).toBeGreaterThanOrEqual(3);
      expect(services).toContain("test1");
      expect(services).toContain("test2");
      expect(services).toContain("alias1");
    });

    it("应该包含别名", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }), [
        "alias1",
        "alias2",
      ]);

      const services = container.getRegisteredServices();
      expect(services).toContain("test");
      expect(services).toContain("alias1");
      expect(services).toContain("alias2");
    });

    it("应该在没有服务时返回空数组", () => {
      const container = new ServiceContainer();
      const services = container.getRegisteredServices();
      expect(services).toEqual([]);
    });
  });

  describe("replace", () => {
    it("应该替换已存在的服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }));

      const instance1 = container.get("test");
      expect(instance1).toEqual({ value: 1 });

      container.replace("test", "singleton", () => ({ value: 2 }));

      const instance2 = container.get("test");
      expect(instance2).toEqual({ value: 2 });
    });

    it("应该替换不同生命周期的服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }));

      container.replace("test", "transient", () => ({ value: 2 }));

      const instance1 = container.get("test");
      const instance2 = container.get("test");

      // transient 应该创建不同的实例
      expect(instance1).toEqual({ value: 2 });
      expect(instance2).toEqual({ value: 2 });
      expect(instance1 === instance2).toBeFalsy();
    });

    it("应该替换带别名的服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }), ["alias1"]);

      container.replace("test", "singleton", () => ({ value: 2 }), ["alias2"]);

      expect(container.get("test")).toEqual({ value: 2 });
      expect(container.get("alias2")).toEqual({ value: 2 });
      // 旧别名应该被移除
      expect(container.has("alias1")).toBeFalsy();
    });
  });

  describe("错误处理", () => {
    it("应该防止重复注册服务", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }));

      let error: Error | null = null;
      try {
        container.registerSingleton("test", () => ({ value: 2 }));
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeTruthy();
      expect(error?.message).toContain("已注册");
    });

    it("应该防止别名冲突", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test1", () => ({ value: 1 }), ["alias"]);

      let error: Error | null = null;
      try {
        container.registerSingleton("test2", () => ({ value: 2 }), ["alias"]);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeTruthy();
      expect(error?.message).toContain("已被使用");
    });

    it("应该在作用域外使用作用域服务时抛出错误", () => {
      const container = new ServiceContainer();
      container.registerScoped("test", () => ({ value: 1 }));

      let error: Error | null = null;
      try {
        container.get("test");
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeTruthy();
      expect(error?.message).toContain("必须在作用域内使用");
    });
  });

  describe("IServiceScope", () => {
    it("应该支持 dispose 方法清理作用域", () => {
      const container = new ServiceContainer();
      let callCount = 0;

      container.registerScoped("test", () => {
        callCount++;
        return { id: callCount };
      });

      const scope = container.createScope();
      const instance1 = scope.get("test");
      expect(instance1).toEqual({ id: 1 });

      // 销毁作用域
      scope.dispose();

      // 创建新作用域，应该重新创建实例
      const scope2 = container.createScope();
      const instance2 = scope2.get("test");
      expect(instance2).toEqual({ id: 2 });
    });

    it("应该支持作用域的 has 方法", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }));

      const scope = container.createScope();
      expect(scope.has("test")).toBeTruthy();
      expect(scope.has("nonexistent")).toBeFalsy();
    });
  });

  describe("remove", () => {
    it("应该清理单例实例", () => {
      const container = new ServiceContainer();
      let callCount = 0;

      container.registerSingleton("test", () => {
        callCount++;
        return { id: callCount };
      });

      const instance1 = container.get("test");
      expect(callCount).toBe(1);

      container.remove("test");
      container.registerSingleton("test", () => {
        callCount++;
        return { id: callCount };
      });

      const instance2 = container.get("test");
      expect(callCount).toBe(2); // 应该重新创建
      expect(instance1).not.toEqual(instance2);
    });

    it("应该清理别名", () => {
      const container = new ServiceContainer();
      container.registerSingleton("test", () => ({ value: 1 }), [
        "alias1",
        "alias2",
      ]);

      expect(container.has("test")).toBeTruthy();
      expect(container.has("alias1")).toBeTruthy();
      expect(container.has("alias2")).toBeTruthy();

      container.remove("test");

      expect(container.has("test")).toBeFalsy();
      expect(container.has("alias1")).toBeFalsy();
      expect(container.has("alias2")).toBeFalsy();
    });

    it("应该清理作用域中的实例", () => {
      const container = new ServiceContainer();
      container.registerScoped("test", () => ({ value: 1 }));

      const scope = container.createScope();
      const instance = scope.get("test");
      expect(instance).toEqual({ value: 1 });

      container.remove("test");

      // 作用域中的实例应该被清理
      let error: Error | null = null;
      try {
        scope.get("test");
      } catch (e) {
        error = e as Error;
      }
      expect(error).toBeTruthy();
      expect(error?.message).toContain("未注册");
    });
  });
});

describe("createServiceContainer", () => {
  it("应该创建服务容器实例", () => {
    const container = createServiceContainer();

    expect(container).toBeTruthy();
    expect(container.has).toBeDefined();
    expect(container.get).toBeDefined();
  });
});

// ============ 新功能测试 ============

describe("单例 undefined/null 支持", () => {
  it("应该支持工厂函数返回 undefined", () => {
    const container = new ServiceContainer();
    let callCount = 0;

    container.registerSingleton("test", () => {
      callCount++;
      return undefined;
    });

    const instance1 = container.get("test");
    const instance2 = container.get("test");

    expect(instance1).toBeUndefined();
    expect(instance2).toBeUndefined();
    expect(callCount).toBe(1); // 只调用一次，不会因为返回 undefined 而重复创建
  });

  it("应该支持工厂函数返回 null", () => {
    const container = new ServiceContainer();
    let callCount = 0;

    container.registerSingleton("test", () => {
      callCount++;
      return null;
    });

    const instance1 = container.get("test");
    const instance2 = container.get("test");

    expect(instance1).toBeNull();
    expect(instance2).toBeNull();
    expect(callCount).toBe(1); // 只调用一次
  });

  it("应该支持工厂函数返回 0 或空字符串", () => {
    const container = new ServiceContainer();

    container.registerSingleton("zero", () => 0);
    container.registerSingleton("empty", () => "");

    expect(container.get("zero")).toBe(0);
    expect(container.get("empty")).toBe("");
  });
});

describe("tryGet", () => {
  it("应该在服务存在时返回服务实例", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({ value: 123 }));

    const result = container.tryGet("test");
    expect(result).toEqual({ value: 123 });
  });

  it("应该在服务不存在时返回 undefined", () => {
    const container = new ServiceContainer();

    const result = container.tryGet("nonexistent");
    expect(result).toBeUndefined();
  });

  it("应该在工厂函数抛出错误时返回 undefined", () => {
    const container = new ServiceContainer();
    container.registerSingleton("error", () => {
      throw new Error("创建失败");
    });

    const result = container.tryGet("error");
    expect(result).toBeUndefined();
  });

  it("应该支持工厂服务的参数传递", () => {
    const container = new ServiceContainer();
    container.registerFactory("factory", (id: number) => ({ id }));

    const result = container.tryGet<{ id: number }>("factory", 42);
    expect(result).toEqual({ id: 42 });
  });
});

describe("getOrDefault", () => {
  it("应该在服务存在时返回服务实例", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({ value: 123 }));

    const result = container.getOrDefault("test", { value: 0 });
    expect(result).toEqual({ value: 123 });
  });

  it("应该在服务不存在时返回默认值", () => {
    const container = new ServiceContainer();

    const result = container.getOrDefault("nonexistent", { value: 999 });
    expect(result).toEqual({ value: 999 });
  });

  it("应该在工厂函数抛出错误时返回默认值", () => {
    const container = new ServiceContainer();
    container.registerSingleton("error", () => {
      throw new Error("创建失败");
    });

    const result = container.getOrDefault("error", "default");
    expect(result).toBe("default");
  });
});

describe("getServiceInfo", () => {
  it("应该返回单例服务的元数据", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({ value: 1 }), ["alias1"]);

    const info = container.getServiceInfo("test");
    expect(info).toBeTruthy();
    expect(info!.name).toBe("test");
    expect(info!.lifetime).toBe("singleton");
    expect(info!.aliases).toContain("alias1");
    expect(info!.hasInstance).toBe(false); // 还未获取过
  });

  it("应该在获取服务后更新 hasInstance", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({ value: 1 }));

    // 获取服务前
    let info = container.getServiceInfo("test");
    expect(info!.hasInstance).toBe(false);

    // 获取服务后
    container.get("test");
    info = container.getServiceInfo("test");
    expect(info!.hasInstance).toBe(true);
  });

  it("应该通过别名获取服务信息", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({ value: 1 }), ["alias1"]);

    const info = container.getServiceInfo("alias1");
    expect(info).toBeTruthy();
    expect(info!.name).toBe("test"); // 应该返回主名称
  });

  it("应该在服务不存在时返回 undefined", () => {
    const container = new ServiceContainer();

    const info = container.getServiceInfo("nonexistent");
    expect(info).toBeUndefined();
  });

  it("应该返回不同生命周期的正确信息", () => {
    const container = new ServiceContainer();
    container.registerTransient("transient", () => ({}));
    container.registerScoped("scoped", () => ({}));
    container.registerFactory("factory", () => ({}));

    expect(container.getServiceInfo("transient")!.lifetime).toBe("transient");
    expect(container.getServiceInfo("scoped")!.lifetime).toBe("scoped");
    expect(container.getServiceInfo("factory")!.lifetime).toBe("factory");
  });
});

describe("getAllServiceInfo", () => {
  it("应该返回所有服务的元数据", () => {
    const container = new ServiceContainer();
    container.registerSingleton("service1", () => ({}));
    container.registerTransient("service2", () => ({}));

    const allInfo = container.getAllServiceInfo();
    expect(allInfo.length).toBe(2);
    expect(allInfo.map((i) => i.name)).toContain("service1");
    expect(allInfo.map((i) => i.name)).toContain("service2");
  });

  it("应该去重（别名和主名指向同一服务）", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({}), ["alias1", "alias2"]);

    const allInfo = container.getAllServiceInfo();
    expect(allInfo.length).toBe(1); // 只有一个服务
    expect(allInfo[0].name).toBe("test");
    expect(allInfo[0].aliases).toContain("alias1");
    expect(allInfo[0].aliases).toContain("alias2");
  });

  it("应该在没有服务时返回空数组", () => {
    const container = new ServiceContainer();

    const allInfo = container.getAllServiceInfo();
    expect(allInfo).toEqual([]);
  });
});

describe("getServicesByLifetime", () => {
  it("应该返回指定生命周期的所有服务", () => {
    const container = new ServiceContainer();
    container.registerSingleton("singleton1", () => ({}));
    container.registerSingleton("singleton2", () => ({}));
    container.registerTransient("transient1", () => ({}));
    container.registerScoped("scoped1", () => ({}));

    const singletons = container.getServicesByLifetime("singleton");
    expect(singletons.length).toBe(2);
    expect(singletons).toContain("singleton1");
    expect(singletons).toContain("singleton2");

    const transients = container.getServicesByLifetime("transient");
    expect(transients.length).toBe(1);
    expect(transients).toContain("transient1");

    const scoped = container.getServicesByLifetime("scoped");
    expect(scoped.length).toBe(1);
    expect(scoped).toContain("scoped1");
  });

  it("应该在没有匹配服务时返回空数组", () => {
    const container = new ServiceContainer();
    container.registerSingleton("singleton", () => ({}));

    const factories = container.getServicesByLifetime("factory");
    expect(factories).toEqual([]);
  });
});

describe("remove 通过别名", () => {
  it("应该支持通过别名移除服务", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({ value: 1 }), [
      "alias1",
      "alias2",
    ]);

    // 通过别名移除
    const result = container.remove("alias1");

    expect(result).toBe(true);
    expect(container.has("test")).toBeFalsy();
    expect(container.has("alias1")).toBeFalsy();
    expect(container.has("alias2")).toBeFalsy();
  });

  it("应该在移除不存在的服务时返回 false", () => {
    const container = new ServiceContainer();

    const result = container.remove("nonexistent");
    expect(result).toBe(false);
  });

  it("应该返回移除结果", () => {
    const container = new ServiceContainer();
    container.registerSingleton("test", () => ({}));

    expect(container.remove("test")).toBe(true);
    expect(container.remove("test")).toBe(false); // 已移除
  });
});

describe("工厂函数错误处理", () => {
  it("应该包装工厂函数的错误信息", () => {
    const container = new ServiceContainer();
    container.registerSingleton("error", () => {
      throw new Error("原始错误信息");
    });

    let error: Error | null = null;
    try {
      container.get("error");
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeTruthy();
    expect(error!.message).toContain("error"); // 包含服务名
    expect(error!.message).toContain("创建失败");
    expect(error!.message).toContain("原始错误信息");
  });

  it("应该处理非 Error 类型的抛出", () => {
    const container = new ServiceContainer();
    container.registerSingleton("error", () => {
      throw "字符串错误";
    });

    let error: Error | null = null;
    try {
      container.get("error");
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeTruthy();
    expect(error!.message).toContain("字符串错误");
  });

  it("应该在 transient 服务中也包装错误", () => {
    const container = new ServiceContainer();
    container.registerTransient("error", () => {
      throw new Error("transient 错误");
    });

    let error: Error | null = null;
    try {
      container.get("error");
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeTruthy();
    expect(error!.message).toContain("error");
    expect(error!.message).toContain("transient 错误");
  });

  it("应该在 scoped 服务中也包装错误", () => {
    const container = new ServiceContainer();
    container.registerScoped("error", () => {
      throw new Error("scoped 错误");
    });

    const scope = container.createScope();
    let error: Error | null = null;
    try {
      scope.get("error");
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeTruthy();
    expect(error!.message).toContain("error");
    expect(error!.message).toContain("scoped 错误");
  });

  it("应该在 factory 服务中也包装错误", () => {
    const container = new ServiceContainer();
    container.registerFactory("error", () => {
      throw new Error("factory 错误");
    });

    let error: Error | null = null;
    try {
      container.get("error");
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeTruthy();
    expect(error!.message).toContain("error");
    expect(error!.message).toContain("factory 错误");
  });
});
