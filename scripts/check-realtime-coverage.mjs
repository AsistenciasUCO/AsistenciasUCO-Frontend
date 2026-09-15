#!/usr/bin/env node
// Gate de cobertura para la vertical realtime (src/app/core/realtime/** y
// cualquier helper realtime de asistencia). Lee coverage/**/lcov.info
// generado por `npm run test:ci` y falla si LINE < 90% o BRANCH < 80% sobre
// ESOS archivos exclusivamente (no la cobertura global del frontend).
//
// No manipula el LCOV ni excluye branches: si un archivo de la vertical
// aparece en el reporte, cuenta completo.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LINE_THRESHOLD = 90;
const BRANCH_THRESHOLD = 80;

const REALTIME_VERTICAL_PATTERNS = [
  /(^|\/)src\/app\/core\/realtime\//,
  /realtime-sync\.service\.ts$/,
];

function isInRealtimeVertical(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.endsWith('.spec.ts')) return false;
  return REALTIME_VERTICAL_PATTERNS.some((pattern) => pattern.test(normalized));
}

function findLcovFiles(dir = 'coverage') {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const found = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      found.push(...findLcovFiles(fullPath));
    } else if (entry === 'lcov.info') {
      found.push(fullPath);
    }
  }
  return found;
}

function parseLcov(content) {
  const records = [];
  let current = null;

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('SF:')) {
      current = { file: line.slice(3), lines: { found: 0, hit: 0 }, branches: { found: 0, hit: 0 } };
      records.push(current);
    } else if (current && line.startsWith('LF:')) {
      current.lines.found = parseInt(line.slice(3), 10) || 0;
    } else if (current && line.startsWith('LH:')) {
      current.lines.hit = parseInt(line.slice(3), 10) || 0;
    } else if (current && line.startsWith('BRF:')) {
      current.branches.found = parseInt(line.slice(4), 10) || 0;
    } else if (current && line.startsWith('BRH:')) {
      current.branches.hit = parseInt(line.slice(4), 10) || 0;
    } else if (line === 'end_of_record') {
      current = null;
    }
  }

  return records;
}

function pct(hit, found) {
  if (found === 0) return 100;
  return (hit / found) * 100;
}

function main() {
  const lcovFiles = findLcovFiles();
  if (lcovFiles.length === 0) {
    console.error(
      '[coverage:realtime] No se encontró ningún coverage/**/lcov.info. Ejecuta `npm run test:ci` primero.'
    );
    process.exit(1);
  }

  const allRecords = lcovFiles.flatMap((path) => parseLcov(readFileSync(path, 'utf8')));
  const verticalRecords = allRecords.filter((r) => isInRealtimeVertical(r.file));

  if (verticalRecords.length === 0) {
    console.error(
      '[coverage:realtime] Ningún archivo de src/app/core/realtime/** (ni helper realtime-sync) apareció en el reporte de cobertura.\n' +
        'Esto normalmente significa que ningún spec importa esos archivos, o que el path del vertical cambió.'
    );
    process.exit(1);
  }

  let linesFound = 0;
  let linesHit = 0;
  let branchesFound = 0;
  let branchesHit = 0;

  console.log('[coverage:realtime] Archivos evaluados:');
  for (const r of verticalRecords) {
    linesFound += r.lines.found;
    linesHit += r.lines.hit;
    branchesFound += r.branches.found;
    branchesHit += r.branches.hit;
    console.log(
      `  - ${r.file.replace(/\\/g, '/')}  ` +
        `lines ${pct(r.lines.hit, r.lines.found).toFixed(1)}%  ` +
        `branches ${pct(r.branches.hit, r.branches.found).toFixed(1)}%`
    );
  }

  const linePct = pct(linesHit, linesFound);
  const branchPct = pct(branchesHit, branchesFound);

  console.log('');
  console.log(
    `[coverage:realtime] TOTAL LINE: ${linePct.toFixed(2)}% (${linesHit}/${linesFound})  ` +
      `threshold >= ${LINE_THRESHOLD}%`
  );
  console.log(
    `[coverage:realtime] TOTAL BRANCH: ${branchPct.toFixed(2)}% (${branchesHit}/${branchesFound})  ` +
      `threshold >= ${BRANCH_THRESHOLD}%`
  );

  const failures = [];
  if (linePct < LINE_THRESHOLD) {
    failures.push(`LINE coverage ${linePct.toFixed(2)}% < ${LINE_THRESHOLD}%`);
  }
  if (branchPct < BRANCH_THRESHOLD) {
    failures.push(`BRANCH coverage ${branchPct.toFixed(2)}% < ${BRANCH_THRESHOLD}%`);
  }

  if (failures.length > 0) {
    console.error('');
    console.error('[coverage:realtime] FAILED:');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log('');
  console.log('[coverage:realtime] PASSED');
}

main();
