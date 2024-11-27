import type {PlatformKey} from 'sentry/types/project';

export enum PlatformCategory {
  FRONTEND = 0,
  MOBILE = 1,
  BACKEND = 2,
  SERVERLESS = 3,
  DESKTOP = 4,
  OTHER = 5,
}

// Mirrors `FRONTEND` in src/sentry/utils/platform_categories.py
// When changing this file, make sure to keep src/sentry/utils/platform_categories.py in sync.
export const frontend: PlatformKey[] = [
  'dart',
  'javascript',
  'javascript-angular',
  'javascript-angularjs',
  'javascript-astro',
  'javascript-backbone',
  'javascript-ember',
  'javascript-gatsby',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-react',
  'javascript-remix',
  'javascript-solid',
  'javascript-solidstart',
  'javascript-svelte',
  'javascript-sveltekit',
  'javascript-vue',
  'unity',
];

// Mirrors `MOBILE` in src/sentry/utils/platform_categories.py
// When changing this file, make sure to keep src/sentry/utils/platform_categories.py in sync.
export const mobile: PlatformKey[] = [
  'android',
  'apple-ios',
  'capacitor',
  'cordova',
  'dart-flutter',
  'dotnet-maui',
  'dotnet-xamarin',
  'flutter',
  'ionic',
  'javascript-capacitor',
  'javascript-cordova',
  'react-native',
  'unity',
  'unreal',
  // Old platforms
  'java-android',
  'cocoa-objc',
  'cocoa-swift',
];

// Mirrors `BACKEND` in src/sentry/utils/platform_categories.py
// When changing this file, make sure to keep src/sentry/utils/platform_categories.py in sync.
export const backend: PlatformKey[] = [
  'bun',
  'deno',
  'dotnet',
  'dotnet-aspnetcore',
  'dotnet-aspnet',
  'elixir',
  'go',
  'go-echo',
  'go-fasthttp',
  'go-fiber',
  'go-gin',
  'go-http',
  'go-iris',
  'go-martini',
  'go-negroni',
  'java',
  'java-appengine',
  'java-log4j',
  'java-log4j2',
  'java-logback',
  'java-logging',
  'java-spring',
  'java-spring-boot',
  'kotlin',
  'native',
  'node',
  'node-express',
  'node-koa',
  'node-connect',
  'perl',
  'php',
  'php-laravel',
  'php-monolog',
  'php-symfony',
  'powershell',
  'python',
  'python-aiohttp',
  'python-asgi',
  'python-bottle',
  'python-celery',
  'python-chalice',
  'python-django',
  'python-falcon',
  'python-fastapi',
  'python-flask',
  'python-pylons',
  'python-pymongo',
  'python-pyramid',
  'python-quart',
  'python-rq',
  'python-sanic',
  'python-starlette',
  'python-tornado',
  'python-tryton',
  'python-wsgi',
  'ruby',
  'ruby-rails',
  'ruby-rack',
  'rust',
];

// Mirrors `SERVERLESS` in src/sentry/utils/platform_categories.py
// When changing this file, make sure to keep src/sentry/utils/platform_categories.py in sync.
export const serverless: PlatformKey[] = [
  'dotnet-awslambda',
  'dotnet-gcpfunctions',
  'node-awslambda',
  'node-azurefunctions',
  'node-gcpfunctions',
  'python-awslambda',
  'python-azurefunctions',
  'python-gcpfunctions',
  'python-serverless',
];

// Mirrors `DESKTOP` in src/sentry/utils/platform_categories.py
// When changing this file, make sure to keep src/sentry/utils/platform_categories.py in sync.
export const desktop: PlatformKey[] = [
  'apple-macos',
  'dotnet-maui',
  'dotnet-winforms',
  'dotnet-wpf',
  'dotnet',
  'electron',
  'flutter',
  'java',
  'javascript-electron',
  'kotlin',
  'minidump',
  'native',
  'native-breakpad',
  'native-crashpad',
  'native-minidump',
  'native-qt',
  'unity',
  'unreal',
];

export const sourceMaps: PlatformKey[] = [
  ...frontend,
  'react-native',
  'cordova',
  'electron',
];

