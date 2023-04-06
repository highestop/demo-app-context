import { createState } from './create-state';

export type IContext<T = any> = { ready: false } | { ready: true; ref: T };

function notReadyContext(): IContext {
    return { ready: false };
}

export interface IAppContext<T> {
    setContext: (value: IContext<T>) => void;
    getContext: () => IContext<T>;
    clearContext: () => void;
}
export function createAppContext<T>(): IAppContext<T> {
    const contextState = createState<IContext<T>>(notReadyContext());
    const clearContext = () => contextState.setState(notReadyContext());
    return {
        setContext: contextState.setState,
        getContext: contextState.getState,
        clearContext,
    };
}
