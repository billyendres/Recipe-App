import { useState } from "react";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig.js";
import BookList from "./BookList";

export default function BookManager({
  genres,
  books,
  setBooks,
  globalBooks,
  setGlobalBooks,
  filteredBooks,
  setFilteredBooks,
  selectedGenreId,
  setSelectedGenreId,
  searchAllGenres,
  setSearchAllGenres,
  loading,
  setLoading,
}) {
  const [newBook, setNewBook] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [editingBookTitle, setEditingBookTitle] = useState("");
  const [loadingBookId, setLoadingBookId] = useState(null);
  const [addBookError, setAddBookError] = useState("");

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
      };
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

  // Filter books based on search query
  const filterBooks = (searchQuery) => {
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
  };

  // Handle key presses for adding books
  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  // Handle toggle for "Search All Genres"
  const handleSearchAllGenres = () => {
    setSearchAllGenres((prev) => !prev);
  };

  return (
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
          onChange={(e) => filterBooks(e.target.value)}
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
      <BookList
        genres={genres}
        filteredBooks={filteredBooks}
        setEditingBook={setEditingBook}
        editingBook={editingBook}
        setEditingBookTitle={setEditingBookTitle}
        editingBookTitle={editingBookTitle}
        editBook={editBook}
        removeBook={removeBook}
        loadingBookId={loadingBookId}
      />
    </section>
  );
}
