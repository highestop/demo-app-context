import {
    UserInfo,
    FeatureSwitch,
    DocInfo as FileInfo,
    TicketInfo,
    SocketService,
    EditorService,
    BridgeService,
    RenderService,
    ActiveDispatcher,
} from './context';
import { IAppContext, createAppContext } from './create-app-context';

// 定义不同 stage 的 context 接口

interface UserContext {
    userInfo: UserInfo;
    featureSwitch: FeatureSwitch;
}
interface FileContext {
    fileInfo: FileInfo;
    ticketInfo: TicketInfo;
    socketService: SocketService;
}
interface EditorContext {
    canvas: HTMLCanvasElement;
    editorService: EditorService;
    bridgeService: BridgeService;
}
interface StageContext {
    renderService: RenderService;
    actionDispatcher: ActiveDispatcher;
}

// 定义整个 app 的 context 接口

interface TypeOfAppContext {
    user: UserContext;
    file: FileContext;
    editor: EditorContext;
    stage: StageContext;
}
type KeyOfAppContext = keyof TypeOfAppContext;

// 创建 app context 单例

const appContexts: {
    [key in keyof TypeOfAppContext]: IAppContext<TypeOfAppContext[key]>;
} = {
    user: createAppContext<UserContext>(),
    file: createAppContext<FileContext>(),
    editor: createAppContext<EditorContext>(),
    stage: createAppContext<StageContext>(),
} as const;

// 对外提供读写 app context 的方法

export function getAppContext<T extends KeyOfAppContext>(
    key: T
): TypeOfAppContext[T] {
    const ctx = appContexts[key].getContext();
    if (!ctx.ready) {
        throw Error(`访问的 Context '${key}' 为空`);
    }
    // 做运行时的完整性检查
    const nilCtx = Object.keys(ctx.ref).filter((key) => ctx.ref[key] == null);
    if (nilCtx.length) {
        throw Error(
            `访问 Context '${key}' 时这些对象为空: ${nilCtx.join(', ')}`
        );
    }
    return ctx.ref;
}

export function setAppContext<T extends KeyOfAppContext>(
    key: T,
    ctx: TypeOfAppContext[T]
): void {
    // 做运行时的完整性检查
    const nilCtx = Object.keys(ctx).filter((key) => ctx[key] == null);
    if (nilCtx.length) {
        throw Error(
            `设置 Context '${key}' 时这些对象为空: ${nilCtx.join(', ')}`
        );
    }
    appContexts[key].setContext({ ready: true, ref: ctx });
}

export function clearAppContext<T extends KeyOfAppContext>(key: T): void {
    appContexts[key].clearContext();
}
