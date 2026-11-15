package com.globalhealthexplorer.imports.service;

import java.util.ArrayList;
import java.util.List;

/** A small RFC 4180-style parser that supports escaped quotes and quoted commas/newlines. */
final class CsvDocumentParser {

	ParsedDocument parse(String content) {
		List<ParsedRow> rows = new ArrayList<>();
		List<String> cells = new ArrayList<>();
		StringBuilder cell = new StringBuilder();
		boolean quoted = false;
		int physicalLine = 1;
		int rowStartLine = 1;
		String text = content.startsWith("\uFEFF") ? content.substring(1) : content;

		for (int index = 0; index < text.length(); index++) {
			char character = text.charAt(index);
			if (quoted) {
				if (character == '"' && index + 1 < text.length() && text.charAt(index + 1) == '"') {
					cell.append('"');
					index++;
				} else if (character == '"') {
					quoted = false;
				} else {
					cell.append(character);
					if (character == '\n') physicalLine++;
				}
				continue;
			}

			if (character == '"' && cell.isEmpty()) {
				quoted = true;
			} else if (character == '"') {
				throw new IllegalArgumentException("CSV quotes must begin at the start of a field.");
			} else if (character == ',') {
				cells.add(cell.toString());
				cell.setLength(0);
			} else if (character == '\n' || character == '\r') {
				if (character == '\r' && index + 1 < text.length() && text.charAt(index + 1) == '\n') index++;
				cells.add(cell.toString());
				addRowIfNotBlank(rows, cells, rowStartLine);
				cells = new ArrayList<>();
				cell.setLength(0);
				physicalLine++;
				rowStartLine = physicalLine;
			} else {
				cell.append(character);
			}
		}

		if (quoted) {
			throw new IllegalArgumentException("CSV has an unclosed quoted field beginning on line " + rowStartLine + ".");
		}
		cells.add(cell.toString());
		addRowIfNotBlank(rows, cells, rowStartLine);
		if (rows.isEmpty()) throw new IllegalArgumentException("CSV file is empty.");
		return new ParsedDocument(rows.getFirst().cells(), rows.subList(1, rows.size()));
	}

	private void addRowIfNotBlank(List<ParsedRow> rows, List<String> cells, int line) {
		if (cells.stream().anyMatch(value -> !value.isBlank())) {
			rows.add(new ParsedRow(line, List.copyOf(cells)));
		}
	}

	record ParsedDocument(List<String> headers, List<ParsedRow> rows) {
	}

	record ParsedRow(int lineNumber, List<String> cells) {
	}
}
