import fetch from 'node-fetch';

import {
    ClientBuilder,
    type AuthMiddlewareOptions,
    type HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';

// Configure authMiddlewareOptions
const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: 'https://auth.eu-central-1.aws.commercetools.com',
    projectKey: 'ocm',
    credentials: {
        clientId: "t8BSmo9gS3Ahrt2agC2T254C",
        clientSecret: "yCsJZSvOFnvz3c0mmHDbnd5nSdiGzqkx",
    },
    scopes: ['manage_project:ocm view_audit_log:ocm manage_api_clients:ocm view_api_clients:ocm'],
    fetch,
};

// Configure httpMiddlewareOptions
const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: 'https://api.eu-central-1.aws.commercetools.com',
    fetch,
};

// Export the ClientBuilder
export const ctpClient = new ClientBuilder()
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .withLoggerMiddleware()
    .build();