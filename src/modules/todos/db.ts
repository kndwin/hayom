import {
  createEvolu,
  NonEmptyString1000,
  SqliteBoolean,
  database,
  id,
  useQuery,
  useEvolu,
  cast,
  table,
} from "@evolu/react";

const TodoId = id("Todo");
type TodoId = typeof TodoId.Type;

const TodoTable = table({
  id: TodoId,
  title: NonEmptyString1000,
  isCompleted: SqliteBoolean,
  isFocused: SqliteBoolean,
});

type TodoTable = typeof TodoTable.Type;

const Database = database({
  todo: TodoTable,
});
type Database = typeof Database.Type;

export const evolu = createEvolu(Database);

// Create a typed SQL query. Yes, with autocomplete and type-checking.
const allTodos = evolu.createQuery((db) =>
  db
    .selectFrom("todo")
    .selectAll()
    // SQLite doesn't support the boolean type, but we have `cast` helper.
    .where("isDeleted", "is not", cast(true))
    .orderBy("createdAt")
);

// Load the query. Batched and cached by default.
evolu.loadQuery(allTodos);

// React Helper Functions

// Use the query in React reactively (it's updated on a mutation).
export function useAllTodos() {
  const { rows } = useQuery(allTodos);
  return rows;
}

export function useTodoActions() {
  const { create, update } = useEvolu<Database>();

  return {
    create: (todo: Pick<TodoTable, "title" | "isCompleted" | "isFocused">) =>
      create("todo", todo),
    remove: (id: TodoId) => {
      update("todo", { id, isDeleted: true });
    },
    update: (todo: Partial<TodoTable> & { id: TodoId }) => {
      update("todo", todo);
    },
  };
}
