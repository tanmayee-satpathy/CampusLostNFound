import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { getDb } from "./db.js";

const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      if (!email || !password) {
        return done(null, false, {
          message: "Email and password are required.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = await getDb();
      const usersCollection = db.collection("Users");

      const user = await usersCollection.findOne({ email: normalizedEmail });

      if (!user) {
        return done(null, false, { message: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        return done(null, false, { message: "Invalid email or password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

passport.use(localStrategy);

export default passport;
