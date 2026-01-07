/**
 * @fileoverview ServiceContainer 测试
 */

import { describe, expect, it } from "jsr:@dreamer/test@^1.0.0-alpha.1";
import { ServiceContainer, type IServiceScope } from "../src/mod.ts";

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
      container.registerSingleton("test", () => ({ value: 123 }), ["alias1", "alias2"]);

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

      const instance = container.get<{ id: number; name: string }>("test", 1, "Alice");
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
});
