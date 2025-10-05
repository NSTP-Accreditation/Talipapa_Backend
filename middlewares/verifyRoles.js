const verifyRoles = (...allowedRoles) => {
  return (request, response, next) => {
    
    if(!request?.roles) return response.sendStatus(401);
    const roles = [...allowedRoles];
    const result = request.roles.map(role => roles.includes(role)).find(val => val === true);
    if(!result) return response.sendStatus(401);
    next();
  }
}

module.exports = verifyRoles;