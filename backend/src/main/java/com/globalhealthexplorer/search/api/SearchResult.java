package com.globalhealthexplorer.search.api;

/** Compact, navigable result shared by the public search categories. */
public record SearchResult(String id, String title, String description, String url) { }
