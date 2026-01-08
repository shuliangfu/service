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
