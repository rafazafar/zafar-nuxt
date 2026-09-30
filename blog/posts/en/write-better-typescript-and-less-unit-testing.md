---
title: "Better TypeScript, more useful tests"
description: "Use types to reduce duplicate checks while keeping runtime validation and tests for behavior."
date: 2025-01-28
image: https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 3
---

I prefer to let TypeScript catch a wrong argument before I need to write a test for it. Clear types reduce repetitive checks and make refactoring easier. They also leave more time for tests that exercise behavior.

That matters when test code can be as large as production code, or even three times its size. Maintaining a test suite is real work. I want each test to tell me something the compiler cannot.

> *Tests are good; impossible states are better — Richard Feldman*

The useful idea here is to design types that exclude invalid combinations. Within correctly typed code, there are then fewer states to handle. Data arriving from outside the application still needs validation.

<figure class="concept concept--split">
<div class="concept-title">Three checks with different jobs</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18"/></svg><strong>Type checking</strong><span>Are typed values used consistently?</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6"/></svg><strong>Runtime validation</strong><span>Does incoming data match the contract?</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l5 5L20 6"/></svg><strong>Behavior tests</strong><span>Does the program do the right thing?</span></li>
</ol>
<figcaption>Use each check for the question it can answer.</figcaption>
</figure>

## Give props and state clear shapes

React components receive props and keep state. Interfaces let the compiler check the types used at those boundaries:

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

These types require a string for `name`, a number for `age`, a boolean for `isMale`, and a number for `count`. Tests do not need to repeat those declarations just to check their types.

But the following tests ask different questions:

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

A type declaration does not prove that the component renders or that `count` starts at zero. Keep tests for behavior that matters. The opportunity is to remove duplicate type checks, not every test near a typed interface.

## Describe the event a handler accepts

An event handler type makes the callback contract clear:

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

The callback accepts a mouse event from a button. TypeScript can check that signature at a typed call site. It cannot prove that a user action actually invokes the callback.

That is why this behavior test can still be useful:

```ts
it('calls onClick handler when button is clicked', () => {
  const handleClick = jest.fn();
  const wrapper = shallow(<MyComponent onClick={handleClick} />);
  wrapper.find('button').simulate('click');
  expect(handleClick).toHaveBeenCalled();
});
```

It checks the connection between the button and the callback. The function's type alone does not check that connection at runtime.

## Treat an API response as a separate boundary

Shared data transfer object (DTO) types help frontend and backend developers change an API together. When a field changes, the compiler can identify affected typed code. That makes refactoring easier and reduces the pressure to retain obsolete shapes.

This example shows the intended response type, but it also shows a limit of assertions:

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

The declaration names `UserDto`, while the assertion names `User`. Those names should refer to the intended contract. More importantly, neither the return annotation nor `as User` validates the JSON. TypeScript removes assertions during compilation; they do not perform a runtime check. The [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions) explains this limit.

Keep a validation step at the boundary when the response cannot be trusted to match the type. A test with a known response remains useful too:

```ts
it('fetches user data and returns the correct object', async () => {
  const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
  fetch.mockResponseOnce(JSON.stringify(expectedUser));
  const user = await fetchUser(1);
  expect(user).toEqual(expectedUser);
});
```

This test checks one expected response. It does not establish how the function handles malformed data or a failed request.

## Restrict the shapes of Redux actions

A union of action types lets each action carry the payload it needs:

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

`FETCH_USER` carries an ID. `RECEIVE_USER` carries a user. The `UserAction` union lets the compiler distinguish those cases and reject mismatched payloads in checked code.

Tests still have work to do: checking dispatch, state changes, and error handling. Clear types narrow that work to behavior rather than repeating the permitted object shapes.

## Keep feedback available during development

My preference is to let developers run tests and use previews while they resolve type errors, where the project allows it. The main branch and production release should still have the required type checks.

Use the compiler for the rules it can check. Use runtime validation for incoming data. Use tests to check what the program does. That division makes the suite more useful without asking types to prove more than they can.
