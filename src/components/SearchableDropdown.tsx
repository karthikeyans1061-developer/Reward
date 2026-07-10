"use client";

import React, { useState, useEffect, useRef, useCallback, KeyboardEvent, ChangeEvent } from "react";

interface SearchableDropdownProps {
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  id
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Flag to prevent blur-transliteration when clicking a dropdown item
  const isSelectingRef = useRef(false);

  // Filter options based on search query matching both Tamil script and phonetic Tanglish
  const filteredOptions = options.filter(option => {
    if (!search) return true;
    const lowerOption = option.toLowerCase();
    const lowerSearch = search.toLowerCase();

    // Check if the query matches directly (e.g. searching 'மு' matches 'முத்து')
    if (lowerOption.includes(lowerSearch)) return true;

    // Check if the phonetic Tanglish translation of the query matches
    try {
      const { getTamilEquivalent } = require("../utils/tamilTranslitMap");
      const phoneticTamilSearch = getTamilEquivalent(lowerSearch);
      return lowerOption.includes(phoneticTamilSearch);
    } catch {
      return false;
    }
  });

  // Synchronize input text with outer value when closed
  useEffect(() => {
    if (!isOpen) {
      setSearch(value);
    }
  }, [value, isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("li");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Convert English phonetic (Tanglish) word to Tamil characters
  const transliterateWord = useCallback(async (word: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=ta-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`
      );
      const data = await response.json();
      if (data && data[0] === "SUCCESS" && data[1]?.[0]?.[1]?.[0]) {
        return data[1][0][1][0];
      }
    } catch (err) {
      console.error("Transliteration request failed:", err);
    }
    return word;
  }, []);

  const transliterateLastWord = useCallback(async () => {
    if (!inputRef.current) return;
    const inputVal = inputRef.current.value;
    const words = inputVal.split(" ");
    const lastWordIdx = words.length - 1;
    const lastWord = words[lastWordIdx];

    if (!lastWord || /[\u0B80-\u0BFF]/.test(lastWord)) {
      return;
    }

    const transliterated = await transliterateWord(lastWord);
    words[lastWordIdx] = transliterated;
    const newText = words.join(" ");
    setSearch(newText);
    onChange(newText);
  }, [transliterateWord, onChange]);

  const selectOption = useCallback((opt: string) => {
    onChange(opt);
    setSearch(opt);
    setIsOpen(false);
    setHighlightedIndex(-1);
    isSelectingRef.current = false;
  }, [onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex(prev => (prev + 1 < filteredOptions.length ? prev + 1 : prev));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : prev));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();

      const target = e.target as HTMLInputElement;
      const val = target.value;
      const words = val.split(" ");
      const lastWord = words[words.length - 1];

      // If dropdown is open and an item is highlighted, pick it immediately
      if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectOption(filteredOptions[highlightedIndex]);
        // Focus next form field
        setTimeout(() => {
          const form = target.form;
          if (form) {
            const index = Array.prototype.indexOf.call(form, target);
            if (index > -1 && index + 1 < form.elements.length) {
              const nextEl = form.elements[index + 1] as HTMLElement;
              nextEl?.focus();
            }
          }
        }, 50);
        return;
      }

      // Auto-transliterate on Enter key press
      const performTransliteration = async () => {
        if (lastWord && !/[\u0B80-\u0BFF]/.test(lastWord)) {
          const transliterated = await transliterateWord(lastWord);
          words[words.length - 1] = transliterated;
          const newText = words.join(" ");
          setSearch(newText);
          onChange(newText);
          return newText;
        }
        return val;
      };

      performTransliteration().then(() => {
        setIsOpen(false);
        // Focus next form field automatically
        setTimeout(() => {
          const form = target.form;
          if (form) {
            const index = Array.prototype.indexOf.call(form, target);
            if (index > -1 && index + 1 < form.elements.length) {
              const nextEl = form.elements[index + 1] as HTMLElement;
              nextEl?.focus();
            }
          }
        }, 50);
      });
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === " ") {
      const target = e.target as HTMLInputElement;
      const val = target.value;
      const words = val.split(" ");
      const lastWord = words[words.length - 1];

      if (lastWord && !/[\u0B80-\u0BFF]/.test(lastWord)) {
        e.preventDefault();
        transliterateWord(lastWord).then((transliterated) => {
          words[words.length - 1] = transliterated;
          const newText = words.join(" ") + " ";
          setSearch(newText);
          onChange(newText);
        });
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val);
    if (!isOpen) {
      setIsOpen(true);
    }
    setHighlightedIndex(-1);
  };

  const handleBlur = () => {
    // Don't transliterate if we're clicking a dropdown item
    if (isSelectingRef.current) {
      return;
    }
    transliterateLastWord();
  };

  // Prevent blur from firing when clicking dropdown items
  const handleItemMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents input blur
    isSelectingRef.current = true;
  };

  return (
    <div className="position-relative w-100" ref={containerRef}>
      <input
        type="text"
        className="form-control"
        id={id}
        placeholder={placeholder}
        value={search}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => {
          setIsOpen(true);
        }}
        ref={inputRef}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul
          ref={listRef}
          className="dropdown-menu show w-100 overflow-auto"
          style={{
            maxHeight: "220px",
            zIndex: 1050,
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "4px",
          }}
          role="listbox"
        >
          {filteredOptions.map((option, idx) => {
            const isHighlighted = idx === highlightedIndex;
            const isSelected = option === value;
            return (
              <li key={option} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`dropdown-item${isHighlighted ? " active" : ""}${isSelected ? " fw-bold" : ""}`}
                  onMouseDown={handleItemMouseDown}
                  onClick={() => selectOption(option)}
                >
                  {isSelected && <span style={{ marginRight: "0.4rem" }}>✓</span>}
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
