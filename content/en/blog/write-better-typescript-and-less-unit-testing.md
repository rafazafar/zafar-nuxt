---
title: Write better Typescript and less Unit Testing
description: Why designing digital experiences that encourage users to slow down
  and engage deeply can lead to more meaningful interactions and better
  outcomes.
date: 2025-01-28
image: https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 7
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---
I’ve found that using strong and well-defined TypeScript typings can greatly reduce the need for extensive unit testing. While testing is an essential part of software development, it can, no, it will often be time-consuming and can slow down the development process tremendously. With well-typed code, we prevent many errors before they even happen.

By doing so, we can catch a lot of errors at compile-time, before they make it to testing/production. This not only saves time and effort, but it also makes our code more reliable and easier to maintain.

That being said, I don’t want to suggest that testing is not important. On the contrary, unit testing is still a crucial part of software development. However, by using TypeScript, we can reduce the amount of testing that needs to be done.

Remember, the ratio between the production code and the test code could be anywhere between 1:1 and 1:3.

> *Tests are good; impossible states are better — Richard Feldman*

In addition, TypeScript allows us to use the concept of “impossible states.” Impossible states are states that are impossible to reach because they are prevented by our typings. By using it, we can eliminate a lot of unnecessary testing, as we know that these states can never happen, and therefore, don’t need to be tested.

---

Heres common examples of how using better TypeScript typings in React can be more efficient than extensive unit testing:

## 1. Type-checking props and state
In React, components often receive props and manage their own state. Without TypeScript, it can be difficult to ensure that the correct data types are being used for props and state. This can lead to runtime errors and a need for extensive unit testing.

With TypeScript, however, we can define interfaces for our props and state, which can catch errors at compile-time and eliminate the need for some unit tests. For example:

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

By defining these interfaces, we can ensure that the correct data types are being used for our props and state, which can catch errors at compile-time and make our code more reliable.

Instead of :

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

## 2. Defining event handlers

Event handlers are often used to handle user interactions, such as clicks or form submissions. Without TypeScript, it can be difficult to ensure that event handlers are defined correctly and handle the correct types of events.

With TypeScript, however, we can define types for our event handlers, which can catch errors at compile-time and eliminate the need for some unit tests. For example:

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

By defining the onClick prop with a type that includes the React.MouseEvent type, we can ensure that the event handler is defined correctly and handles the correct types of events, which can make our code more reliable and reduce the need for unit tests.

Without TypeScript typings, we would need to write unit tests to ensure that event handlers are defined correctly and handle the correct types of events.

```ts
it('calls onClick handler when button is clicked', () => {
  const handleClick = jest.fn();
  const wrapper = shallow(<MyComponent onClick={handleClick} />);
  wrapper.find('button').simulate('click');
  expect(handleClick).toHaveBeenCalled();
});
```

## 3. Type-checking external APIs

For any app/webapp it’s common to use external APIs, such as REST APIs or GraphQL APIs, to retrieve data for our components. Without TypeScript, it can be difficult to ensure that the correct data types are being used throughout the app. This makes refactoring code an absolute nightmare.

Using types, Backend/API developers will also be less restricted knowing the frontend can quickly grab the new DTO and quckly update frontend code. This ensure less legacy bloat and faster development cycle.

For example:
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

By defining the User interface for the API response, we can ensure that the correct data types are being used for the API response, which can catch errors at compile-time and make our code more reliable.

Without TS , we would need to write unit tests to ensure that the correct data types are being used for the API responses. For example:

```ts
it('fetches user data and returns the correct object', async () => {
  const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
  fetch.mockResponseOnce(JSON.stringify(expectedUser));
  const user = await fetchUser(1);
  expect(user).toEqual(expectedUser);
});
```


## 4. Type-checking Redux actions
When using Redux to manage state in a web application, it’s important to ensure that the actions are well-typed and consistent. Without TypeScript, we might need to write extensive unit tests to ensure that the actions are being dispatched correctly and handling errors appropriately.

Instead, we can define interfaces for our Redux actions. For example:

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

By defining the UserAction interface for the Redux actions, we can ensure that the actions are well-typed and consistent, which can catch errors at compile-time and make our code more reliable.

In summary, using better TypeScript typings will help catch errors at compile-time, make our code more reliable, and eliminate the need for some unit tests. By ensuring that the correct data types are being used for props, state, event handlers, and API responses, we can reduce cost and make ship happen faster

Important Note: Please dont block testing/preview CICD just because of Type errors. Blocking main or production sure but dont slowdown developers testing prematurely. Happy coding!