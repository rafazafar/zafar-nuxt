---
title: "TypeScriptの型を改善して、必要なテストに集中する"
description: "型検査と重複する確認を減らし、外部データの検証と動作テストを適切に使い分けます。"
date: 2025-01-28
image: https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 3
---

引数の型が違うなら、テストを書く前にTypeScriptのコンパイラに見つけてほしいと思います。明確な型は、同じ確認の繰り返しを減らし、コードの変更も助けます。その分、動作を確かめるテストに時間を使えます。

テストコードの量が本番コードと同程度になり、場合によっては3倍になることもあります。テストにも保守が必要です。一つひとつが、コンパイラでは確認できない内容を確かめるものにしたいと考えています。

> *テストは良いものです。不可能な状態はさらに良いものです。— リチャード・フェルドマン*

型で無効な組み合わせを表せなくすると、型検査の対象となるコードで扱う状態を減らせます。ただし、アプリの外から来るデータには、別途検証が必要です。

<figure class="concept concept--split">
<div class="concept-title">3つの確認を使い分ける</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18"/></svg><strong>型検査</strong><span>型の使い方が一致しているか</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6"/></svg><strong>実行時の検証</strong><span>受信データが契約に合っているか</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l5 5L20 6"/></svg><strong>動作テスト</strong><span>プログラムが意図どおり動くか</span></li>
</ol>
<figcaption>それぞれが確認できる内容に合わせて使います。</figcaption>
</figure>

## propsとstateの形を定義する

Reactのコンポーネントが受け取るpropsと、保持するstateをインターフェイスで定義します。

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

この定義では、`name`は文字列、`age`は数値、`isMale`は真偽値、`count`は数値です。これらの型の確認を、テストで繰り返す必要はありません。

ただし、次のテストは別の内容を確認しています。

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

型定義だけでは、コンポーネントが描画されることや、`count`の初期値が0であることは分かりません。必要な動作のテストは残します。減らせるのは、型の規則を重複して確認する部分です。

## イベントハンドラーの契約を定義する

コールバックが受け取るイベントの型を明示します。

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

この型は、ボタンのマウスイベントを受け取る関数を表します。クリックによって、その関数が実際に呼ばれることまでは証明しません。

そのため、次の動作テストには意味があります。

```ts
it('calls onClick handler when button is clicked', () => {
  const handleClick = jest.fn();
  const wrapper = shallow(<MyComponent onClick={handleClick} />);
  wrapper.find('button').simulate('click');
  expect(handleClick).toHaveBeenCalled();
});
```

このテストは、ボタンとコールバックが実行時につながっているかを確認します。

## API応答は境界で検証する

データ転送オブジェクト（DTO）の型を共有すると、フロントエンドとバックエンドでAPIの変更を扱いやすくなります。フィールドが変わったとき、コンパイラが影響するコードを示せるためです。古い形式を残し続ける負担も減らせます。

次の例には、期待する型と、型アサーションの限界が表れています。

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

戻り値は`UserDto`ですが、アサーションは`User`です。名前は、意図した契約に合わせる必要があります。さらに、戻り値の型注釈も`as User`も、受信したJSONを検証しません。型アサーションはコンパイル時に除去されます。この制約は、[TypeScriptハンドブック](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)で説明されています。

外部データが型と一致すると保証できない場合は、受信する境界で検証します。既知の応答を使うテストも役立ちます。

```ts
it('fetches user data and returns the correct object', async () => {
  const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
  fetch.mockResponseOnce(JSON.stringify(expectedUser));
  const user = await fetchUser(1);
  expect(user).toEqual(expectedUser);
});
```

このテストが確認するのは、期待した応答の一例です。不正なデータや要求の失敗は、別の確認項目です。

## Reduxアクションの組み合わせを制限する

アクション型のユニオンを使うと、種類ごとに必要なペイロードを定義できます。

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

`FETCH_USER`にはID、`RECEIVE_USER`にはユーザーが入ります。`UserAction`によって、コンパイラは種類とペイロードの対応を確認できます。

ディスパッチ、状態変更、エラー処理は、引き続きテストで確認します。型を明確にすると、テストを動作の確認に集中させやすくなります。

## 開発中も確認を進められるようにする

私は、型エラーを修正している間も、プロジェクトの条件が許す範囲でテストとプレビューを利用できるようにしたいと考えています。メインブランチと本番リリースでは、必要な型検査を実施します。

型の規則はコンパイラ、外部データは実行時の検証、動作はテストで確認します。役割を分けると、必要な確認を残しながら重複を減らせます。