export const performance: PlatformKey[] = [
  'bun',
  'deno',
  'javascript',
  'javascript-ember',
  'javascript-react',
  'javascript-vue',
  'php',
  'php-laravel',
  'python',
  'python-django',
  'python-flask',
  'python-fastapi',
  'python-starlette',
  'python-sanic',
  'python-celery',
  'python-bottle',
  'python-pylons',
  'python-pyramid',
  'python-tornado',
  'python-rq',
  'node',
  'node-express',
  'node-koa',
  'node-connect',
];

// List of platforms that have tracing custom instrumentation guide docs for its nested frameworks
// i.e. for a platform like `javascript-react`, we have a custom instrumentation guide for `react` that can be
// accessed at `https://docs.sentry.io/platforms/javascript/guides/react/tracing/instrumentation/custom-instrumentation/`
export const platformsWithNestedInstrumentationGuides: PlatformKey[] = [
  'apple',
  'apple-ios',
  'apple-macos',
  'dart',
  'dart-flutter',
  'go',
  'go-echo',
  'go-fasthttp',
  'go-fiber',
  'go-gin',
  'go-http',
  'go-iris',
  'go-martini',
  'go-negroni',
  'java',
  'java-android',
  'java-appengine',
  'java-log4j',
  'java-log4j2',
  'java-logback',
  'java-logging',
  'java-spring',
  'java-spring-boot',
  'javascript',
  'javascript-angular',
  'javascript-angularjs',
  'javascript-astro',
  'javascript-backbone',
  'javascript-browser',
  'javascript-capacitor',
  'javascript-cordova',
  'javascript-electron',
  'javascript-ember',
  'javascript-gatsby',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-react',
  'javascript-remix',
  'javascript-solid',
  'javascript-svelte',
  'javascript-sveltekit',
  'javascript-vue',
  'dotnet',
  'dotnet-aspnet',
  'dotnet-aspnetcore',
  'dotnet-awslambda',
  'dotnet-gcpfunctions',
  'dotnet-google-cloud-functions',
  'dotnet-maui',
  'dotnet-uwp',
  'dotnet-winforms',
  'dotnet-wpf',
  'dotnet-xamarin',
  'php',
  'php-laravel',
  'php-monolog',
  'php-symfony',
  'php-symfony2',
  'powershell',
  'react-native',
  'ruby',
  'rust',
  'unity',
];

// List of platforms that have performance onboarding checklist content
export const withPerformanceOnboarding: Set<PlatformKey> = new Set([
  'javascript',
  'javascript-react',
  'javascript-nextjs',
  'python',
  'python-django',
  'python-flask',
  'php',
  'node',
]);

// List of platforms that do not have performance support. We make use of this list in the product to not provide any Performance
// views such as Performance onboarding checklist.
export const withoutPerformanceSupport: Set<PlatformKey> = new Set([
  'elixir',
  'minidump',
  'nintendo-switch',
]);

export const profiling: PlatformKey[] = [
  // mobile
  'android',
  'apple-ios',
  // go
  'go',
  // nodejs
  'node',
  'node-express',
  'node-koa',
  'node-connect',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-remix',
  'javascript-solidstart',
  'javascript-sveltekit',
  'javascript',
  'javascript-react',
  // react-native
  'react-native',
  // python
  'python',
  'python-django',
  'python-flask',
  'python-fastapi',
  'python-starlette',
  'python-sanic',
  'python-celery',
  'python-bottle',
  'python-pylons',
  'python-pyramid',
  'python-tornado',
  'python-rq',
  'python-aiohttp',
  'python-chalice',
  'python-falcon',
  'python-quart',
  'python-tryton',
  'python-wsgi',
  'python-serverless',
  // rust
  'rust',
  // php
  'php',
  'php-laravel',
  'php-symfony',
  // ruby
  'ruby',
  'ruby-rails',
  'ruby-rack',
];

