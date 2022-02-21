import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify"

async function refreshAccessToken(token) {
    try {

        spotifyApi.setAccessToken(token.accessToken);
        spotifyApi.setRefreshToken(token.refreshToken);
        const { body: refreshedToken } = await spotifyApi.refreshAccessToken();
        console.log("REFRESHED TOKEN IS", refreshedToken);

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now + refreshedToken.expires_in * 1000, // = 1 hours since 3600 is return by spotify API
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
            // Replace if new one came back sle fall back to the old refresh token
        }

    } catch (error) {
        console.error(error)
        return {
            ...token,
            error: 'RefreshAccessTokenError'
        }
    }
}

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        SpotifyProvider({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
            authorization: LOGIN_URL
        }),
        // ...add more providers here
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: '/login'
    },
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign initial
            if (account && user){
                console.log("FIRST LOGIN TO THE SPOTIFY CLONE")
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    username: account.providerAccountId,
                    accessTokenExpires: account.expires_at * 1000 // we are handling expiry times in milliseconds hence the * 1000
                }
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() - token.accessTokenExpires) {
                console.log("EXISTING ACCESS TOKEN IS VALID")
                return token;
            }
            // Access token has expired, so we need to refresh it...add
            console.log("ACCESS TOKEN HAS EXPIRED, REFRESHING...")
            return await refreshAccessToken(token)
        },

        async session({session, token}) {
            session.user.accessToken = token.accessToken
            session.user.refreshToken = token.refreshToken
            session.user.username = token.username
            console.log("SESSION INFO : ", session )
            return session;
        }

    }

})