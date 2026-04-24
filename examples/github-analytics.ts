/**
 * GitHub Project Analytics — ADR-152
 *
 * Demonstrates how to use the Trix TypeScript SDK to access code intelligence
 * and delivery analytics for GitHub-connected projects.
 *
 * Prerequisites:
 *   1. A Trix project with a linked GitHub repository
 *   2. TRIX_API_KEY and TRIX_PROJECT_ID environment variables
 *
 * Usage:
 *   TRIX_API_KEY=your_key TRIX_PROJECT_ID=your_id npx ts-node examples/github-analytics.ts
 */

import { Trix } from '../src/index.js';

const apiKey = process.env.TRIX_API_KEY ?? '';
const projectId = process.env.TRIX_PROJECT_ID ?? '';

if (!apiKey || !projectId) {
  console.error('Error: set TRIX_API_KEY and TRIX_PROJECT_ID environment variables.');
  process.exit(1);
}

const client = new Trix({ apiKey, baseUrl: 'https://api.trixdb.com' });

function section(title: string): void {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(50));
}

async function showVelocity(): Promise<void> {
  section('PR Velocity');
  const v = await client.github.getVelocity(projectId);
  console.log(`  Merged last 7 days:   ${v.merged_last_7_days}`);
  console.log(`  Merged last 30 days:  ${v.merged_last_30_days}`);
  if (v.avg_cycle_time_days != null) {
    console.log(`  Avg cycle time:       ${v.avg_cycle_time_days.toFixed(1)} days`);
  } else {
    console.log('  Avg cycle time:       no data yet');
  }
}

async function showFlaggedPRs(): Promise<void> {
  section('Risk-Flagged PRs');
  const result = await client.github.getFlaggedPRs(projectId);
  if (result.prs.length === 0) {
    console.log('  No risk-flagged PRs found.');
    return;
  }
  for (const pr of result.prs) {
    console.log(`\n  ${pr.summary.slice(0, 80)}`);
    for (const flag of pr.flags) {
      console.log(`    ⚠  ${flag.replace('pr:', '')}`);
    }
  }
}

async function showCycleTime(): Promise<void> {
  section('Issue Cycle Time');
  const ct = await client.github.getCycleTime(projectId);
  const trend = { improving: '↓ faster', worsening: '↑ slower' }[ct.trend] ?? '→ stable';
  console.log(`  Trend: ${trend}`);
  if (ct.avg_cycle_days_last_30 != null) {
    console.log(`  Avg close time (last 30d):  ${ct.avg_cycle_days_last_30.toFixed(1)} days`);
  }
  if (ct.avg_cycle_days_30_60 != null) {
    console.log(`  Avg close time (prev 30d):  ${ct.avg_cycle_days_30_60.toFixed(1)} days`);
  }
  console.log(`  Open issues:                ${ct.open_issue_count}`);
  console.log(`  Closed last 30 days:        ${ct.closed_last_30}`);
}

async function showAgentAttribution(): Promise<void> {
  section('AI vs Human Contributions');
  const attr = await client.github.getAgentAttribution(projectId);
  const total = attr.agent_total + attr.human_total;
  if (total === 0) {
    console.log('  No commit or PR data synced yet.');
    return;
  }
  const aiPct = Math.round(attr.agent_ratio * 100);
  console.log(`  Total commits:  ${attr.total_commits}`);
  console.log(`  Total PRs:      ${attr.total_prs}`);
  console.log(`  AI-assisted:    ${aiPct}%  (${attr.agent_total}/${total})`);
  console.log(`  Human:          ${100 - aiPct}%  (${attr.human_total}/${total})`);
  if (Object.keys(attr.agent_breakdown).length > 0) {
    console.log('\n  By agent:');
    for (const [agent, count] of Object.entries(attr.agent_breakdown)) {
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      const bar = '█'.repeat(Math.floor(pct / 5));
      console.log(`    ${agent.padEnd(12)} ${String(pct).padStart(3)}%  ${bar}  (${count})`);
    }
  }
}

async function showGoalProgress(): Promise<void> {
  section('GitHub-Driven Goal Progress');
  const result = await client.github.getGoalProgress(projectId);
  if (result.goals.length === 0) {
    console.log('  No goals linked to GitHub issues.');
    return;
  }
  for (const g of result.goals) {
    // progress is stored as 0.0–1.0; multiply by 100 for display
    const pct = Math.round(g.progress * 100);
    const barLen = Math.floor(pct / 10);
    const bar = '█'.repeat(barLen) + '░'.repeat(10 - barLen);
    console.log(`  [${bar}] ${String(pct).padStart(3)}%  ${g.title}`);
  }
}

async function showFileComplexity(): Promise<void> {
  section('File Complexity (top hotspots)');
  const result = await client.github.getFileComplexity(projectId);
  if (result.files.length === 0) {
    console.log('  No complexity data yet — run a repo scan first.');
    return;
  }
  for (const f of result.files.slice(0, 10)) {
    const level = (f.complexity_level ?? 'ok').toUpperCase().padEnd(8);
    const score = f.hotspot_score != null ? f.hotspot_score.toFixed(2) : '—';
    const cyc = f.cyclomatic_complexity ?? '—';
    console.log(`  [${level}] score=${score}  cyc=${String(cyc).padEnd(4)}  ${f.file_path}`);
  }
}

async function generateNarrative(windowDays = 7): Promise<void> {
  section(`Delivery Narrative (last ${windowDays} days)`);
  console.log('  Generating…');
  const result = await client.github.generateNarrative(projectId, { window_days: windowDays });
  const stored = result.stored ? 'stored' : 'not stored';
  console.log(`  [${stored}, ${result.window_days}d window]\n`);
  for (const line of result.narrative.split('\n')) {
    if (line.trim()) console.log(`  ${line}`);
  }
}

async function main(): Promise<void> {
  console.log('Trix GitHub Analytics — ADR-152');
  console.log(`Project: ${projectId}`);

  await showVelocity();
  await showFlaggedPRs();
  await showCycleTime();
  await showAgentAttribution();
  await showGoalProgress();
  await showFileComplexity();

  // Uncomment to generate a new narrative (costs an LLM call):
  // await generateNarrative(7);

  // Uncomment to backfill a repo connection (requires connection_id):
  // const connectionId = process.env.TRIX_CONNECTION_ID ?? '';
  // if (connectionId) {
  //   const scan = await client.github.scanRepo(projectId, connectionId);
  //   console.log(`\n  Scan: ${scan.commits} commits, ${scan.prs} PRs, ${scan.files} files`);
  // }

  console.log('\nDone.');
}

main().catch((err: unknown) => {
  console.error('Error:', err);
  process.exit(1);
});
