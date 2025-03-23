import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import mailerConfig from './mailer.config';
const appConfig = [databaseConfig, mailerConfig, jwtConfig];
export default appConfig;
