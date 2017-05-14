const DEBUG = (process.env.APP_ENV === "dev")

module.exports = {
  log: function(...log) {
    if (DEBUG) {
      console.log(...log)
    }
  },
  info: function(...info) {
    if (DEBUG) {
      console.info(...info)
    }
  },
  warn: function(...warn) {
    if (DEBUG) {
      console.warn(...warn)
    }
  },
  error: function(...error) {
    if (DEBUG) {
      console.error(...error)
    }
  }
}