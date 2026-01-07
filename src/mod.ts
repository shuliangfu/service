/**
 * @module @dreamer/service
 *
 * @dreamer/service 服务容器（依赖注入）工具库
 *
 * 用于管理应用中的服务和依赖关系，提供完整的依赖注入功能。
 *
 * 特性：
 * - 服务注册和获取（单例、多例、工厂模式）
 * - 手动服务注册（无需装饰器）
 * - 服务生命周期管理（singleton、transient、scoped）
 * - 服务别名支持
 * - 延迟加载
 * - 服务替换和覆盖
 * - 类型安全的服务获取
 * - 服务依赖手动注入
 *
 * 环境兼容性：
 * - 服务端：✅ 支持（Deno 运行时）
 * - 客户端：❌ 不支持（浏览器环境）
 *
 * @example
 * ```typescript
 * import { ServiceContainer } from "jsr:@dreamer/service";
 *
 * const container = new ServiceContainer();
 *
 * // 注册单例服务
 * container.registerSingleton("userService", () => new UserService());
 *
 * // 获取服务
 * const userService = container.get("userService");
 * ```
 */

/**
 * 服务生命周期类型
 */
export type ServiceLifetime = "singleton" | "transient" | "scoped" | "factory";

/**
 * 服务注册信息
 */
interface ServiceRegistration<T = unknown> {
  /** 服务名称 */
  name: string;
  /** 服务生命周期 */
  lifetime: ServiceLifetime;
  /** 工厂函数（用于创建服务实例） */
  factory: (...args: unknown[]) => T;
  /** 服务实例（仅用于 singleton） */
  instance?: T;
  /** 服务别名 */
  aliases?: string[];
}

/**
 * 作用域接口
 */
export interface IServiceScope {
  /** 获取服务 */
  get<T = unknown>(name: string, ...args: unknown[]): T;
  /** 检查服务是否存在 */
  has(name: string): boolean;
  /** 销毁作用域（清理作用域内的服务） */
  dispose(): void;
}

/**
 * 服务容器类
 * 提供依赖注入和服务管理功能
 */
export class ServiceContainer {
  /** 服务注册表 */
  private services: Map<string, ServiceRegistration> = new Map();
  /** 作用域服务实例存储（每个作用域独立） */
  private scopedInstances: Map<IServiceScope, Map<string, unknown>> = new Map();
  /** 当前作用域栈（用于嵌套作用域） */
  private scopeStack: IServiceScope[] = [];

  /**
   * 注册单例服务
   * 在整个应用生命周期中只有一个实例
   *
   * @param name 服务名称
   * @param factory 工厂函数
   * @param aliases 服务别名（可选）
   */
  registerSingleton<T = unknown>(
    name: string,
    factory: () => T,
    aliases?: string[],
  ): void {
    this.register(name, "singleton", factory, aliases);
  }

  /**
   * 注册多例服务
   * 每次获取时都会创建新实例
   *
   * @param name 服务名称
   * @param factory 工厂函数
   * @param aliases 服务别名（可选）
   */
  registerTransient<T = unknown>(
    name: string,
    factory: () => T,
    aliases?: string[],
  ): void {
    this.register(name, "transient", factory, aliases);
  }

  /**
   * 注册作用域服务
   * 在同一个作用域内是单例，不同作用域之间是独立的
   *
   * @param name 服务名称
   * @param factory 工厂函数
   * @param aliases 服务别名（可选）
   */
  registerScoped<T = unknown>(
    name: string,
    factory: () => T,
    aliases?: string[],
  ): void {
    this.register(name, "scoped", factory, aliases);
  }

  /**
   * 注册工厂服务
   * 允许使用工厂函数动态创建服务，可以传入参数
   *
   * @param name 服务名称
   * @param factory 工厂函数（可以接受参数）
   * @param aliases 服务别名（可选）
   */
  registerFactory<T = unknown, TArgs extends unknown[] = unknown[]>(
    name: string,
    factory: (...args: TArgs) => T,
    aliases?: string[],
  ): void {
    this.register(
      name,
      "factory",
      factory as (...args: unknown[]) => T,
      aliases,
    );
  }

  /**
   * 内部注册方法
   *
   * @param name 服务名称
   * @param lifetime 服务生命周期
   * @param factory 工厂函数
   * @param aliases 服务别名
   */
  private register<T = unknown>(
    name: string,
    lifetime: ServiceLifetime,
    factory: (...args: unknown[]) => T,
    aliases?: string[],
  ): void {
    // 检查服务是否已注册
    if (this.services.has(name)) {
      throw new Error(`服务 "${name}" 已注册，如需替换请先使用 remove() 移除`);
    }

    // 创建服务注册信息
    const registration: ServiceRegistration<T> = {
      name,
      lifetime,
      factory: factory as (...args: unknown[]) => T,
      aliases,
    };

    // 注册服务
    this.services.set(name, registration);

    // 注册别名
    if (aliases && aliases.length > 0) {
      for (const alias of aliases) {
        if (this.services.has(alias)) {
          throw new Error(`别名 "${alias}" 已被使用`);
        }
        // 别名指向同一个注册信息
        this.services.set(alias, registration);
      }
    }
  }

