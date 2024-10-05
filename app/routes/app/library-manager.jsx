// app/routes/library-manager.jsx

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig.js";
import GenreManager from "../../components/library/GenreManager";
import BookManager from "../../components/library/BookManager";

export default function LibraryManager() {
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [globalBooks, setGlobalBooks] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchAllGenres, setSearchAllGenres] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch genres, sorted by timestamp
  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      const q = query(collection(db, "bookShelves"), orderBy("createdAt"));
      const genreSnapshot = await getDocs(q);
      setGenres(
        genreSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    };
    fetchGenres();
  }, []);

  // Fetch books based on selected genre or globally if "View All Books" is selected
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      if (selectedGenreId === "all" || searchAllGenres) {
        const booksSnapshot = await getDocs(collection(db, "books"));
        const allBooks = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGlobalBooks(allBooks);
        setFilteredBooks(allBooks);
      } else {
        const booksRef = collection(db, "books");
        const q = query(booksRef, where("shelfId", "==", selectedGenreId));
        const booksSnapshot = await getDocs(q);
        const genreBooks = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(genreBooks);
        setFilteredBooks(genreBooks);
      }
      setLoading(false);
    };
    fetchBooks();
  }, [selectedGenreId, searchAllGenres]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-primary-dark">
          Welcome to the Digital Library Management System
        </h1>
        <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
          Easily manage your library's genres and books with our
          professional-grade library management system.
        </p>
      </header>

      {/* Genre Management */}
      <GenreManager
        genres={genres}
        setGenres={setGenres}
        selectedGenreId={selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        setLoading={setLoading}
        loading={loading}
      />

      {/* Book Management */}
      <BookManager
        genres={genres}
        books={books}
        setBooks={setBooks}
        globalBooks={globalBooks}
        setGlobalBooks={setGlobalBooks}
        filteredBooks={filteredBooks}
        setFilteredBooks={setFilteredBooks}
        selectedGenreId={selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        searchAllGenres={searchAllGenres}
        setSearchAllGenres={setSearchAllGenres}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}
