// 定义更改 context 的 lifecycle 入口函数

import { clearAppContext, setAppContext } from './app-context';
import { UserInfo } from './context';

export function userLogin(userInfo: UserInfo) {
    setAppContext('user', {
        userInfo,
        featureSwitch: {},
    });
}

export function userLogout() {
    clearAppContext('user');
}
