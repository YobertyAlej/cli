/* eslint no-console: "off" */
import { getLinkedDirectories } from '../extension/linker';
import { getHostEnvName } from '../clients/server-env';
import apisConfig from '../../config/services';
import msg from '../user_messages';
import { getDeveloper } from '../commands/register';

export default async function() {
  const serverEnv = getHostEnvName();

  if (serverEnv !== 'production') {
    console.log(msg.use.show(serverEnv));
    console.log(apisConfig);
  }

  const extDirs = await getLinkedDirectories();

  if (extDirs.length === 0) {
    console.log(msg.show.missingExtensions());
  } else {
    console.log(msg.show.listExtensions(extDirs));
  }

  const developer = await getDeveloper();
  if (developer) {
    console.log(msg.login.complete(developer));
  }
}
