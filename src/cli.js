import { createObject } from './main';

const yargs = require('yargs');

export async function cli(args)
{    
    const options = yargs
    .options({
        type: {
            alias: 't',
            choices: ['table','page','report','codeunit'],
            demandOption: true,
            description: 'Object Type to create.'
        },
        name: {
            alias: 'n', 
            demandOption: true, 
            description: 'Object Name to create.'

        },
        id : {
            alias:'i',
            type: 'number',
            default: 50100, 
            description: 'Object ID to create.'
        },
        extends: {
            alias: 'e',             
            description: 'Object Name to extend.',

        },
    }).argv;

    await createObject(options);
    
    //console.log(options);
}