export interface IContext<T = any> {
    set: (context: T | null) => void;
    get: () => T | null;
}
export type IContextValueType<C extends IContext> = ReturnType<C['get']>;

export function createContext<T>(): IContext<T> {
    let context: T | null = null;
    return {
        set: (ctx: T | null) => {
            context = ctx;
        },
        get: () => {
            return context;
        },
    };
}
