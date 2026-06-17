const parseBasicAuth = (header = "") => {
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    return {};
  }

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    return {};
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1)
  };
};

export const requireAdminAuth = (req, res, next) => {
  const { username, password } = parseBasicAuth(req.get("authorization"));

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return next();
  }

  return res.status(401).json({ message: "Admin authentication required" });
};
