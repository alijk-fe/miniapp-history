import { isMiniApp, isWeChatMiniProgram, isQuickApp } from 'universal-env';
import { fireListeners } from './listeners';
import { REPLACE, POP, PUSH } from './constants';

let __routerMap = {};

let apiCore;

if (isMiniApp) {
  apiCore = my;
} else if (isWeChatMiniProgram) {
  apiCore = wx;
} else if (isQuickApp) {
  apiCore = require('@system.router');
}

function redirectTo(location, options) {
  options.success = () => {
    fireListeners(location, REPLACE);
  };
  if (isQuickApp) {
    options.uri = options.url;
    apiCore.replace(options);
    // no callback for quickapp's router event
    fireListeners(location, REPLACE);
  } else {
    apiCore.redirectTo(options);
  }
}

function navigateTo(location, options) {
  options.success = () => {
    fireListeners(location, PUSH);
  };
  if (isQuickApp) {
    options.uri = options.url;
    apiCore.push(options);
    // no callback for quickapp's router event
    fireListeners(location, PUSH);
  } else {
    apiCore.navigateTo(options);
  }
}

function navigateBack(location, options) {
  if (isQuickApp) {
    apiCore.back();
  } else {
    apiCore.navigateBack(options);
  }
  fireListeners(location, POP);
}

/**
 * Navigate to given path.
 */
function push(location, path, query) {
  return navigateTo(location, { url: generateUrl(path, query) });
}

/**
 * Navigate replace.
 */
function replace(location, path, query) {
  return redirectTo(location, { url: generateUrl(path, query) });
}

/**
 * Unsupported in miniapp.
 */
function go() {
  throw new Error('Unsupported go in miniapp.');
}

/**
 * Navigate back.
 */
function goBack(location, n = 1) {
  return navigateBack(location, { delta: n });
}

/**
 * Unsupported in miniapp.
 */
function goForward() {
  throw new Error('Unsupported goForward in miniapp.');
}

/**
 * Unsupported in miniapp.
 * @return {boolean} Always true.
 */
function canGo() {
  return true;
}

/**
 * Generate MiniApp url
 * @param {string} path
 * @param {object} query
 */
function generateUrl(path, query) {
  let [pathname, search] = path.split('?');
  const miniappPath = __routerMap[pathname];
  if (!miniappPath) {
    throw new Error(`Path ${path} is not found`);
  }
  if (query) {
    if (search) {
      search += `&${stringifyQuery(query)}`;
    } else {
      search = stringifyQuery(query);
    }
  }

  return search ? `/${miniappPath}?${search}` : `/${miniappPath}`;
}

/**
 * Stringify query
 * @param {object} query - route query
 * @return {string}
 */
function stringifyQuery(query) {
  return Object.keys(query).reduce((total, nextKey, index) => {
    return `${total}${index ? '&' : ''}${nextKey}=${query[nextKey]}`;
  }, '');
}

export function __updateRouterMap(routes) {
  routes.map(route => {
    // Rule of source in appConfig differs from Quickapp's manifest
    if (isQuickApp) {
      __routerMap[route.path] = route.source.replace(/\/index$/, '');
    } else {
      __routerMap[route.path] = route.source;
    }
  });
  // return as globalRoutes for Quickapp
  if (isQuickApp) {
    return __routerMap;
  }
}

export function setRoutes(routes) {
  __routerMap = routes;
}

export default function generateActions(location) {
  const actions = {
    push, replace, goBack, go, canGo, goForward
  };
  return Object.keys(actions).reduce((result, actionName) => {
    result[actionName] = actions[actionName].bind(null, location);
    return result;
  }, {});
}
