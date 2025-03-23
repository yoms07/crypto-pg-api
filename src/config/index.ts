import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import mailerConfig from './mailer.config';
import urlConfig from './url.config';
const appConfig = [databaseConfig, mailerConfig, jwtConfig, urlConfig];
export default appConfig;
