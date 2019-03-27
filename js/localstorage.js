
const localStorageIo = (appName, useDebugLogging) => {
    const log = (...msg) => { if (useDebugLogging) console.log(...msg)};
    const localStorageEnabled = typeof(Storage) !== "undefined";
    const empty = ({ id: `${appName} State`});

    const hasExisting = localStorageEnabled && !!localStorage.getItem(appName);
    log(hasExisting ? `Loaded ${appName} State` : `No ${appName} State Found`);

    if (!hasExisting)
        localStorage.setItem(appName, JSON.stringify(empty));
    let state = JSON.parse(localStorage.getItem(appName));
    log('State', state);

    const update = (updateState) => {
        updateState(state);
        log('Updated', state);
        if (localStorageEnabled)
            localStorage.setItem(appName, JSON.stringify(state));
        return state;
    };

    return ({
        save: (name, item) => update(s => s[name] = item),
        load: (name, createDefault) => {
            const result = state[name] || createDefault();
            log('Loaded', result);
            return result;
        }
    });
};
