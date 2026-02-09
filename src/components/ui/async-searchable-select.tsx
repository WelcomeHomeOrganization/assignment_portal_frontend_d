"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, Loader2, ChevronDown, X, Check } from "lucide-react";

// Generic type for search result items - only requires id
export interface SearchableItem {
    id: string;
}

// Search function signature that services must implement
export type SearchFunction<T extends SearchableItem> = (
    query: string,
    page: number,
    limit: number
) => Promise<{
    items: T[];
    hasMore: boolean;
}>;

interface AsyncSearchableSelectProps<T extends SearchableItem> {
    /** Single or multi-select mode */
    mode: "single" | "multi";
    /** Placeholder text for search input */
    placeholder?: string;
    /** Function to fetch search results */
    searchFn: SearchFunction<T>;
    /** Function to render display text for an item */
    displayValue: (item: T) => string;
    /** Optional function to render secondary text */
    secondaryValue?: (item: T) => string;
    /** Current selected value(s) */
    value: T | T[] | null;
    /** Callback when selection changes */
    onChange: (value: T | T[] | null) => void;
    /** Whether the component is disabled */
    disabled?: boolean;
    /** Number of items to fetch per page */
    pageSize?: number;
    /** Debounce delay in milliseconds */
    debounceMs?: number;
    /** Label for the field */
    label?: string;
    /** Optional items to exclude from results (e.g., current task for parent selection) */
    excludeIds?: string[];
    /** Optional custom renderer for dropdown options */
    renderOption?: (item: T, isSelected: boolean) => React.ReactNode;
    /** Optional custom renderer for selected item(s) in trigger */
    renderSelected?: (item: T, onRemove?: (e: React.MouseEvent) => void) => React.ReactNode;
}

