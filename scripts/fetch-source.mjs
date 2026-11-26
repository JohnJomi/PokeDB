// Downloads the pinned sources into .cache/ with sparse, shallow checkouts.
// To update: change a commit here, regenerate, test and review the diff.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const SOURCES = [
  {
    dir: "pokeapi",
    url: "https://github.com/PokeAPI/pokeapi.git",
    commit: "de6760be38b60a3024f1d9054330ff265f0dc619",
    paths: ["/data/v2/csv/", "/LICENSE*"],
  },
  {
    dir: "sprites",
    url: "https://github.com/PokeAPI/sprites.git",
    commit: "c0542f7c51215d9672439012838c99f520596cbd",
    paths: ["/sprites/pokemon/*.png", "/sprites/pokemon/shiny/*.png", "/LICENCE*", "/LICENSE*"],
  },
];

for (const { dir, url, commit, paths } of SOURCES) {
  const target = `.cache/${dir}`;
  const git = (...args) => execFileSync("git", ["-C", target, ...args], { stdio: "inherit" });

  if (!existsSync(`${target}/.git`)) {
    mkdirSync(target, { recursive: true });
    git("init", "--quiet");
    git("remote", "add", "origin", url);
  }
  git("sparse-checkout", "set", "--no-cone", ...paths);
  git("fetch", "--quiet", "--depth", "1", "--filter=blob:none", "origin", commit);
  git("checkout", "--quiet", "--detach", commit);
  console.log(`${dir} at ${commit}`);
}
