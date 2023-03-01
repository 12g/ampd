package org.hihn.ampd.server.service;

import org.bff.javampd.album.MPDAlbum;
import org.bff.javampd.server.MPD;
import org.bff.javampd.server.MPDConnectionException;
import org.bff.javampd.song.MPDSong;
import org.hihn.ampd.server.model.AmpdSettings;
import org.hihn.ampd.server.util.StringUtils;
import org.springframework.beans.support.PagedListHolder;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import static org.hihn.ampd.server.Constants.ALBUM_CACHE;

/**
 * Provides methods to browse through {@link MPDAlbum} of the collection.
 */
@Service
@CacheConfig(cacheNames = { ALBUM_CACHE })
public class AlbumService {

	private final MPD mpd;

	private final AmpdSettings ampdSettings;

	private enum SortBy {

		NAME("name"), ARTIST("artist"), RANDOM("random");

		private final String key;

		SortBy(String sortBy) {
			key = sortBy;
		}

		public String getKey() {
			return key;
		}

	}

	public AlbumService(MPD mpd, AmpdSettings ampdSettings) {
		this.mpd = mpd;
		this.ampdSettings = ampdSettings;
	}

	@Cacheable
	public PageImpl<MPDAlbum> listAllAlbums(String searchTermP, int pageIndex, Integer pageSize, String sortBy) {
		String searchTerm = searchTermP.toLowerCase().trim();
		List<MPDAlbum> filteredAlbums = mpd.getMusicDatabase()
			.getAlbumDatabase()
			.listAllAlbums()
			.stream()
			.filter(album -> {
				if (album.getName().isBlank()) {
					// No album title
					return false;
				}
				if (album.getArtistNames().isEmpty() && StringUtils.isNullOrEmpty(album.getAlbumArtist())) {
					// No info about the album artist
					return false;
				}
				if (album.getArtistNames().isEmpty()) {
					album.getArtistNames().add(album.getAlbumArtist());
				}
				else {
					album.setAlbumArtist(album.getArtistNames().get(0));
				}

				try {
					int albumContains = mpd.getMusicDatabase().getSongDatabase().findAlbum(album).size();
					if (albumContains < 2) {
						// Some tracks have the album attribute set but are not
						// actually
						// part of an album but a singleton. Only use albums with at
						// least
						// 2 tracks
						return false;
					}
				}
				catch (MPDConnectionException e) {
					return false;
				}

				return album.getName().toLowerCase().contains(searchTerm)
						|| album.getAlbumArtist().toLowerCase().contains(searchTerm)
						|| album.getArtistNames().get(0).toLowerCase().contains(searchTerm);
			})
			.sorted(Comparator.comparing(a -> sortBy.equals(SortBy.NAME.getKey()) ? a.getName() : a.getAlbumArtist()))
			.collect(Collectors.toList());

		if (sortBy.equals(SortBy.RANDOM.getKey())) {
			Collections.shuffle(filteredAlbums);
		}

		Pageable pageable = PageRequest.of(pageIndex, getPageSize(pageSize));
		PagedListHolder<MPDAlbum> pages = new PagedListHolder<>(filteredAlbums);
		pages.setPage(pageIndex);
		pages.setPageSize(getPageSize(pageSize));
		return new PageImpl<>(pages.getPageList(), pageable, filteredAlbums.size());
	}

	@Cacheable
	public Collection<MPDSong> listAlbum(String album, String artist) {
		MPDAlbum mpdAlbum = MPDAlbum.builder(album).albumArtist(artist).build();
		return mpd.getMusicDatabase().getSongDatabase().findAlbum(mpdAlbum);
	}

	private int getPageSize(Integer pageSize) {
		return pageSize == null ? ampdSettings.getAlbumsPageSize() : pageSize;
	}

}
