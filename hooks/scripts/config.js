// https://git-scm.com/docs/githooks

module.exports = {
  hooks: [
    'applypatch-msg',
    'pre-applypatch',
    'post-applypatch',
    'pre-commit',
    'prepare-commit-msg',
    'commit-msg',
    'post-commit',
    'pre-rebase',
    'post-checkout',
    'post-merge',
    'pre-push',
    'pre-receive',
    'update',
    'post-receive',
    'post-update',
    'push-to-checkout',
    'pre-auto-gc',
    'post-rewrite',
    'rebase',
    'sendemail-validate',
    'fsmonitor-watchman'
  ]
}
