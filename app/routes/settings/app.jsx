import { useLoaderData } from "@remix-run/react";
import sanityClient from "../../../sanityClient";

export const loader = async () => {
  const query = `*[_type == "author"]{
    _id,
    name,
    slug,
    image{
      asset->{
        url
      }
    },
    bio
  }`;

  const authors = await sanityClient.fetch(query);

  return { authors };
};

export default function App() {
  const { authors } = useLoaderData();

  return (
    <div>
      <h1>App</h1>
      {authors.map((author) => (
        <div key={author._id}>
          <h2>{author.name}</h2>
          <p>{author.bio && author.bio[0]?.children[0]?.text}</p>
        </div>
      ))}
    </div>
  );
}
