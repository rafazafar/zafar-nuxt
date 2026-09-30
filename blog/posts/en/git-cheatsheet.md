---
title: "The Git commands I keep close by"
description: "A short reference for everyday changes, branches, temporary work, and undoing a shared commit."
date: 2022-04-23
image: https://images.unsplash.com/photo-1556075798-4825dfaaf498?q=80&w=800
minRead: 2
---

Most everyday Git work follows a short path: edit files, choose what belongs in a commit, record it, and share it. I find the commands easier to remember when I keep those steps separate.

<figure class="concept concept--flow">
<div class="concept-title">Where your changes go</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h7l5 5v13H7z M14 3v6h5 M10 13h6 M10 17h6"/></svg><strong>Working files</strong><span>Edit your files.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l5 5L20 6"/></svg><strong>Staging area</strong><span>git add selects changes.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0"/></svg><strong>Local history</strong><span>git commit records them.</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9z"/></svg><strong>Remote</strong><span>git push shares commits.</span></li>
</ol>
<figcaption>Staging selects the next snapshot. A local commit does not send it to the remote.</figcaption>
</figure>

## Start a repository and check your work

- `git init`: Create a repository in the current directory.
- `git clone <repository>`: Copy an existing repository.
- `git status`: Check the current branch and file states.
- `git diff`: Read changes in tracked files that you have not staged.
- `git log`: Read the commit history.

Check the state before making a commit or changing branches. It is easier to choose the next command when you know where your changes are.

## Record and share a change

Use `git add <file>` to stage the changes you want in the next commit. Then use `git commit -m "<message>"` to record them locally. `git push` sends your commits to the remote repository.

To bring remote changes into your current branch, use `git pull`. It fetches and integrates changes; the integration method depends on your configuration and options.

The normal workflow is to edit, stage, commit, and push. Keep your branch up to date with the team's work as you go.

## Work on a branch

- `git branch <branch>`: Create a branch.
- `git checkout <branch>`: Switch to that branch.
- `git merge <branch>`: Merge the named branch into your current branch.
- `git branch -d <branch>`: Delete a branch when Git's merge checks allow it.

For a feature, create a branch and switch to it. Make and commit the changes there. When the work is ready, switch back to your project's main branch and merge the feature branch into it.

The current branch matters: `git merge` changes the branch you are on.

## Set unfinished work aside

`git reset <file>` removes a file's changes from the staging area while keeping the working copy. It is useful when you staged more than you intended.

`git stash` temporarily stores local changes. `git stash pop` applies the most recent stash and removes it if the application succeeds. These commands help when you need to interrupt one piece of work for another.

## Undo a commit that is already shared

Use `git revert` when you want a new commit that reverses an earlier commit while keeping the history:

```
git revert <commit-hash>
```

Push the revert commit to share that reversal with the team. The original commit remains in the history, along with the explanation of how it was undone.

## Keep commits small enough to review

Uncommitted work has no commit history to return to. I try to commit at least once an hour while working, but a useful commit should also describe one coherent change. Large batches make review and fault finding harder.

Use branches for features and significant changes. Review and test the work before merging it into the main branch. Keeping that branch stable makes a later rollback easier and gives teammates a reliable starting point.
