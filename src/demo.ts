import { App } from "./lifecycle";

interface UserInfo {
    userId: string;
}
interface DocInfo {
    docId: string;
}

class UserService {
    onUserLogIn(deps: { userInfo: UserInfo }) {
        console.log('onUserLogIn', deps.userInfo.userId);
    }
    onUserLogOut() {
        console.log('onUserLogOut');
    }
}
class DocService {
    onEnterDoc(deps: { docInfo: DocInfo }) {
        console.log('onEnterDoc', deps.docInfo.docId);
    }
}

function initServices() {
    return [new UserService(), new DocService()];
}

const app = App
    // declare contexts in app
    // e.g. there are two context (or called state) in this app
    .declareContext((declare) => ({
        userInfo: declare<UserInfo>(),
        docInfo: declare<DocInfo>(),
    }))
    // declare hooks for service
    // e.g. hook 'onEnterDoc' is a hook which can provide context 'userInfo' and 'docInfo' -- they shouldn't be null, or wound throw.
    // hook is the only way for service to get a context, app will not export them
    .declareHook({
        onUserLogIn: ['userInfo'],
        onEnterDoc: ['userInfo', 'docInfo'],
        onUserLogOut: ['docInfo'],
    })
    // register services
    // e.g. any service should implement partial interface with hooks above. Incompatible type wound fail.
    // you can import services from other files, and you can use a factory function to provide a series of related services.
    .registerService(initServices)
    // provide lifecycle entries
    .provideEntries({
        login: (ctx, trigger) => (userId: string) => {
            ctx.userInfo.set({ userId });
            trigger('onUserLogIn');
        },
        enter: (ctx, trigger) => (docId: string) => {
            ctx.docInfo.set({ docId });
            trigger('onEnterDoc');
            // in this entry function, you wanna trigger hook 'onEnterDoc', and hook 'onEnterDoc' depends on contexts 'userInfo' and 'docInfo'.
            // so you need to make sure these contexts are nonullable before trigger
        },
        logout: (ctx, trigger) => () => {
            ctx.userInfo.set(null);
            trigger('onUserLogOut');
        },
    })
    // export app
    .build();

const { entries } = app;
entries.login('chen');
entries.enter('123');
entries.logout();