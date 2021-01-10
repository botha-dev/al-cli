import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import { option } from 'yargs';

const access = promisify(fs.access);
const fsPromise = require('fs').promises;
const fsExtra = require('fs-extra');

const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

async function copyTemplateFiles(options) {

    return fsPromise.readdir(options.templateDirectory)
        .then(async filenames => {
            for (let filename of filenames) {
                await handleTemplateFile(options, filename);
                //console.log(filename)
            }
        })
        .catch(err => {
            console.log(err)
        });
}

async function handleTemplateFile(options, file) {

    var sourceFile = path.join(options.templateDirectory, file);
    var destFile = path.join(options.targetDirectory, handleFileName(options, file));
        
    try {

        await fsPromise.copyFile(
            sourceFile,
            destFile,
            fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE
        );

        console.log("%s  %s", chalk.green('CREATED'), destFile);

        await fsPromise.readFile(destFile)
            .then(data => {
                var newData = data.toString().replace(/<id>/gi, options.id);
                newData = newData.toString().replace(/<name>/gi, options.name);
                newData = newData.toString().replace(/<extends>/gi, options.extends);
                fsPromise.writeFile(destFile, newData);
            })

    } catch (error) {
        console.error('%s', chalk.red.bold(error));
    }

}

function handleFileName(options, file) {
    var tempName = options.name;
    var tempNameSplit = tempName.split(' ');    
    var fileName = '';

    if (tempNameSplit.length > 1) {
        for (let index = 0; index < tempNameSplit.length; index++) {
            const element = capitalize(tempNameSplit[index]);
            fileName += element;
        }
    } else {
        fileName = tempName;
    }

    fileName = fileName + file;
    return fileName;
}

export async function createObject(options) {

    var folder = "";

    var slashPos = options.name.indexOf("/");

    if (slashPos > -1) {
        folder = options.name.substr(0, slashPos);
        options.name = options.name.substr(slashPos + 1);
    }

    options = {
        ...options,
        targetDirectory: options.targetDirectory || path.join(process.cwd(), folder),
    };
    
    fsExtra.ensureDir(options.targetDirectory, function (err) {
        console.log(err) // => null       
    })

    const currentFileUrl = import.meta.url;

    var templateDir = path.join(
        new URL(currentFileUrl).pathname,
        '../../templates',
        options.type.toLowerCase()

    );

    templateDir = templateDir.substr(1, templateDir.length);

    options.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.red.bold('ERROR'));
        process.exit(1);
    }

    console.log('creating template files');
    await copyTemplateFiles(options);

    console.log('%s Object created.', chalk.green.bold('DONE'));
    return true;
}