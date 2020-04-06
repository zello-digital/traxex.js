"use strict";

const chalk = require("chalk");
const commander = require("commander");
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

const packageJson = require("./package.json");

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action((name) => {
    projectName = name;
  })
  .option("--verbose", "print additional logs")
  .option("--info", "print environment debug info")
  .option(
    "--scripts-version <alternative-package>",
    "use a non-standard version of react-scripts"
  )
  .option(
    "--template <path-to-template>",
    "specify a template for the created project"
  )
  .option("--use-npm")
  .option("--use-pnp")
  // TODO: Remove this in next major release.
  .option(
    "--typescript",
    "(this option will be removed in favour of templates in the next major release of create-react-app)"
  )
  .allowUnknownOption()
  .on("--help", () => {
    console.log(`    Only ${chalk.green("<project-directory>")} is required.`);
    console.log();
    console.log(
      `    A custom ${chalk.cyan("--scripts-version")} can be one of:`
    );
    console.log(`      - a specific npm version: ${chalk.green("0.8.2")}`);
    console.log(`      - a specific npm tag: ${chalk.green("@next")}`);
    console.log(
      `      - a custom fork published on npm: ${chalk.green(
        "my-react-scripts"
      )}`
    );
    console.log(
      `      - a local path relative to the current working directory: ${chalk.green(
        "file:../my-react-scripts"
      )}`
    );
    console.log(
      `      - a .tgz archive: ${chalk.green(
        "https://mysite.com/my-react-scripts-0.8.2.tgz"
      )}`
    );
    console.log(
      `      - a .tar.gz archive: ${chalk.green(
        "https://mysite.com/my-react-scripts-0.8.2.tar.gz"
      )}`
    );
    console.log(
      `    It is not needed unless you specifically want to use a fork.`
    );
    console.log();
    console.log(`    A custom ${chalk.cyan("--template")} can be one of:`);
    console.log(
      `      - a custom fork published on npm: ${chalk.green(
        "cra-template-typescript"
      )}`
    );
    console.log(
      `      - a local path relative to the current working directory: ${chalk.green(
        "file:../my-custom-template"
      )}`
    );
    console.log(
      `      - a .tgz archive: ${chalk.green(
        "https://mysite.com/my-custom-template-0.8.2.tgz"
      )}`
    );
    console.log(
      `      - a .tar.gz archive: ${chalk.green(
        "https://mysite.com/my-custom-template-0.8.2.tar.gz"
      )}`
    );
    console.log();
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(
      `      ${chalk.cyan(
        "https://github.com/facebook/create-react-app/issues/new"
      )}`
    );
    console.log();
  })
  .parse(process.argv);

if (program.info) {
  console.log(chalk.bold("\nEnvironment Info:"));
  console.log(
    `\n  current version of ${packageJson.name}: ${packageJson.version}`
  );
  console.log(`  running from ${__dirname}`);
  return envinfo
    .run(
      {
        System: ["OS", "CPU"],
        Binaries: ["Node", "npm", "Yarn"],
        Browsers: ["Chrome", "Edge", "Internet Explorer", "Firefox", "Safari"],
        npmPackages: ["react", "react-dom", "react-scripts"],
        npmGlobalPackages: ["create-react-app"],
      },
      {
        duplicates: true,
        showNotFound: true,
      }
    )
    .then(console.log);
}

if (typeof projectName === "undefined") {
  console.error("Please specify the project directory:");
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
  );
  console.log();
  console.log("For example:");
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green("my-react-app")}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

// TODO: Create app
createApp(
  projectName,
  program.verbose,
  program.scriptsVersion,
  program.template,
  program.useNpm,
  program.usePnp,
  program.typescript
);

function createApp() {
  const unsupportedNodeVersion = !semver.satisfies(process.version, ">=8.10.0");
  if (unsupportedNodeVersion && useTypeScript) {
    console.error(
      chalk.red(
        `You are using Node ${process.version} with the TypeScript template. Node 8.10 or higher is required to use TypeScript.\n`
      )
    );

    process.exit(1);
  } else if (unsupportedNodeVersion) {
    console.log(
      chalk.yellow(
        `You are using Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n` +
          `Please update to Node 8.10 or higher for a better, fully supported experience.\n`
      )
    );
    // Fall back to latest supported react-scripts on Node 4
    version = "react-scripts@0.9.x";
  }
}
