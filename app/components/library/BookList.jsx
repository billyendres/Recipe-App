export default function BookList({
  genres,
  filteredBooks,
  setEditingBook,
  editingBook,
  setEditingBookTitle,
  editingBookTitle,
  editBook,
  removeBook,
  loadingBookId,
}) {
  // Handle key presses for editing book titles
  const handleKeyPress = (e, id) => {
    if (e.key === "Enter") {
      editBook(id, editingBookTitle);
    }
  };

  return (
    <ul className="list-disc pl-5 space-y-3">
      {filteredBooks.length > 0 ? (
        filteredBooks.map((book) => {
          const bookGenre = genres.find((genre) => genre.id === book.shelfId);

          return (
            <li
              key={book.id}
              className="flex flex-col justify-between bg-white p-4 rounded-lg border border-gray-200 hover:border-primary transition-colors duration-200"
            >
              {editingBook === book.id ? (
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={editingBookTitle}
                    onChange={(e) => setEditingBookTitle(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, book.id)}
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
                      {bookGenre ? `Genre: ${bookGenre.name}` : "Unknown Genre"}
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
  );
}
