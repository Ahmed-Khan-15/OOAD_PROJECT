package com.globalhealthexplorer.dataset.service;

import java.text.Normalizer;
import java.util.Locale;

public final class SlugUtil {

	private SlugUtil() {
	}

	public static String fromName(String name) {
		String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
				.replaceAll("\\p{M}+", "")
				.toLowerCase(Locale.ROOT);
		return normalized.replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
	}
}
