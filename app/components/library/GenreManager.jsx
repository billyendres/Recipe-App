import { useState } from "react";
import {
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  collection,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig.js";
import GenreList from "./GenreList";

export default function GenreManager({
  genres,
  setGenres,
  selectedGenreId,
  setSelectedGenreId,
  setLoading,
  loading,
}) {
  const [newGenre, setNewGenre] = useState("");
  const [editingGenre, setEditingGenre] = useState(null);
  const [editingGenreName, setEditingGenreName] = useState("");
  const [loadingGenreId, setLoadingGenreId] = useState(null);
  const [maxGenreError, setMaxGenreError] = useState("");

  // Function to add a new genre
  const addGenre = async () => {
    setMaxGenreError("");
    if (genres.length >= 5) {
      setMaxGenreError("Maximum of 5 genres allowed in the library.");
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
      setLoading(false);
    }
  };

  // Function to edit an existing genre
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

  // Function to delete a genre
  const removeGenre = async (genreId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this genre and all its books?"
      )
    ) {
      setLoadingGenreId(genreId);
      const genreDoc = doc(db, "bookShelves", genreId);
      await deleteDoc(genreDoc);
      setGenres((prevGenres) =>
        prevGenres.filter((genre) => genre.id !== genreId)
      );
      if (selectedGenreId === genreId) setSelectedGenreId("all");
      setLoadingGenreId(null);
    }
  };

  // Handle key presses for adding and editing genres
  const handleKeyPress = (e, action) => {
    if (e.key === "Enter") action();
  };

  return (
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
      <GenreList
        genres={genres}
        selectedGenreId={selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        editingGenre={editingGenre}
        setEditingGenre={setEditingGenre}
        editingGenreName={editingGenreName}
        setEditingGenreName={setEditingGenreName}
        editGenre={editGenre}
        removeGenre={removeGenre}
        loadingGenreId={loadingGenreId}
      />
    </section>
  );
}
