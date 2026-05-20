// seed/skills/devops.js — Git, GitHub Actions, CI/CD, App Signing
import { mk } from '../helpers.js';

export default function buildDevOpsSkills() {
  return [
    mk('Git', 'devops'),
    mk('GitHub Actions', 'devops'),
    mk('CI/CD Pipelines', 'devops'),
    mk('App Signing & Binary Builds', 'devops'),
  ];
}
