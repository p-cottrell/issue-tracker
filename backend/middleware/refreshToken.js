// Middleware function to handle refreshing access tokens when they expire
const refreshToken = async (req, res, next) => {
    try {
        // Retrieve the access token from the cookies
        const accessToken = req.cookies.access_token;

        // Verify the access token using the secret key
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // If the token is valid, proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Check if the error is due to the access token being expired
        if (error.name === 'TokenExpiredError') {
            // Extract the refresh token from the cookies
            const { refreshToken } = req.cookies;

            // Look for the refresh token in the database
            const storedToken = await RefreshToken.findOne({ token: refreshToken });

            // If the refresh token exists and is still valid (not expired)
            if (storedToken && storedToken.expiresAt > Date.now()) {
                // Retrieve the user associated with the refresh token
                const user = await User.findById(storedToken.userId);

                // Prepare a new payload with the user's ID and role information
                const payload = { id: user._id, isAdministrator: user.isAdministrator };

                // Generate a new access token with a 1-hour expiration time
                const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

                // Set the new access token in the cookies
                res.cookie('access_token', newAccessToken, {
                    httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) and not by client-side scripts
                    secure: process.env.NODE_ENV === 'production', // Sets the cookie to be sent only over HTTPS in production
                    sameSite: 'Strict', // Ensures the cookie is only sent with requests from the same site
                    maxAge: 3600000, // Sets the cookie's expiration time to 1 hour (3600000 milliseconds)
                });

                // Attach the user information to the request object for further processing
                req.user = payload;

                // Continue to the next middleware or route handler
                next();
            } else {
                // If the refresh token is invalid or expired, return a 403 Forbidden status
                res.status(403).send('Refresh token expired');
            }
        } else {
            // If the error is not due to token expiration, return a 401 Unauthorized status
            res.status(401).send('Invalid token');
        }
    }
};

module.exports = refreshToken;
