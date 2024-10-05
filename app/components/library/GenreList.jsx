export default function GenreList({
  genres,
  selectedGenreId,
  setSelectedGenreId,
  editingGenre,
  setEditingGenre,
  editingGenreName,
  setEditingGenreName,
  editGenre,
  removeGenre,
  loadingGenreId,
}) {
  const handleKeyPress = (e, id) => {
    if (e.key === "Enter") {
      editGenre(id, editingGenreName);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* View All Books Option */}
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
                onKeyPress={(e) => handleKeyPress(e, genre.id)}
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
  );
}