  /**
   * 获取服务
   *
   * @param name 服务名称
   * @param args 工厂函数的参数（仅用于 factory 类型）
   * @returns 服务实例
   */
  get<T = unknown>(name: string, ...args: unknown[]): T {
    // 检查服务是否存在
    if (!this.has(name)) {
      throw new Error(`服务 "${name}" 未注册`);
    }

    const registration = this.services.get(name)! as ServiceRegistration<T>;

    // 根据生命周期获取服务实例
    switch (registration.lifetime) {
      case "singleton":
        return this.getSingleton<T>(registration);
      case "transient":
        return this.getTransient<T>(registration);
      case "scoped":
        return this.getScoped<T>(registration);
      case "factory":
        return this.getFactory<T>(registration, ...args);
      default:
        throw new Error(`不支持的服务生命周期: ${registration.lifetime}`);
    }
  }

  /**
   * 获取单例服务
   */
  private getSingleton<T>(registration: ServiceRegistration<T>): T {
    // 如果已有实例，直接返回
    if (registration.instance !== undefined) {
      return registration.instance as T;
    }

    // 创建新实例并缓存
    const instance = registration.factory() as T;
    registration.instance = instance;
    return instance;
  }

  /**
   * 获取多例服务
   */
  private getTransient<T>(registration: ServiceRegistration<T>): T {
    // 每次创建新实例
    return registration.factory() as T;
  }

  /**
   * 获取作用域服务
   */
  private getScoped<T>(registration: ServiceRegistration<T>): T {
    // 获取当前作用域（如果有）
    const currentScope = this.getCurrentScope();
    if (!currentScope) {
      throw new Error(
        `作用域服务 "${registration.name}" 必须在作用域内使用，请先调用 createScope() 创建作用域`,
      );
    }

    // 获取作用域的实例存储
    let scopeInstances = this.scopedInstances.get(currentScope);
    if (!scopeInstances) {
      scopeInstances = new Map();
      this.scopedInstances.set(currentScope, scopeInstances);
    }

    // 如果作用域内已有实例，直接返回
    if (scopeInstances.has(registration.name)) {
      return scopeInstances.get(registration.name) as T;
    }

    // 创建新实例并存储在作用域内
    const instance = registration.factory() as T;
    scopeInstances.set(registration.name, instance);
    return instance;
  }

  /**
   * 获取工厂服务
   */
  private getFactory<T>(
    registration: ServiceRegistration<T>,
    ...args: unknown[]
  ): T {
    // 使用工厂函数创建实例（可以传入参数）
    return registration.factory(...args) as T;
  }

  /**
   * 获取当前作用域
   */
  private getCurrentScope(): IServiceScope | null {
    return this.scopeStack.length > 0
      ? this.scopeStack[this.scopeStack.length - 1]
      : null;
  }

  /**
   * 检查服务是否存在
   *
   * @param name 服务名称
   * @returns 是否存在
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * 移除服务
   *
   * @param name 服务名称
   */
  remove(name: string): void {
    if (!this.services.has(name)) {
      return;
    }

    const registration = this.services.get(name)!;

    // 移除主服务
    this.services.delete(name);

    // 移除别名
    if (registration.aliases) {
      for (const alias of registration.aliases) {
        this.services.delete(alias);
      }
    }

    // 如果是单例，清理实例
    if (registration.lifetime === "singleton") {
      registration.instance = undefined;
    }

    // 清理所有作用域中的实例
    for (const scopeInstances of this.scopedInstances.values()) {
      scopeInstances.delete(name);
      if (registration.aliases) {
        for (const alias of registration.aliases) {
          scopeInstances.delete(alias);
        }
      }
    }
  }

  /**
   * 创建作用域
   * 用于管理作用域服务的生命周期
   *
   * @returns 作用域实例
   */
  createScope(): IServiceScope {
    const scope: IServiceScope = {
      get: <T = unknown>(name: string, ...args: unknown[]): T => {
        // 将当前作用域推入栈
        this.scopeStack.push(scope);
        try {
          return this.get<T>(name, ...args);
        } finally {
          // 从栈中移除
          this.scopeStack.pop();
        }
      },
      has: (name: string): boolean => {
        return this.has(name);
      },
      dispose: (): void => {
        // 清理作用域内的所有实例
        this.scopedInstances.delete(scope);
      },
    };

    return scope;
  }

  /**
   * 清空所有服务
   */
  clear(): void {
    this.services.clear();
    this.scopedInstances.clear();
    this.scopeStack = [];
  }

  /**
   * 获取所有已注册的服务名称
   *
   * @returns 服务名称数组
   */
  getRegisteredServices(): string[] {
    const serviceNames = new Set<string>();
    for (const [, registration] of this.services.entries()) {
      serviceNames.add(registration.name);
      if (registration.aliases) {
        for (const alias of registration.aliases) {
          serviceNames.add(alias);
        }
      }
    }
    return Array.from(serviceNames);
  }

  /**
   * 替换服务（先移除再注册）
   *
   * @param name 服务名称
   * @param lifetime 服务生命周期
   * @param factory 工厂函数
   * @param aliases 服务别名
   */
  replace<T = unknown>(
    name: string,
    lifetime: ServiceLifetime,
    factory: (...args: unknown[]) => T,
    aliases?: string[],
  ): void {
    this.remove(name);
    this.register(name, lifetime, factory, aliases);
  }
}

/**
 * 创建服务容器实例
 *
 * @returns 服务容器实例
 */
export function createServiceContainer(): ServiceContainer {
  return new ServiceContainer();
}