export const releaseHealth: PlatformKey[] = [
  // frontend
  'javascript',
  'javascript-react',
  'javascript-angular',
  'javascript-angularjs',
  'javascript-astro',
  'javascript-backbone',
  'javascript-ember',
  'javascript-gatsby',
  'javascript-vue',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-remix',
  'javascript-solid',
  'javascript-solidstart',
  'javascript-svelte',
  'javascript-sveltekit',
  'android',
  'apple-ios',
  'cordova',
  'javascript-cordova',
  'react-native',
  'flutter',
  'dart-flutter',
  'bun',
  'deno',
  'native',
  'node',
  'node-express',
  'node-koa',
  'node-connect',
  'python',
  'python-django',
  'python-flask',
  'python-fastapi',
  'python-starlette',
  'python-sanic',
  'python-celery',
  'python-bottle',
  'python-pylons',
  'python-pyramid',
  'python-tornado',
  'python-rq',
  'python-pymongo',
  'rust',
  'apple-macos',
  'native',
  'native-crashpad',
  'native-breakpad',
  'native-qt',
  'electron',
  'javascript-electron',
  'rust',
  'php',
  'php-laravel',
  'php-symfony',
  'dotnet',
  'dotnet-awslambda',
  'dotnet-gcpfunctions',
  'dotnet-maui',
  'dotnet-uwp',
  'dotnet-wpf',
  'dotnet-winforms',
  'dotnet-xamarin',
  'unity',
];

// These are the backend platforms that can set up replay -- e.g. they can be set up via a linked JS framework or via JS loader.
export const replayBackendPlatforms: readonly PlatformKey[] = [
  'bun',
  'deno',
  'dotnet-aspnetcore',
  'dotnet-aspnet',
  'elixir',
  'go-echo',
  'go-fasthttp',
  'go-fiber',
  'go',
  'go-gin',
  'go-http',
  'go-iris',
  'go-martini',
  'go-negroni',
  'java-spring',
  'java-spring-boot',
  'node',
  'node-express',
  'php',
  'php-laravel',
  'php-symfony',
  'python-aiohttp',
  'python-bottle',
  'python-django',
  'python-falcon',
  'python-fastapi',
  'python-flask',
  'python-pyramid',
  'python-quart',
  'python-sanic',
  'python-starlette',
  'python-tornado',
  'ruby-rails',
];

// These are the frontend platforms that can set up replay.
export const replayFrontendPlatforms: readonly PlatformKey[] = [
  'javascript',
  'javascript-angular',
  'javascript-astro',
  'javascript-backbone',
  'javascript-capacitor',
  'capacitor',
  'javascript-electron',
  'electron',
  'javascript-ember',
  'javascript-gatsby',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-react',
  'javascript-remix',
  'javascript-solid',
  'javascript-solidstart',
  'javascript-svelte',
  'javascript-sveltekit',
  'javascript-vue',
];

// These are the mobile platforms that can set up replay.
export const replayMobilePlatforms: PlatformKey[] = [
  'android',
  'apple-ios',
  'react-native',
  'flutter',
];

// These are all the platforms that can set up replay.
export const replayPlatforms: readonly PlatformKey[] = [
  ...replayFrontendPlatforms,
  ...replayBackendPlatforms,
  ...replayMobilePlatforms,
];

/**
 * The list of platforms for which we have created onboarding instructions.
 * Should be a subset of the list of `replayPlatforms`.
 */
export const replayOnboardingPlatforms: readonly PlatformKey[] = [
  ...replayFrontendPlatforms.filter(p => !['javascript-backbone'].includes(p)),
  ...replayBackendPlatforms,
  ...replayMobilePlatforms,
];

// These are the supported replay platforms that can also be set up using the JS loader.
export const replayJsLoaderInstructionsPlatformList: readonly PlatformKey[] = [
  'javascript',
  ...replayBackendPlatforms,
];

// Feedback platforms that show only NPM widget setup instructions (no loader)
export const feedbackNpmPlatforms: readonly PlatformKey[] = [
  'ionic',
  ...replayFrontendPlatforms,
];

// Feedback platforms that show widget instructions (both NPM & loader)
export const feedbackWidgetPlatforms: readonly PlatformKey[] = [
  ...feedbackNpmPlatforms,
  ...replayBackendPlatforms,
];

// Feedback platforms that only show crash API instructions
export const feedbackCrashApiPlatforms: readonly PlatformKey[] = [
  'android',
  'apple',
  'apple-macos',
  'apple-ios',
  'dart',
  'dotnet',
  'dotnet-awslambda',
  'dotnet-gcpfunctions',
  'dotnet-maui',
  'dotnet-uwp',
  'dotnet-wpf',
  'dotnet-winforms',
  'dotnet-xamarin',
  'flutter',
  'java',
  'java-log4j2',
  'java-logback',
  'kotlin',
  'node-koa',
  'react-native',
  'unity',
  'unreal',
];

