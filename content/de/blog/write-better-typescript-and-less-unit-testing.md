---
title: Schreiben Sie besseres Typescript und weniger Unit-Tests
description: Warum das Entwerfen digitaler Erlebnisse, die Benutzer dazu anregen, langsamer zu werden und sich intensiv zu engagieren, zu bedeutungsvolleren Interaktionen und besseren Ergebnissen führen kann.
date: 2025-01-28
image: https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 7
author:
  name: Zafar
  avatar:
    src: https://r2.zafar.dev/img/profile.jpg
    alt: Zafar
---
Ich habe festgestellt, dass die Verwendung starker und gut definierter TypeScript-Typisierungen den Bedarf an umfangreichen Unit-Tests erheblich reduzieren kann. Während das Testen ein wesentlicher Bestandteil der Softwareentwicklung ist, kann es, nein, es wird oft zeitaufwändig sein und den Entwicklungsprozess enorm verlangsamen. Mit gut typisiertem Code verhindern wir viele Fehler, bevor sie überhaupt auftreten.

Dadurch können wir viele Fehler zur Kompilierungszeit abfangen, bevor sie zum Testen/in die Produktion gelangen. Dies spart nicht nur Zeit und Mühe, sondern macht unseren Code auch zuverlässiger und einfacher zu warten.

Das heißt nicht, dass ich andeuten möchte, dass Testen nicht wichtig ist. Im Gegenteil, Unit-Testing ist immer noch ein entscheidender Teil der Softwareentwicklung. Durch die Verwendung von TypeScript können wir jedoch die Menge der durchzuführenden Tests reduzieren.

Denken Sie daran, das Verhältnis zwischen dem Produktionscode und dem Testcode kann zwischen 1:1 und 1:3 liegen.

> *Tests sind gut; unmögliche Zustände sind besser – Richard Feldman*

Darüber hinaus ermöglicht uns TypeScript die Verwendung des Konzepts der „unmöglichen Zustände“. Unmögliche Zustände sind Zustände, die unmöglich zu erreichen sind, da sie durch unsere Typisierungen verhindert werden. Durch die Verwendung können wir viele unnötige Tests eliminieren, da wir wissen, dass diese Zustände niemals eintreten können und daher nicht getestet werden müssen.

---

Hier sind häufige Beispiele dafür, wie die Verwendung besserer TypeScript-Typisierungen in React effizienter sein kann als umfangreiche Unit-Tests:

## 1. Typüberprüfung von Props und State
In React empfangen Komponenten häufig Props und verwalten ihren eigenen Zustand. Ohne TypeScript kann es schwierig sein sicherzustellen, dass die richtigen Datentypen für Props und State verwendet werden. Dies kann zu Laufzeitfehlern und einem Bedarf an umfangreichen Unit-Tests führen.

Mit TypeScript können wir jedoch Schnittstellen für unsere Props und unseren State definieren, die Fehler zur Kompilierungszeit abfangen und die Notwendigkeit einiger Unit-Tests eliminieren können. Zum Beispiel:

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

Durch die Definition dieser Schnittstellen können wir sicherstellen, dass die richtigen Datentypen für unsere Props und unseren State verwendet werden, was Fehler zur Kompilierungszeit abfangen und unseren Code zuverlässiger machen kann.

Anstatt von :

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

## 2. Definieren von Event-Handlern

Event-Handler werden häufig verwendet, um Benutzerinteraktionen wie Klicks oder Formularübermittlungen zu behandeln. Ohne TypeScript kann es schwierig sein sicherzustellen, dass Event-Handler korrekt definiert sind und die richtigen Arten von Ereignissen behandeln.

Mit TypeScript können wir jedoch Typen für unsere Event-Handler definieren, die Fehler zur Kompilierungszeit abfangen und die Notwendigkeit einiger Unit-Tests eliminieren können. Zum Beispiel:

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

Durch die Definition der onClick-Prop mit einem Typ, der den React.MouseEvent-Typ enthält, können wir sicherstellen, dass der Event-Handler korrekt definiert ist und die richtigen Arten von Ereignissen behandelt, was unseren Code zuverlässiger machen und den Bedarf an Unit-Tests reduzieren kann.

Ohne TypeScript-Typisierungen müssten wir Unit-Tests schreiben, um sicherzustellen, dass Event-Handler korrekt definiert sind und die richtigen Arten von Ereignissen behandeln.

```ts
it('calls onClick handler when button is clicked', () => {
  const handleClick = jest.fn();
  const wrapper = shallow(<MyComponent onClick={handleClick} />);
  wrapper.find('button').simulate('click');
  expect(handleClick).toHaveBeenCalled();
});
```

## 3. Typüberprüfung externer APIs

Für jede App/Web-App ist es üblich, externe APIs wie REST-APIs oder GraphQL-APIs zu verwenden, um Daten für unsere Komponenten abzurufen. Ohne TypeScript kann es schwierig sein sicherzustellen, dass die richtigen Datentypen in der gesamten App verwendet werden. Dies macht das Refactoring von Code zu einem absoluten Albtraum.

Durch die Verwendung von Typen sind Backend-/API-Entwickler auch weniger eingeschränkt, da sie wissen, dass das Frontend das neue DTO schnell abrufen und den Frontend-Code schnell aktualisieren kann. Dies gewährleistet weniger Legacy-Ballast und einen schnelleren Entwicklungszyklus.

Zum Beispiel:
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

Durch die Definition der User-Schnittstelle für die API-Antwort können wir sicherstellen, dass die richtigen Datentypen für die API-Antwort verwendet werden, was Fehler zur Kompilierungszeit abfangen und unseren Code zuverlässiger machen kann.

Ohne TS müssten wir Unit-Tests schreiben, um sicherzustellen, dass die richtigen Datentypen für die API-Antworten verwendet werden. Zum Beispiel:

```ts
it('fetches user data and returns the correct object', async () => {
  const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
  fetch.mockResponseOnce(JSON.stringify(expectedUser));
  const user = await fetchUser(1);
  expect(user).toEqual(expectedUser);
});
```


## 4. Typüberprüfung von Redux-Aktionen
Bei der Verwendung von Redux zur Verwaltung des Zustands in einer Webanwendung ist es wichtig sicherzustellen, dass die Aktionen gut typisiert und konsistent sind. Ohne TypeScript müssten wir möglicherweise umfangreiche Unit-Tests schreiben, um sicherzustellen, dass die Aktionen korrekt versendet werden und Fehler angemessen behandeln.

Stattdessen können wir Schnittstellen für unsere Redux-Aktionen definieren. Zum Beispiel:

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

Durch die Definition der UserAction-Schnittstelle für die Redux-Aktionen können wir sicherstellen, dass die Aktionen gut typisiert und konsistent sind, was Fehler zur Kompilierungszeit abfangen und unseren Code zuverlässiger machen kann.

Zusammenfassend lässt sich sagen, dass die Verwendung besserer TypeScript-Typisierungen dazu beiträgt, Fehler zur Kompilierungszeit abzufangen, unseren Code zuverlässiger zu machen und die Notwendigkeit einiger Unit-Tests zu eliminieren. Indem wir sicherstellen, dass die richtigen Datentypen für Props, State, Event-Handler und API-Antworten verwendet werden, können wir Kosten senken und die Auslieferung beschleunigen.

Wichtiger Hinweis: Bitte blockieren Sie das Testen/die Vorschau von CICD nicht nur wegen Typfehlern. Das Blockieren von Main oder Produktion ist sicher, aber verlangsamen Sie das Testen von Entwicklern nicht vorzeitig. Viel Spaß beim Codieren!
