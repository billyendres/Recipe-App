import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig.js";

export default function LibraryManager() {
  // State Variables
  const [genres, setGenres] = useState([]);
  const [newGenre, setNewGenre] = useState("");
  const [editingGenre, setEditingGenre] = useState(null);
  const [editingGenreName, setEditingGenreName] = useState("");
  const [loadingGenreId, setLoadingGenreId] = useState(null);

  const [selectedGenreId, setSelectedGenreId] = useState("all");
  const [books, setBooks] = useState([]);
  const [globalBooks, setGlobalBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBook, setNewBook] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [editingBookTitle, setEditingBookTitle] = useState("");
  const [loadingBookId, setLoadingBookId] = useState(null);
  const [searchAllGenres, setSearchAllGenres] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maxGenreError, setMaxGenreError] = useState("");
  const [addBookError, setAddBookError] = useState("");

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

  // Filter books based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(
        selectedGenreId === "all" || searchAllGenres ? globalBooks : books
      );
    } else {
      const targetBooks =
        selectedGenreId === "all" || searchAllGenres ? globalBooks : books;
      const filtered = targetBooks.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books, globalBooks, selectedGenreId, searchAllGenres]);

  // Add a new genre with timestamp and update state immediately
  const addGenre = async () => {
    setMaxGenreError("");
    if (genres.length >= 5) {
      setMaxGenreError("Maximum of 5 genres allowed in the library.");
      // Automatically hide the error message after 3 seconds
      setTimeout(() => setMaxGenreError(""), 3000);
      return;
    }

    if (newGenre.trim() !== "") {
      setLoading(true);
      const newShelf = await addDoc(collection(db, "bookShelves"), {
        name: newGenre,
        createdAt: serverTimestamp(),
      });
      setGenres((prevGenres) => [
        ...prevGenres,
        { id: newShelf.id, name: newGenre, createdAt: new Date() },
      ]);
      setNewGenre("");
      setMaxGenreError(""); // Clear any error
      setLoading(false);
    }
  };

  // Edit an existing genre and update state immediately
  const editGenre = async (id, newName) => {
    setLoadingGenreId(id);
    const genreDoc = doc(db, "bookShelves", id);
    await updateDoc(genreDoc, { name: newName });
    setGenres((prevGenres) =>
      prevGenres.map((genre) =>
        genre.id === id ? { ...genre, name: newName } : genre
      )
    );
    setEditingGenre(null);
    setLoadingGenreId(null);
  };

  // Add a new book to the selected genre and update state immediately
  const addBook = async () => {
    setAddBookError("");
    if (selectedGenreId === "all") {
      setAddBookError("Select a genre to add a book.");
      return;
    }

    if (newBook.trim() !== "" && selectedGenreId) {
      setLoading(true);
      const newBookDoc = await addDoc(collection(db, "books"), {
        title: newBook,
        shelfId: selectedGenreId,
        createdAt: serverTimestamp(),
      });
      const addedBook = {
        id: newBookDoc.id,
        title: newBook,
        shelfId: selectedGenreId,
        createdAt: new Date(),
      }; // Set createdAt to Date object to prevent "Invalid Date"
      if (selectedGenreId === "all" || searchAllGenres) {
        setGlobalBooks((prevBooks) => [...prevBooks, addedBook]);
      } else {
        setBooks((prevBooks) => [...prevBooks, addedBook]);
      }
      setFilteredBooks((prevBooks) => [...prevBooks, addedBook]);
      setNewBook("");
      setLoading(false);
    }
  };

  // Edit an existing book and update state immediately
  const editBook = async (id, newTitle) => {
    setLoadingBookId(id);
    const bookDoc = doc(db, "books", id);
    await updateDoc(bookDoc, { title: newTitle });
    const updatedBooks =
      selectedGenreId === "all" || searchAllGenres ? globalBooks : books;
    const updatedBookList = updatedBooks.map((book) =>
      book.id === id ? { ...book, title: newTitle } : book
    );
    if (selectedGenreId === "all" || searchAllGenres) {
      setGlobalBooks(updatedBookList);
    } else {
      setBooks(updatedBookList);
    }
    setFilteredBooks(updatedBookList);
    setEditingBook(null);
    setLoadingBookId(null);
  };

  // Delete a book and update state immediately
  const removeBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setLoadingBookId(id);
      await deleteDoc(doc(db, "books", id));
      if (selectedGenreId === "all" || searchAllGenres) {
        const updatedGlobalBooks = globalBooks.filter((book) => book.id !== id);
        setGlobalBooks(updatedGlobalBooks);
        setFilteredBooks(updatedGlobalBooks);
      } else {
        const updatedBooks = books.filter((book) => book.id !== id);
        setBooks(updatedBooks);
        setFilteredBooks(updatedBooks);
      }
      setLoadingBookId(null);
    }
  };

  // Delete a genre and its books, and update state immediately
  const removeGenre = async (genreId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this genre and all its books?"
      )
    ) {
      setLoadingGenreId(genreId);
      const booksRef = collection(db, "books");
      const q = query(booksRef, where("shelfId", "==", genreId));
      const booksSnapshot = await getDocs(q);
      booksSnapshot.docs.forEach(async (book) => {
        await deleteDoc(doc(db, "books", book.id));
      });

      await deleteDoc(doc(db, "bookShelves", genreId));
      setGenres((prevGenres) =>
        prevGenres.filter((genre) => genre.id !== genreId)
      );
      if (selectedGenreId === genreId) setSelectedGenreId("all"); // Go back to "All Books"
      setGlobalBooks((prevBooks) =>
        prevBooks.filter((book) => book.shelfId !== genreId)
      );
      setFilteredBooks((prevBooks) =>
        prevBooks.filter((book) => book.shelfId !== genreId)
      );
      setLoadingGenreId(null);
    }
  };

  // Handle key presses for adding genre and book
  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  // Handle toggle for "Search All Genres"
  const handleSearchAllGenres = () => {
    setSearchAllGenres((prev) => !prev);
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-primary-dark">
          Welcome to the Digital Library Management System
        </h1>
        <p className="text-xl text-center text-gray-700 max-w-3xl mx-auto">
          Easily manage your library's genres and books with our
          professional-grade library management system. Add new genres, update
          book details, and keep your library collection organized effortlessly.
        </p>
      </header>

      {/* Genre Management Section */}
      <section className="mb-16 bg-white p-8 rounded-lg border-2 border-gray-200">
        <h2 className="text-3xl font-semibold mb-6">Manage Your Genres</h2>
        <p className="mb-4 text-gray-600">
          Organize your books by genre. You can create new genres, edit existing
          ones, or remove them entirely. Click on a genre to view books specific
          to that genre.
        </p>
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addGenre)}
            placeholder="Create a new genre"
            className="border p-3 rounded-lg w-96"
          />
          <button
            onClick={addGenre}
            className="bg-secondary text-white p-3 rounded-lg"
            disabled={genres.length >= 6}
          >
            Add Genre
          </button>
        </div>
        {maxGenreError && (
          <p className="text-red-500 text-sm mb-4">{maxGenreError}</p>
        )}

        {/* Genre List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* View All Books */}
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer ${
              selectedGenreId === "all"
                ? "border-primary bg-primary-light text-white"
                : "border-gray-200 bg-white"
            } transition duration-200 ease-in-out transform hover:scale-105`}
            onClick={() => setSelectedGenreId("all")}
          >
            <span className="text-xl font-semibold">View All Books</span>
            <p className="text-white-500 text-sm mt-2">
              Browse our full collection of titles.
            </p>
          </div>

          {/* User-Added Genres */}
          {genres.map((genre) => (
            <div
              key={genre.id}
              className={`p-6 rounded-lg border-2 ${
                selectedGenreId === genre.id
                  ? "border-primary bg-white text-black"
                  : "border-gray-200 bg-white"
              } transition duration-200 ease-in-out transform hover:scale-105 cursor-pointer`}
              onClick={() => setSelectedGenreId(genre.id)}
            >
              {editingGenre === genre.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={editingGenreName}
                    onChange={(e) => setEditingGenreName(e.target.value)}
                    onKeyPress={(e) =>
                      handleKeyPress(e, () =>
                        editGenre(genre.id, editingGenreName)
                      )
                    }
                    className="border p-2 rounded bg-gray-100 w-full mr-2 text-black"
                  />
                  <button
                    onClick={() => editGenre(genre.id, editingGenreName)}
                    className="ml-2 text-secondary-dark bg-secondary px-3 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setEditingGenre(null)}
                    className="ml-2 text-red-500 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xl font-semibold">{genre.name}</span>

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingGenre(genre.id);
                        setEditingGenreName(genre.name);
                      }}
                      className="text-sm text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGenre(genre.id);
                      }}
                      className="text-sm text-red-500 ml-2"
                      disabled={loadingGenreId === genre.id}
                    >
                      {loadingGenreId === genre.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Book Management Section */}
      <section className="bg-white p-8 rounded-lg border-2 border-gray-200">
        <h2 className="text-3xl font-semibold mb-6">Manage Your Books</h2>
        <p className="mb-4 text-gray-600">
          Add, edit, or delete books from your library. You can also search for
          specific books within the selected genre or across all genres.
        </p>
        {selectedGenreId !== "all" && (
          <p className="mb-4 text-gray-500">
            Viewing books in{" "}
            <span className="font-semibold">
              {genres.find((genre) => genre.id === selectedGenreId)?.name}
            </span>
          </p>
        )}

        {/* Book Form and Search */}
        <div className="flex items-center mb-4 space-x-4">
          <input
            type="text"
            value={newBook}
            onChange={(e) => setNewBook(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addBook)}
            className="border p-3 rounded-lg w-96"
            placeholder="New book title..."
          />
          <button
            onClick={addBook}
            className="bg-primary text-white p-3 rounded-lg"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Book"}
          </button>
        </div>
        {addBookError && (
          <p className="text-red-500 text-sm mb-4">{addBookError}</p>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a book..."
            className="border p-3 rounded-lg w-96 mb-2"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchAllGenres}
                onChange={handleSearchAllGenres}
                className="mr-2"
              />
              Search All Genres
            </label>
          </div>
        </div>

        {/* Book List */}
        <ul className="list-disc pl-5 space-y-3">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => {
              const bookGenre = genres.find(
                (genre) => genre.id === book.shelfId
              );
              return (
                <li
                  key={book.id}
                  className="flex flex-col justify-between bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  {editingBook === book.id ? (
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={editingBookTitle}
                        onChange={(e) => setEditingBookTitle(e.target.value)}
                        onKeyPress={(e) =>
                          handleKeyPress(e, () =>
                            editBook(book.id, editingBookTitle)
                          )
                        }
                        className="border p-2 rounded w-full mr-2 text-black bg-gray-100"
                      />
                      <button
                        onClick={() => editBook(book.id, editingBookTitle)}
                        className="text-sm text-secondary-dark bg-secondary px-3 py-1 rounded mr-2"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setEditingBook(null)}
                        className="text-sm text-red-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                          {book.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {bookGenre
                            ? `Genre: ${bookGenre.name}`
                            : "Unknown Genre"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {book.createdAt?.seconds ? (
                          <>
                            Added on:{" "}
                            {new Date(
                              book.createdAt.seconds * 1000
                            ).toLocaleDateString()}
                          </>
                        ) : (
                          <>Recently Added</>
                        )}
                      </div>
                      <div className="mt-2 flex justify-end space-x-4">
                        <button
                          onClick={() => {
                            setEditingBook(book.id);
                            setEditingBookTitle(book.title);
                          }}
                          className="text-primary-dark"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeBook(book.id)}
                          className="text-red-500"
                          disabled={loadingBookId === book.id}
                        >
                          {loadingBookId === book.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })
          ) : (
            <p className="text-gray-500">No books found in this genre.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