export function AsyncSearchableSelect<T extends SearchableItem>({
    mode,
    placeholder = "Search...",
    searchFn,
    displayValue,
    secondaryValue,
    value,
    onChange,
    disabled = false,
    pageSize = 20,
    debounceMs = 300,
    excludeIds = [],
    renderOption,
    renderSelected,
}: AsyncSearchableSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const excludeIdsRef = useRef(excludeIds);
    const searchFnRef = useRef(searchFn);
    const pageSizeRef = useRef(pageSize);
    const loadingRef = useRef(false);

    // Keep refs updated
    useEffect(() => {
        excludeIdsRef.current = excludeIds;
        searchFnRef.current = searchFn;
        pageSizeRef.current = pageSize;
    });

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    const performSearch = useCallback(async (query: string, pageNum: number, append: boolean = false) => {
        if (loadingRef.current && !append) return; // Prevent concurrent searches for new query

        if (pageNum === 1) {
            setLoading(true);
            loadingRef.current = true;
        } else {
            setLoadingMore(true);
        }
        setError(null);

        try {
            const result = await searchFnRef.current(query, pageNum, pageSizeRef.current);

            // Filter out excluded items
            const currentExcludeIds = excludeIdsRef.current || [];
            const filteredItems = result.items.filter(item => !currentExcludeIds.includes(item.id));

            if (append) {
                setItems(prev => [...prev, ...filteredItems]);
            } else {
                setItems(filteredItems);
            }
            setHasMore(result.hasMore);
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to load results");
            if (!append) {
                setItems([]);
            }
        } finally {
            setLoading(false);
            loadingRef.current = false;
            setLoadingMore(false);
        }
    }, []); // Empty dependency array because we use refs

    // Handle search input change with debounce - runs when user types or opens dropdown
    useEffect(() => {
        // Don't search if dropdown is closed
        if (!isOpen) {
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setPage(1);
            performSearch(searchQuery, 1, false);
        }, debounceMs);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, isOpen, performSearch, debounceMs]);

    // Reset state when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setItems([]);
            setPage(1);
            setHasMore(false);
            setError(null);
        }
    }, [isOpen]);



    // Load more handler
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        performSearch(searchQuery, nextPage, true);
    };

    // Handle item selection
    const handleSelect = (item: T) => {
        if (mode === "single") {
            const currentSelected = value as T | null;
            // Only call onChange if the selected item changed
            if (currentSelected?.id !== item.id) {
                // Defer parent update to avoid nested updates during commit refs
                setTimeout(() => onChange(item), 0);
            }
            // close dropdown after selection
            setIsOpen(false);
            setSearchQuery("");
        } else {
            const currentValue = (value as T[]) || [];
            const isSelected = currentValue.some(v => v.id === item.id);

            if (isSelected) {
                const newValue = currentValue.filter(v => v.id !== item.id);
                // Guard: only update if different
                if (newValue.length !== currentValue.length) {
                    setTimeout(() => onChange(newValue), 0);
                }
            } else {
                // Add item immutably for multi-select
                const newValue = [...currentValue, item];
                // Guard: ensure we don't call onChange with identical ids
                const same = newValue.length === currentValue.length && newValue.every((v, i) => v.id === currentValue[i].id);
                if (!same) {
                    setTimeout(() => onChange(newValue), 0);
                }
            }
        }
    };

    // Check if item is selected
    const isItemSelected = (item: T): boolean => {
        if (mode === "single") {
            return (value as T | null)?.id === item.id;
        }
        return ((value as T[]) || []).some(v => v.id === item.id);
    };

    // Remove selected item (for multi-select)
    const handleRemove = (item: T, e: React.MouseEvent) => {
        e.stopPropagation();
        if (mode === "multi") {
            const currentValue = (value as T[]) || [];
            const newValue = currentValue.filter(v => v.id !== item.id);
            // Only call if changed
            if (newValue.length !== currentValue.length) {
                setTimeout(() => onChange(newValue), 0);
            }
        } else {
            if ((value as T | null) !== null) {
                setTimeout(() => onChange(null), 0);
            }
        }
    };

    // Clear single selection
    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mode === "multi") {
            const currentValue = (value as T[]) || [];
            if (currentValue.length > 0) {
                setTimeout(() => onChange([]), 0);
            }
        } else {
            if ((value as T | null) !== null) {
                setTimeout(() => onChange(null), 0);
            }
        }
    };

    // Render selected value(s) display
    const renderSelectedDisplay = () => {
        if (mode === "single") {
            const selected = value as T | null;
            if (!selected) {
                return <span className="text-muted-foreground">{placeholder}</span>;
            }

            if (renderSelected) {
                return (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                        {renderSelected(selected, !disabled ? handleClear : undefined)}
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                    <span className="truncate">{displayValue(selected)}</span>
                    {!disabled && (
                        <X
                            className="h-4 w-4 text-muted-foreground hover:text-foreground ml-2 shrink-0"
                            onClick={handleClear}
                        />
                    )}
                </div>
            );
        }

        const selectedItems = (value as T[]) || [];
        if (selectedItems.length === 0) {
            return <span className="text-muted-foreground">{placeholder}</span>;
        }

        return (
            <div className="flex flex-wrap gap-1 flex-1">
                {selectedItems.map(item => (
                    <React.Fragment key={item.id}>
                        {renderSelected ? (
                            renderSelected(item, !disabled ? (e) => handleRemove(item, e) : undefined)
                        ) : (
                            <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs"
                            >
                                {displayValue(item)}
                                {!disabled && (
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-primary/70"
                                        onClick={(e) => handleRemove(item, e)}
                                    />
                                )}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Trigger button */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={cn(
                    "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    disabled && "cursor-not-allowed opacity-50",
                    isOpen && "ring-2 ring-ring ring-offset-2"
                )}
            >
                {renderSelectedDisplay()}
                <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform ml-2 shrink-0",
                    isOpen && "rotate-180"
                )} />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md start-0">
                    {/* Search input */}
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="h-4 w-4 text-muted-foreground mr-2" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder={placeholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                            autoFocus
                        />
                        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />}
                    </div>

                    {/* Results list */}
                    <div className="max-h-60 overflow-y-auto">
                        {error ? (
                            <div className="py-6 text-center text-sm text-destructive">
                                {error}
                            </div>
                        ) : loading && items.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No results found
                            </div>
                        ) : (
                            <>
                                {items.map(item => {
                                    const selected = isItemSelected(item);

                                    if (renderOption) {
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelect(item)}
                                                className={cn(
                                                    "cursor-pointer hover:bg-accent px-3 py-2",
                                                    selected && "bg-accent/50"
                                                )}
                                            >
                                                {renderOption(item, selected)}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent",
                                                selected && "bg-accent/50"
                                            )}
                                        >
                                            {mode === "multi" ? (
                                                <Checkbox
                                                    checked={selected}
                                                    className="pointer-events-none"
                                                />
                                            ) : (
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    {selected && <Check className="h-4 w-4 text-primary" />}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm truncate">{displayValue(item)}</div>
                                                {secondaryValue && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {secondaryValue(item)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Load More button */}
                                {hasMore && (
                                    <div className="p-2 border-t">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLoadMore();
                                            }}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Loading...
                                                </>
                                            ) : (
                                                "Load More"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
