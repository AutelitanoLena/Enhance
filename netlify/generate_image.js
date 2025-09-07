// Ce fichier est une fonction sans serveur de Netlify (Netlify Function)
// Son rôle est d'appeler l'API de Google de manière sécurisée sans exposer la clé API.

// On importe la bibliothèque de client Google AI Studio
const { GoogleGenerativeAI } = require("@google/generative-ai");

// La clé API est lue depuis les variables d'environnement de Netlify.
// Cela garantit qu'elle n'est jamais visible dans le code public.
const API_KEY = process.env.GOOGLE_API_KEY;

exports.handler = async (event, context) => {
    // Vérifier si la méthode de la requête est POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Méthode non autorisée. Seules les requêtes POST sont acceptées.'
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        // Initialiser l'API avec la clé sécurisée
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });

        // Générer l'image
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // La réponse de l'API contient les images encodées en base64
        const imageData = response.candidates[0].images[0];
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                // Permettre l'accès depuis n'importe quel domaine
                'Access-Control-Allow-Origin': '*', 
            },
            body: JSON.stringify({ image: imageData }),
        };

    } catch (error) {
        console.error('Erreur de la fonction sans serveur:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erreur lors de la génération de l\'image.', error: error.message }),
        };
    }
};
