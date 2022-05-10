import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import {
  GetCollectionsDocument,
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  GetCollectionDocument,
  useGetCollectionQuery,
  Task,
  useUpdateTaskMutation,
  useCreateTaskMutation,
} from "./../generated/apollo-hooks";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  Link,
} from "react-router-dom";

type MainProps = {
  appName: string;
};

const Home: React.FC<MainProps> = ({ appName }) => {
  const [input, setInput] = useState<string>();
  const {
    data: collectionsData,
    loading: collectionsLoading,
    error,
  } = useGetCollectionsQuery();

  const [createCollection] = useCreateCollectionMutation();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (input) {
      void createCollection({
        variables: {
          collectionName: input,
        },
        refetchQueries: [{ query: GetCollectionsDocument }],
        awaitRefetchQueries: true,
      });
      setInput("");
    }
  };

  if (collectionsLoading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <h2>{appName}</h2>
      <h3>Create a new collection</h3>
      <form>
        <input onChange={handleInput} value={input} type="text" />
        <button onClick={handleSubmit} type="submit">
          Create
        </button>
      </form>
      <h3>Existing collections</h3>
      {collectionsData?.getCollections ? (
        <ul>
          {collectionsData?.getCollections
            .filter(
              Boolean as unknown as <T>(x: T | null | undefined) => x is T
            )
            .map((collection) => (
              <li key={collection.id}>
                <Link to={`collection/${collection.name}`}>
                  {collection.name}
                </Link>
              </li>
            ))}
        </ul>
      ) : (
        <div>None</div>
      )}
    </>
  );
};

type TaskMode = "read" | "edit";

const TaskEditMode: React.FC<{
  collectionName: string;
  task: Task;
  setMode: React.Dispatch<React.SetStateAction<TaskMode>>;
}> = ({ collectionName, task: { id, name, tags }, setMode }) => {
  const [taskName, setTaskName] = useState(name);
  const [taskTags, setTaskTags] = useState(
    tags && tags?.length > 0 ? tags.join(", ") : ""
  );

  const [updateTask] = useUpdateTaskMutation();

  const handleTaskNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTaskName(e.target.value);
  };

  const handleTaskTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTaskTags(e.target.value);
  };

  const handleSubmit = () => {
    const tags = taskTags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => !!t);
    const name = taskName.trim();
    if (name.length !== 0) {
      void updateTask({
        variables: {
          collectionName: collectionName,
          taskId: id,
          input: {
            name: name,
            tags: tags,
          },
        },
      }).then(() => setMode("read"));
    }
  };

  const handleReset = () => {
    setMode("read");
  };

  return (
    <>
      <label htmlFor="task-name">Name: </label>
      <input
        style={{ marginBottom: "0.25rem" }}
        name="task-name"
        type="text"
        value={taskName}
        onChange={handleTaskNameInput}
      ></input>
      <label htmlFor="task-tags">Tags(comma separated list): </label>
      <input
        style={{ marginBottom: "0.25rem" }}
        name="task-tags"
        type="text"
        value={taskTags}
        onChange={handleTaskTagInput}
      ></input>
      <div>
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
        <button type="reset" onClick={handleReset}>
          Cancel
        </button>
      </div>
    </>
  );
};

const Task: React.FC<{ collectionName: string; task: Task }> = ({
  collectionName,
  task: { id, name, complete, tags },
}) => {
  const [mode, setMode] = useState<TaskMode>("read");
  const [updateTask] = useUpdateTaskMutation();
  return (
    <div
      style={{
        margin: "1rem 0rem 0rem 0rem",
        padding: "0.5rem 0.5rem 0.5rem 0.5rem",
        minWidth: "20rem",
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "flex-start",
        borderStyle: "ridge",
        position: "relative",
      }}
    >
      {mode === "read" ? (
        <>
          <button
            style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}
            onClick={() => {
              setMode("edit");
            }}
          >
            Edit
          </button>
          <div style={{ marginBottom: "0.25rem" }}>{name}</div>
          <div style={{ marginBottom: "0.25rem" }}>
            Tags: {tags && tags.length > 0 ? tags?.join(", ") : "No tags"}
          </div>
          <div style={{ marginBottom: "0.25rem" }}>
            Status: {complete ? "Done" : "In progress"}
          </div>
          {complete ? (
            <button
              onClick={() => {
                void updateTask({
                  variables: {
                    collectionName,
                    taskId: id,
                    input: {
                      complete: false,
                    },
                  },
                });
              }}
            >
              Mark uncomplete
            </button>
          ) : (
            <button
              onClick={() => {
                void updateTask({
                  variables: {
                    collectionName,
                    taskId: id,
                    input: {
                      complete: true,
                    },
                  },
                });
              }}
            >
              Mark Complete
            </button>
          )}
        </>
      ) : (
        <TaskEditMode
          collectionName={collectionName}
          task={{ id, name, complete, tags }}
          setMode={setMode}
        />
      )}
    </div>
  );
};

const Collection: React.FC = () => {
  const params = useParams();
  const [taskName, setTaskName] = useState("");
  const [searchTerms, setSearchTerms] = useState("");
  const { collectionName } = params;
  const { data, loading } = useGetCollectionQuery({
    variables: {
      name: collectionName as string,
    },
  });
  const [createTask] = useCreateTaskMutation();

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTaskName(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (taskName) {
      void createTask({
        variables: {
          collectionName: collectionName as string,
          input: {
            name: taskName,
          },
        },
        refetchQueries: [
          {
            query: GetCollectionDocument,
            variables: {
              name: collectionName,
            },
          },
        ],
        awaitRefetchQueries: true,
      });
      setTaskName("");
    }
  };

  if (loading) {
    return <div>Loading collection...</div>;
  }
  return (
    <>
      <div>
        <p>Create a new task</p>
        <form>
          <label htmlFor="task-name">Task name: </label>
          <br />
          <input
            id="name"
            name="task-name"
            value={taskName}
            onChange={handleNameInput}
          />
          <br />
          <button onClick={handleSubmit} type="submit">
            Create
          </button>
        </form>
      </div>
      <p>Search tasks based on name or tag</p>
      <input
        value={searchTerms}
        onChange={(e) => {
          e.preventDefault();
          setSearchTerms(e.target.value);
        }}
      ></input>
      {data?.getCollection?.tasks ? (
        <>
          {data.getCollection.tasks
            .filter(
              Boolean as unknown as <T>(x: T | null | undefined) => x is T
            )
            .filter((task) => {
              const lowerCasedSearchTerm = searchTerms.toLowerCase();
              return searchTerms
                ? task.name.toLowerCase().includes(lowerCasedSearchTerm) ||
                    task.tags?.some(
                      (tag) => tag.toLowerCase() === lowerCasedSearchTerm
                    )
                : true;
            })
            .map((task) => (
              <Task collectionName={collectionName as string} task={task} />
            ))}
        </>
      ) : (
        <>Error</>
      )}
    </>
  );
};

const PageWrapper: React.FC = ({ children }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
      <div className="left-padding" />
      <div
        className="content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </div>
      <div className="right-padding" />
    </div>
  );
};

const App: React.FC = () => {
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "http://localhost:3000/graphql",
  });
  return (
    <ApolloProvider client={apolloClient}>
      <PageWrapper>
        <Router>
          <Routes>
            <Route path="/" element={<Home appName="Collections App" />} />
            <Route path="collection/:collectionName" element={<Collection />} />
          </Routes>
        </Router>
      </PageWrapper>
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
