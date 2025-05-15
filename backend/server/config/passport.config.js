require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `http://localhost:3001/api/auth/discord/callback`,
    scope: ['identify', 'email']
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.email || `${profile.id}@discord.fake`;

            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    firstName: profile.username,
                    lastName: "Discord",
                    email,
                    role: "manager",
                    status: "pending",
                    emailVerified: true,
                    passwordHash: "-",
                    authProvider: "discord",
                    providerId: profile.id
                });
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback",
    scope: ["user:email"]
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.fake`;
            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    firstName: profile.displayName?.split(" ")[0] || "GitHub",
                    lastName: profile.displayName?.split(" ")[1] || "User",
                    email,
                    role: "manager",
                    status: "pending",
                    emailVerified: true,
                    passwordHash: "-",
                    authProvider: "github",
                    providerId: profile.id
                });
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            let user = await User.findOne({ email });

            if (!user) {
                user = await User.create({
                    firstName: profile.name.givenName || "Google",
                    lastName: profile.name.familyName || "User",
                    email,
                    role: "manager",
                    status: "pending",
                    emailVerified: true,
                    passwordHash: "-",
                    authProvider: "google",
                    providerId: profile.id
                });
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

