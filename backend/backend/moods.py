# Deezer playlist search terms for each emotion detected by face-api.js.
# Searching at request time keeps recommendations working even when
# individual playlists are removed.
mood_queries = {
    'happy': ['happy hits', 'feel good', 'good vibes', 'happy pop', 'summer hits'],
    'sad': ['sad songs', 'heartbreak', 'sad acoustic', 'melancholy', 'rainy day'],
    'angry': ['calm down', 'chill out', 'stress relief', 'relaxing acoustic', 'peaceful piano'],
    'surprised': ['party hits', 'dance hits', 'upbeat', 'energy boost', 'workout hits'],
    'neutral': ['chill hits', 'lofi', 'indie chill', 'acoustic covers', 'easy listening'],
    'fearful': ['calming music', 'peaceful', 'relaxing', 'ambient', 'soothing'],
    'disgusted': ['mood booster', 'feel good', 'throwback hits', 'positive vibes', 'happy hits'],
}

suggestion_texts = {
    'happy': "You're looking HAPPY 😀 Keep smiling! Let's play:",
    'sad': "It seems you're feeling SAD 😞 Here's a comforting song for you.",
    'angry': "Feeling ANGRY? 😡 Take a deep breath and relax with this music.",
    'surprised': "You look SURPRISED 😮 Here's an exciting song for you.",
    'neutral': "You're feeling NEUTRAL 😐 Here's something to keep you balanced.",
    'fearful': "Feeling FEARFUL 😨 Listen to this calming music.",
    'disgusted': "You seem DISGUSTED 😒 Let's change your mood with some refreshing music."
}
