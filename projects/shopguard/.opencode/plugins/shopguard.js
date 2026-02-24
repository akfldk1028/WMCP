/**
 * ShopGuard OpenCode Plugin
 *
 * Injects ShopGuard skill context into OpenCode's system prompt
 * for automatic skill discovery and activation.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, '..', '..', 'skills');

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const lines = match[1].split('\n');
  const frontmatter = {};
  let currentKey = null;

  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();
      frontmatter[currentKey] = value === '>' ? '' : value;
    } else if (currentKey && line.startsWith('  ')) {
      frontmatter[currentKey] += (frontmatter[currentKey] ? ' ' : '') + line.trim();
    }
  }

  return { frontmatter, content: match[2] };
}

function loadSkills() {
  const skills = [];

  // Root SKILL.md
  const rootSkill = join(SKILLS_DIR, 'SKILL.md');
  if (existsSync(rootSkill)) {
    const { frontmatter } = extractFrontmatter(readFileSync(rootSkill, 'utf-8'));
    skills.push(frontmatter);
  }

  // Sub-skill directories
  try {
    for (const dir of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const skillFile = join(SKILLS_DIR, dir.name, 'SKILL.md');
      if (existsSync(skillFile)) {
        const { frontmatter } = extractFrontmatter(readFileSync(skillFile, 'utf-8'));
        skills.push(frontmatter);
      }
    }
  } catch { /* skills dir may not exist */ }

  return skills;
}

function getBootstrapContent() {
  const skills = loadSkills();
  if (skills.length === 0) return null;

  const lines = [
    '## Available ShopGuard Skills',
    '',
    'The following shopping protection skills are available:',
    '',
  ];

  for (const skill of skills) {
    if (skill.name && skill.description) {
      lines.push(`- **${skill.name}**: ${skill.description}`);
    }
  }

  lines.push('');
  lines.push('To use a skill, the ShopGuard MCP server must be running: `npx shopguard-mcp`');

  return lines.join('\n');
}

export const ShopGuardPlugin = async ({ client, directory }) => {
  return {
    'experimental.chat.system.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (bootstrap) {
        (output.system ||= []).push(bootstrap);
      }
    },
  };
};

export default ShopGuardPlugin;
