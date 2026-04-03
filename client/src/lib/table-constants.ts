/**
 * Shared table layout constants.
 *
 * Management layout main: pt-16 md:pt-6 pb-4 md:pb-6
 * Desktop available: 100vh - 24px top - 24px bottom = 100vh - 48px
 * Toolbar: ~52px, Pagination: ~48px → table gets 100vh - 148px
 * With class tabs (+57px): table gets 100vh - 205px
 */

/** Page wrapper classes (flex column, hidden overflow).
 * MUST also apply LIST_PAGE_STYLE as inline style for the height calc. */
export const LIST_PAGE_CLASS = 'flex flex-col overflow-hidden'

/** Table container: explicit max-h so it scrolls internally. Header stays sticky. */
export const TABLE_CONTAINER_CLASS = 'rounded-xl border overflow-auto flex-1 min-h-0'

/** Table container inside class detail page (tab bar + sub-tabs take extra space) */
export const TABLE_CONTAINER_WITH_TABS_CLASS = 'rounded-xl border overflow-auto flex-1 min-h-0'

/** Sticky table header — solid background so scrolling content doesn't show through */
export const TABLE_HEADER_CLASS = 'sticky top-0 z-[1] bg-muted'

/** Default page sizes */
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

/** Default page size */
export const DEFAULT_PAGE_SIZE = 20
