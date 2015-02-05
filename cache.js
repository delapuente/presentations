
/**
 * An object with the urls to be fetched only if there is network as values
 * and the fallbacks for when there is no network as keys. If you don't want
 * a fallback, leave it as true.
 *
 * Examples:
 *
 * var NETWORK_ONLY = {
 *   'online.png': 'offline.png'
 * };
 *
 * Try to fetch a remote copy of `online.png`. If not possible answer with
 * `offline.png` instead.
 *
 * var NETWORK_ONLY = {
 *   'online.png': true
 * };
 *
 * Try to fetch a remote copy. If not possible the request will fail.
 */
var NETWORK_ONLY = {};

/**
 * Indicate the type of hosting holding the web. This inccurs in some
 * automatisms for prefetching. Current accapted values are:
 *
 *   * "gh-pages": triggers prefetching by content, deriving the zip file
 *   from the current location.
 *
 * You can avoid any kind of automatic prefetch by setting it to false.
 */
var HOST = "gh-pages";

/**
 * Stablishes what should be prefetched and added to offline caches. Current
 * supported values are:
 *
 *   * false: prevents any kind of prefetching.
 *   * url: should point to a zipfile from which the cache will be prepopulated.
 */
var PREFETCH = null;
