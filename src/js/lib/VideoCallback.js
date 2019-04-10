function notifyCallback(self, cbName, ...args) {
    if (!self.mListeners) return false;
    let isHandled = false;
    for (let i = 0; i < self.mListeners.length && !isHandled; i++) {
        if (!self.mListeners[i][cbName]) continue;
        isHandled |= self.mListeners[i][cbName](...args);
    }
    return isHandled;
}

function notifyOnPlayed(self, ...args) {
    return notifyCallback(self, 'onPlayed', ...args);
}

function notifyOnPaused(self, ...args) {
    return notifyCallback(self, 'onPaused', ...args);
}

function notifyOnStopped(self, ...args) {
    return notifyCallback(self, 'onStopped', ...args);
}

function notifyOnFinished(self, ...args) {
    return notifyCallback(self, 'onFinished', ...args);
}

function notifyOnPrepared(self, ...args) {
    return notifyCallback(self, 'onPrepared', ...args);
}

function notifyOnCanplay(self, ...args) {
    return notifyCallback(self, 'onCanplay', ...args);
}

function notifyOnError(self, ...args) {
    return notifyCallback(self, 'onError', ...args);
}

function notifyOnFullScreen(self, ...args) {
    return notifyCallback(self, 'onFullScreen', ...args);
}

function notifyOnNormalScreen(self, ...args) {
    return notifyCallback(self, 'onNormalScreen', ...args);
}

export { notifyOnPlayed, notifyOnPaused, notifyOnStopped, notifyOnFinished, notifyOnPrepared, notifyOnCanplay, notifyOnError, notifyOnFullScreen, notifyOnNormalScreen };
