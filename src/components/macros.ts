import { execSync } from 'node:child_process'

export const getHash = () => execSync('git rev-parse HEAD').toString().trim()
export const getBranch = () => execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
