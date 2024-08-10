const core = require("@actions/core");
const tc = require("@actions/tool-cache");
const fs = require("node:fs");

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const catwalkVersion = core.getInput("catwalk-version");
    core.info(`Installing catwalk version '${catwalkVersion}'`);

    const binary = binaryName();
    const url =
      catwalkVersion === "latest"
        ? `https://github.com/catppuccin/catwalk/releases/latest/download/${binary}`
        : `https://github.com/catppuccin/catwalk/releases/download/${catwalkVersion}/${binary}`;

    core.info(`Downloading catwalk from '${url}'`);
    const destDir = "/tmp/catppuccin";
    const destFile = await tc.downloadTool(url, `${destDir}/catwalk`);
    core.info(`Downloaded catwalk to '${destFile}'`);

    core.info(`Setting execute permissions for '${destFile}'`);
    fs.chmodSync(destFile, "755");

    core.info(`Adding '${destDir}' to PATH`);
    core.addPath(destDir);

    core.setOutput("catwalk-version", catwalkVersion);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
}

function binaryName() {
  let targetTriple;
  switch (process.platform) {
    case "linux":
      targetTriple = "x86_64-unknown-linux-gnu";
      break;
    case "darwin":
      targetTriple = "aarch64-apple-darwin";
      break;
    case "win32":
      targetTriple = "x86_64-pc-windows-msvc.exe";
      break;
    default:
      throw new Error(`Unsupported platform ${process.platform}.`);
  }

  return `catwalk-${targetTriple}`;
}

module.exports = {
  run,
};
