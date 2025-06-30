const jwt = require("jsonwebtoken");

const identifier = async (req, res, next) => {
  let token;

  // ✅ Correct usage of req.header()
  if (req.header("client") === "not-browser") {
    token = req.header("authorization");
  } else {
    token = req.cookies["Authorization"];
  }

  // ✅ Token existence check
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // ✅ Extract Bearer token if it exists
    const userToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    // ✅ Verify token using secret
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

    // ✅ Add user data to request for later usage
    req.user = jwtVerified;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

module.exports = identifier;
