const jwt = require('jsonwebtoken');


const verifyJWT = (request, response, next) => {
  const authHeader =  request.headers.Authorization || request.headers.authorization;
  
  if(!authHeader?.startsWith("Bearer ")) return response.sendStatus(401);
  const token = authHeader.split(' ')[1];

  console.log(token);
  
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (error, decoded) => {
      if (error) return response.sendStatus(403);
      request.user = decoded.username;
      request.roles = decoded.userInfo.roles;
      next();
    }
  )
};

module.exports = verifyJWT;