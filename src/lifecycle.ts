import { IContext, createContext, IContextValueType } from "./context";

export class App {
    static declareContext = <AppContext extends { [key: string]: IContext }>(
        contextFactory: (declare: typeof createContext) => AppContext
    ) => {
        const ctxs = contextFactory(createContext);
        const declareHook = <
            AppHookConfig extends { [hookKey: string]: (keyof AppContext)[] }
        >(
            hookConfigs: AppHookConfig
        ) => {
            //
            const ctxToHooks: {
                [ctxKey in keyof AppContext]: Set<keyof AppHookConfig>;
            } = {} as any;
            Object.keys(ctxs).forEach((ctxKey: keyof AppContext) => {
                ctxToHooks[ctxKey] = new Set();
                Object.keys(hookConfigs).forEach((hookKey: keyof AppHookConfig) => {
                    if (hookConfigs[hookKey].indexOf(ctxKey) !== -1) {
                        ctxToHooks[ctxKey].add(hookKey);
                    }
                });
            });
            //
            const registerService = (
                serviceFactory: () => Partial<{
                    [hookKey in keyof AppHookConfig]: (deps: {
                        [ctxKey in AppHookConfig[hookKey][number]]: NonNullable<
                            IContextValueType<AppContext[ctxKey]>
                        >;
                    }) => void;
                }>[]
            ) => {
                const services = serviceFactory();
                const provideEntries = <
                    AppEntyConfig extends {
                        [entryKey: string]: (
                            ctxs: {
                                [ctxKey in keyof AppContext]: AppContext[ctxKey];
                            },
                            trigger: (hook: keyof AppHookConfig) => void
                        ) => (...args: any[]) => void;
                    }
                >(
                    entryConfigs: AppEntyConfig
                ) => {
                    const trigger =
                        (entryKey: keyof AppEntyConfig, triggered: () => void) =>
                            (hookKey: keyof AppHookConfig) => {
                                triggered();
                                const hookDeps = hookConfigs[hookKey].reduce((deps, ctxKey) => {
                                    const ctx = ctxs[ctxKey].get();
                                    if (ctx == null) {
                                        throw Error(
                                            `Context:${ctxKey.toString()} is null in Hook:${hookKey.toString()}. Make sure Context:${ctxKey.toString()}' is set before Entry:${entryKey.toString()}, or remove Context:${ctxKey.toString()}' as dependence in Hook:${hookKey.toString()}.`
                                        );
                                    }
                                    deps[ctxKey] = ctx;
                                    return deps;
                                }, {} as any);
                                services.forEach((service) => service[hookKey]?.(hookDeps));
                            };
                    const entries: {
                        [entryKey in keyof AppEntyConfig]: (
                            ...args: Parameters<ReturnType<AppEntyConfig[entryKey]>>
                        ) => void;
                    } = {} as any;
                    Object.keys(entryConfigs).forEach(
                        <entryKey extends keyof AppEntyConfig>(entryKey: entryKey) => {
                            entries[entryKey] = (
                                ...args: Parameters<ReturnType<AppEntyConfig[entryKey]>>
                            ) => {
                                // let triggered = false;
                                entryConfigs[entryKey](
                                    ctxs,
                                    trigger(entryKey, () => {
                                        // if (triggered) {
                                        //   throw Error(
                                        //     `Cannot trigger more than one hook in Entry:${entryKey.toString()}`
                                        //   );
                                        // }
                                        // triggered = true;
                                    })
                                )(...args);
                                // if (!triggered) {
                                //   console.warn(
                                //     `No hook has been triggered in Entry:${entryKey.toString()}`
                                //   );
                                // }
                            };
                        }
                    );
                    const build = () => {
                        return { entries };
                    };
                    return { build };
                };
                return { provideEntries };
            };
            return { registerService };
        };
        return { declareHook };
    };
}
