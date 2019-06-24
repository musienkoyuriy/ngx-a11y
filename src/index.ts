import chalk from 'chalk';
import { readFileSync } from 'fs';

const glob = require('glob');

import { printWarnings } from './logger';
import { FileMetadata } from './models/common';
import { Warning } from './models/warnings';
import {
  getA11yWarnings,
  getContentFromVueFile,
  getContentFromVueXTemplate,
  getTemplateFromAngularDecorator,
  getTemplateFromVueObject
  // getTemplateFromComponentDecorator,
  // getTemplateFromReactComponents
} from './parser';
import { getExtension, getFrameworkName } from './utils';

const error = chalk.bold.red;

const templatesWithWarnings = Object.create(null);

function linkWarningsWithTemplate(warnings: Warning[], templateUrl: string): void {
  if (templateUrl in templatesWithWarnings) {
    templatesWithWarnings[templateUrl] = [
      ...templatesWithWarnings[templateUrl],
      ...warnings
    ];
  } else {
    templatesWithWarnings[templateUrl] = warnings;
  }
}

function getTemplate({ fileContent, fileExtension }: FileMetadata): string {
  switch (getFrameworkName()) {
    case 'angular':
      return fileExtension === 'ts'
        ? getTemplateFromAngularDecorator(fileContent)
        : fileContent;
    case 'react':
      return getTemplateFromReactComponents(fileContent);
    case 'vue':
      if (fileExtension === 'vue') {
        return getContentFromVueFile(fileContent);
      } else if (fileExtension === 'js' || fileExtension === 'ts') {
        return getTemplateFromVueObject(fileContent);
      } else {
        return getContentFromVueXTemplate(fileContent);
      }
    default:
      return fileContent;
  }
}

function parseTemplate(templateUrl: string): void {
  const fileExtension = getExtension(templateUrl);

  let fileContent;

  try {
    fileContent = readFileSync(templateUrl, { encoding: 'utf8' });
  } catch (err) {
    throw new Error(err);
  }

  const template = getTemplate({
    fileExtension,
    fileContent
  });

  const warnings = getA11yWarnings(template);

  linkWarningsWithTemplate(warnings, templateUrl);
}

function handleTemplates(fileNames: string[]): void {
  fileNames.forEach(fileName => parseTemplate(fileName));
  printWarnings(templatesWithWarnings);
}

function getExtensionPattern(): string {
  const framework = getFrameworkName();

  if (framework === 'vue') {
    return '+(vue|ts|js|html)';
  } else if (framework === 'angular') {
    return '+(html|ts)';
  } else if (framework === 'react') {
    return '+(js|jsx)';
  }

  return '+(html|htm)';
}

export function run(program: any): void {
  const { path } = program;

  if (!path) {
    console.error(
      error(
        'Path is not specified. Use "--path" or "-p" options to specify a root folder.'
      )
    );
    process.exit(0);
  }

  glob(`${path}/**/*.${getExtensionPattern()}`, (err: Error, fileNames: string[]) => {
    if (err) {
      throw new Error(`Files search error ${err}`);
    }

    handleTemplates(fileNames);

    if (program.watch) {
      process.stdin.resume();
    }
  });
}
