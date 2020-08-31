export default function(handler) {
  // const { errorResponse } = require("../utils/response");
  return async (req, res, next) => {
    try {
      return await handler(req, res);
    } catch (ex) {
      console.error("Uncaught error", ex);
      next(ex);
    }
  };
}
