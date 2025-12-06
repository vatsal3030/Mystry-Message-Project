import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" }, // ✅ changed
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const { identifier, password } = credentials as {
          identifier: string;
          password: string;
        };

        await dbConnect();

        try {
          // ✅ allow login using either email or username
          const user = await UserModel.findOne({
            $or: [{ email: identifier }, { username: identifier }],
          });

          if (!user) {
            throw new Error("Invalid email/username or password");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before signing in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("Invalid email/username or password");
          }

          // success → return user object
          return user;
        } catch (err: any) {
          // rethrow actual message so frontend can show proper error
          throw new Error(err.message || "Error during sign in");
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // TS-safe: user is any here
        const u = user as any;
        token._id = u._id?.toString();
        token.isVerified = u.isVerified;
        token.isAcceptingMessages = u.isAcceptingMessages;
        token.username = u.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any)._id = token._id?.toString();
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).isAcceptingMessages =
          token.isAcceptingMessages;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
};
