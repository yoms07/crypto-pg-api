import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import web3Config from './web3.config';
import mailerConfig from './mailer.config';
import urlConfig from './url.config';
import secretConfig from './secret.config';
const appConfig = [
  databaseConfig,
  mailerConfig,
  jwtConfig,
  urlConfig,
  web3Config,
  secretConfig,
];
export default appConfig;
