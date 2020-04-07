#!/usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const commander = require("commander");
const prompts = require("prompts");
const dns = require("dns");
const envinfo = require("envinfo");
const execSync = require("child_process").execSync;
const fs = require("fs-extra");
const hyperquest = require("hyperquest");
const inquirer = require("inquirer");
const os = require("os");
const path = require("path");
const semver = require("semver");
const spawn = require("cross-spawn");
const tmp = require("tmp");
const unpack = require("tar-pack").unpack;
const url = require("url");
const validateProjectName = require("validate-npm-package-name");

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("Traxex JS", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
};

const askQuestions = () => {
  const questions = [
    {
      name: "FILENAME",
      type: "input",
      message: "What is the name of the file without extension?",
    },
    {
      type: "list",
      name: "EXTENSION",
      message: "What is the file extension?",
      choices: [".rb", ".js", ".php", ".css"],
      filter: function (val) {
        return val.split(".")[1];
      },
    },
  ];
  return inquirer.prompt(questions);
};

const createFile = (filename, extension) => {
  const filePath = `${process.cwd()}/${filename}.${extension}`;
  shell.touch(filePath);
  return filePath;
};

const success = (filepath) => {
  console.log(chalk.white.bgGreen.bold(`Done! File created at ${filepath}`));
};

const run = async () => {
  // show script introduction
  init();
  // ask questions
  const answers = await askQuestions();
  const { FILENAME, EXTENSION } = answers;

  // create the file
  const filePath = createFile(FILENAME, EXTENSION);

  // show success message
  success(filePath);
};

run();
