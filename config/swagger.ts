// for AdonisJS v6
import path from 'node:path'
import url from 'node:url'
// ---

export default {
  path: path.dirname(url.fileURLToPath(import.meta.url)) + '/../', // for AdonisJS v6
  title: 'Spotlight API', // use info instead
  version: '1.0.0', // use info instead
  description: 'API documentation for Spotlight application', // use info instead
  tagIndex: 1,
  productionEnv: 'production', // optional
  info: {
    title: 'Spotlight API',
    version: '1.0.0',
    description: 'API documentation for Spotlight application',
  },
  snakeCase: true,

  debug: false, // set to true, to get some useful debug output
  ignore: ['/swagger', '/docs'],
  preferredPutPatch: 'PUT', // if PUT/PATCH are provided for the same route, prefer PUT
  common: {
    parameters: {}, // OpenAPI conform parameters that are commonly used
    headers: {}, // OpenAPI conform headers that are commonly used
  },
  securitySchemes: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  }, // optional
  authMiddlewares: ['auth', 'auth:api'], // optional
  defaultSecurityScheme: 'BearerAuth', // optional
  persistAuthorization: true, // persist authorization between reloads on the swagger page
  showFullPath: false, // the path displayed after endpoint summary
}
