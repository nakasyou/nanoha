import { getHash, getBranch } from './macros.ts' with { type: 'macro' }

export const commitHash = getHash()
export const gitBranch = getBranch()
