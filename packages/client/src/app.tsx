import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import {
  GetCollectionsDocument,
  useGetCollectionsQuery,
  useCreateCollectionMutation,
  useGetCollectionQuery,
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
        <input onChange={handleInput} value={input} type="text"></input>
        <button onClick={handleSubmit} type="submit">
          Button
        </button>
      </form>
      <h3>Existing collections</h3>
      {collectionsData?.getCollections ? (
        <ul>
          {collectionsData?.getCollections.map((name) => (
            <li key={name}>
              <Link to={`collection/${name as string}`}>{name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>None</div>
      )}
    </>
  );
};

const Collection: React.FC = () => {
  const params = useParams();
  const { collectionId } = params;
  console.log(collectionId);
  return <>Params</>;
};

const App: React.FC = () => {
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "http://localhost:3000/graphql",
  });
  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home appName="Collections App" />} />
          <Route path="collection/:collectionId" element={<Collection />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
