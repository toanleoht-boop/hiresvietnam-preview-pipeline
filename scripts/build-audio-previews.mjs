import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value.slice(2), all[index + 1]] : null).filter(Boolean));
const jobPath = resolve(args.job || 'preview-job.json');
const outputRoot = resolve(args.output || 'preview-dist');

if (!existsSync(jobPath)) throw new Error(`Không tìm thấy job: ${jobPath}`);
const job = JSON.parse(readFileSync(jobPath, 'utf8'));
if (!job.albumSlug || !Array.isArray(job.tracks) || job.tracks.length === 0) throw new Error('Job cần albumSlug và danh sách tracks.');

const albumDir = resolve(outputRoot, job.albumSlug);
rmSync(albumDir, { recursive: true, force: true });
mkdirSync(albumDir, { recursive: true });

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error(`${command} thất bại với mã ${result.status}`);
}

function safeName(value, fallback) {
  return String(value || fallback)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 80) || fallback;
}

const manifestTracks = [];
for (const [index, track] of job.tracks.entries()) {
  const sourceUrl = track.mp3Url || track.sourceUrl || track.hiresUrl || track.driveUrl;
  if (!sourceUrl) throw new Error(`Bài ${index + 1} chưa có URL nguồn.`);

  const number = String(index + 1).padStart(2, '0');
  const fileName = `${number}-${safeName(track.title, `track-${number}`)}.mp3`;
  const sourcePath = resolve(albumDir, `.source-${number}`);
  const outputPath = resolve(albumDir, fileName);

  console.log(`\n[${index + 1}/${job.tracks.length}] ${track.title}`);
  if (/drive\.google\.com|docs\.google\.com/.test(sourceUrl)) {
    run('gdown', [sourceUrl, '-O', sourcePath]);
  } else {
    run('curl', ['-L', '--fail', '--retry', '3', sourceUrl, '-o', sourcePath]);
  }

  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(track.previewStart ?? job.previewStart ?? 15),
    '-i', sourcePath,
    '-t', String(track.previewDuration ?? job.previewDuration ?? 90),
    '-vn', '-map_metadata', '-1', '-codec:a', 'libmp3lame', '-b:a', String(job.bitrate || '160k'),
    outputPath
  ]);
  rmSync(sourcePath, { force: true });

  manifestTracks.push({
    trackId: track.id || '',
    title: track.title || basename(fileName, '.mp3'),
    previewUrl: `https://toanleoht-boop.github.io/hiresvietnam-preview-pipeline/previews/${job.albumSlug}/${fileName}`
  });
}

writeFileSync(resolve(albumDir, 'manifest.json'), JSON.stringify({
  version: 1,
  albumSlug: job.albumSlug,
  generatedAt: new Date().toISOString(),
  tracks: manifestTracks
}, null, 2));

console.log(`\nĐã tạo ${manifestTracks.length} preview tại ${albumDir}`);
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((value, index, all) => value.startsWith('--') ? [value.slice(2), all[index + 1]] : null).filter(Boolean));
const jobPath = resolve(args.job || 'preview-job.json');
const outputRoot = resolve(args.output || 'preview-dist');

if (!existsSync(jobPath)) throw new Error(`Không tìm thấy job: ${jobPath}`);
const job = JSON.parse(readFileSync(jobPath, 'utf8'));
if (!job.albumSlug || !Array.isArray(job.tracks) || job.tracks.length === 0) throw new Error('Job cần albumSlug và danh sách tracks.');

const albumDir = resolve(outputRoot, job.albumSlug);
rmSync(albumDir, { recursive: true, force: true });
mkdirSync(albumDir, { recursive: true });

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error(`${command} thất bại với mã ${result.status}`);
}

function safeName(value, fallback) {
  return String(value || fallback)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 80) || fallback;
}

const manifestTracks = [];
for (const [index, track] of job.tracks.entries()) {
  const sourceUrl = track.mp3Url || track.sourceUrl || track.hiresUrl || track.driveUrl;
  if (!sourceUrl) throw new Error(`Bài ${index + 1} chưa có URL nguồn.`);

  const number = String(index + 1).padStart(2, '0');
  const fileName = `${number}-${safeName(track.title, `track-${number}`)}.mp3`;
  const sourcePath = resolve(albumDir, `.source-${number}`);
  const outputPath = resolve(albumDir, fileName);

  console.log(`\n[${index + 1}/${job.tracks.length}] ${track.title}`);
  if (/drive\.google\.com|docs\.google\.com/.test(sourceUrl)) {
    run('gdown', [sourceUrl, '-O', sourcePath]);
  } else {
    run('curl', ['-L', '--fail', '--retry', '3', sourceUrl, '-o', sourcePath]);
  }

  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-ss', String(track.previewStart ?? job.previewStart ?? 15),
    '-i', sourcePath,
    '-t', String(track.previewDuration ?? job.previewDuration ?? 90),
    '-vn', '-map_metadata', '-1', '-codec:a', 'libmp3lame', '-b:a', String(job.bitrate || '160k'),
    outputPath
  ]);
  rmSync(sourcePath, { force: true });

  manifestTracks.push({
    trackId: track.id || '',
    title: track.title || basename(fileName, '.mp3'),
    previewUrl: `/previews/${job.albumSlug}/${fileName}`
  });
}

writeFileSync(resolve(albumDir, 'manifest.json'), JSON.stringify({
  version: 1,
  albumSlug: job.albumSlug,
  generatedAt: new Date().toISOString(),
  tracks: manifestTracks
}, null, 2));

console.log(`\nĐã tạo ${manifestTracks.length} preview tại ${albumDir}`);