// Feedback platforms that default to the web API
export const feedbackWebApiPlatforms: readonly PlatformKey[] = [
  'cordova',
  'ruby-rack',
  'ruby',
  'rust',
  'native',
  'native-qt',
  'node-awslambda',
  'node-azurefunctions',
  'node-connect',
  'node-gcpfunctions',
  'minidump',
  'python-asgi',
  'python-awslambda',
  'python-celery',
  'python-chalice',
  'python-gcpfunctions',
  'python-pymongo',
  'python-pylons',
  'python',
  'python-rq',
  'python-serverless',
  'python-tryton',
  'python-wsgi',
];

// All feedback onboarding platforms
export const feedbackOnboardingPlatforms: readonly PlatformKey[] = [
  ...feedbackWebApiPlatforms,
  ...feedbackWidgetPlatforms,
  ...feedbackCrashApiPlatforms,
];

// Feature flag onboarding platforms
export const featureFlagOnboardingPlatforms: readonly PlatformKey[] = [
  'javascript',
  'python',
  'javascript-angular',
  'javascript-astro',
  'javascript-backbone',
  'javascript-ember',
  'javascript-gatsby',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-react',
  'javascript-remix',
  'javascript-solid',
  'javascript-solidstart',
  'javascript-svelte',
  'javascript-sveltekit',
  'javascript-vue',
];

const customMetricBackendPlatforms: readonly PlatformKey[] = [
  'bun',
  'dart',
  'deno',
  'dotnet',
  'dotnet-aspnet',
  'dotnet-aspnetcore',
  'dotnet-awslambda',
  'dotnet-gcpfunctions',
  'dotnet-maui',
  'dotnet-uwp',
  'dotnet-winforms',
  'dotnet-wpf',
  'java',
  'java-appengine',
  'java-log4j',
  'java-log4j2',
  'java-logback',
  'java-logging',
  'java-spring',
  'java-spring-boot',
  'php',
  'php-laravel',
  // TODO: Enable once metrics are available for Symfony
  // 'php-symfony',
  'python',
  'python-aiohttp',
  'python-asgi',
  'python-awslambda',
  'python-bottle',
  'python-celery',
  'python-chalice',
  'python-django',
  'python-falcon',
  'python-fastapi',
  'python-flask',
  'python-gcpfunctions',
  'python-pymongo',
  'python-pylons',
  'python-pyramid',
  'python-quart',
  'python-rq',
  'python-sanic',
  'python-serverless',
  'python-starlette',
  'python-tornado',
  'python-tryton',
  'python-wsgi',
  'rust',
  'node',
  'node-awslambda',
  'node-azurefunctions',
  'node-connect',
  'node-express',
  'node-gcpfunctions',
  'node-koa',
  'ruby',
  'ruby-rails',
  'ruby-rack',
];

const customMetricFrontendPlatforms: readonly PlatformKey[] = [
  'android',
  'apple-ios',
  'electron',
  'flutter',
  'java-android',
  'javascript-angular',
  'javascript-astro',
  'javascript-backbone',
  'javascript-capacitor',
  'javascript-electron',
  'javascript-ember',
  'javascript-gatsby',
  'javascript-nextjs',
  'javascript-nuxt',
  'javascript-react',
  'javascript-remix',
  'javascript-solid',
  'javascript-solidstart',
  'javascript-svelte',
  'javascript-sveltekit',
  'javascript-vue',
  'javascript',
  'react-native',
  'unity',
];

// These are all the platforms that can set up custom metrics.
export const customMetricPlatforms: readonly PlatformKey[] = [
  ...customMetricFrontendPlatforms,
  ...customMetricBackendPlatforms,
];

/**
 * The list of platforms for which we have created onboarding instructions.
 * Should be a subset of the list of `customMetricPlatforms`.
 */
export const customMetricOnboardingPlatforms: readonly PlatformKey[] =
  customMetricPlatforms.filter(
    p =>
      // Legacy platforms that do not have in-product docs
      ![
        'javascript-backbone',
        'javascript-capacitor',
        'javascript-electron',
        'python-pylons',
        'python-tryton',
      ].includes(p)
  );
