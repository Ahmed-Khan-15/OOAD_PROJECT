package com.globalhealthexplorer.common;

public class ResourceNotFoundException extends RuntimeException {

	public ResourceNotFoundException(String resource, String identifier) {
		super(resource + " was not found: " + identifier);
	}
}
