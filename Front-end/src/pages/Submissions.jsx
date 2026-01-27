import React from 'react';
import MovieForm from '../components/MovieForm';

export default function Submission() {
  const handleFinalSubmit = (data) => {
    console.log("Données collectées pour l'API :", data);
    alert("Formulaire soumis avec succès (Check la console) !");
  };

  return (
    <div className="submission-page">
      <div className="movieForm-container">
        <MovieForm onFinalSubmit={handleFinalSubmit} />
      </div>
    </div>
  );
}