'use strict';

export const errorResponse = (statusCode, message) => {
    const errorCode = statusCode || 501;
    return {
        statusCode: errorCode,
        body: JSON.stringify({
            status: errorCode,
            message: message || 'Unknown error.',
        }),
        isBase64Encoded: false,
    };
};
export const successResponse = (data, is64Base) => {
    return {
        statusCode: 200,
        body: JSON.stringify(data),
        isBase64Encoded: is64Base || false,
    };
};

module.exports = {
    successResponse,
    errorResponse,
};
