// require jsonwebtoken
const jwt = require('jsonwebtoken');

// require config
const {SECRET_KEY} = require('../utilities/config');

// authenticate function
const authenticate = (req, res, next) => {
    
    // check if token is present in the request
    // const token = req.cookies.token;

    // get token from headers
    const token = req.headers.authorization;

    if(!token) return res.status(401).json({message: 'No token found'});

    // verify token
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    }catch(err) {
        res.status(401).json({message: 'Invalid token'});
    }
}

// export authenticate
module.exports = authenticate;