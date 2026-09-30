---
title: "Bessere TypeScript-Typen, sinnvollere Tests"
description: "Doppelte Typprüfungen vermeiden und Validierung sowie Verhaltenstests gezielt einsetzen."
date: 2025-01-28
image: https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1
minRead: 2
---

Ich lasse einen falschen Argumenttyp lieber vom Compiler finden, bevor ich dafür einen Test schreiben muss. Klare TypeScript-Typen reduzieren wiederholte Prüfungen und erleichtern Änderungen am Code. Für Verhalten bleiben Tests nötig.

Das lohnt sich besonders, wenn Testcode so umfangreich wie der Produktivcode oder sogar dreimal so groß wird. Jeder Test verursacht Pflegeaufwand. Er sollte deshalb etwas prüfen, das der Compiler nicht schon abdeckt.

> *Tests sind gut; unmögliche Zustände sind besser – Richard Feldman*

Die Idee dahinter: Typen können ungültige Kombinationen im geprüften Code ausschließen. So gibt es weniger Zustände zu behandeln. Daten von außerhalb der Anwendung brauchen trotzdem eine Validierung.

<figure class="concept concept--split">
<div class="concept-title">Drei Prüfungen, drei Aufgaben</div>
<ol class="concept-nodes" role="list">
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18"/></svg><strong>Typprüfung</strong><span>Werden Typen konsistent verwendet?</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6"/></svg><strong>Validierung</strong><span>Passen eingehende Daten zum Vertrag?</span></li>
<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12l5 5L20 6"/></svg><strong>Verhaltenstests</strong><span>Tut das Programm das Richtige?</span></li>
</ol>
<figcaption>Jede Prüfung beantwortet eine andere Frage.</figcaption>
</figure>

## Props und State beschreiben

Interfaces legen fest, welche Formen Props und State einer React-Komponente haben:

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

Hier erwartet der Compiler einen String für `name`, eine Zahl für `age`, einen Boolean für `isMale` und eine Zahl für `count`. Tests müssen diese Typdeklarationen nicht wiederholen.

Die folgenden Tests prüfen allerdings andere Eigenschaften:

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

Ein Typ beweist weder, dass die Komponente rendert, noch dass `count` anfangs null ist. Sinnvolle Verhaltenstests bleiben bestehen. Einsparen lassen sich Prüfungen, die lediglich Typregeln doppeln.

## Den Vertrag eines Event-Handlers festlegen

Der Callback kann den erwarteten Ereignistyp ausdrücklich nennen:

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

Die Signatur beschreibt ein Mausereignis auf einem Button. Sie beweist nicht, dass ein Klick den Callback wirklich auslöst. Dafür kann dieser Test weiterhin sinnvoll sein:

```ts
it('calls onClick handler when button is clicked', () => {
  const handleClick = jest.fn();
  const wrapper = shallow(<MyComponent onClick={handleClick} />);
  wrapper.find('button').simulate('click');
  expect(handleClick).toHaveBeenCalled();
});
```

Er prüft die Verbindung zwischen Button und Handler zur Laufzeit.

## API-Antworten gesondert prüfen

Gemeinsame DTO-Typen helfen Frontend und Backend bei Änderungen. Ändert sich ein Feld, kann der Compiler betroffene Stellen im typisierten Code zeigen. Das erleichtert Refactoring und den Abbau alter Datenstrukturen.

Das folgende Beispiel beschreibt die gewünschte Antwort, zeigt aber auch die Grenze einer Typbehauptung:

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

Die Rückgabe nennt `UserDto`, die Assertion dagegen `User`. Beide Namen sollten zum vorgesehenen Vertrag passen. Vor allem prüft weder die Annotation noch `as User` die empfangenen JSON-Daten. Assertions werden beim Kompilieren entfernt. Das erklärt das [TypeScript-Handbuch](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions).

Wenn die Antwort nicht verlässlich zum Typ passt, ist eine Prüfung an dieser Grenze nötig. Auch ein Test mit einer bekannten Antwort bleibt nützlich:

```ts
it('fetches user data and returns the correct object', async () => {
  const expectedUser = { id: 1, name: 'John', email: 'john@example.com' };
  fetch.mockResponseOnce(JSON.stringify(expectedUser));
  const user = await fetchUser(1);
  expect(user).toEqual(expectedUser);
});
```

Dieser Test deckt eine erwartete Antwort ab. Fehlerhafte Daten und fehlgeschlagene Requests sind weitere Fälle.

## Redux-Aktionen eingrenzen

Mit einer Union bekommt jede Aktion ihre passende Payload:

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

`FETCH_USER` enthält eine ID, `RECEIVE_USER` einen Nutzer. `UserAction` erlaubt dem Compiler, die Fälle zu unterscheiden und falsche Payloads im geprüften Code abzulehnen.

Tests prüfen weiterhin Dispatch, Zustandsänderungen und Fehlerbehandlung. Sie müssen nicht dieselben Objektformen noch einmal beschreiben.

## Rückmeldungen während der Entwicklung ermöglichen

Ich möchte Tests und Vorschauen möglichst auch nutzen können, während Typfehler noch behoben werden. Für Hauptbranch und Produktion müssen die vorgesehenen Typprüfungen trotzdem gelten.

Der Compiler prüft Typregeln, die Validierung prüft eingehende Daten und Tests prüfen Verhalten. Mit dieser Aufteilung bleibt der Nutzen klar, ohne von TypeScript mehr zu erwarten, als es leisten kann.
