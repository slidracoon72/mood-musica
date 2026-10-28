# Deezer playlist search terms for each emotion detected by face-api.js.
# Searching at request time keeps recommendations working even when
# individual playlists are removed.
mood_queries = {
    'happy': ['happy hits', 'feel good', 'good vibes', 'happy pop', 'summer hits'],
    'sad': ['sad songs', 'heartbreak', 'sad pop', 'ballads', 'rainy day'],
    'angry': ['calm down', 'chill out', 'chill vibes', 'stress relief', 'calm piano'],
    'surprised': ['party hits', 'dance hits', 'upbeat', 'club hits', 'pop hits'],
    'neutral': ['chill hits', 'lofi', 'indie chill', 'acoustic covers', 'easy listening'],
    'fearful': ['calming music', 'peaceful', 'relaxing', 'ambient', 'soothing'],
    'disgusted': ['mood booster', 'feel good', 'feel good pop', 'positive vibes', 'happy hits'],
}

# Playlists with these words in the title are seasonal and rarely fit a mood
excluded_playlist_words = ['christmas', 'xmas', 'noël', 'noel', 'navidad', 'weihnacht', 'halloween']

suggestion_texts = {
    'happy': "You're looking HAPPY 😀 Keep smiling! Let's play:",
    'sad': "It seems you're feeling SAD 😞 Here's a comforting song for you.",
    'angry': "Feeling ANGRY? 😡 Take a deep breath and relax with this music.",
    'surprised': "You look SURPRISED 😮 Here's an exciting song for you.",
    'neutral': "You're feeling NEUTRAL 😐 Here's something to keep you balanced.",
    'fearful': "Feeling FEARFUL 😨 Listen to this calming music.",
    'disgusted': "You seem DISGUSTED 😒 Let's change your mood with some refreshing music."
}
