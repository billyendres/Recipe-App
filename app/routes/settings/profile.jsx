import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig.js";

export default function BookManager() {
  // State for bookshelves
  const [bookShelves, setBookShelves] = useState([]);
  const [newBookShelf, setNewBookShelf] = useState("");
  const [editingShelf, setEditingShelf] = useState(null); // Track the shelf being edited

  // State for books within a selected shelf
  const [selectedShelfId, setSelectedShelfId] = useState(null);
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState("");
  const [editingBook, setEditingBook] = useState(null); // Track the book being edited

  // Fetch bookshelves from Firestore
  useEffect(() => {
    const fetchBookShelves = async () => {
      const bookShelvesSnapshot = await getDocs(collection(db, "bookShelves"));
      setBookShelves(
        bookShelvesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchBookShelves();
  }, []);

  // Fetch books when a shelf is selected
  useEffect(() => {
    if (selectedShelfId) {
      const fetchBooks = async () => {
        const booksRef = collection(db, "books");
        const q = query(booksRef, where("shelfId", "==", selectedShelfId));
        const booksSnapshot = await getDocs(q);
        setBooks(
          booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      };
      fetchBooks();
    }
  }, [selectedShelfId]);

  // Add a new bookshelf
  const addBookShelf = async () => {
    if (newBookShelf.trim() !== "") {
      await addDoc(collection(db, "bookShelves"), { name: newBookShelf });
      setNewBookShelf("");
      const bookShelvesSnapshot = await getDocs(collection(db, "bookShelves"));
      setBookShelves(
        bookShelvesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    }
  };

  // Edit an existing bookshelf
  const editBookShelf = async (id, newName) => {
    const shelfDoc = doc(db, "bookShelves", id);
    await updateDoc(shelfDoc, { name: newName });
    const bookShelvesSnapshot = await getDocs(collection(db, "bookShelves"));
    setBookShelves(
      bookShelvesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    setEditingShelf(null);
  };

  // Add a new book to the selected shelf
  const addBook = async () => {
    if (newBook.trim() !== "" && selectedShelfId) {
      await addDoc(collection(db, "books"), {
        title: newBook,
        shelfId: selectedShelfId,
      });
      setNewBook("");
      const booksRef = collection(db, "books");
      const q = query(booksRef, where("shelfId", "==", selectedShelfId));
      const booksSnapshot = await getDocs(q);
      setBooks(
        booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    }
  };

  // Edit an existing book
  const editBook = async (id, newTitle) => {
    const bookDoc = doc(db, "books", id);
    await updateDoc(bookDoc, { title: newTitle });
    const booksRef = collection(db, "books");
    const q = query(booksRef, where("shelfId", "==", selectedShelfId));
    const booksSnapshot = await getDocs(q);
    setBooks(booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setEditingBook(null);
  };

  // Remove a book
  const removeBook = async (id) => {
    await deleteDoc(doc(db, "books", id));
    setBooks(books.filter((book) => book.id !== id));
  };

  // Remove a bookshelf and all its books
  const removeBookShelf = async (shelfId) => {
    // Delete all books in the shelf
    const booksRef = collection(db, "books");
    const q = query(booksRef, where("shelfId", "==", shelfId));
    const booksSnapshot = await getDocs(q);
    booksSnapshot.docs.forEach(async (book) => {
      await deleteDoc(doc(db, "books", book.id));
    });

    // Delete the shelf itself
    await deleteDoc(doc(db, "bookShelves", shelfId));
    setBookShelves(bookShelves.filter((shelf) => shelf.id !== shelfId));
    setBooks([]);
    setSelectedShelfId(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bookshelf Manager</h1>

      {/* Bookshelf Management */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Bookshelves</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={newBookShelf}
            onChange={(e) => setNewBookShelf(e.target.value)}
            className="border p-2 rounded mr-2"
            placeholder="New bookshelf name..."
          />
          <button
            onClick={addBookShelf}
            className="bg-green-500 text-white p-2 rounded"
          >
            Add Bookshelf
          </button>
        </div>
        <ul className="list-disc pl-5">
          {bookShelves.map((shelf) => (
            <li key={shelf.id} className="mb-2">
              {editingShelf === shelf.id ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    defaultValue={shelf.name}
                    onBlur={(e) => editBookShelf(shelf.id, e.target.value)}
                    className="border p-2 rounded"
                  />
                  <button
                    onClick={() => setEditingShelf(null)}
                    className="ml-2 text-red-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span
                    className={`cursor-pointer ${
                      selectedShelfId === shelf.id ? "font-bold" : ""
                    }`}
                    onClick={() => setSelectedShelfId(shelf.id)}
                  >
                    {shelf.name}
                  </span>
                  <div>
                    <button
                      onClick={() => setEditingShelf(shelf.id)}
                      className="text-blue-500 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeBookShelf(shelf.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Book Management for Selected Shelf */}
      {selectedShelfId && (
        <div>
          <h2 className="text-xl font-semibold">Books in Shelf</h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={newBook}
              onChange={(e) => setNewBook(e.target.value)}
              className="border p-2 rounded mr-2"
              placeholder="New book title..."
            />
            <button
              onClick={addBook}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Add Book
            </button>
          </div>
          <ul className="list-disc pl-5">
            {books.map((book) => (
              <li
                key={book.id}
                className="flex justify-between items-center mb-2"
              >
                {editingBook === book.id ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      defaultValue={book.title}
                      onBlur={(e) => editBook(book.id, e.target.value)}
                      className="border p-2 rounded"
                    />
                    <button
                      onClick={() => setEditingBook(null)}
                      className="ml-2 text-red-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{book.title}</span>
                    <div>
                      <button
                        onClick={() => setEditingBook(book.id)}
                        className="text-blue-500 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeBook(book.id)}
                        className="text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
