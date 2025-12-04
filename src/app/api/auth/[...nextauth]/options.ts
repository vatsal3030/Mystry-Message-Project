import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"
import { NextAuthOptions } from "next-auth"


export const authOptions:NextAuthOptions = {
    providers: [
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.email },
                            { username: credentials.password },
                        ]
                    })
                    if (!user) {
                        throw new Error("Invalid Email or Username")
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your email before signing in")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    }
                    else {
                        throw new Error("Invalid Password")
                    }

                }
                catch (err) {
                    throw new Error("Error connecting to database")
                }
            },
        }),
    ],
    pages: {
        signIn: '/signin',
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            if(token)
            {
                session.user._id = token._id?.toString();
                session.user.isVerified = token.isVerified ;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username ;

            }
            return session;
        }
    }
}



