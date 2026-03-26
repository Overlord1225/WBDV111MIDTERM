document.addEventListener("DOMContentLoaded", function () {
    const UPLOADS_KEY = "vsp_uploads_v1";
    const STATS_KEY = "vsp_track_stats_v1";
    const DEFAULT_COVER = "img/childrenofthecity.jpg";

    function parseJSON(value, fallback) {
        if (!value) {
            return fallback;
        }
        try {
            return JSON.parse(value);
        } catch (_error) {
            return fallback;
        }
    }

    function getUploads() {
        return parseJSON(localStorage.getItem(UPLOADS_KEY), []);
    }

    function setUploads(uploads) {
        localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
    }

    function getStats() {
        return parseJSON(localStorage.getItem(STATS_KEY), {});
    }

    function setStats(stats) {
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }

    function normalizePart(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function buildTrackId(title, artist, src) {
        return [normalizePart(title), normalizePart(artist), normalizePart(src)].join("__");
    }

    function ensureTrackStat(trackId, title, artist) {
        const stats = getStats();
        if (!stats[trackId]) {
            stats[trackId] = {
                title: title || "Unknown Title",
                artist: artist || "Unknown Artist",
                plays: 0,
                favorite: false,
                lastPlayedAt: null
            };
            setStats(stats);
        }
    }

    function upsertTrackStat(trackId, patch) {
        const stats = getStats();
        if (!stats[trackId]) {
            stats[trackId] = {
                title: patch.title || "Unknown Title",
                artist: patch.artist || "Unknown Artist",
                plays: 0,
                favorite: false,
                lastPlayedAt: null
            };
        }
        stats[trackId] = Object.assign({}, stats[trackId], patch);
        setStats(stats);
    }

    function createFavoriteButton(trackId) {
        const stats = getStats();
        const button = document.createElement("button");
        button.type = "button";
        button.className = "favorite-btn";
        button.dataset.trackId = trackId;
        button.textContent = stats[trackId] && stats[trackId].favorite ? "Unfavorite" : "Favorite";
        return button;
    }

    function refreshFavoriteButtons(trackId) {
        const stats = getStats();
        const isFavorite = !!(stats[trackId] && stats[trackId].favorite);
        const buttons = document.querySelectorAll('.favorite-btn[data-track-id="' + trackId + '"]');

        buttons.forEach(function (button) {
            button.textContent = isFavorite ? "Unfavorite" : "Favorite";
        });
    }

    function wireCard(card) {
        const titleElement = card.querySelector(".song-title");
        const artistElement = card.querySelector(".artist-name");
        const audio = card.querySelector("audio");
        const source = audio ? audio.querySelector("source") : null;
        const trackInfo = card.querySelector(".track-info");

        if (!titleElement || !artistElement || !audio || !source || !trackInfo) {
            return;
        }

        const title = titleElement.textContent.trim();
        const artist = artistElement.textContent.trim();
        const sourceValue = source.getAttribute("src") || "";
        const trackId = card.dataset.trackId || buildTrackId(title, artist, sourceValue);
        card.dataset.trackId = trackId;
        card.dataset.search = (title + " " + artist).toLowerCase();

        ensureTrackStat(trackId, title, artist);
        upsertTrackStat(trackId, { title: title, artist: artist });

        if (!trackInfo.querySelector(".favorite-btn")) {
            const favoriteButton = createFavoriteButton(trackId);
            trackInfo.insertBefore(favoriteButton, audio);
        }

        audio.addEventListener("play", function () {
            const stats = getStats();
            const current = stats[trackId] || {
                title: title,
                artist: artist,
                plays: 0,
                favorite: false,
                lastPlayedAt: null
            };
            current.plays += 1;
            current.lastPlayedAt = new Date().toISOString();
            current.title = title;
            current.artist = artist;
            stats[trackId] = current;
            setStats(stats);
        });
    }

    function createCard(track) {
        const card = document.createElement("div");
        card.className = "music-card";
        card.dataset.trackId = track.id;
        card.dataset.search = (track.title + " " + track.artist).toLowerCase();

        card.innerHTML =
            '<img src="' + track.cover + '" alt="' + track.title + ' Cover" class="cover-art">' +
            '<div class="track-info">' +
            '<p class="song-title"></p>' +
            '<p class="artist-name"></p>' +
            '<audio controls preload="metadata">' +
            '<source>' +
            "</audio>" +
            "</div>";

        const titleElement = card.querySelector(".song-title");
        const artistElement = card.querySelector(".artist-name");
        const source = card.querySelector("audio source");

        titleElement.textContent = track.title;
        artistElement.textContent = track.artist;
        source.setAttribute("src", track.dataUrl);
        source.setAttribute("type", track.type || "audio/mpeg");

        return card;
    }

    function renderUploadedTracks(musicList) {
        const uploads = getUploads();
        uploads.forEach(function (track) {
            const exists = musicList.querySelector('.music-card[data-track-id="' + track.id + '"]');
            if (exists) {
                return;
            }
            const card = createCard(track);
            musicList.appendChild(card);
            wireCard(card);
        });
    }

    function wireSearch(searchInput, musicList) {
        if (!searchInput) {
            return;
        }
        searchInput.addEventListener("input", function () {
            const value = this.value.trim().toLowerCase();
            const cards = musicList.querySelectorAll(".music-card");
            cards.forEach(function (card) {
                const searchableText = card.dataset.search || "";
                card.style.display = searchableText.includes(value) ? "flex" : "none";
            });
        });
    }

    function fileToDataUrl(file) {
        return new Promise(function (resolve, reject) {
            const reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function () {
                reject(new Error("Could not read file."));
            };
            reader.readAsDataURL(file);
        });
    }

    function getNameWithoutExtension(fileName) {
        return fileName.replace(/\.[^.]+$/, "");
    }

    async function wireUploadForm(form, musicList) {
        if (!form || !musicList) {
            return;
        }

        const fileInput = form.querySelector("#musicFile");
        const titleInput = form.querySelector("#musicTitle");
        const artistInput = form.querySelector("#musicArtist");
        const status = form.querySelector("#uploadStatus");

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                if (status) {
                    status.textContent = "Pick an audio file first.";
                }
                return;
            }

            const file = fileInput.files[0];
            const title = (titleInput && titleInput.value.trim()) || getNameWithoutExtension(file.name) || "Unknown Title";
            const artist = (artistInput && artistInput.value.trim()) || "Unknown Artist";

            if (status) {
                status.textContent = "Uploading...";
            }

            try {
                const dataUrl = await fileToDataUrl(file);
                const id = buildTrackId(title, artist, Date.now() + "_" + file.name);
                const track = {
                    id: id,
                    title: title,
                    artist: artist,
                    type: file.type || "audio/mpeg",
                    dataUrl: dataUrl,
                    cover: DEFAULT_COVER
                };

                const uploads = getUploads();
                uploads.push(track);
                setUploads(uploads);

                const card = createCard(track);
                musicList.appendChild(card);
                wireCard(card);

                if (status) {
                    status.textContent = "Song added successfully.";
                }
                form.reset();
            } catch (_error) {
                if (status) {
                    status.textContent = "Upload failed. File may be too large for browser storage.";
                }
            }
        });
    }

    function wireFavoriteToggles(container) {
        container.addEventListener("click", function (event) {
            const button = event.target.closest(".favorite-btn");
            if (!button) {
                return;
            }

            const trackId = button.dataset.trackId;
            if (!trackId) {
                return;
            }

            const stats = getStats();
            const current = stats[trackId];
            if (!current) {
                return;
            }

            current.favorite = !current.favorite;
            stats[trackId] = current;
            setStats(stats);
            refreshFavoriteButtons(trackId);
        });
    }

    function initMusicPage() {
        const musicList = document.getElementById("musicList");
        if (!musicList) {
            return;
        }

        const searchInput = document.getElementById("musicSearch");
        const uploadForm = document.getElementById("musicUploadForm");

        const currentCards = musicList.querySelectorAll(".music-card");
        currentCards.forEach(function (card) {
            wireCard(card);
        });

        renderUploadedTracks(musicList);
        wireSearch(searchInput, musicList);
        wireUploadForm(uploadForm, musicList);
        wireFavoriteToggles(musicList);
    }

    function renderProfile() {
        const profilePage = document.getElementById("profilePage");
        if (!profilePage) {
            return;
        }

        const stats = getStats();
        const uploads = getUploads();
        const statEntries = Object.values(stats);
        const playedEntries = statEntries.filter(function (entry) {
            return entry.plays > 0;
        });

        const mostPlayedElement = document.getElementById("mostPlayedSong");
        const favoriteElement = document.getElementById("favoriteSong");
        const totalPlaysElement = document.getElementById("totalPlays");
        const uploadedSongsElement = document.getElementById("uploadedSongs");
        const topTracksList = document.getElementById("topTracksList");

        const mostPlayed = playedEntries
            .slice()
            .sort(function (a, b) {
                return b.plays - a.plays;
            })[0];

        const favorite = statEntries.find(function (entry) {
            return entry.favorite;
        });

        const topTracks = playedEntries
            .slice()
            .sort(function (a, b) {
                return b.plays - a.plays;
            })
            .slice(0, 5);

        const totalPlays = playedEntries.reduce(function (sum, entry) {
            return sum + entry.plays;
        }, 0);

        if (mostPlayedElement) {
            mostPlayedElement.textContent = mostPlayed ? mostPlayed.title + " - " + mostPlayed.artist + " (" + mostPlayed.plays + " plays)" : "No plays yet";
        }
        if (favoriteElement) {
            favoriteElement.textContent = favorite ? favorite.title + " - " + favorite.artist : "No favorite selected";
        }
        if (totalPlaysElement) {
            totalPlaysElement.textContent = String(totalPlays);
        }
        if (uploadedSongsElement) {
            uploadedSongsElement.textContent = String(uploads.length);
        }

        if (topTracksList) {
            topTracksList.innerHTML = "";
            if (topTracks.length === 0) {
                topTracksList.innerHTML = "<li>No listening data yet.</li>";
            } else {
                topTracks.forEach(function (track) {
                    const item = document.createElement("li");
                    item.textContent = track.title + " - " + track.artist + " (" + track.plays + " plays)";
                    topTracksList.appendChild(item);
                });
            }
        }
    }

    initMusicPage();
    renderProfile();
});
