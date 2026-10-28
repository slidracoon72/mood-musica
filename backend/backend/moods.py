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
