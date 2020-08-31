import jwt from 'jsonwebtoken';
import config from 'config';

export default function(req, res, next) {
    if (!['super'].includes(req.user.role)) {
        console.log('user', req.user);
        return res.status(403).send('Unautorized.');
    } else {
        next();
    }
};
