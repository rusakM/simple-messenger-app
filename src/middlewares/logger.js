class Logger {
    constructor() {
        this.logged = false;
    }

    login(callback) {
        this.logged = true;
        callback();
    }

    logout(callback) {
        this.logged = false;
        callback();
    }

    isLogged() {
        return this.logged;
    }
}

export default new Logger();