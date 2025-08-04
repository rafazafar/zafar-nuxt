---
title: より良いTypescriptを書き、単体テストを減らす
description: ユーザーに速度を落として深く関わることを促すデジタル体験を設計することが、より有意義なインタラクションとより良い結果につながる理由。
date: 2025-01-28
image: https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 7
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---
強力で明確に定義されたTypeScriptの型付けを使用すると、広範な単体テストの必要性を大幅に削減できることがわかりました。テストはソフトウェア開発の不可欠な部分ですが、時間がかかり、開発プロセスを大幅に遅くすることがよくあります。適切に型付けされたコードを使用すると、多くのエラーが発生する前に防ぐことができます。

そうすることで、テスト/本番に到達する前に、コンパイル時に多くのエラーをキャッチできます。これにより、時間と労力が節約されるだけでなく、コードの信頼性が高まり、保守が容易になります。

とはいえ、テストが重要ではないと示唆したいわけではありません。それどころか、単体テストは依然としてソフトウェア開発の重要な部分です。ただし、TypeScriptを使用することで、実行する必要のあるテストの量を減らすことができます。

本番コードとテストコードの比率は、1：1から1：3の範囲になる可能性があることを忘れないでください。

> *テストは良いものです。不可能な状態はさらに良いものです。— リチャード・フェルドマン*

さらに、TypeScriptでは「不可能な状態」の概念を使用できます。不可能な状態とは、型付けによって妨げられているため到達できない状態です。それを使用することで、これらの状態は決して発生しないことがわかっているため、多くの不要なテストを排除できます。

---

Reactでより良いTypeScriptの型付けを使用することが、広範な単体テストよりも効率的である一般的な例を次に示します。

## 1. propsとstateの型チェック
Reactでは、コンポーネントは多くの場合、propsを受け取り、独自のstateを管理します。TypeScriptがないと、propsとstateに正しいデータ型が使用されていることを確認するのが難しい場合があります。これにより、ランタイムエラーが発生し、広範な単体テストが必要になる可能性があります。

ただし、TypeScriptを使用すると、propsとstateのインターフェイスを定義できます。これにより、コンパイル時にエラーをキャッチし、一部の単体テストの必要性をなくすことができます。例：

```ts
interface Props {
  name: string;
  age: number;
  isMale: boolean;
}

interface State {
  count: number;
}

class MyComponent extends React.Component<Props, State> {
  // ...
}
```

これらのインターフェイスを定義することで、propsとstateに正しいデータ型が使用されていることを確認できます。これにより、コンパイル時にエラーをキャッチし、コードの信頼性を高めることができます。

代わりに：

```ts
it('renders with correct props', () => {
  const wrapper = shallow(<MyComponent name="John" age={30} isMale={true} />);
  expect(wrapper.exists()).toBe(true);
});

it('renders with correct state', () => {
  const wrapper = shallow(<MyComponent name="John" age={30} isMale={true} />);
  expect(wrapper.state()).toEqual({ count: 0 });
});
```

## 2. イベントハンドラの定義

イベントハンドラは、クリックやフォームの送信などのユーザー操作を処理するためによく使用されます。TypeScriptがないと、イベントハンドラが正しく定義され、正しい種類のイベントを処理していることを確認するのが難しい場合があります。

ただし、TypeScriptを使用すると、イベントハンドラの型を定義できます。これにより、コンパイル時にエラーをキャッチし、一部の単体テストの必要性をなくすことができます。例：

```ts
interface MyComponentProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function MyComponent(props: MyComponentProps) {
  return (
    <button onClick={props.onClick}>Click me</button>
  );
}
```

React.MouseEvent型を含む型でonClickプロパティを定義することで、イベントハンドラが正しく定義され、正しい種類のイベントを処理していることを確認できます。これにより、コードの信頼性が高まり、単体テストの必要性が減ります。

TypeScriptの型付けがないと、イベントハンドラが正しく定義され、正しい種類のイベントを処理していることを確認するために単体テストを作成する必要があります。

```ts
it('calls onClick handler when button is clicked', () => {
  const handleClick = jest.fn();
  const wrapper = shallow(<MyComponent onClick={handleClick} />);
  wrapper.find('button').simulate('click');
  expect(handleClick).toHaveBeenCalled();
});
```

## 3. 外部APIの型チェック

アプリ/ウェブアプリでは、REST APIやGraphQL APIなどの外部APIを使用してコンポーネントのデータを取得するのが一般的です。TypeScriptがないと、アプリ全体で正しいデータ型が使用されていることを確認するのが難しい場合があります。これにより、コードのリファクタリングはまったくの悪夢になります。

型を使用すると、バックエンド/ API開発者は、フロントエンドが新しいDTOをすばやく取得してフロントエンドコードをすばやく更新できることを知っているため、制限が少なくなります。これにより、レガシーの肥大化が少なくなり、開発サイクルが速くなります。

例：
```ts
interface UserDto {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(id: number): Promise<UserDto> {
  const response = await fetch(`/users/${id}`);
  const data = await response.json();
  return data as User;
}
```

API応答のUserインターフェイスを定義することで、API応答に正しいデータ型が使用されていることを確認できます。これにより、コンパイル時にエラーをキャッチし、コードの信頼性を高めることができます。

TSがないと、API応答に正しいデータ型が使用されていることを確認するために単体テストを作成する必要があります。例：

```ts
it('fetches user data and returns the correct object', async () => {
  const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
  fetch.mockResponseOnce(JSON.stringify(expectedUser));
  const user = await fetchUser(1);
  expect(user).toEqual(expectedUser);
});
```


## 4. Reduxアクションの型チェック
Webアプリケーションで状態を管理するためにReduxを使用する場合、アクションが適切に型付けされ、一貫していることを確認することが重要です。TypeScriptがないと、アクションが正しくディスパッチされ、エラーが適切に処理されていることを確認するために、広範な単体テストを作成する必要がある場合があります。

代わりに、Reduxアクションのインターフェイスを定義できます。例：

```ts
interface User {
  id: number;
  name: string;
  email: string;
}


interface FetchUserAction {
  type: 'FETCH_USER';
  payload: {
    id: number;
  };
}
interface ReceiveUserAction {
  type: 'RECEIVE_USER';
  payload: {
    user: User;
  };
}
type UserAction = FetchUserAction | ReceiveUserAction;
function fetchUser(id: number): UserAction {
  return {
    type: 'FETCH_USER',
    payload: { id }
  };
}
```

ReduxアクションのUserActionインターフェイスを定義することで、アクションが適切に型付けされ、一貫していることを確認できます。これにより、コンパイル時にエラーをキャッチし、コードの信頼性を高めることができます。

要約すると、より良いTypeScriptの型付けを使用すると、コンパイル時にエラーをキャッチし、コードの信頼性を高め、一部の単体テストの必要性をなくすのに役立ちます。props、state、イベントハンドラ、API応答に正しいデータ型が使用されていることを確認することで、コストを削減し、より速く出荷できます。

重要な注意：型エラーのためだけにテスト/プレビューCICDをブロックしないでください。メインまたは本番をブロックするのは確かですが、開発者のテストを時期尚早に遅くしないでください。ハッピーコーディング！
