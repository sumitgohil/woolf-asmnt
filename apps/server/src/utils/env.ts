export function validateEnvironment() {
  const requiredVars = ["AUTHORIZATION_TOKEN", "GEMINI_ENDPOINT"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", ")
    );
    console.error("💡 Please check your .env file");
    return false;
  }

  console.log("✅ Environment variables validated");
  return true;
}

export function logEnvironmentStatus() {
  console.log("🔧 Environment Status:");
  console.log("  NODE_ENV:", process.env.NODE_ENV || "not set");
  console.log("  PORT:", process.env.PORT || "not set");
  console.log(
    "  GEMINI_ENDPOINT:",
    process.env.GEMINI_ENDPOINT ? "configured" : "not configured"
  );
  console.log(
    "  AUTHORIZATION_TOKEN:",
    process.env.AUTHORIZATION_TOKEN ? "configured" : "not configured"
  );
}
