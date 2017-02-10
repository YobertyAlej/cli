/* eslint no-console: 0 */
import { uploadExtension } from '../commands/push';
import msg from '../user_messages';
import _ from 'lodash';
import { pathExists } from '../extension/data';
import { handleError } from '../extension/error-handler';
import fs from 'mz/fs';
import bluebird from 'bluebird';
import path from 'path';
import { prompt } from 'inquirer';
import { getHostEnvName } from '../clients/server-env';

export async function pushAll(args) {
  const dirFiles = _.difference(await fs.readdir(process.cwd()), args.without || []);
  const extPaths = await bluebird.filter(dirFiles, f => pathExists(path.join(f, 'extension.json')));

  if (extPaths.length === 0) {
    console.log('No extensions found in current directory.');
    return [];
  }

  let { pathsToPush } = args.noconfirm || await prompt({
    type: 'checkbox',
    name: 'pathsToPush',
    message: `Check extensions you want to push to ${getHostEnvName()}?`,
    choices: extPaths,
    pageSize: 25
  });
  pathsToPush = pathsToPush || extPaths;

  const pushed = [];
  const notPushed = [];

  for (const extPath of pathsToPush) {
    try  {
      await uploadExtension(args, extPath);
      console.log(msg.push.complete());
      pushed.push(extPath);
    } catch (err) {
      await handleError(err);
      notPushed.push(extPath);
    }
  }

  if (pushed.length > 0) {
    console.log(`Pushed:`);
    console.log(pushed.map(e => `  ${e}`).join('\n'));
  }

  if (notPushed.length > 0) {
    console.log(`Not pushed:`);
    console.log(notPushed.map(e => `  ${e}`).join('\n'));
  }

  return pathsToPush;
}
