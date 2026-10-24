import { copyFileSync, existsSync } from "node:fs";
const dir = "dist/client";
if (existsSync(`${dir}/_shell.html`)) copyFileSync(`${dir}/_shell.html`, `${dir}/index.html`);
console.log("index.html gerado para o Capacitor");
