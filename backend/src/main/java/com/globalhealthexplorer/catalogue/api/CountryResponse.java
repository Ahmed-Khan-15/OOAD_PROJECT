package com.globalhealthexplorer.catalogue.api;

public record CountryResponse(
		String id,
		String iso2,
		String iso3,
		String name,
		String region,
		boolean active) {
}
