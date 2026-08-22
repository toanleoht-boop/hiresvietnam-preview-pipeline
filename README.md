# Hi-Res Việt Nam preview pipeline

Private GitHub Actions pipeline that downloads public Google Drive audio, creates 90-second MP3 previews, and publishes static files plus `manifest.json` to the existing cPanel hosting over FTPS.

Required repository secrets:

- `CPANEL_FTP_HOST`
- `CPANEL_FTP_USER`
- `CPANEL_FTP_PASSWORD`
- `CPANEL_FTP_REMOTE_ROOT`

Run **Actions → Build audio previews → Run workflow** and select a file under `preview-jobs/`.
