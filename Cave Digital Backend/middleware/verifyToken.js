const jwt = require("jsonwebtoken");
const Users = require("../models/users");
const SECRET_KEY = "cavedigital";

async function verifyToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET_KEY);

    // Await the user lookup
    const user = await Users.findOne({ email: verified.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const data= {id: user._id, email: user.email, name: user.name};
    req.user = data;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
}

module.exports = verifyToken;