import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteSuggestedSong, setSongLiked, useUserSongs } from '../services/songService';
import { signIn, useAuthUser } from '../services/authService';
import { toast } from '../services/toastService';
import { MOODS, MOOD_KEYS } from '../moods';
import EmptyState from './EmptyState';
import SongTile from './SongTile';

const SKELETON_TILES = 8;

const PAGES = {
    history: {
        title: 'History',
        subtitle: 'Every song Mood Musica has suggested for you.',
        emptyIcon: 'fa-clock-rotate-left',
        emptyTitle: 'No songs yet',
        emptyText: 'Scan your mood or pick one, and your suggestions will appear here.',
    },
    favorites: {
        title: 'Favorites',
        subtitle: 'Songs you have hearted.',
        emptyIcon: 'fa-heart',
        emptyTitle: 'No favorites yet',
        emptyText: 'Tap the heart on any song to keep it here.',
    },
};

const Library = ({ favoritesOnly = false }) => {
    const page = PAGES[favoritesOnly ? 'favorites' : 'history'];
    const { user, loading: authLoading } = useAuthUser();
    const { songs, loading, error } = useUserSongs(user?.uid);
    const [filter, setFilter] = useState('all');

    const pageSongs = favoritesOnly ? songs.filter(song => song.liked) : songs;
    const availableMoods = MOOD_KEYS.filter(mood => pageSongs.some(song => song.emotion === mood));
    // Fall back to "all" if the selected mood no longer has songs
    const activeFilter = availableMoods.includes(filter) ? filter : 'all';
    const visibleSongs = activeFilter === 'all' ? pageSongs : pageSongs.filter(song => song.emotion === activeFilter);

    const handleToggleLike = (song) => {
        setSongLiked(user.uid, song.id, !song.liked)
            .then(() => toast(song.liked ? 'Removed from favorites' : 'Added to favorites', 'success'))
            .catch((dbError) => {
                console.error('Failed to update song:', dbError);
                toast('Could not update favorites', 'error');
            });
    };

    const handleDelete = (song) => {
        deleteSuggestedSong(user.uid, song.id)
            .then(() => toast('Removed from history', 'success'))
            .catch((dbError) => {
                console.error('Failed to delete song:', dbError);
                toast('Could not remove the song', 'error');
            });
    };

    let content;
    if (authLoading || loading) {
        content = (
            <div className="song-grid" aria-busy="true" aria-label="Loading songs">
                {Array.from({ length: SKELETON_TILES }, (_, index) => <div key={index} className="skeleton tile-skeleton"></div>)}
            </div>
        );
    } else if (!user) {
        content = (
            <EmptyState
                icon="fa-lock"
                title={`Sign in to see your ${page.title.toLowerCase()}`}
                action={(
                    <button type="button" className="btn btn-primary" onClick={signIn}>
                        <i className="fa-brands fa-google" aria-hidden="true"></i> Sign in with Google
                    </button>
                )}
            >
                Your suggested and favorite songs are saved privately to your account.
            </EmptyState>
        );
    } else if (error) {
        content = <EmptyState icon="fa-triangle-exclamation" title="Something went wrong">{error}</EmptyState>;
    } else if (pageSongs.length === 0) {
        content = (
            <EmptyState
                icon={page.emptyIcon}
                title={page.emptyTitle}
                action={<Link to="/" className="btn btn-primary"><i className="fa-solid fa-camera" aria-hidden="true"></i> Find a song</Link>}
            >
                {page.emptyText}
            </EmptyState>
        );
    } else {
        content = (
            <>
                {availableMoods.length > 1 && (
                    <div className="filters" role="group" aria-label="Filter by mood">
                        <button
                            type="button"
                            className={`mood-option mood-option-sm ${activeFilter === 'all' ? 'is-active' : ''}`}
                            style={{ '--mood': 'var(--accent)' }}
                            aria-pressed={activeFilter === 'all'}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        {availableMoods.map(mood => (
                            <button
                                key={mood}
                                type="button"
                                className={`mood-option mood-option-sm ${activeFilter === mood ? 'is-active' : ''}`}
                                style={{ '--mood': MOODS[mood].color }}
                                aria-pressed={activeFilter === mood}
                                onClick={() => setFilter(mood)}
                            >
                                <i className={`fa-solid ${MOODS[mood].icon}`} aria-hidden="true"></i>
                                {MOODS[mood].label}
                            </button>
                        ))}
                    </div>
                )}
                <div className="song-grid">
                    {visibleSongs.map(song => (
                        <SongTile
                            key={song.id}
                            song={song}
                            onToggleLike={() => handleToggleLike(song)}
                            onDelete={favoritesOnly ? undefined : () => handleDelete(song)}
                        />
                    ))}
                </div>
            </>
        );
    }

    const count = user && !loading && !error ? pageSongs.length : null;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">{page.title}</h1>
                    <p className="page-subtitle">
                        {page.subtitle}
                        {count > 0 && ` ${count} ${count === 1 ? 'song' : 'songs'}.`}
                    </p>
                </div>
            </div>
            {content}
        </>
    );
};

export default Library;
