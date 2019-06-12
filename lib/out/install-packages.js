'use strict';

const chalk = require('chalk');
const execa = require('execa');
const ora = require('ora');

function install(packages, currentState) {
    if (!packages.length) {
        return Promise.resolve(currentState);
    }

    // const installer = currentState.get('installer');
    const installGlobal = currentState.get('global');
    const saveExact = currentState.get('saveExact');
    const color = chalk.supportsColor;
    const updateInstaller = currentState.get('updateInstaller');

    let npmArgs;
    if (updateInstaller === 'yarn') {
        npmArgs = ['add']
            .concat(packages.slice(1))
            .concat(saveExact ? '--exact' : null)
            .filter(Boolean);
        if (installGlobal) {
            npmArgs.unshift('global')
        }
    } else {
        npmArgs = ['install']
            .concat(installGlobal  ? '--global' : null)
            .concat(saveExact ? '--save-exact' : null)
            .concat(packages)
            .concat(color ? '--color=always' : null)
            .filter(Boolean);
    }

    console.log('');
    console.log(`$ ${chalk.green(updateInstaller)} ${chalk.green(npmArgs.join(' '))}`);
    const spinner = ora(`Installing using ${chalk.green(updateInstaller)}...`);
    spinner.enabled = spinner.enabled && currentState.get('spinner');
    spinner.start();

    return execa(updateInstaller, npmArgs, { cwd: currentState.get('cwd') }).then(output => {
        spinner.stop();
        console.log(output.stdout);
        console.log(output.stderr);

        return currentState;
    }).catch(err => {
        spinner.stop();
        throw err;
    });
}

module.exports = install;
