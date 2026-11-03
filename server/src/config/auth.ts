
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { getDB } from "./db.js";

export const createAuth = () => {
  return betterAuth({
    database: mongodbAdapter(getDB()),

    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    advanced: {
  defaultCookieAttributes: {
    sameSite: "none",
    secure: true,
  },
},

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },

    user: {
      additionalFields: {
        photoURL: {
          type: "string",
          required: false,
          input: true,
        },
      },
    },

    session: {
      cookieCache: {
        enabled: true,
        strategy: "jwt",
      },
    },

    plugins: [
      jwt({
        sessionCookieCache: true,
      }),
    ],

    trustedOrigins: [
      "http://localhost:3000",
      "https://studio-space-nu.vercel.app",
    ],
  });
};
