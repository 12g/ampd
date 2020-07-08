package org.hihn.ampd.server.message.outgoing.search;

import java.util.List;
import org.bff.javampd.song.MpdSong;

/**
 * Represents the structure of the search payload returned to the frontend.
 */
public class SearchPayload {

  List<MpdSong> searchResults = null;

  int searchResultCount = 0;

  String query = null;

  public SearchPayload() {
  }

  public SearchPayload(List<MpdSong> searchResults, int searchResultCount, String query) {
    this.searchResults = searchResults;
    this.searchResultCount = searchResultCount;
    this.query = query;
  }

  public List<MpdSong> getSearchResults() {
    return searchResults;
  }

  public void setSearchResults(List<MpdSong> searchResults) {
    this.searchResults = searchResults;
  }

  public int getSearchResultCount() {
    return searchResultCount;
  }

  public void setSearchResultCount(int searchResultCount) {
    this.searchResultCount = searchResultCount;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }
}
