import { For, createEffect, createSignal, type Component } from 'solid-js';
import logo from './logo.svg';

const createSocket = () => {
  const socket = new WebSocket(
    import.meta.env.VITE_WEBSOCKET_SERVER_URL as string
  );
  const [isOnline, setIsOnline] = createSignal(false);

  socket.onopen = () => {
    setIsOnline(true);
  };

  socket.onclose = () => {
    setIsOnline(false);
  };

  return { socket, isOnline };
};

const App: Component = () => {
  const { socket, isOnline } = createSocket();
  const [todos, setTodos] = createSignal<{ id: number; text: string }[]>([]);

  createEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'todos') {
        setTodos(data.payload);
      }
    };
  });

  const createTodo = (todoText: string) => {
    const data = JSON.stringify({
      type: 'createTodo',
      payload: { text: todoText },
    });
    socket.send(data);
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const formData = new FormData(target);
    const text = formData.get('todoName') as string;
    createTodo(text);
    target.reset();
  };

  return (
    <main class="container">
      <figure>
        <img src={logo} alt="logo" width={320} />
      </figure>
      {isOnline() ? <p>Online</p> : <p>Offline</p>}
      <h1>Todos</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" name="todoName" placeholder="Enter a todo" />
        <button type="submit">Add Todo</button>
      </form>

      <ul>
        <For each={todos()} fallback={<li>Loading...</li>}>
          {(todo) => <li>{todo.text}</li>}
        </For>
      </ul>
    </main>
  );
};

export default App;
