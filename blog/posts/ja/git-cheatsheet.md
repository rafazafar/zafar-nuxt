---
title: "日々の作業で使うGitコマンド"
description: "変更の記録、ブランチ、一時保存、共有済みコミットの取り消しに使うコマンドをまとめます。"
date: 2022-04-23
image: https://images.unsplash.com/photo-1556075798-4825dfaaf498?q=80&w=800
minRead: 3
---

普段のGit作業は、ファイルを変更し、コミットに含める変更を選び、記録して共有する流れです。それぞれの段階を分けて考えると、コマンドの役割が分かりやすくなります。

<figure class="concept concept--flow">
<div class="concept-title">変更が記録されるまでの流れ</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h7l5 5v13H7z M14 3v6h5 M10 13h6 M10 17h6"/></svg><strong>作業ファイル</strong><span>ファイルを編集する</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l5 5L20 6"/></svg><strong>ステージ</strong><span>git addで変更を選ぶ</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 6c0-4 18-4 18 0s-18 4-18 0v12c0 4 18 4 18 0V6 M3 12c0 4 18 4 18 0"/></svg><strong>ローカル履歴</strong><span>git commitで記録する</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18a4 4 0 0 1-1-8 7 7 0 0 1 13-1 4.5 4.5 0 0 1 0 9z"/></svg><strong>リモート</strong><span>git pushで共有する</span></li>
</ol>
<figcaption>ステージでは次の記録に含める変更を選びます。コミットだけではリモートへ送信されません。</figcaption>
</figure>

## 作業を始めて、状態を確認する

- `git init`：現在のディレクトリにリポジトリを作成します。
- `git clone <repository>`：既存のリポジトリを複製します。
- `git status`：現在のブランチとファイルの状態を確認します。
- `git diff`：追跡中のファイルにある、未ステージの変更を確認します。
- `git log`：コミット履歴を確認します。

コミットやブランチの切り替えの前に、変更がどこにあるかを確認します。

## 変更を記録して共有する

`git add <file>`で、次のコミットに含める変更をステージします。`git commit -m "<message>"`でローカルの履歴に記録し、`git push`でリモートリポジトリへ送信します。

リモートの変更を現在のブランチに取り込むときは、`git pull`を使います。取得した変更の統合方法は、設定とオプションによって変わります。

編集、ステージ、コミット、プッシュの順に進めます。作業中も、チームの変更を取り込んでブランチを更新します。

## ブランチで作業する

- `git branch <branch>`：ブランチを作成します。
- `git checkout <branch>`：指定したブランチへ切り替えます。
- `git merge <branch>`：指定したブランチを現在のブランチへマージします。
- `git branch -d <branch>`：Gitのマージ確認条件を満たすブランチを削除します。

新機能では、ブランチを作成して切り替えてから、変更とコミットを行います。テストとレビューが終わったら、プロジェクトのメインブランチへ戻り、作業ブランチをマージします。

`git merge`が変更するのは、現在いるブランチです。実行前に確認してください。

## 途中の作業を一時的に退避する

`git reset <file>`は、変更をステージから外します。作業ファイルの変更は残るため、ステージする範囲を間違えたときに使えます。

`git stash`は、ローカルの変更を一時保存します。`git stash pop`は、最新の保存内容を適用し、成功した場合にその保存内容を削除します。別の作業を先に行う必要があるときに役立ちます。

## 共有済みのコミットを取り消す

`git revert`は、指定したコミットの変更を取り消す、新しいコミットを作成します。

```
git revert <commit-hash>
```

作成したコミットをプッシュすると、取り消しをチームと共有できます。元のコミットと取り消しの両方が履歴に残ります。

## レビューできる大きさで記録する

未コミットの作業には、戻れるコミット履歴がありません。私は、作業中は少なくとも1時間ごとのコミットを目安にしています。同時に、一つのコミットを一つのまとまった変更にします。変更が大きいほど、レビューと原因調査が難しくなるためです。

新機能や大きな変更にはブランチを使い、メインブランチへマージする前に確認とテストを行います。メインブランチが安定していれば、他のメンバーが作業を始めやすく、必要なときに変更を戻しやすくなります。
