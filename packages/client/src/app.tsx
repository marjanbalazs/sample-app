import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  useMutation,
} from "@apollo/client";
import {
  GetCollectionsDocument,
  GetCollectionsQuery,
  GetCollectionsQueryVariables,
  CreateCollectionDocument,
  CreateCollectionMutation,
  CreateCollectionMutationVariables,
  useGetCollectionsQuery,
} from "sample-app-graphql-schema/src/generated/apollo-hooks";

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "http://localhost:3000/graphql",
});

const App: React.FC = () => {
  const { data, loading, error } = useGetCollectionsQuery();
  const [
    createCollection,
    { data: createData, loading: createLoading, error: createError },
  ] = useMutation<CreateCollectionMutation, CreateCollectionMutationVariables>(
    CreateCollectionDocument,
    {
      refetchQueries: [{ query: GetCollectionsDocument }],
    }
  );
  if (loading) {
    return <div>"Loading..."</div>;
  }
  return (
    <div>
      {data?.getCollections ? (
        <ul>
          {data.getCollections?.map((name) => (
            <li>{name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
