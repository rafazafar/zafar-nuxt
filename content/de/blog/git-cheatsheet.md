---
title: "Git Cheatsheet: Essential Commands for Developers"
description: A comprehensive reference guide to Git commands and workflows for developers of all experience levels, with tips to avoid common mistakes.
date: 2022-04-23
image: https://images.unsplash.com/photo-1556075798-4825dfaaf498?q=80&w=800
minRead: 5
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---

## Basic Commands

- `git init`: Initialize a new Git repository
- `git clone <repository>`: Clone an existing repository
- `git add <file>`: Add a file to the staging area
- `git commit -m "<message>"`: Commit changes with a message
- `git push`: Push changes to the remote repository
- `git pull`: Pull changes from the remote repository
- `git status`: Check the status of the repository

## Branching

- `git branch <branch>`: Create a new branch
- `git checkout <branch>`: Switch to a different branch
- `git merge <branch>`: Merge a branch into the current branch
- `git branch -d <branch>`: Delete a branch

## Other Useful Commands

- `git log`: View the commit history
- `git diff`: View the changes made in the repository
- `git reset <file>`: Unstage a file
- `git stash`: Save changes temporarily
- `git stash pop`: Restore the most recently stashed changes

## Basic Workflow

1. Make changes to your local repository: Create or edit files, add them to the staging area using `git add`, and then commit the changes using `git commit`.
2. Push your changes to the remote repository: Use `git push` to send your committed changes to the remote repository.
3. Update your local repository with changes from the remote repository: Use `git pull` to fetch and merge changes from the remote repository into your local repository.

## Branching Workflow

1. Create a new branch: Use `git branch <branch>` to create a new branch.
2. Switch to the new branch: Use `git checkout <branch>` to switch to the new branch.
3. Make changes and commit them as usual.
4. Merge the branch into the main branch: When you are ready to incorporate the changes from your new branch into the main branch (usually master), switch back to the main branch using `git checkout <branch>` and then use `git merge <branch>` to merge the changes from your new branch into the main branch.

## Undo a Commit That's Already Pushed

If you want to leave the original commit in place, but just undo the changes it made, you can use the `git revert` command to create a new commit that undoes the changes made by the original commit. For example:

```
git revert <commit-hash>
```

This will create a new commit that undoes the changes made in the original commit. You can then push the revert commit to the remote repository to undo the changes on the remote.

## Common Developer Mistakes When Using Git

### Forgetting to Commit Changes

It's important to commit your changes regularly so that you have a record of the progress you have made. If you forget to commit your changes, you may lose your work if something goes wrong.

### Not Committing Often Enough

On the other hand, it's also important to commit your changes often enough so that you don't have too many changes in a single commit. Large commits can be harder to review and troubleshoot if there are problems.

Try to commit at least once per hour.

### Not Branching

It's a good idea to use branches when working on new features or making significant changes to your codebase. This helps to keep your main branch (usually master) stable and allows you to work on multiple features at the same time.

### Not Keeping the Main Branch Clean

It's important to keep your main branch (usually master) clean and only include well-tested code. This makes it easier to roll back changes if necessary and reduces the risk of introducing bugs into your codebase.

### Not Reviewing Changes Before Merging

It's a good idea to review changes before merging them into the main branch, especially if you are working with a team. This helps to ensure that the code is of high quality and does not introduce any issues.
